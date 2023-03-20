import { getSession } from "../Socket";
import { SendMessageTypes } from "../Types";
import { phoneToJid } from "./phone-to-jid";

export const isExist = async ({
  sessionId,
  to,
  isGroup = false,
}: SendMessageTypes): Promise<boolean> => {
  try {
    const session = getSession(sessionId);
    if (!session) throw new Error("Session ID Not Found!");
    const receiver = phoneToJid({
      to: to,
      isGroup: isGroup,
    });
    if (!isGroup) {
      const one = (await session.onWhatsApp(receiver))[0].exists;
      return one;
    } else {
      return Boolean((await session.groupMetadata(receiver)).id);
    }
  } catch (error) {
    return false;
  }
};
