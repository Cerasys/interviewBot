/* globals zoomSdk */
import React from "react";
import UserInfo from "./UserInfo";
import { AuthorizationContext } from "../contexts/AuthorizationContext";

export const Authorization = (props) => {
  const {
    user,
    userContextStatus,
    inGuestMode,
    promptAuthorize,
    authorize,
    showInClientOAuthPrompt,
  } = React.useContext(AuthorizationContext);
  return (
    <>
      <UserInfo
        user={user}
        onClick={inGuestMode ? promptAuthorize : authorize}
        showGuestModePrompt={inGuestMode}
        userContextStatus={userContextStatus}
        showInClientOAuthPrompt={showInClientOAuthPrompt}
      />
    </>
  );
};
