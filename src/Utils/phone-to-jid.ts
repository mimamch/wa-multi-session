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

  // Jika sudah group JID (ada @g.us), biarkan tanda minus
  if (number.endsWith("@g.us")) {
    return number;
  }

  // Pattern group JID: angka-angka-tanda minus-angka-angka (misal: 6282170389181-1610338502)
  const isGroupJidFormat = isGroup && /^\d+-\d+$/.test(number);

  // Kalau bukan group JID, hapus tanda minus
  if (!isGroupJidFormat) {
    number = number.replace(/-/g, "");
  }

  // Tambahkan suffix JID
  if (isGroup) {
    if (!number.endsWith("@g.us")) number = number + "@g.us";
  } else {
    if (!number.endsWith("@s.whatsapp.net"))
    number = number.replace(/\s|\+/gim, "");
    if (!number.includes("@g.us")) number = number + "@g.us";
  } else {
    number = number.replace(/\s|\+/gim, "");
    if (!number.includes("@s.whatsapp.net"))
      number = number + "@s.whatsapp.net";
  }

  return number;
};
