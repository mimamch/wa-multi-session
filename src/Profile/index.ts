import { Messages } from "../Defaults";
import { WhatsappError } from "../Error";
import { getSession } from "../Socket";
import { GetProfileInfoProps } from "../Types/profile";

/**
 * Get profile information of a target (people or group)
 */
export const getProfileInfo = async (props: GetProfileInfoProps) => {
  const session = getSession(props.sessionId);
  if (!session)
    throw new WhatsappError(Messages.sessionNotFound(props.sessionId));

  const [profilePictureUrl, status] = await Promise.allSettled([
    session.profilePictureUrl(props.target, "image", 5000),
    session.fetchStatus(props.target),
  ]);
  return {
    profilePictureUrl:
      profilePictureUrl.status === "fulfilled"
        ? profilePictureUrl.value || null
        : null,
    status: status.status === "fulfilled" ? status.value || null : null,
  };
};
