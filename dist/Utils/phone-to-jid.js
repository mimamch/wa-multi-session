"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phoneToJid = void 0;
const phoneToJid = ({ to, isGroup = false, }) => {
    if (!to)
        throw new Error('parameter "to" is required');
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
