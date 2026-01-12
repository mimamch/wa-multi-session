import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  WASocket,
} from "baileys";
import { Boom } from "@hapi/boom";
import QRCode from "qrcode";
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
import { LegacyStore } from "../Store/Store";
import { createDelay } from "../Utils/create-delay";

const sessions: Map<
  string,
  {
    sock: WASocket;
    store: LegacyStore;
  }
> = new Map();

const callback: Map<string, Function> = new Map();

const retryCount: Map<string, number> = new Map();

const P = require("pino")({
  level: "silent",
});

/**
 * Start a session with QR Code scanning
 */
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
    sessions.set(sessionId, { sock: sock, store });
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
              QRCode.toString(
                update.qr,
                { type: "terminal", small: true },
                (error, qrcode) => {
                  console.log(sessionId + ":");
                  console.log(qrcode);
                }
              );
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
          if (msg?.message?.protocolMessage) {
            // ignore history sync messages
            return;
          }
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
 * Start a session using Phone Number Pairing Code (Beta)
 * This function is separated to ensure stability and independent logic from QR flow
 * @beta This function is currently in beta testing
 */
export const startSessionWithPairingCode = async (
  sessionId: string,
  options: StartSessionWithPairingCodeParams
): Promise<WASocket> => {
  console.log(
    "startSessionWithPairingCode is currently in beta testing. Please report any issues."
  );
  if (isSessionExistAndRunning(sessionId))
    throw new WhatsappError(Messages.sessionAlreadyExist(sessionId));

  const { version } = await fetchLatestBaileysVersion();
  const startSocket = async () => {
    let isPairingCodeRequested = false;
    const store = options.store || new SQLiteStore(sessionId);
    const sock: WASocket = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: store.state,
      logger: P,
      markOnlineOnConnect: false,
      browser: Browsers.ubuntu("Chrome"),
    });
    sessions.set(sessionId, { sock: sock, store: store });
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
          }

          // Handle pairing code request if not registered
          if (
            !sock.authState.creds.registered &&
            (connection === "connecting" || !!update.qr) &&
            !isPairingCodeRequested
          ) {
            isPairingCodeRequested = true; // Prevents race conditions / multiple requests
            console.log("pairing");

            // Add delay to ensure connection is stable before requesting code
            await createDelay(2000);

            try {
              const code = await sock.requestPairingCode(options.phoneNumber);
              console.log(code);
              callback.get(CALLBACK_KEY.ON_PAIRING_CODE)?.(sessionId, code);
            } catch (error) {
              console.log("Error Requesting Pairing Code", error);
              isPairingCodeRequested = false; // Reset flag to allow retry on error
            }
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
          if (msg?.message?.protocolMessage) {
            // ignore history sync messages
            return;
          }
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
    await session?.sock.logout();
    await session?.store.deleteCreds();
  } catch (error) {}
  session?.sock.end(undefined);
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
