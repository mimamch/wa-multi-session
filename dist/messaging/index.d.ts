import { WASocket } from "@adiwajshing/baileys";
export declare const sendTextMessage: ({ session, message, phoneNumber, }: {
    session: WASocket;
    message: string;
    phoneNumber: string;
}) => Promise<import("@adiwajshing/baileys").proto.WebMessageInfo | undefined>;
