import { WASocket } from "@adiwajshing/baileys";

export const sendTextMessage = async ({
  session,
  message,
  jid,
}: {
  session: WASocket;
  message: string;
  jid: string;
}) => {
  return session.sendMessage(jid, {
    text: "",
  });
};
