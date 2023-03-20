import { SendMessageTypes } from "../Types";

export const phoneToJid = ({
  to,
  isGroup = false,
}: {
  to: string | number;
  isGroup?: boolean;
}): string => {
  if (!to) throw new Error('parameter "to" is required');
  let number = to.toString();
  if (isGroup) {
    number = number.replace(/\s|[+]|[-]/gim, "");
    if (!number.includes("@g.us")) number = number + "@g.us";
  } else {
    number = number.replace(/\s|[+]|[-]/gim, "");
    if (!number.includes("@s.whatsapp.net"))
      number = number + "@s.whatsapp.net";
  }

  return number;
};
