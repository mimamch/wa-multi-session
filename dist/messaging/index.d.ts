import { proto, WASocket } from "@adiwajshing/baileys";
export declare const sendTextMessage: ({ session, message, phoneNumber, }: {
    session: WASocket;
    message: string;
    phoneNumber: string;
}) => Promise<proto.WebMessageInfo | undefined>;
