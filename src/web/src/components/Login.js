import React from "react";
import { AuthorizationContext } from "../contexts/AuthorizationContext";
import Button from "react-bootstrap/Button";

export const Login = React.memo((props) => {
    const { userAuthorized, authorize, isAuthorized, thirdPartyInstall } = React.useContext(AuthorizationContext);

    if (!userAuthorized) {
        return (
            <div className="login">
                <Button onClick={authorize}>Login</Button>
            </div>
        );
    }
    if (!isAuthorized) {
        return (
            <div className="login">
                <Button onClick={thirdPartyInstall}>Authorize</Button>
            </div>
        );
    }
    return (<div>Invalid State</div>)
});