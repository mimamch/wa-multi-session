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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVideo = exports.sendImage = exports.sendTextMessage = void 0;
const Socket_1 = require("../Socket");
const Utils_1 = require("../Utils");
const is_exist_1 = require("../Utils/is-exist");
const sendTextMessage = ({ sessionId, to, text = "", isGroup = false, }) => __awaiter(void 0, void 0, void 0, function* () {
    const session = (0, Socket_1.getSession)(sessionId);
    if (!session)
        throw new Error(`Session with ID: ${sessionId} Not Found!`);
    const oldPhone = to;
    to = (0, Utils_1.phoneToJid)({ to, isGroup, sessionId });
    const isRegistered = yield (0, is_exist_1.isExist)({
        sessionId,
        to,
        isGroup,
    });
    if (!isRegistered) {
        throw new Error(`${oldPhone} is not registered on Whatsapp`);
    }
    return yield session.sendMessage(to, {
        text: text,
    });
});
exports.sendTextMessage = sendTextMessage;
const sendImage = ({ sessionId, to, text = "", isGroup = false, media, }) => __awaiter(void 0, void 0, void 0, function* () {
    const session = (0, Socket_1.getSession)(sessionId);
    if (!session)
        throw new Error(`Session with ID: ${sessionId} Not Found!`);
    const oldPhone = to;
    to = (0, Utils_1.phoneToJid)({ to, isGroup, sessionId });
    const isRegistered = yield (0, is_exist_1.isExist)({
        sessionId,
        to,
        isGroup,
    });
    if (!isRegistered) {
        throw new Error(`${oldPhone} is not registered on Whatsapp`);
    }
    if (!media)
        throw new Error("parameter media must be Buffer or String URL");
    return yield session.sendMessage(to, {
        image: typeof media == "string"
            ? {
                url: media,
            }
            : media,
        caption: text,
    });
});
exports.sendImage = sendImage;
const sendVideo = ({ sessionId, to, text = "", isGroup = false, media, }) => __awaiter(void 0, void 0, void 0, function* () {
    const session = (0, Socket_1.getSession)(sessionId);
    if (!session)
        throw new Error(`Session with ID: ${sessionId} Not Found!`);
    const oldPhone = to;
    to = (0, Utils_1.phoneToJid)({ to, isGroup, sessionId });
    const isRegistered = yield (0, is_exist_1.isExist)({
        sessionId,
        to,
        isGroup,
    });
    if (!isRegistered) {
        throw new Error(`${oldPhone} is not registered on Whatsapp`);
    }
    if (!media)
        throw new Error("parameter media must be Buffer or String URL");
    return yield session.sendMessage(to, {
        video: typeof media == "string"
            ? {
                url: media,
            }
            : media,
        caption: text,
    });
});
exports.sendVideo = sendVideo;
