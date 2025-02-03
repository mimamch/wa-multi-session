"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readMessage = exports.sendTyping = exports.sendSticker = exports.sendVoiceNote = exports.sendDocument = exports.sendVideo = exports.sendImage = exports.sendTextMessage = void 0;
const Defaults_1 = require("../Defaults");
const Socket_1 = require("../Socket");
const Utils_1 = require("../Utils");
const create_delay_1 = require("../Utils/create-delay");
const is_exist_1 = require("../Utils/is-exist");
const mime_1 = __importDefault(require("mime"));
const Error_1 = require("../Error");
const sendTextMessage = (_a) => __awaiter(void 0, void 0, void 0, function* () {
    var { sessionId, to, text = "", isGroup = false } = _a, props = __rest(_a, ["sessionId", "to", "text", "isGroup"]);
    const session = (0, Socket_1.getSession)(sessionId);
    if (!session)
        throw new Error_1.WhatsappError(Defaults_1.Messages.sessionNotFound(sessionId));
    const oldPhone = to;
    to = (0, Utils_1.phoneToJid)({ to, isGroup });
    const isRegistered = yield (0, is_exist_1.isExist)({
        sessionId,
        to,
        isGroup,
    });
    if (!isRegistered) {
        throw new Error_1.WhatsappError(`${oldPhone} is not registered on Whatsapp`);
    }
    return yield session.sendMessage(to, {
        text: text,
    }, {
        quoted: props.answering,
    });
});
exports.sendTextMessage = sendTextMessage;
const sendImage = (_a) => __awaiter(void 0, void 0, void 0, function* () {
    var { sessionId, to, text = "", isGroup = false, media } = _a, props = __rest(_a, ["sessionId", "to", "text", "isGroup", "media"]);
    const session = (0, Socket_1.getSession)(sessionId);
    if (!session)
        throw new Error_1.WhatsappError(Defaults_1.Messages.sessionNotFound(sessionId));
    const oldPhone = to;
    to = (0, Utils_1.phoneToJid)({ to, isGroup });
    const isRegistered = yield (0, is_exist_1.isExist)({
        sessionId,
        to,
        isGroup,
    });
    if (!isRegistered) {
        throw new Error_1.WhatsappError(`${oldPhone} is not registered on Whatsapp`);
    }
    if (!media)
        throw new Error_1.WhatsappError("parameter media must be Buffer or String URL");
    return yield session.sendMessage(to, {
        image: typeof media == "string"
            ? {
                url: media,
            }
            : media,
        caption: text,
    }, {
        quoted: props.answering,
    });
});
exports.sendImage = sendImage;
const sendVideo = (_a) => __awaiter(void 0, void 0, void 0, function* () {
    var { sessionId, to, text = "", isGroup = false, media } = _a, props = __rest(_a, ["sessionId", "to", "text", "isGroup", "media"]);
    const session = (0, Socket_1.getSession)(sessionId);
    if (!session)
        throw new Error_1.WhatsappError(Defaults_1.Messages.sessionNotFound(sessionId));
    const oldPhone = to;
    to = (0, Utils_1.phoneToJid)({ to, isGroup });
    const isRegistered = yield (0, is_exist_1.isExist)({
        sessionId,
        to,
        isGroup,
    });
    if (!isRegistered) {
        throw new Error_1.WhatsappError(`${oldPhone} is not registered on Whatsapp`);
    }
    if (!media)
        throw new Error_1.WhatsappError("parameter media must be Buffer or String URL");
    return yield session.sendMessage(to, {
        video: typeof media == "string"
            ? {
                url: media,
            }
            : media,
        caption: text,
    }, {
        quoted: props.answering,
    });
});
exports.sendVideo = sendVideo;
const sendDocument = (_a) => __awaiter(void 0, void 0, void 0, function* () {
    var { sessionId, to, text = "", isGroup = false, media, filename } = _a, props = __rest(_a, ["sessionId", "to", "text", "isGroup", "media", "filename"]);
    const session = (0, Socket_1.getSession)(sessionId);
    if (!session)
        throw new Error_1.WhatsappError(Defaults_1.Messages.sessionNotFound(sessionId));
    const oldPhone = to;
    to = (0, Utils_1.phoneToJid)({ to, isGroup });
    const isRegistered = yield (0, is_exist_1.isExist)({
        sessionId,
        to,
        isGroup,
    });
    if (!isRegistered) {
        throw new Error_1.WhatsappError(`${oldPhone} is not registered on Whatsapp`);
    }
    if (!media) {
        throw new Error_1.WhatsappError(`Invalid Media`);
    }
    const mimetype = mime_1.default.getType(filename);
    if (!mimetype) {
        throw new Error_1.WhatsappError(`Filename must include valid extension`);
    }
    return yield session.sendMessage(to, {
        fileName: filename,
        document: typeof media == "string"
            ? {
                url: media,
            }
            : media,
        mimetype: mimetype,
        caption: text,
    }, {
        quoted: props.answering,
    });
});
exports.sendDocument = sendDocument;
const sendVoiceNote = (_a) => __awaiter(void 0, void 0, void 0, function* () {
    var { sessionId, to, isGroup = false, media } = _a, props = __rest(_a, ["sessionId", "to", "isGroup", "media"]);
    const session = (0, Socket_1.getSession)(sessionId);
    if (!session)
        throw new Error_1.WhatsappError(Defaults_1.Messages.sessionNotFound(sessionId));
    const oldPhone = to;
    to = (0, Utils_1.phoneToJid)({ to, isGroup });
    const isRegistered = yield (0, is_exist_1.isExist)({
        sessionId,
        to,
        isGroup,
    });
    if (!isRegistered) {
        throw new Error_1.WhatsappError(`${oldPhone} is not registered on Whatsapp`);
    }
    if (!media) {
        throw new Error_1.WhatsappError(`Invalid Media`);
    }
    return yield session.sendMessage(to, {
        audio: typeof media == "string"
            ? {
                url: media,
            }
            : media,
        ptt: true,
    }, {
        quoted: props.answering,
    });
});
exports.sendVoiceNote = sendVoiceNote;
const sendSticker = (_a) => __awaiter(void 0, void 0, void 0, function* () {
    var { sessionId, to, isGroup, media } = _a, props = __rest(_a, ["sessionId", "to", "isGroup", "media"]);
    const session = (0, Socket_1.getSession)(sessionId);
    if (!session)
        throw new Error_1.WhatsappError(Defaults_1.Messages.sessionNotFound(sessionId));
    const oldPhone = to;
    to = (0, Utils_1.phoneToJid)({ to, isGroup });
    const isRegistered = yield (0, is_exist_1.isExist)({
        sessionId,
        to,
        isGroup,
    });
    if (!isRegistered) {
        throw new Error_1.WhatsappError(`${oldPhone} is not registered on Whatsapp`);
    }
    if (!media) {
        throw new Error_1.WhatsappError(`Invalid Media`);
    }
    return yield session.sendMessage(to, {
        sticker: typeof media == "string"
            ? {
                url: media,
            }
            : media,
    }, {
        quoted: props.answering,
    });
});
exports.sendSticker = sendSticker;
/**
 * Give typing effect to target
 *
 * Looks like human typing
 *
 *
 * @param sessionId - Session ID
 * @param to - Target
 * @param duration - Duration in miliseconds typing effect will appear
 */
const sendTyping = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sessionId, to, duration = 1000, isGroup = false, }) {
    const oldPhone = to;
    to = (0, Utils_1.phoneToJid)({ to, isGroup });
    const session = (0, Socket_1.getSession)(sessionId);
    if (!session)
        throw new Error_1.WhatsappError(Defaults_1.Messages.sessionNotFound(sessionId));
    const isRegistered = yield (0, is_exist_1.isExist)({
        sessionId,
        to,
        isGroup,
    });
    if (!isRegistered) {
        throw new Error_1.WhatsappError(`${oldPhone} is not registered on Whatsapp`);
    }
    yield session.sendPresenceUpdate("composing", to);
    yield (0, create_delay_1.createDelay)(duration);
    yield session.sendPresenceUpdate("available", to);
});
exports.sendTyping = sendTyping;
/**
 * Give typing effect to target
 *
 * Looks like human typing
 *
 *
 * @param sessionId - Session ID
 * @param to - Target
 * @param duration - Duration in miliseconds typing effect will appear
 */
const readMessage = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sessionId, key }) {
    const session = (0, Socket_1.getSession)(sessionId);
    if (!session)
        throw new Error_1.WhatsappError(Defaults_1.Messages.sessionNotFound(sessionId));
    yield session.readMessages([key]);
});
exports.readMessage = readMessage;
