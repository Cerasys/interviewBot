/* globals zoomSdk */

import * as React from 'react';
import { waitForZoomSdk } from "../SDK/zoomsdkwrapper";

export const usePersonaUser = () => {
    const [user, setUser] = React.useState(null);
    const [isAuthorized, setIsAuthorized] = React.useState(null);

    const thirdPartyInstall = React.useCallback(() => {
        waitForZoomSdk().then(() => {
            zoomSdk.openUrl({
                url: `${process.env.REACT_APP_PUBLIC_ROOT}/api/auth0/login`,
            });
        });
    }, []);

    React.useEffect(() => {
        async function getUserProfile() {
            const userDataResponse = await fetch(
                `${process.env.REACT_APP_PUBLIC_ROOT}/api/auth0/proxy/userinfo`
            );

            if (userDataResponse.ok && userDataResponse.status === 200) {
                const userData = await userDataResponse.json();
                setUser(userData);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        }
        getUserProfile();
    }, []);

    return { user, isAuthorized, thirdPartyInstall }
}