import { proto, WASocket } from "@adiwajshing/baileys";
import { getSession } from "../Socket";
import { SendMessageTypes } from "../Types";
import { phoneToJid } from "../Utils";
import { isExist } from "../Utils/is-exist";

export const sendTextMessage = async ({
  sessionId,
  to,
  text = "",
  isGroup = false,
}: SendMessageTypes): Promise<proto.WebMessageInfo | undefined> => {
  const session = getSession(sessionId);
  if (!session) throw new Error(`Session with ID: ${sessionId} Not Found!`);
  const oldPhone = to;
  to = phoneToJid({ to, isGroup, sessionId });
  const isRegistered = await isExist({
    sessionId,
    to,
    isGroup,
  });
  if (!isRegistered) {
    throw new Error(`${oldPhone} is not registered on Whatsapp`);
  }
  return await session.sendMessage(to, {
    text: text,
  });
};
export const sendImage = async ({
  sessionId,
  to,
  text = "",
  isGroup = false,
  media,
}: SendMessageTypes): Promise<proto.WebMessageInfo | undefined> => {
  const session = getSession(sessionId);
  if (!session) throw new Error(`Session with ID: ${sessionId} Not Found!`);
  const oldPhone = to;
  to = phoneToJid({ to, isGroup, sessionId });
  const isRegistered = await isExist({
    sessionId,
    to,
    isGroup,
  });
  if (!isRegistered) {
    throw new Error(`${oldPhone} is not registered on Whatsapp`);
  }
  if (!media) throw new Error("parameter media must be Buffer or String URL");
  return await session.sendMessage(to, {
    image:
      typeof media == "string"
        ? {
            url: media,
          }
        : media,
    caption: text,
  });
};
export const sendVideo = async ({
  sessionId,
  to,
  text = "",
  isGroup = false,
  media,
}: SendMessageTypes): Promise<proto.WebMessageInfo | undefined> => {
  const session = getSession(sessionId);
  if (!session) throw new Error(`Session with ID: ${sessionId} Not Found!`);
  const oldPhone = to;
  to = phoneToJid({ to, isGroup, sessionId });
  const isRegistered = await isExist({
    sessionId,
    to,
    isGroup,
  });
  if (!isRegistered) {
    throw new Error(`${oldPhone} is not registered on Whatsapp`);
  }
  if (!media) throw new Error("parameter media must be Buffer or String URL");
  return await session.sendMessage(to, {
    video:
      typeof media == "string"
        ? {
            url: media,
          }
        : media,
    caption: text,
  });
};
