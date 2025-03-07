import { Messages } from "../Defaults";
import { WhatsappError } from "../Error";
import { getSession } from "../Socket";
import { GetProfileInfoProps } from "../Types/profile";

export const getProfileInfo = async (props: GetProfileInfoProps) => {
  const session = getSession(props.sessionId);
  if (!session)
    throw new WhatsappError(Messages.sessionNotFound(props.sessionId));

  const [profilePictureUrl, status] = await Promise.all([
    session.profilePictureUrl(props.target, "image", 5000),
    session.fetchStatus(props.target),
  ]);
  return {
    profilePictureUrl,
    status,
  };
};
