import { WASocket } from "@adiwajshing/baileys";
export declare const sendTextMessage: ({ session, message, jid, }: {
    session: WASocket;
    message: string;
    jid: string;
}) => Promise<import("@adiwajshing/baileys").proto.WebMessageInfo | undefined>;
