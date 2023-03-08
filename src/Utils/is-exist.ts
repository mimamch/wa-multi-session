import { getSession } from "../Socket";
import { SendMessageTypes } from "../Types";

export const isExist = async ({
  sessionId,
  to,
  isGroup,
}: SendMessageTypes): Promise<boolean> => {
  try {
    const session = getSession(sessionId);
    if (!session) throw new Error("Session ID Not Found!");
    if (isGroup) {
      return Boolean((await session.groupMetadata(to.toString())).id);
    } else {
      return (await session.onWhatsApp(to.toString()))[0].exists;
    }
  } catch (error) {
    return false;
  }
};
