export class WhatsappError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WhatsappError";
    Object.setPrototypeOf(this, WhatsappError.prototype);
  }

  static isWhatsappError(error: any): error is WhatsappError {
    return error instanceof WhatsappError || error instanceof Error;
  }
}
