import makeWASocket, {
  AuthenticationCreds,
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  initAuthCreds,
  proto,
  SignalDataTypeMap,
  WASocket,
} from "baileys";
import qrTerminal from "qrcode-terminal";
import { Adapter } from "../Adapter/Adapter";
import {
  MessageReceived,
  MessageUpdated,
  SendMediaTypes,
  SendMessageTypes,
  SendReadTypes,
  SendTypingTypes,
  StartSessionParams,
} from "../Types";
import { CALLBACK_KEY, Messages } from "../Defaults";
import { WhatsappError } from "../Error";
import pino from "pino";
import {
  jsonBufferToStringParser,
  stringToJsonBufferParser,
} from "../Utils/json-parser";
import { Boom } from "@hapi/boom";
import { parseMessageStatusCodeToReadable } from "../Utils/message-status";
import {
  saveAudioHandler,
  saveDocumentHandler,
  saveImageHandler,
  saveVideoHandler,
} from "../Utils/save-media";
import { WhatsappConstructorProps } from "../Types/Whatsapp";
import { Session, Store } from "../Types/Store";
import { createDelay, phoneToJid } from "../Utils";
import mime from "mime";
import { GetProfileInfoProps } from "../Types/profile";

export class Whatsapp {
  private adapter: Adapter;
  private P: pino.Logger;
  constructor(props: WhatsappConstructorProps) {
    if (!props.adapter) {
      throw new WhatsappError(Messages.adapterNotProvided());
    }
    this.adapter = props.adapter;
    this.P = pino({ level: props.debugLevel || "silent" });

    /**
     * Apply callbacks
     */
    this.applyCallbacks(props);

    /**
     * Load existing sessions from adapter
     */
    if (props.autoLoad ?? true) {
      this.load();
    }
  }

  private sessions = new Map<string, Session>();

  private callback = new Map<string, Function>();
  private retryCount = new Map<string, number>();

  async getSessionsIds(): Promise<string[]> {
    return Array.from(this.sessions.keys());
  }
  async getSessionById(sessionId: string): Promise<Session | undefined> {
    const session = this.sessions.get(sessionId);
    return session;
  }
  private async getSessionByIdReadyOrThrow(
    sessionId: string
  ): Promise<Session> {
    const session = await this.getSessionById(sessionId);
    if (!session) throw new WhatsappError(Messages.sessionNotFound(sessionId));
    if (session.status !== "connected")
      throw new WhatsappError(Messages.sessionNotReady(sessionId));

    return session;
  }

  private async isSessionExistAndRunning(sessionId: string): Promise<boolean> {
    if (await this.getSessionById(sessionId)) {
      return true;
    }
    return false;
  }

  private getStore = async (sessionId: string): Promise<Store> => {
    const creds: AuthenticationCreds =
      stringToJsonBufferParser(
        await this.adapter.readData(sessionId, "creds")
      ) || initAuthCreds();

    return {
      state: {
        creds: creds,
        keys: {
          get: async (type, ids) => {
            const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};
            for (const id of ids) {
              let value = stringToJsonBufferParser(
                await this.adapter.readData(sessionId, `${type}-${id}`)
              );
              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            }
            return data;
          },
          set: async (data) => {
            for (const category in data) {
              for (const id in data[category as keyof SignalDataTypeMap]) {
                const value = data[category as keyof SignalDataTypeMap]![id];
                if (value) {
                  await this.adapter.writeData(
                    sessionId,
                    `${category}-${id}`,
                    category,
                    jsonBufferToStringParser(value)
                  );
                } else {
                  await this.adapter.deleteData(sessionId, `${category}-${id}`);
                }
              }
            }
          },
        },
      },
      saveCreds: async () => {
        await this.adapter.writeData(
          sessionId,
          "creds",
          "credentials",
          jsonBufferToStringParser(creds)
        );
      },
      clearCreds: async () => {
        await this.adapter.clearData(sessionId);
      },
    };
  };

  /**
   * Start a new Whatsapp Session
   */
  async startSession(
    sessionId: string,
    options: StartSessionParams = { printQR: true }
  ): Promise<WASocket> {
    if (await this.isSessionExistAndRunning(sessionId))
      throw new WhatsappError(Messages.sessionAlreadyExist(sessionId));

    const { version } = await fetchLatestBaileysVersion();
    const startSocket = async () => {
      const store = await this.getStore(sessionId);
      const sock: WASocket = makeWASocket({
        version,
        auth: store.state,
        logger: this.P,
        markOnlineOnConnect: false,
        browser: Browsers.ubuntu("Chrome"),
      });
      this.sessions.set(sessionId, {
        sock: sock,
        store: store,
        status: "connecting",
      });
      try {
        sock.ev.process(async (events) => {
          if (events["connection.update"]) {
            const update = events["connection.update"];
            const { connection, lastDisconnect } = update;
            if (update.qr) {
              this.callback.get(CALLBACK_KEY.ON_QR)?.({
                sessionId,
                qr: update.qr,
              });
              options.onQRUpdated?.(update.qr);
              if (options.printQR) {
                qrTerminal.generate(update.qr, { small: true }, (qrcode) => {
                  console.log(sessionId + ":");
                  console.log(qrcode);
                });
              }
            }
            if (connection == "connecting") {
              this.callback.get(CALLBACK_KEY.ON_CONNECTING)?.(sessionId);
              options.onConnecting?.();
              this.sessions.get(sessionId)!.status = "connecting";
            }
            if (connection === "close") {
              const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
              let retryAttempt = this.retryCount.get(sessionId) ?? 0;
              let shouldRetry;
              if (code != DisconnectReason.loggedOut && retryAttempt < 10) {
                shouldRetry = true;
              }
              if (shouldRetry) {
                retryAttempt++;
                this.retryCount.set(sessionId, retryAttempt);
                startSocket();
              } else {
                this.sessions.get(sessionId)!.status = "disconnected";
                this.retryCount.delete(sessionId);
                this.deleteSession(sessionId);
                this.callback.get(CALLBACK_KEY.ON_DISCONNECTED)?.(sessionId);
                options.onDisconnected?.();
              }
            }
            if (connection == "open") {
              this.retryCount.delete(sessionId);
              this.callback.get(CALLBACK_KEY.ON_CONNECTED)?.(sessionId);
              this.sessions.get(sessionId)!.status = "connected";
              options.onConnected?.();
            }
          }
          if (events["creds.update"]) {
            await store.saveCreds();
          }
          if (events["messages.update"]) {
            const msg = events["messages.update"][0];
            const data: MessageUpdated = {
              sessionId: sessionId,
              messageStatus: parseMessageStatusCodeToReadable(
                msg.update.status!
              ),
              ...msg,
            };
            this.callback.get(CALLBACK_KEY.ON_MESSAGE_UPDATED)?.(data);
            options.onMessageUpdated?.(data);
          }
          if (events["messages.upsert"]) {
            const msg = events["messages.upsert"]
              .messages?.[0] as unknown as MessageReceived;
            msg.sessionId = sessionId;
            msg.saveImage = (path) => saveImageHandler(msg, path);
            msg.saveVideo = (path) => saveVideoHandler(msg, path);
            msg.saveDocument = (path) => saveDocumentHandler(msg, path);
            msg.saveAudio = (path) => saveAudioHandler(msg, path);
            this.callback.get(CALLBACK_KEY.ON_MESSAGE_RECEIVED)?.({
              ...msg,
            });
            options.onMessageReceived?.(msg);
          }
        });
        return sock;
      } catch (error) {
        return sock;
      }
    };
    return startSocket();
  }

  /**
   * Delete or Logout Whatsapp Session
   */
  async deleteSession(sessionId: string) {
    const session = await this.getSessionById(sessionId);
    try {
      await session?.sock.logout();
      await session?.store.clearCreds();
    } catch (error) {}
    session?.sock.end(undefined);
    this.sessions.delete(sessionId);
  }

  /**
   * Register callback for various events
   */
  private applyCallbacks(props: WhatsappConstructorProps) {
    if (props.onConnecting) {
      this.callback.set(CALLBACK_KEY.ON_CONNECTING, props.onConnecting);
    }
    if (props.onConnected) {
      this.callback.set(CALLBACK_KEY.ON_CONNECTED, props.onConnected);
    }
    if (props.onDisconnected) {
      this.callback.set(CALLBACK_KEY.ON_DISCONNECTED, props.onDisconnected);
    }
    if (props.onMessageUpdated) {
      this.callback.set(
        CALLBACK_KEY.ON_MESSAGE_UPDATED,
        props.onMessageUpdated
      );
    }
    if (props.onMessageReceived) {
      this.callback.set(
        CALLBACK_KEY.ON_MESSAGE_RECEIVED,
        props.onMessageReceived
      );
    }
    if (props.onQRUpdated) {
      this.callback.set(CALLBACK_KEY.ON_QR, props.onQRUpdated);
    }
  }

  /**
   * Load sessions from adapter
   */
  async load() {
    try {
      const sessionIds = (await this.adapter.listSessions?.()) || [];
      for (const sessionId of sessionIds) {
        // check if session is already running
        if (await this.isSessionExistAndRunning(sessionId)) {
          continue;
        }

        await this.startSession(sessionId);
      }
    } catch (error) {
      this.P.error("Failed to load sessions from adapter: " + error);
    }
  }

  /**
   *
   *
   *
   *
   *
   *
   *
   * Messaging functions
   *
   *
   *
   *
   *
   *
   *
   */

  /**
   * Send Text Message
   */
  sendText = async (props: SendMessageTypes & { text: string }) => {
    const session = await this.getSessionByIdReadyOrThrow(props.sessionId);
    const to = phoneToJid({ to: props.to, isGroup: props.isGroup });

    return await session.sock.sendMessage(
      to,
      {
        text: props.text,
      },
      {
        quoted: props.answering,
      }
    );
  };

  /**
   * Send Image Message
   */
  sendImage = async (props: SendMediaTypes) => {
    const session = await this.getSessionByIdReadyOrThrow(props.sessionId);
    const to = phoneToJid({ to: props.to, isGroup: props.isGroup });

    return await session.sock.sendMessage(
      to,
      {
        image:
          typeof props.media == "string"
            ? {
                url: props.media,
              }
            : props.media,
        caption: props.text,
      },
      {
        quoted: props.answering,
      }
    );
  };

  /**
   * Send Video Message
   */
  sendVideo = async (props: SendMediaTypes) => {
    const session = await this.getSessionByIdReadyOrThrow(props.sessionId);
    const to = phoneToJid({ to: props.to, isGroup: props.isGroup });

    return await session.sock.sendMessage(
      to,
      {
        video:
          typeof props.media == "string"
            ? {
                url: props.media,
              }
            : props.media,
        caption: props.text,
      },
      {
        quoted: props.answering,
      }
    );
  };

  /**
   * Send Document Message
   */
  sendDocument = async (props: SendMediaTypes & { filename: string }) => {
    const session = await this.getSessionByIdReadyOrThrow(props.sessionId);
    const to = phoneToJid({ to: props.to, isGroup: props.isGroup });

    if (!props.media) {
      throw new WhatsappError(`Invalid Media`);
    }

    const mimetype = mime.getType(props.filename);
    if (!mimetype) {
      throw new WhatsappError(`Filename must include valid extension`);
    }

    return await session.sock.sendMessage(
      to,
      {
        fileName: props.filename,
        document:
          typeof props.media == "string"
            ? {
                url: props.media,
              }
            : props.media,
        mimetype: mimetype,
        caption: props.text,
      },
      {
        quoted: props.answering,
      }
    );
  };

  /**
   * Send Audio Message
   */
  sendAudio = async (
    props: Omit<SendMediaTypes, "text"> & {
      asVoiceNote?: boolean;
    }
  ) => {
    const session = await this.getSessionByIdReadyOrThrow(props.sessionId);
    const to = phoneToJid({ to: props.to, isGroup: props.isGroup });

    if (!props.media) {
      throw new WhatsappError(`Invalid Media`);
    }

    return await session.sock.sendMessage(
      to,
      {
        audio:
          typeof props.media == "string"
            ? {
                url: props.media,
              }
            : props.media,
        ptt: props.asVoiceNote ?? false,
      },
      {
        quoted: props.answering,
      }
    );
  };

  /**
   * Send Sticker Message
   */
  sendSticker = async (props: Omit<SendMediaTypes, "text">) => {
    const session = await this.getSessionByIdReadyOrThrow(props.sessionId);
    const to = phoneToJid({ to: props.to, isGroup: props.isGroup });

    if (!props.media) {
      throw new WhatsappError(`Invalid Media`);
    }

    return await session.sock.sendMessage(
      to,
      {
        sticker:
          typeof props.media == "string"
            ? {
                url: props.media,
              }
            : props.media,
      },
      {
        quoted: props.answering,
      }
    );
  };

  /**
   * Send Typing Indicator
   */
  sendTypingIndicator = async (props: SendTypingTypes) => {
    const session = await this.getSessionByIdReadyOrThrow(props.sessionId);
    const to = phoneToJid({ to: props.to, isGroup: props.isGroup });

    await session.sock.sendPresenceUpdate("composing", to);
    await createDelay(props.duration);
    await session.sock.sendPresenceUpdate("available", to);
  };

  /**
   * Mark Message as Read
   */
  readMessage = async (props: SendReadTypes) => {
    const session = await this.getSessionByIdReadyOrThrow(props.sessionId);

    await session.sock.readMessages([props.key]);
  };

  /**
   * Get Profile Information
   */
  async getProfile(props: GetProfileInfoProps) {
    const session = await this.getSessionByIdReadyOrThrow(props.sessionId);

    const [profilePictureUrl, status] = await Promise.allSettled([
      session.sock.profilePictureUrl(props.target, "image", 5000),
      session.sock.fetchStatus(props.target),
    ]);
    return {
      profilePictureUrl:
        profilePictureUrl.status === "fulfilled"
          ? profilePictureUrl.value || null
          : null,
      status: status.status === "fulfilled" ? status.value || null : null,
    };
  }

  /**
   * Check is user or group exist
   */
  async isExist(props: SendMessageTypes): Promise<boolean> {
    try {
      const session = await this.getSessionByIdReadyOrThrow(props.sessionId);
      const receiver = phoneToJid({
        to: props.to,
        isGroup: props.isGroup,
      });
      if (!props.isGroup) {
        const one = Boolean(
          (await session?.sock.onWhatsApp(receiver))?.[0]?.exists
        );
        return one;
      } else {
        return Boolean((await session.sock.groupMetadata(receiver)).id);
      }
    } catch (error) {
      throw error;
    }
  }
}
