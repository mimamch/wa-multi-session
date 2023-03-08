/// <reference types="node" />
import { proto, WASocket } from "@adiwajshing/baileys";
import { MessageReceived } from "../Types";
export declare const startWhatsapp: (sessionId?: string) => Promise<{
    getOrderDetails: (orderId: string, tokenBase64: string) => Promise<import("@adiwajshing/baileys").OrderDetails>;
    getCatalog: ({ jid, limit, cursor }: import("@adiwajshing/baileys").GetCatalogOptions) => Promise<{
        products: import("@adiwajshing/baileys").Product[];
        nextPageCursor: string | undefined;
    }>;
    getCollections: (jid?: string | undefined, limit?: number | undefined) => Promise<{
        collections: import("@adiwajshing/baileys").CatalogCollection[];
    }>;
    productCreate: (create: import("@adiwajshing/baileys").ProductCreate) => Promise<import("@adiwajshing/baileys").Product>;
    productDelete: (productIds: string[]) => Promise<{
        deleted: number;
    }>;
    productUpdate: (productId: string, update: import("@adiwajshing/baileys").ProductUpdate) => Promise<import("@adiwajshing/baileys").Product>;
    sendMessageAck: ({ tag, attrs }: import("@adiwajshing/baileys").BinaryNode) => Promise<void>;
    sendRetryRequest: (node: import("@adiwajshing/baileys").BinaryNode, forceIncludeKeys?: boolean | undefined) => Promise<void>;
    rejectCall: (callId: string, callFrom: string) => Promise<void>;
    getPrivacyTokens: (jids: string[]) => Promise<import("@adiwajshing/baileys").BinaryNode>;
    assertSessions: (jids: string[], force: boolean) => Promise<boolean>;
    relayMessage: (jid: string, message: proto.IMessage, { messageId: msgId, participant, additionalAttributes, useUserDevicesCache, cachedGroupMetadata }: import("@adiwajshing/baileys").MessageRelayOptions) => Promise<string>;
    sendReceipt: (jid: string, participant: string | undefined, messageIds: string[], type: import("@adiwajshing/baileys").MessageReceiptType) => Promise<void>;
    sendReceipts: (keys: proto.IMessageKey[], type: import("@adiwajshing/baileys").MessageReceiptType) => Promise<void>;
    readMessages: (keys: proto.IMessageKey[]) => Promise<void>;
    refreshMediaConn: (forceGet?: boolean | undefined) => Promise<import("@adiwajshing/baileys").MediaConnInfo>;
    waUploadToServer: import("@adiwajshing/baileys").WAMediaUploadFunction;
    fetchPrivacySettings: (force?: boolean | undefined) => Promise<{
        [_: string]: string;
    }>;
    updateMediaMessage: (message: proto.IWebMessageInfo) => Promise<proto.IWebMessageInfo>;
    sendMessage: (jid: string, content: import("@adiwajshing/baileys").AnyMessageContent, options?: import("@adiwajshing/baileys").MiscMessageGenerationOptions | undefined) => Promise<proto.WebMessageInfo | undefined>;
    groupMetadata: (jid: string) => Promise<import("@adiwajshing/baileys").GroupMetadata>;
    groupCreate: (subject: string, participants: string[]) => Promise<import("@adiwajshing/baileys").GroupMetadata>;
    groupLeave: (id: string) => Promise<void>;
    groupUpdateSubject: (jid: string, subject: string) => Promise<void>;
    groupParticipantsUpdate: (jid: string, participants: string[], action: import("@adiwajshing/baileys").ParticipantAction) => Promise<{
        status: string;
        jid: string;
    }[]>;
    groupUpdateDescription: (jid: string, description?: string | undefined) => Promise<void>;
    groupInviteCode: (jid: string) => Promise<string | undefined>;
    groupRevokeInvite: (jid: string) => Promise<string | undefined>;
    groupAcceptInvite: (code: string) => Promise<string | undefined>;
    groupAcceptInviteV4: (key: string | proto.IMessageKey, inviteMessage: proto.Message.IGroupInviteMessage) => Promise<string>;
    groupGetInviteInfo: (code: string) => Promise<import("@adiwajshing/baileys").GroupMetadata>;
    groupToggleEphemeral: (jid: string, ephemeralExpiration: number) => Promise<void>;
    groupSettingUpdate: (jid: string, setting: "announcement" | "locked" | "not_announcement" | "unlocked") => Promise<void>;
    groupFetchAllParticipating: () => Promise<{
        [_: string]: import("@adiwajshing/baileys").GroupMetadata;
    }>;
    processingMutex: {
        mutex<T>(code: () => T | Promise<T>): Promise<T>;
    };
    upsertMessage: (msg: proto.IWebMessageInfo, type: import("@adiwajshing/baileys").MessageUpsertType) => Promise<void>;
    appPatch: (patchCreate: import("@adiwajshing/baileys").WAPatchCreate) => Promise<void>;
    sendPresenceUpdate: (type: import("@adiwajshing/baileys").WAPresence, toJid?: string | undefined) => Promise<void>;
    presenceSubscribe: (toJid: string, tcToken?: Buffer | undefined) => Promise<void>;
    profilePictureUrl: (jid: string, type?: "image" | "preview" | undefined, timeoutMs?: number | undefined) => Promise<string | undefined>;
    onWhatsApp: (...jids: string[]) => Promise<{
        exists: boolean;
        jid: string;
    }[]>;
    fetchBlocklist: () => Promise<string[]>;
    fetchStatus: (jid: string) => Promise<{
        status: string | undefined;
        setAt: Date;
    } | undefined>;
    updateProfilePicture: (jid: string, content: import("@adiwajshing/baileys").WAMediaUpload) => Promise<void>;
    updateProfileStatus: (status: string) => Promise<void>;
    updateProfileName: (name: string) => Promise<void>;
    updateBlockStatus: (jid: string, action: "block" | "unblock") => Promise<void>;
    getBusinessProfile: (jid: string) => Promise<void | import("@adiwajshing/baileys").WABusinessProfile>;
    resyncAppState: (collections: readonly ("critical_block" | "critical_unblock_low" | "regular_high" | "regular_low" | "regular")[], isInitialSync: boolean) => Promise<void>;
    chatModify: (mod: import("@adiwajshing/baileys").ChatModification, jid: string) => Promise<void>;
    type: "md";
    ws: any;
    ev: import("@adiwajshing/baileys").BaileysEventEmitter & {
        process(handler: (events: Partial<import("@adiwajshing/baileys").BaileysEventMap>) => void | Promise<void>): () => void;
        buffer(): void;
        createBufferedFunction<A extends any[], T_1>(work: (...args: A) => Promise<T_1>): (...args: A) => Promise<T_1>;
        flush(force?: boolean | undefined): boolean;
        isBuffering(): boolean;
    };
    authState: {
        creds: import("@adiwajshing/baileys").AuthenticationCreds;
        keys: import("@adiwajshing/baileys").SignalKeyStoreWithTransaction;
    };
    user: import("@adiwajshing/baileys").Contact | undefined;
    generateMessageTag: () => string;
    query: (node: import("@adiwajshing/baileys").BinaryNode, timeoutMs?: number | undefined) => Promise<import("@adiwajshing/baileys").BinaryNode>;
    waitForMessage: (msgId: string, timeoutMs?: number | undefined) => Promise<any>;
    waitForSocketOpen: () => Promise<void>;
    sendRawMessage: (data: Buffer | Uint8Array) => Promise<void>;
    sendNode: (frame: import("@adiwajshing/baileys").BinaryNode) => Promise<void>;
    logout: (msg?: string | undefined) => Promise<void>;
    end: (error: Error | undefined) => void;
    onUnexpectedError: (error: Error, msg: string) => void;
    uploadPreKeys: (count?: number | undefined) => Promise<void>;
    uploadPreKeysToServerIfRequired: () => Promise<void>;
    waitForConnectionUpdate: (check: (u: Partial<import("@adiwajshing/baileys").ConnectionState>) => boolean | undefined, timeoutMs?: number | undefined) => Promise<void>;
}>;
export declare const deleteSession: (sessionId: string) => void;
export declare const getAllSession: () => string[];
export declare const getSession: (key: string) => WASocket | undefined;
export declare const onMessageReceived: (listener: (msg: MessageReceived) => any) => void;
