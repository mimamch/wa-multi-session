import { WASocket } from "@adiwajshing/baileys";
export declare const startWhatsapp: (sessionName: string) => Promise<void>;
export declare const getAllSession: () => string[];
export declare const getSession: (key: string) => WASocket;
