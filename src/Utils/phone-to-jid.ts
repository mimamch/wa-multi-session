import { WhatsappError } from "../Error";
import PHONENUMBER_MCC from "@whiskeysockets/baileys";

const isPhoneNumberValidCountry = (phone: string) => {
  return Object.keys(PHONENUMBER_MCC).some((key) => {
    return phone.startsWith(key);
  });
};

export const phoneToJid = ({
  to,
  isGroup = false,
}: {
  to: string | number;
  isGroup?: boolean;
}): string => {
  if (!to) throw new WhatsappError('parameter "to" is required');
  let number = to.toString().replace(/\s|\+/g, "");

  // if any group JID (@g.us), leave the (-) return it as is
  if (number.endsWith("@g.us")) {
    return number;
  }

  // Pattern group JID: // 1234567890-1234567890 = group JID
  const isGroupJidFormat = isGroup && /^\d+-\d+$/.test(number);

  // if not JID group, remove any (-) minus characters
  if (!isGroupJidFormat) {
    number = number.replace(/-/g, "");
  }

  // Add suffix if not exists
  if (isGroup) {
    if (!number.endsWith("@g.us")) number = number + "@g.us";
  } else {
    // remove any spaces or plus characters
    // remove all unnecessary logic code and make it look efficient
    number = number.replace(/\s|\+/gim, "");
    if (!number.endsWith("@s.whatsapp.net"))
      number = number + "@s.whatsapp.net";
  }

  return number;
};
