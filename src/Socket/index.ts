import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  WASocket,
} from "baileys";
import { Boom } from "@hapi/boom";
import qrTerminal from "qrcode-terminal";
import type {
  MessageReceived,
  MessageUpdated,
  StartSessionParams,
  StartSessionWithPairingCodeParams,
} from "../Types";
import { CALLBACK_KEY, Messages } from "../Defaults";
import {
  saveAudioHandler,
  saveDocumentHandler,
  saveImageHandler,
  saveVideoHandler,
} from "../Utils/save-media";
import { WhatsappError } from "../Error";
import { parseMessageStatusCodeToReadable } from "../Utils/message-status";
import { getSQLiteSessionIds, SQLiteStore } from "../Store/Sqlite";
import { Store } from "../Store/Store";

const sessions: Map<
  string,
  {
    session: WASocket;
    store: Store;
  }
> = new Map();

const callback: Map<string, Function> = new Map();

const retryCount: Map<string, number> = new Map();

const P = require("pino")({
  level: "silent",
});

export const startSession = async (
  sessionId = "mysession",
  options: StartSessionParams = { printQR: true }
): Promise<WASocket> => {
  if (isSessionExistAndRunning(sessionId))
    throw new WhatsappError(Messages.sessionAlreadyExist(sessionId));

  const { version } = await fetchLatestBaileysVersion();
  const startSocket = async () => {
    const store = options.store || new SQLiteStore(sessionId);
    const sock: WASocket = makeWASocket({
      version,
      auth: store.state,
      logger: P,
      markOnlineOnConnect: false,
      browser: Browsers.ubuntu("Chrome"),
    });
    sessions.set(sessionId, { session: sock, store });
    try {
      sock.ev.process(async (events) => {
        if (events["connection.update"]) {
          const update = events["connection.update"];
          const { connection, lastDisconnect } = update;
          if (update.qr) {
            callback.get(CALLBACK_KEY.ON_QR)?.({
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
            callback.get(CALLBACK_KEY.ON_CONNECTING)?.(sessionId);
            options.onConnecting?.();
          }
          if (connection === "close") {
            const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
            let retryAttempt = retryCount.get(sessionId) ?? 0;
            let shouldRetry;
            if (code != DisconnectReason.loggedOut && retryAttempt < 10) {
              shouldRetry = true;
            }
            if (shouldRetry) {
              retryAttempt++;
              retryCount.set(sessionId, retryAttempt);
              startSocket();
            } else {
              retryCount.delete(sessionId);
              deleteSession(sessionId);
              callback.get(CALLBACK_KEY.ON_DISCONNECTED)?.(sessionId);
              options.onDisconnected?.();
            }
          }
          if (connection == "open") {
            retryCount.delete(sessionId);
            callback.get(CALLBACK_KEY.ON_CONNECTED)?.(sessionId);
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
            messageStatus: parseMessageStatusCodeToReadable(msg.update.status!),
            ...msg,
          };
          callback.get(CALLBACK_KEY.ON_MESSAGE_UPDATED)?.(data);
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
          callback.get(CALLBACK_KEY.ON_MESSAGE_RECEIVED)?.({
            ...msg,
          });
          options.onMessageReceived?.(msg);
        }
      });
      return sock;
    } catch (error) {
      // console.log("SOCKET ERROR", error);
      return sock;
    }
  };
  return startSocket();
};

/**
 *
 * @deprecated Use startSession method instead
 */
export const startSessionWithPairingCode = async (
  sessionId: string,
  options: StartSessionWithPairingCodeParams
): Promise<WASocket> => {
  if (isSessionExistAndRunning(sessionId))
    throw new WhatsappError(Messages.sessionAlreadyExist(sessionId));

  const { version } = await fetchLatestBaileysVersion();
  const startSocket = async () => {
    const store = options.store || new SQLiteStore(sessionId);
    const sock: WASocket = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: store.state,
      logger: P,
      markOnlineOnConnect: false,
      browser: Browsers.ubuntu("Chrome"),
    });
    sessions.set(sessionId, { session: sock, store: store });
    try {
      if (!sock.authState.creds.registered) {
        console.log("first time pairing");
        const code = await sock.requestPairingCode(options.phoneNumber);
        console.log(code);
        callback.get(CALLBACK_KEY.ON_PAIRING_CODE)?.(sessionId, code);
      }

      sock.ev.process(async (events) => {
        if (events["connection.update"]) {
          const update = events["connection.update"];
          const { connection, lastDisconnect } = update;
          if (update.qr) {
            callback.get(CALLBACK_KEY.ON_QR)?.({
              sessionId,
              qr: update.qr,
            });
          }
          if (connection == "connecting") {
            callback.get(CALLBACK_KEY.ON_CONNECTING)?.(sessionId);
          }
          if (connection === "close") {
            const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
            let retryAttempt = retryCount.get(sessionId) ?? 0;
            let shouldRetry;
            if (code != DisconnectReason.loggedOut && retryAttempt < 10) {
              shouldRetry = true;
            }
            if (shouldRetry) {
              retryAttempt++;
            }
            if (shouldRetry) {
              retryCount.set(sessionId, retryAttempt);
              startSocket();
            } else {
              retryCount.delete(sessionId);
              deleteSession(sessionId);
              callback.get(CALLBACK_KEY.ON_DISCONNECTED)?.(sessionId);
            }
          }
          if (connection == "open") {
            retryCount.delete(sessionId);
            callback.get(CALLBACK_KEY.ON_CONNECTED)?.(sessionId);
          }
        }
        if (events["creds.update"]) {
          await store.saveCreds();
        }
        if (events["messages.update"]) {
          const msg = events["messages.update"][0];
          const data: MessageUpdated = {
            sessionId: sessionId,
            messageStatus: parseMessageStatusCodeToReadable(msg.update.status!),
            ...msg,
          };
          callback.get(CALLBACK_KEY.ON_MESSAGE_UPDATED)?.(data);
        }
        if (events["messages.upsert"]) {
          const msg = events["messages.upsert"]
            .messages?.[0] as unknown as MessageReceived;
          msg.sessionId = sessionId;
          msg.saveImage = (path) => saveImageHandler(msg, path);
          msg.saveVideo = (path) => saveVideoHandler(msg, path);
          msg.saveDocument = (path) => saveDocumentHandler(msg, path);
          msg.saveAudio = (path) => saveAudioHandler(msg, path);
          callback.get(CALLBACK_KEY.ON_MESSAGE_RECEIVED)?.({
            ...msg,
          });
        }
      });
      return sock;
    } catch (error) {
      // console.log("SOCKET ERROR", error);
      return sock;
    }
  };
  return startSocket();
};

/**
 * @deprecated Use startSession method instead
 */
export const startWhatsapp = startSession;

export const deleteSession = async (sessionId: string) => {
  const session = getSession(sessionId);
  try {
    await session?.session.logout();
    await session?.store.deleteCreds();
  } catch (error) {}
  session?.session.end(undefined);
  sessions.delete(sessionId);
};
export const getAllSession = (): string[] => Array.from(sessions.keys());

export const getSession = (
  key: string
): typeof sessions extends Map<string, infer U> ? U : never =>
  sessions.get(key);

const isSessionExistAndRunning = (sessionId: string): boolean => {
  if (getSession(sessionId)) {
    return true;
  }
  return false;
};

type GetStartSessionOptionsProps = (
  sessionid: string
) => StartSessionParams | undefined | void;
/**
 * @returns loaded session ids
 */
export const loadSessionsFromStorage = async (
  getOptions?: GetStartSessionOptionsProps
) => {
  /**
   * TODO: improve this method to load sessions from other storage options
   */
  const sessionIds = await getSQLiteSessionIds();
  for (const sessionId of sessionIds) {
    const options = getOptions?.(sessionId);
    await startSession(sessionId, options || undefined);
  }

  return sessionIds;
};

export const onMessageReceived = (listener: (msg: MessageReceived) => any) => {
  callback.set(CALLBACK_KEY.ON_MESSAGE_RECEIVED, listener);
};
export const onQRUpdated = (
  listener: ({ sessionId, qr }: { sessionId: string; qr: string }) => any
) => {
  callback.set(CALLBACK_KEY.ON_QR, listener);
};
export const onConnected = (listener: (sessionId: string) => any) => {
  callback.set(CALLBACK_KEY.ON_CONNECTED, listener);
};
export const onDisconnected = (listener: (sessionId: string) => any) => {
  callback.set(CALLBACK_KEY.ON_DISCONNECTED, listener);
};
export const onConnecting = (listener: (sessionId: string) => any) => {
  callback.set(CALLBACK_KEY.ON_CONNECTING, listener);
};

export const onMessageUpdate = (listener: (data: MessageUpdated) => any) => {
  callback.set(CALLBACK_KEY.ON_MESSAGE_UPDATED, listener);
};

export const onPairingCode = (
  listener: (sessionId: string, code: string) => any
) => {
  callback.set(CALLBACK_KEY.ON_PAIRING_CODE, listener);
};
