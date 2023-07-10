/* globals zoomSdk */
import React, { createContext, useMemo } from "react";
import { waitForZoomSdk } from "../SDK/zoomsdkwrapper";
import { useZoomUser } from "../hooks/useZoomUser";
import { usePersonaUser } from "../hooks/usePersonaUser";

export const AuthorizationContext = createContext();

export const AuthStatus = {
    loading: "loading",
    authorized: "authorized",
    unauthorized: "unauthorized",
}

export const AuthorizationContextProvider = (props) => {
    const {
        handleError,
        handleUserContextStatus,
        userContextStatus,
    } = props;
    const { user: zoomUser, authorize, userAuthorized, error } = useZoomUser({ userContextStatus, handleUserContextStatus });
    const { user: personaUser, thirdPartyInstall, isAuthorized} = usePersonaUser();
    const authorizationStatus = useMemo(() => {
        if (userAuthorized === null || isAuthorized === null) {
            return AuthStatus.loading;
        } else if (userAuthorized && isAuthorized) {
            return AuthStatus.authorized;
        }
        return AuthStatus.unauthorized;
    }, [userAuthorized, isAuthorized]);

    React.useEffect(() => {
        handleError(error);
    }, [error]);

    const contextValue = useMemo(() => ({
        authorizationStatus,
        zoomUser,
        personaUser,
        userAuthorized,
        authorize,
        thirdPartyInstall,
        isAuthorized
    }), [authorizationStatus, authorize, isAuthorized, personaUser, userAuthorized, zoomUser, thirdPartyInstall]);
    
    return (
        <AuthorizationContext.Provider value={contextValue}>
            {props.children}
        </AuthorizationContext.Provider>
    );
};
