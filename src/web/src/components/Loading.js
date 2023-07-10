import React, { memo } from "react";
import "./Loading.css";
import { AuthorizationContext } from '../contexts/AuthorizationContext';
import { Login } from "./Login";

const Loading = memo((props) => {
    const { authorizationStatus } = React.useContext(AuthorizationContext);
    switch (authorizationStatus) {
        case "authorized":
            return props.children;
        case "unauthorized":
            return <Login />;
        case "loading":
        default:
            return (
                <p className={"connection-string connecting"}>
                    loading...
                </p>
            );
    }

    // if (props.runningContext !== "inMeeting" && "inPhone") {
    //     return (
    //         <p className={"connection-string connecting"}>
    //             Offline: Start meeting to connect
    //         </p>
    //     );
    // }
    // return props.children;
});

export default Loading;
