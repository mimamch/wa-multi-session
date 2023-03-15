export abstract class CREDENTIALS {
  static DIR_NAME: string = "wa_credentials";
  static PREFIX: string = "_credentials";
}

export enum CALLBACK_KEY {
  ON_MESSAGE_RECEIVED = "on-message-received",
  ON_QR = "on-qr",
}

export abstract class Messages {
  static sessionAlreadyExist = (sessionId: string): string =>
    `Session ID :${sessionId} is already exist, Try another Session ID.`;

  static sessionNotFound = (sessionId: string): string =>
    `Session with ID: ${sessionId} Not Exist!`;

  static paremetersRequired = (props: string[] | string) =>
    `Parameter ${
      typeof props == "string"
        ? props
        : props instanceof Array
        ? props.join(", ")
        : ""
    } is required`;
}
