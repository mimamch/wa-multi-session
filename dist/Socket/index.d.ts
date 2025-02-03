import { WASocket } from "@whiskeysockets/baileys";
import type { MessageReceived, MessageUpdated, StartSessionParams, StartSessionWithPairingCodeParams } from "../Types";
export declare const startSession: (sessionId?: string, options?: StartSessionParams) => Promise<WASocket>;
/**
 *
 * @deprecated Use startSession method instead
 */
export declare const startSessionWithPairingCode: (sessionId: string, options: StartSessionWithPairingCodeParams) => Promise<WASocket>;
/**
 * @deprecated Use startSession method instead
 */
export declare const startWhatsapp: (sessionId?: string, options?: StartSessionParams) => Promise<WASocket>;
export declare const deleteSession: (sessionId: string) => Promise<void>;
export declare const getAllSession: () => string[];
export declare const getSession: (key: string) => WASocket | undefined;
export declare const loadSessionsFromStorage: () => void;
export declare const onMessageReceived: (listener: (msg: MessageReceived) => any) => void;
export declare const onQRUpdated: (listener: ({ sessionId, qr }: {
    sessionId: string;
    qr: string;
}) => any) => void;
export declare const onConnected: (listener: (sessionId: string) => any) => void;
export declare const onDisconnected: (listener: (sessionId: string) => any) => void;
export declare const onConnecting: (listener: (sessionId: string) => any) => void;
export declare const onMessageUpdate: (listener: (data: MessageUpdated) => any) => void;
export declare const onPairingCode: (listener: (sessionId: string, code: string) => any) => void;
//# sourceMappingURL=index.d.ts.map