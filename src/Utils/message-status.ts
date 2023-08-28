import { proto } from "@whiskeysockets/baileys";
import { MessageUpdated } from "../Types";

export const parseMessageStatusCodeToReadable = (
  code: proto.WebMessageInfo.Status
): MessageUpdated["messageStatus"] => {
  if (code == proto.WebMessageInfo.Status.PENDING) return "pending";
  if (code == proto.WebMessageInfo.Status.SERVER_ACK) return "server";
  if (code == proto.WebMessageInfo.Status.DELIVERY_ACK) return "delivered";
  if (code == proto.WebMessageInfo.Status.READ) return "read";
  if (code == proto.WebMessageInfo.Status.PLAYED) return "played";

  return "error";
};
