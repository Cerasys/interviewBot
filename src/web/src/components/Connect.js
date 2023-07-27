/* globals zoomSdk */
import React, { memo, useState } from "react";
import Button from "react-bootstrap/Button";
import "./Connect.css";
import { AuthorizationContext } from "../contexts/AuthorizationContext";

const Connect = memo((props) => {
  const { zoomUser } = React.useContext(AuthorizationContext);
  const [botConnection, setBotConnection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [failedConnection, setIsFailedConnection] = useState(false);

  const connectionHandler = async (event) => {
    const { code, state } = event;
    setIsLoading(true);
    if (!botConnection) {
      try {
        const response = await fetch("/persona/connect", {
          method: "POST",
          body: JSON.stringify({
            code,
            state,
            href: window.location.href,
            meetingContext: props.meetingContext,
            joinUrl: props.joinUrl,
            email: zoomUser && zoomUser.email,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          setIsFailedConnection(true);
          setBotConnection(false);
          throw new Error("Something went wrong!");
        }
        setIsFailedConnection(false);
        setBotConnection(true);
      } catch (err) {
        console.error(err);
        console.log(
          "Request to Persona has failed, likely because no Zoom access token exists for this user. You must use the authorize API to get an access token"
        );
        setBotConnection(false);
        setIsFailedConnection(true);
      }
    }
    if (botConnection) {
      // post request to disconnect
      setBotConnection(false);
    }

    setIsLoading(false);
  };
  if (props.runningContext !== "inMeeting" && "inPhone") {
    return (
      <p className={"connection-string connecting"}>
        Offline: Start meeting to connect
      </p>
    );
  }
  return (
    <React.Fragment>
      <p
        className={`connection-string ${
          failedConnection
            ? "failed"
            : botConnection
            ? "connected"
            : "disconnected"
        }`}
      >
        {isLoading && "Copilot Status: Connecting..."}
        {!isLoading &&
          `Copilot Status: ${
            failedConnection
              ? "Failed to Connect"
              : botConnection
              ? "Connected"
              : "Disconnected"
          }`}
      </p>

      <div className="center">
        <Button onClick={connectionHandler} disabled={isLoading || botConnection}>
          {"Connect"}
        </Button>
      </div>
    </React.Fragment>
  );
});

export default Connect;
