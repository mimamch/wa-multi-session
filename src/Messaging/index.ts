import { proto, WASocket } from "@adiwajshing/baileys";
import { phoneToJid } from "../Utils";

export const sendTextMessage = async ({
  session,
  message = "",
  phoneNumber,
}: {
  session: WASocket;
  message: string;
  phoneNumber: string;
}): Promise<proto.WebMessageInfo | undefined> => {
  const oldPhone = phoneNumber;
  phoneNumber = phoneToJid(phoneNumber);
  const [check] = await session.onWhatsApp(phoneNumber);
  if (!check?.exists) {
    throw new Error(`${oldPhone} is not registered on Whatsapp`);
  }
  return await session.sendMessage(phoneNumber, {
    text: message,
  });
};
