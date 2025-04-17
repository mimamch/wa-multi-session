import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { MessageReceived } from "../Types";
import ValidationError from "./error";
import fs from "fs/promises";

const saveMedia = async (path: string, data: Buffer) => {
  await fs.writeFile(path, data.toString("base64"), "base64");
};

export const saveImageHandler = async (msg: MessageReceived, path: string) => {
  if (!msg.message?.imageMessage)
    throw new ValidationError("Message is not contain Image");

  const buf = await downloadMediaMessage(msg, "buffer", {});

  return saveMedia(path, buf as Buffer);
};
export const saveVideoHandler = async (msg: MessageReceived, path: string) => {
  if (!msg.message?.videoMessage)
    throw new ValidationError("Message is not contain Video");

  const buf = await downloadMediaMessage(msg, "buffer", {});

  return saveMedia(path, buf as Buffer);
};

export const saveDocumentHandler = async (
  msg: MessageReceived,
  path: string
) => {
  if (!msg.message?.documentMessage)
    throw new ValidationError("Message is not contain Document");

  const buf = await downloadMediaMessage(msg, "buffer", {});

  const ext = msg.message.documentMessage.fileName?.split(".").pop();
  path += "." + ext;
  return saveMedia(path, buf as Buffer);
};

export const saveAudioHandler = async (msg: MessageReceived, path: string) => {
  if (!msg.message?.audioMessage)
    throw new ValidationError("Message is not contain Audio");

  const buf = await downloadMediaMessage(msg, "buffer", {});

  return saveMedia(path, buf as Buffer);
};
