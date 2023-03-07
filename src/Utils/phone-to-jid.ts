const phoneToJid = (phoneNumber: number | string): string => {
  let number = phoneNumber;
  number = number.toString().replace(/\s|[+]|[-]/gim, "");
  if (!number.includes("@s.whatsapp.net")) number = number + "@s.whatsapp.net";

  return number;
};

export default phoneToJid;
