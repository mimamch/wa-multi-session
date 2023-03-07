"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = exports.getAllSession = exports.startWhatsapp = void 0;
const baileys_1 = __importStar(require("@adiwajshing/baileys"));
const pino_1 = __importDefault(require("pino"));
const path_1 = __importDefault(require("path"));
const msgRetryCounterMap = {};
const sessions = new Map();
const startWhatsapp = (sessionName) => __awaiter(void 0, void 0, void 0, function* () {
    const logger = (0, pino_1.default)({ level: "warn" });
    const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)(path_1.default.resolve("credentials", sessionName + "_credentials"));
    const { version, isLatest } = yield (0, baileys_1.fetchLatestBaileysVersion)();
    console.log(isLatest ? "Baileys Version Is Latest" : "Baileys Version Need Update");
    const sock = (0, baileys_1.default)({
        version,
        printQRInTerminal: true,
        auth: state,
        logger,
        msgRetryCounterMap,
        markOnlineOnConnect: false,
    });
    sessions.set(sessionName, Object.assign({}, sock));
    sock.ev.process((events) => __awaiter(void 0, void 0, void 0, function* () {
        if (events["connection.update"]) {
            const update = events["connection.update"];
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                if ((lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error).output.statusCode !==
                    baileys_1.DisconnectReason.loggedOut) {
                    (0, exports.startWhatsapp)(sessionName);
                }
                else {
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
            yield saveCreds();
        }
    }));
    return sock;
});
exports.startWhatsapp = startWhatsapp;
const getAllSession = () => Array.from(sessions.keys());
exports.getAllSession = getAllSession;
const getSession = (key) => sessions.get(key);
exports.getSession = getSession;
