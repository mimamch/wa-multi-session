import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  WASocket,
} from "@adiwajshing/baileys";
import pino from "pino";
import path from "path";
import { Boom } from "@hapi/boom";
import fs from "fs";

const msgRetryCounterMap = {};
const sessions: Map<string, WASocket> = new Map();

export const startWhatsapp = async (sessionId: string) => {
  const logger = pino({ level: "warn" });
  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve("wa_credentials", sessionId + "_credentials")
  );
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(
    isLatest ? "Baileys Version Is Latest" : "Baileys Version Need Update"
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
          startWhatsapp(sessionId);
        } else {
          deleteSession(sessionId);
        }
      }
      if (connection == "open") {
      }

      console.log("connection update", update);
    }

    // credentials updated -- save them
    if (events["creds.update"]) {
      await saveCreds();
    }
  });
  return sock;
};
export const deleteSession = (sessionId: string) => {
  sessions.delete(sessionId);
  const dir = path.resolve("wa_credentials", sessionId + "_credentials");
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { force: true, recursive: true });
  }
};

export const getAllSession = (): string[] => Array.from(sessions.keys());

export const getSession = (key: string): WASocket =>
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
      startWhatsapp(dir.split("_")[0]);
    }
  });
};

loadSessions();
