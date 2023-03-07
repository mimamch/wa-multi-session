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
exports.sendTextMessage = void 0;
const Utils_1 = require("../Utils");
const sendTextMessage = ({ session, message = "", phoneNumber, }) => __awaiter(void 0, void 0, void 0, function* () {
    const oldPhone = phoneNumber;
    phoneNumber = (0, Utils_1.phoneToJid)(phoneNumber);
    const [check] = yield session.onWhatsApp(phoneNumber);
    if (!(check === null || check === void 0 ? void 0 : check.exists)) {
        throw new Error(`${oldPhone} is not registered on Whatsapp`);
    }
    return yield session.sendMessage(phoneNumber, {
        text: message,
    });
});
exports.sendTextMessage = sendTextMessage;
