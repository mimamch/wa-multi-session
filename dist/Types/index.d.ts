import { proto } from "@adiwajshing/baileys";
export interface SendMessageTypes {
    to: string | number;
    text?: string;
    sessionId: string;
    isGroup?: boolean;
}
export interface MessageReceived extends proto.IWebMessageInfo {
    sessionId: string;
}
