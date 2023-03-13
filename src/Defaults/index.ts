export enum CREDENTIALS {
  DIR_NAME = "wa_credentials",
  PREFIX = "_credentials",
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
