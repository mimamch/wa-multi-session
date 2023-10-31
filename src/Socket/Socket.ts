import { WASocket } from "@whiskeysockets/baileys";
import { MessageReceived, MessageUpdated } from "../Types";

export class Socket {
  constructor({
    id,
    phoneNumber,
    socket,
  }: {
    id: string;
    phoneNumber: string;
    socket?: WASocket;
  }) {
    this.id = id;
    this.phoneNumber = phoneNumber;
    this.socket = socket;
  }

  id: string;
  socket: WASocket | undefined;
  phoneNumber: string;

  async logout() {
    try {
      await this.socket?.logout();
    } catch (error) {}
    this.socket?.end(undefined);
  }

  onQr?: (qr: string) => void;
  onPairing?: (code: string) => void;
  onConnecting?: () => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onMessageUpdated?: (data: MessageUpdated) => void;
  onMessageReceived?: (data: MessageReceived) => void;
}

// const socket = new Socket({ id: "1" });
