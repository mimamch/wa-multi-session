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
exports.onMessageReceived = exports.getSession = exports.getAllSession = exports.deleteSession = exports.startWhatsapp = exports.startSession = void 0;
const baileys_1 = __importStar(require("@adiwajshing/baileys"));
const pino_1 = __importDefault(require("pino"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Defaults_1 = require("../Defaults");
const msgRetryCounterMap = {};
const sessions = new Map();
const callback = new Map();
const startSession = (sessionId = "mysession") => __awaiter(void 0, void 0, void 0, function* () {
    if (checkIsAvailableCreds(sessionId))
        throw new Error(Defaults_1.Messages.sessionAlreadyExist(sessionId));
    const logger = (0, pino_1.default)({ level: "error" });
    const { version, isLatest } = yield (0, baileys_1.fetchLatestBaileysVersion)();
    const startSocket = () => __awaiter(void 0, void 0, void 0, function* () {
        const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME, sessionId + Defaults_1.CREDENTIALS.PREFIX));
        const sock = (0, baileys_1.default)({
            version,
            printQRInTerminal: true,
            auth: state,
            logger,
            msgRetryCounterMap,
            markOnlineOnConnect: false,
        });
        sessions.set(sessionId, Object.assign({}, sock));
        sock.ev.process((events) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            if (events["connection.update"]) {
                const update = events["connection.update"];
                const { connection, lastDisconnect } = update;
                if (connection === "close") {
                    if ((lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error).output.statusCode !==
                        baileys_1.DisconnectReason.loggedOut) {
                        startSocket();
                    }
                    else {
                        (0, exports.deleteSession)(sessionId);
                    }
                }
                if (connection == "open") {
                    console.log("Whatsapp Session Connected: ", sessionId);
                }
            }
            if (events["creds.update"]) {
                yield saveCreds();
            }
            if (events["messages.upsert"]) {
                const msg = (_a = events["messages.upsert"].messages) === null || _a === void 0 ? void 0 : _a[0];
                (_b = callback.get(Defaults_1.CALLBACK_KEY.ON_MESSAGE_RECEIVED)) === null || _b === void 0 ? void 0 : _b(Object.assign({ sessionId }, msg));
            }
        }));
        return sock;
    });
    return yield startSocket();
});
exports.startSession = startSession;
/**
 * @deprecated Use startSession method instead
 */
exports.startWhatsapp = exports.startSession;
const deleteSession = (sessionId) => {
    const session = (0, exports.getSession)(sessionId);
    session === null || session === void 0 ? void 0 : session.logout();
    sessions.delete(sessionId);
    const dir = path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME, sessionId + Defaults_1.CREDENTIALS.PREFIX);
    if (fs_1.default.existsSync(dir)) {
        fs_1.default.rmSync(dir, { force: true, recursive: true });
    }
};
exports.deleteSession = deleteSession;
const getAllSession = () => Array.from(sessions.keys());
exports.getAllSession = getAllSession;
const getSession = (key) => sessions.get(key);
exports.getSession = getSession;
const loadSessions = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs_1.default.existsSync(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME))) {
        fs_1.default.mkdirSync(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME));
    }
    fs_1.default.readdir(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME), (err, dirs) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            throw err;
        }
        for (const dir of dirs) {
            (0, exports.startSession)(dir.split("_")[0]);
        }
    }));
});
const checkIsAvailableCreds = (sessionId) => {
    if (fs_1.default.existsSync(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME)) &&
        fs_1.default.existsSync(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME, sessionId + Defaults_1.CREDENTIALS.PREFIX)) &&
        (0, exports.getSession)(sessionId)) {
        return true;
    }
    return false;
};
loadSessions();
const onMessageReceived = (listener) => {
    callback.set(Defaults_1.CALLBACK_KEY.ON_MESSAGE_RECEIVED, listener);
};
exports.onMessageReceived = onMessageReceived;
