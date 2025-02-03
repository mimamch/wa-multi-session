"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMessageStatusCodeToReadable = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
const parseMessageStatusCodeToReadable = (code) => {
    if (code == baileys_1.proto.WebMessageInfo.Status.PENDING)
        return "pending";
    if (code == baileys_1.proto.WebMessageInfo.Status.SERVER_ACK)
        return "server";
    if (code == baileys_1.proto.WebMessageInfo.Status.DELIVERY_ACK)
        return "delivered";
    if (code == baileys_1.proto.WebMessageInfo.Status.READ)
        return "read";
    if (code == baileys_1.proto.WebMessageInfo.Status.PLAYED)
        return "played";
    return "error";
};
exports.parseMessageStatusCodeToReadable = parseMessageStatusCodeToReadable;
