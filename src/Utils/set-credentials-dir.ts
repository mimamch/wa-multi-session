import { CREDENTIALS } from "../Defaults";

export const setCredentialsDir = (dirname: string = "wa_credentials") => {
  CREDENTIALS.DIR_NAME = dirname;
};
