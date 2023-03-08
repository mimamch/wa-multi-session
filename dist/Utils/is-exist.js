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
exports.isExist = void 0;
const Socket_1 = require("../Socket");
const isExist = ({ sessionId, to, isGroup, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = (0, Socket_1.getSession)(sessionId);
        if (!session)
            throw new Error("Session ID Not Found!");
        if (isGroup) {
            return Boolean((yield session.groupMetadata(to.toString())).id);
        }
        else {
            return (yield session.onWhatsApp(to.toString()))[0].exists;
        }
    }
    catch (error) {
        return false;
    }
});
exports.isExist = isExist;
