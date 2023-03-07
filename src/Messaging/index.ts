import { WASocket } from "@adiwajshing/baileys";
import { phoneToJid } from "../Utils";

export const sendTextMessage = async ({
  session,
  message = "",
  phoneNumber,
}: {
  session: WASocket;
  message: string;
  phoneNumber: string;
}) => {
  phoneNumber = phoneToJid(phoneNumber);
  return session.sendMessage(phoneNumber, {
    text: message,
  });
};
