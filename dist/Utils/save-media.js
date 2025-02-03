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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDocumentHandler = exports.saveVideoHandler = exports.saveImageHandler = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
const error_1 = __importDefault(require("./error"));
const promises_1 = __importDefault(require("fs/promises"));
const saveMedia = (path, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield promises_1.default.writeFile(path, data.toString("base64"), "base64");
});
const saveImageHandler = (msg, path) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = msg.message) === null || _a === void 0 ? void 0 : _a.imageMessage))
        throw new error_1.default("Message is not contain Image");
    const buf = yield (0, baileys_1.downloadMediaMessage)(msg, "buffer", {});
    return saveMedia(path, buf);
});
exports.saveImageHandler = saveImageHandler;
const saveVideoHandler = (msg, path) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = msg.message) === null || _a === void 0 ? void 0 : _a.videoMessage))
        throw new error_1.default("Message is not contain Video");
    const buf = yield (0, baileys_1.downloadMediaMessage)(msg, "buffer", {});
    return saveMedia(path, buf);
});
exports.saveVideoHandler = saveVideoHandler;
const saveDocumentHandler = (msg, path) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!((_a = msg.message) === null || _a === void 0 ? void 0 : _a.documentMessage))
        throw new error_1.default("Message is not contain Document");
    const buf = yield (0, baileys_1.downloadMediaMessage)(msg, "buffer", {});
    const ext = (_b = msg.message.documentMessage.fileName) === null || _b === void 0 ? void 0 : _b.split(".").pop();
    path += "." + ext;
    return saveMedia(path, buf);
});
exports.saveDocumentHandler = saveDocumentHandler;
