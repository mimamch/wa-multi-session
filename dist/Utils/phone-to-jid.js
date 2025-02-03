"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.phoneToJid = void 0;
const Error_1 = require("../Error");
const baileys_1 = __importDefault(require("@whiskeysockets/baileys"));
const isPhoneNumberValidCountry = (phone) => {
    return Object.keys(baileys_1.default).some((key) => {
        return phone.startsWith(key);
    });
};
const phoneToJid = ({ to, isGroup = false, }) => {
    if (!to)
        throw new Error_1.WhatsappError('parameter "to" is required');
    let number = to.toString();
    if (isGroup) {
        number = number.replace(/\s|[+]|[-]/gim, "");
        if (!number.includes("@g.us"))
            number = number + "@g.us";
    }
    else {
        number = number.replace(/\s|[+]|[-]/gim, "");
        if (!number.includes("@s.whatsapp.net"))
            number = number + "@s.whatsapp.net";
    }
    return number;
};
exports.phoneToJid = phoneToJid;
