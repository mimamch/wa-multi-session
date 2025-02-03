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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.onPairingCode = exports.onMessageUpdate = exports.onConnecting = exports.onDisconnected = exports.onConnected = exports.onQRUpdated = exports.onMessageReceived = exports.loadSessionsFromStorage = exports.getSession = exports.getAllSession = exports.deleteSession = exports.startWhatsapp = exports.startSessionWithPairingCode = exports.startSession = void 0;
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Defaults_1 = require("../Defaults");
const save_media_1 = require("../Utils/save-media");
const Error_1 = require("../Error");
const message_status_1 = require("../Utils/message-status");
const sessions = new Map();
const callback = new Map();
const retryCount = new Map();
const P = require("pino")({
    level: "silent",
});
const startSession = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (sessionId = "mysession", options = { printQR: true }) {
    if (isSessionExistAndRunning(sessionId))
        throw new Error_1.WhatsappError(Defaults_1.Messages.sessionAlreadyExist(sessionId));
    const { version } = yield (0, baileys_1.fetchLatestBaileysVersion)();
    const startSocket = () => __awaiter(void 0, void 0, void 0, function* () {
        const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME, sessionId + Defaults_1.CREDENTIALS.PREFIX));
        const sock = (0, baileys_1.default)({
            version,
            printQRInTerminal: options.printQR,
            auth: state,
            logger: P,
            markOnlineOnConnect: false,
            browser: baileys_1.Browsers.ubuntu("Chrome"),
        });
        sessions.set(sessionId, Object.assign({}, sock));
        try {
            sock.ev.process((events) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
                if (events["connection.update"]) {
                    const update = events["connection.update"];
                    const { connection, lastDisconnect } = update;
                    if (update.qr) {
                        (_a = callback.get(Defaults_1.CALLBACK_KEY.ON_QR)) === null || _a === void 0 ? void 0 : _a({
                            sessionId,
                            qr: update.qr,
                        });
                        (_b = options.onQRUpdated) === null || _b === void 0 ? void 0 : _b.call(options, update.qr);
                    }
                    if (connection == "connecting") {
                        (_c = callback.get(Defaults_1.CALLBACK_KEY.ON_CONNECTING)) === null || _c === void 0 ? void 0 : _c(sessionId);
                        (_d = options.onConnecting) === null || _d === void 0 ? void 0 : _d.call(options);
                    }
                    if (connection === "close") {
                        const code = (_f = (_e = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _e === void 0 ? void 0 : _e.output) === null || _f === void 0 ? void 0 : _f.statusCode;
                        let retryAttempt = (_g = retryCount.get(sessionId)) !== null && _g !== void 0 ? _g : 0;
                        let shouldRetry;
                        if (code != baileys_1.DisconnectReason.loggedOut && retryAttempt < 10) {
                            shouldRetry = true;
                        }
                        if (shouldRetry) {
                            retryAttempt++;
                            retryCount.set(sessionId, retryAttempt);
                            startSocket();
                        }
                        else {
                            retryCount.delete(sessionId);
                            (0, exports.deleteSession)(sessionId);
                            (_h = callback.get(Defaults_1.CALLBACK_KEY.ON_DISCONNECTED)) === null || _h === void 0 ? void 0 : _h(sessionId);
                            (_j = options.onDisconnected) === null || _j === void 0 ? void 0 : _j.call(options);
                        }
                    }
                    if (connection == "open") {
                        retryCount.delete(sessionId);
                        (_k = callback.get(Defaults_1.CALLBACK_KEY.ON_CONNECTED)) === null || _k === void 0 ? void 0 : _k(sessionId);
                        (_l = options.onConnected) === null || _l === void 0 ? void 0 : _l.call(options);
                    }
                }
                if (events["creds.update"]) {
                    yield saveCreds();
                }
                if (events["messages.update"]) {
                    const msg = events["messages.update"][0];
                    const data = Object.assign({ sessionId: sessionId, messageStatus: (0, message_status_1.parseMessageStatusCodeToReadable)(msg.update.status) }, msg);
                    (_m = callback.get(Defaults_1.CALLBACK_KEY.ON_MESSAGE_UPDATED)) === null || _m === void 0 ? void 0 : _m(sessionId, data);
                    (_o = options.onMessageUpdated) === null || _o === void 0 ? void 0 : _o.call(options, data);
                }
                if (events["messages.upsert"]) {
                    const msg = (_p = events["messages.upsert"]
                        .messages) === null || _p === void 0 ? void 0 : _p[0];
                    msg.sessionId = sessionId;
                    msg.saveImage = (path) => (0, save_media_1.saveImageHandler)(msg, path);
                    msg.saveVideo = (path) => (0, save_media_1.saveVideoHandler)(msg, path);
                    msg.saveDocument = (path) => (0, save_media_1.saveDocumentHandler)(msg, path);
                    (_q = callback.get(Defaults_1.CALLBACK_KEY.ON_MESSAGE_RECEIVED)) === null || _q === void 0 ? void 0 : _q(Object.assign({}, msg));
                    (_r = options.onMessageReceived) === null || _r === void 0 ? void 0 : _r.call(options, msg);
                }
            }));
            return sock;
        }
        catch (error) {
            // console.log("SOCKET ERROR", error);
            return sock;
        }
    });
    return startSocket();
});
exports.startSession = startSession;
/**
 *
 * @deprecated Use startSession method instead
 */
const startSessionWithPairingCode = (sessionId, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (isSessionExistAndRunning(sessionId))
        throw new Error_1.WhatsappError(Defaults_1.Messages.sessionAlreadyExist(sessionId));
    const { version } = yield (0, baileys_1.fetchLatestBaileysVersion)();
    const startSocket = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME, sessionId + Defaults_1.CREDENTIALS.PREFIX));
        const sock = (0, baileys_1.default)({
            version,
            printQRInTerminal: false,
            auth: state,
            logger: P,
            markOnlineOnConnect: false,
            browser: baileys_1.Browsers.ubuntu("Chrome"),
        });
        sessions.set(sessionId, Object.assign({}, sock));
        try {
            if (!sock.authState.creds.registered) {
                console.log("first time pairing");
                const code = yield sock.requestPairingCode(options.phoneNumber);
                console.log(code);
                (_a = callback.get(Defaults_1.CALLBACK_KEY.ON_PAIRING_CODE)) === null || _a === void 0 ? void 0 : _a(sessionId, code);
            }
            sock.ev.process((events) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                if (events["connection.update"]) {
                    const update = events["connection.update"];
                    const { connection, lastDisconnect } = update;
                    if (update.qr) {
                        (_a = callback.get(Defaults_1.CALLBACK_KEY.ON_QR)) === null || _a === void 0 ? void 0 : _a({
                            sessionId,
                            qr: update.qr,
                        });
                    }
                    if (connection == "connecting") {
                        (_b = callback.get(Defaults_1.CALLBACK_KEY.ON_CONNECTING)) === null || _b === void 0 ? void 0 : _b(sessionId);
                    }
                    if (connection === "close") {
                        const code = (_d = (_c = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _c === void 0 ? void 0 : _c.output) === null || _d === void 0 ? void 0 : _d.statusCode;
                        let retryAttempt = (_e = retryCount.get(sessionId)) !== null && _e !== void 0 ? _e : 0;
                        let shouldRetry;
                        if (code != baileys_1.DisconnectReason.loggedOut && retryAttempt < 10) {
                            shouldRetry = true;
                        }
                        if (shouldRetry) {
                            retryAttempt++;
                        }
                        if (shouldRetry) {
                            retryCount.set(sessionId, retryAttempt);
                            startSocket();
                        }
                        else {
                            retryCount.delete(sessionId);
                            (0, exports.deleteSession)(sessionId);
                            (_f = callback.get(Defaults_1.CALLBACK_KEY.ON_DISCONNECTED)) === null || _f === void 0 ? void 0 : _f(sessionId);
                        }
                    }
                    if (connection == "open") {
                        retryCount.delete(sessionId);
                        (_g = callback.get(Defaults_1.CALLBACK_KEY.ON_CONNECTED)) === null || _g === void 0 ? void 0 : _g(sessionId);
                    }
                }
                if (events["creds.update"]) {
                    yield saveCreds();
                }
                if (events["messages.update"]) {
                    const msg = events["messages.update"][0];
                    const data = Object.assign({ sessionId: sessionId, messageStatus: (0, message_status_1.parseMessageStatusCodeToReadable)(msg.update.status) }, msg);
                    (_h = callback.get(Defaults_1.CALLBACK_KEY.ON_MESSAGE_UPDATED)) === null || _h === void 0 ? void 0 : _h(sessionId, data);
                }
                if (events["messages.upsert"]) {
                    const msg = (_j = events["messages.upsert"]
                        .messages) === null || _j === void 0 ? void 0 : _j[0];
                    msg.sessionId = sessionId;
                    msg.saveImage = (path) => (0, save_media_1.saveImageHandler)(msg, path);
                    msg.saveVideo = (path) => (0, save_media_1.saveVideoHandler)(msg, path);
                    msg.saveDocument = (path) => (0, save_media_1.saveDocumentHandler)(msg, path);
                    (_k = callback.get(Defaults_1.CALLBACK_KEY.ON_MESSAGE_RECEIVED)) === null || _k === void 0 ? void 0 : _k(Object.assign({}, msg));
                }
            }));
            return sock;
        }
        catch (error) {
            // console.log("SOCKET ERROR", error);
            return sock;
        }
    });
    return startSocket();
});
exports.startSessionWithPairingCode = startSessionWithPairingCode;
/**
 * @deprecated Use startSession method instead
 */
exports.startWhatsapp = exports.startSession;
const deleteSession = (sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = (0, exports.getSession)(sessionId);
    try {
        yield (session === null || session === void 0 ? void 0 : session.logout());
    }
    catch (error) { }
    session === null || session === void 0 ? void 0 : session.end(undefined);
    sessions.delete(sessionId);
    const dir = path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME, sessionId + Defaults_1.CREDENTIALS.PREFIX);
    if (fs_1.default.existsSync(dir)) {
        fs_1.default.rmSync(dir, { force: true, recursive: true });
    }
});
exports.deleteSession = deleteSession;
const getAllSession = () => Array.from(sessions.keys());
exports.getAllSession = getAllSession;
const getSession = (key) => sessions.get(key);
exports.getSession = getSession;
const isSessionExistAndRunning = (sessionId) => {
    if (fs_1.default.existsSync(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME)) &&
        fs_1.default.existsSync(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME, sessionId + Defaults_1.CREDENTIALS.PREFIX)) &&
        fs_1.default.readdirSync(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME, sessionId + Defaults_1.CREDENTIALS.PREFIX)).length &&
        (0, exports.getSession)(sessionId)) {
        return true;
    }
    return false;
};
const shouldLoadSession = (sessionId) => {
    if (fs_1.default.existsSync(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME)) &&
        fs_1.default.existsSync(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME, sessionId + Defaults_1.CREDENTIALS.PREFIX)) &&
        fs_1.default.readdirSync(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME, sessionId + Defaults_1.CREDENTIALS.PREFIX)).length &&
        !(0, exports.getSession)(sessionId)) {
        return true;
    }
    return false;
};
const loadSessionsFromStorage = () => {
    if (!fs_1.default.existsSync(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME))) {
        fs_1.default.mkdirSync(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME));
    }
    fs_1.default.readdir(path_1.default.resolve(Defaults_1.CREDENTIALS.DIR_NAME), (err, dirs) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            throw err;
        }
        for (const dir of dirs) {
            const sessionId = dir.split("_")[0];
            if (!shouldLoadSession(sessionId))
                continue;
            (0, exports.startSession)(sessionId);
        }
    }));
};
exports.loadSessionsFromStorage = loadSessionsFromStorage;
const onMessageReceived = (listener) => {
    callback.set(Defaults_1.CALLBACK_KEY.ON_MESSAGE_RECEIVED, listener);
};
exports.onMessageReceived = onMessageReceived;
const onQRUpdated = (listener) => {
    callback.set(Defaults_1.CALLBACK_KEY.ON_QR, listener);
};
exports.onQRUpdated = onQRUpdated;
const onConnected = (listener) => {
    callback.set(Defaults_1.CALLBACK_KEY.ON_CONNECTED, listener);
};
exports.onConnected = onConnected;
const onDisconnected = (listener) => {
    callback.set(Defaults_1.CALLBACK_KEY.ON_DISCONNECTED, listener);
};
exports.onDisconnected = onDisconnected;
const onConnecting = (listener) => {
    callback.set(Defaults_1.CALLBACK_KEY.ON_CONNECTING, listener);
};
exports.onConnecting = onConnecting;
const onMessageUpdate = (listener) => {
    callback.set(Defaults_1.CALLBACK_KEY.ON_MESSAGE_UPDATED, listener);
};
exports.onMessageUpdate = onMessageUpdate;
const onPairingCode = (listener) => {
    callback.set(Defaults_1.CALLBACK_KEY.ON_MESSAGE_UPDATED, listener);
};
exports.onPairingCode = onPairingCode;
