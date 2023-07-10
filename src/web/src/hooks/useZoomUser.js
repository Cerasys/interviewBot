/* globals zoomSdk */

import * as React from 'react';
import { waitForZoomSdk } from "../SDK/zoomsdkwrapper";

export const useZoomUser = ({userContextStatus}) => {
    const [error, handleError] = React.useState(null);  
    const [user, handleUser] = React.useState(null);
    const [userAuthorized, setUserAuthorized] = React.useState(null);
    const initialized = React.useRef(false)

    /**
     * Request user authorization
     */
    const authorize = React.useCallback(async () => {
        console.log("Authorize flow begins here");
        console.log("1. Get code challenge and state from backend . . .");
        let authorizeResponse;
        try {
            authorizeResponse = await (await fetch("/api/zoomapp/authorize")).json();
            console.log(authorizeResponse);
            if (!authorizeResponse || !authorizeResponse.codeChallenge) {
                console.error(
                    "Error in the authorize flow - likely an outdated user session.  Please refresh the app"
                );
                return;
            }
        } catch (e) {
            console.error(e);
        }
        const { codeChallenge, state } = authorizeResponse;

        console.log("1a. Code challenge from backend: ", codeChallenge);
        console.log("1b. State from backend: ", state);

        const authorizeOptions = {
            codeChallenge: codeChallenge,
            state: state,
        };
        console.log("2. Invoke authorize, eg zoomSdk.authorize(authorizeOptions)");
        try {
            await waitForZoomSdk();
            const zoomAuthResponse = await zoomSdk.authorize(authorizeOptions);
            console.log(zoomAuthResponse);
        } catch (e) {
            console.error(e);
        }
    }, []);

    React.useEffect(() => {
        if (initialized.current) {
            return; // only run once
        } else {
            initialized.current = true;
        }

        console.log("In-Client OAuth flow: onAuthorized event listener added");
        zoomSdk.addEventListener("onAuthorized", (event) => {
            const { code, state } = event;
            console.log("3. onAuthorized event fired.");
            console.log(
                "3a. Here is the event passed to event listener callback, with code and state: ",
                event
            );
            console.log(
                "4. POST the code, state to backend to exchange server-side for a token.  Refer to backend logs now . . ."
            );

            fetch("/api/zoomapp/onauthorized", {
                method: "POST",
                body: JSON.stringify({
                    code,
                    state,
                    href: window.location.href,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(() => {
                console.log(
                    "4. Backend returns succesfully after exchanging code for auth token.  Go ahead and update the UI"
                );
                setUserAuthorized(true);

                // the error === string
                handleError(null);
            });
        });
    }, []);

    React.useEffect(() => {

        async function fetchUser() {
            try {
                // An example of using the Zoom REST API via proxy
                const response = await fetch("/zoom/api/v2/users/me");
                if (response.status !== 200) throw new Error();
                const user = await response.json();
                handleUser(user);
                setUserAuthorized(true);
            } catch (error) {
                console.error(error);
                console.log(
                    "Request to Zoom REST API has failed ^, likely because no Zoom access token exists for this user. You must use the authorize API to get an access token"
                );
                setUserAuthorized(false);
            }
        }

        if (userContextStatus === "authorized") {
            fetchUser();
        } else if (
            userContextStatus === "unauthenticated" ||
            userContextStatus === "authenticated"
        ) {
            // guest mode is not supported in this app
            setUserAuthorized(false);
        }
    }, [userContextStatus]);

    return { user, error, authorize, userAuthorized}
}