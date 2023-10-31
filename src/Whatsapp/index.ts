import makeWASocket, {
  Browsers,
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { CALLBACK_KEY, CREDENTIALS, Messages } from "../Defaults";
import { Socket } from "../Socket/Socket";
import { WhatsappOptions } from "../Types/WhatsappOptions";
import fs from "fs";
import path from "path";
import { MessageReceived, MessageUpdated, StartSessionParams } from "../Types";
import { WhatsappError } from "../Error";
import pino from "pino";
import { Boom } from "@hapi/boom";
import { parseMessageStatusCodeToReadable } from "../Utils/message-status";
import {
  saveDocumentHandler,
  saveImageHandler,
  saveVideoHandler,
} from "../Utils/save-media";

export class Whatsapp {
  constructor(options: WhatsappOptions = {}) {}

  sockets: Map<string, Socket> = new Map();
  callback: Map<string, Function> = new Map();
  retryCount: Map<string, number> = new Map();

  async load(each?: (socket: Socket) => Socket) {
    if (!fs.existsSync(path.resolve(CREDENTIALS.DIR_NAME))) {
      fs.mkdirSync(path.resolve(CREDENTIALS.DIR_NAME));
    }
    fs.readdir(path.resolve(CREDENTIALS.DIR_NAME), async (err, dirs) => {
      if (err) {
        throw err;
      }
      for (const dir of dirs) {
        const sessionId = dir.split("_")[0];
        const phoneNumber = dir.split("_")[1];
        let socket = new Socket({
          id: sessionId,
          phoneNumber: phoneNumber,
        });
        socket = each?.(socket) ?? socket;
        if (!this.shouldLoadSession(socket)) continue;
        this.startSession(socket);
      }
    });
  }

  private shouldLoadSession = (socket: Socket): boolean => {
    if (
      fs.existsSync(path.resolve(CREDENTIALS.DIR_NAME)) &&
      fs.existsSync(
        path.resolve(
          CREDENTIALS.DIR_NAME,
          socket.id + "_" + socket.phoneNumber + CREDENTIALS.SUFFIX
        )
      ) &&
      fs.readdirSync(
        path.resolve(
          CREDENTIALS.DIR_NAME,
          socket.id + "_" + socket.phoneNumber + CREDENTIALS.SUFFIX
        )
      ).length &&
      !this.getSocket(socket.id)
    ) {
      return true;
    }
    return false;
  };

  private getSocket = (key: string): Socket | null =>
    this.sockets.get(key) ?? null;

  startSession = async (socket: Socket): Promise<Socket> => {
    if (this.isSessionExistAndRunning(socket))
      throw new WhatsappError(Messages.sessionAlreadyExist(socket.id));
    const logger = pino({ level: "silent" });

    const { version } = await fetchLatestBaileysVersion();
    const startSocket = async () => {
      const { state, saveCreds } = await useMultiFileAuthState(
        path.resolve(
          CREDENTIALS.DIR_NAME,
          socket.id + "_" + socket.phoneNumber + CREDENTIALS.SUFFIX
        )
      );
      const sock: WASocket = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        logger,
        markOnlineOnConnect: false,
        browser: Browsers.ubuntu("Chrome"),
      });
      socket.socket = sock;
      this.sockets.set(socket.id, socket);
      try {
        sock.ev.process(async (events) => {
          if (events["connection.update"]) {
            const update = events["connection.update"];
            const { connection, lastDisconnect } = update;
            if (update.qr) {
              socket.onQr?.(update.qr);
            }
            if (connection == "connecting") {
              socket.onConnecting?.();
            }
            if (connection === "close") {
              const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
              let retryAttempt = this.retryCount.get(socket.id) ?? 0;
              let shouldRetry;
              if (code != DisconnectReason.loggedOut && retryAttempt < 10) {
                shouldRetry = true;
              }
              if (shouldRetry) {
                retryAttempt++;
              }
              if (shouldRetry) {
                this.retryCount.set(socket.id, retryAttempt);
                startSocket();
              } else {
                this.retryCount.delete(socket.id);
                this.deleteSession(socket.id);
                socket.onDisconnected?.();
              }
            }
            if (connection == "open") {
              this.retryCount.delete(socket.id);
              socket.onConnected?.();
            }
          }
          if (events["creds.update"]) {
            await saveCreds();
          }
          if (events["messages.update"]) {
            const msg = events["messages.update"][0];
            const data: MessageUpdated = {
              sessionId: socket.id,
              messageStatus: parseMessageStatusCodeToReadable(
                msg.update.status!
              ),
              ...msg,
            };
            socket.onMessageUpdated?.(data);
          }
          if (events["messages.upsert"]) {
            const msg = events["messages.upsert"]
              .messages?.[0] as unknown as MessageReceived;
            msg.sessionId = socket.id;
            msg.saveImage = (path) => saveImageHandler(msg, path);
            msg.saveVideo = (path) => saveVideoHandler(msg, path);
            msg.saveDocument = (path) => saveDocumentHandler(msg, path);
            socket.onMessageReceived?.(msg);
          }
        });
        if (!sock.authState.creds.registered) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          const code = await sock.requestPairingCode(socket.phoneNumber);
          console.log(code);
          socket.onPairing?.(code);
        }
        return socket;
      } catch (error: any) {
        console.log(error.message);
        return socket;
      }
    };
    return startSocket();
  };

  private isSessionExistAndRunning = (socket: Socket): boolean => {
    if (
      fs.existsSync(path.resolve(CREDENTIALS.DIR_NAME)) &&
      fs.existsSync(
        path.resolve(
          CREDENTIALS.DIR_NAME,
          socket.id + "_" + socket.phoneNumber + CREDENTIALS.SUFFIX
        )
      ) &&
      fs.readdirSync(
        path.resolve(
          CREDENTIALS.DIR_NAME,
          socket.id + "_" + socket.phoneNumber + CREDENTIALS.SUFFIX
        )
      ).length &&
      this.getSocket(socket.id)
    ) {
      return true;
    }
    return false;
  };

  deleteSession = async (sessionId: string) => {
    const socket = this.getSocket(sessionId);
    if (!socket) return;
    await socket.logout();
    const dir = path.resolve(
      CREDENTIALS.DIR_NAME,
      socket.id + "_" + socket.phoneNumber + CREDENTIALS.SUFFIX
    );
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { force: true, recursive: true });
    }
  };
}

const wa = new Whatsapp();
// wa.load();

const mySocket = new Socket({ id: "mysocket", phoneNumber: "6281524538841" });
mySocket.onPairing = (code) => {
  console.log(code);
};

wa.startSession(mySocket);
