import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  proto,
  useMultiFileAuthState,
  WASocket,
} from "@adiwajshing/baileys";
import pino from "pino";
import path from "path";
import { Boom } from "@hapi/boom";
import fs from "fs";
import { MessageReceived } from "../Types";

const msgRetryCounterMap = {};
const sessions: Map<string, WASocket> = new Map();

const callback: Map<string, Function> = new Map();

export const startSession = async (sessionId = "mysession") => {
  if (checkIsAvailableCreds(sessionId))
    throw new Error(
      `Session ID :${sessionId} is already exist, Try another Session ID.`
    );
  const logger = pino({ level: "silent" });

  const { version, isLatest } = await fetchLatestBaileysVersion();

  const startSocket = async () => {
    const { state, saveCreds } = await useMultiFileAuthState(
      path.resolve("wa_credentials", sessionId + "_credentials")
    );
    const sock: WASocket = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: state,
      logger,
      msgRetryCounterMap,
      markOnlineOnConnect: false,
    });
    sessions.set(sessionId, { ...sock });

    sock.ev.process(async (events) => {
      if (events["connection.update"]) {
        const update = events["connection.update"];
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
          if (
            (lastDisconnect?.error as Boom).output.statusCode !==
            DisconnectReason.loggedOut
          ) {
            startSocket();
          } else {
            deleteSession(sessionId);
          }
        }
        if (connection == "open") {
          console.log("Whatsapp Session Connected: ", sessionId);
        }
      }
      if (events["creds.update"]) {
        await saveCreds();
      }
      // if (params?.onReceiveMessage && events["messages.upsert"]) {
      //   const msg = events["messages.upsert"].messages?.[0];
      //   params?.onReceiveMessage(msg);
      // }
      if (events["messages.upsert"]) {
        const msg = events["messages.upsert"].messages?.[0];
        callback.get("onMessageReceive")?.({ sessionId, ...msg });
      }
    });
    return sock;
  };
  return await startSocket();
};

/**
 * @deprecated Use startSession method instead
 */
export const startWhatsapp = startSession;

export const deleteSession = (sessionId: string) => {
  const session = getSession(sessionId);
  session?.logout();
  sessions.delete(sessionId);
  const dir = path.resolve("wa_credentials", sessionId + "_credentials");
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { force: true, recursive: true });
  }
};
export const getAllSession = (): string[] => Array.from(sessions.keys());

export const getSession = (key: string): WASocket | undefined =>
  sessions.get(key) as WASocket;

const loadSessions = async () => {
  if (!fs.existsSync(path.resolve("wa_credentials"))) {
    fs.mkdirSync(path.resolve("wa_credentials"));
  }
  fs.readdir(path.resolve("wa_credentials"), async (err, dirs) => {
    if (err) {
      throw err;
    }
    for (const dir of dirs) {
      startSession(dir.split("_")[0]);
    }
  });
};

const checkIsAvailableCreds = (sessionId: string): boolean => {
  if (
    fs.existsSync(path.resolve("wa_credentials")) &&
    fs.existsSync(path.resolve("wa_credentials", sessionId + "_credentials")) &&
    getSession(sessionId)
  ) {
    return true;
  }
  return false;
};

loadSessions();

export const onMessageReceived = (listener: (msg: MessageReceived) => any) => {
  callback.set("onMessageReceive", listener);
};
