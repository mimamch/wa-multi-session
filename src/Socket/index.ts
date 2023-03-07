import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  WASocket,
} from "@adiwajshing/baileys";
import pino from "pino";
import path from "path";
import { Boom } from "@hapi/boom";

const msgRetryCounterMap = {};
const sessions: Map<string, WASocket> = new Map();

export const startWhatsapp = async (sessionName: string) => {
  const logger = pino({ level: "warn" });
  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve("credentials", sessionName + "_credentials")
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
  sessions.set(sessionName, { ...sock });

  sock.ev.process(async (events) => {
    if (events["connection.update"]) {
      const update = events["connection.update"];
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        if (
          (lastDisconnect?.error as Boom).output.statusCode !==
          DisconnectReason.loggedOut
        ) {
          startWhatsapp(sessionName);
        } else {
          //   deleteSession(name);
          //   startSock(name);
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

export const getAllSession = (): string[] => Array.from(sessions.keys());

export const getSession = (key: string): WASocket =>
  sessions.get(key) as WASocket;
