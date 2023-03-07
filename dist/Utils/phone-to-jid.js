"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phoneToJid = void 0;
const phoneToJid = (phoneNumber) => {
    let number = phoneNumber;
    number = number.toString().replace(/\s|[+]|[-]/gim, "");
    if (!number.includes("@s.whatsapp.net"))
        number = number + "@s.whatsapp.net";
    return number;
};
exports.phoneToJid = phoneToJid;
