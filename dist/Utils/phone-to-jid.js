"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phoneToJid = void 0;
const phoneToJid = ({ to, isGroup = false, }) => {
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
