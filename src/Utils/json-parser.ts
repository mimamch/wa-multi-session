import { BufferJSON } from "baileys";

export const stringToJsonBufferParser = (str: string) => {
  try {
    return JSON.parse(str, BufferJSON.reviver);
  } catch (error) {
    return null;
  }
};

export const jsonBufferToStringParser = (obj: any) => {
  try {
    return JSON.stringify(obj, BufferJSON.replacer);
  } catch (error) {
    return null;
  }
};
