/* globals zoomSdk */
import { useLocation, useHistory } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Authorization } from "./components/Authorization";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Transcription from "./components/Transcription";
import Connect from "./components/Connect";

let once = 0; // to prevent increasing number of event listeners being added

function App() {
  const history = useHistory();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [runningContext, setRunningContext] = useState(null);
  const [meetingContext, setMeetingContext] = useState(null);
  const [connected, setConnected] = useState(false);
  const [counter, setCounter] = useState(0);
  const [preMeeting, setPreMeeting] = useState(true); // start with pre-meeting code
  const [userContextStatus, setUserContextStatus] = useState("");
  const [joinUrl, setJoinUrl] = useState(null);

  useEffect(() => {
    async function configureSdk() {
      // to account for the 2 hour timeout for config
      const configTimer = setTimeout(() => {
        setCounter(counter + 1);
      }, 120 * 60 * 1000);

      try {
        // Configure the JS SDK, required to call JS APIs in the Zoom App
        // These items must be selected in the Features -> Zoom App SDK -> Add APIs tool in Marketplace
        const configResponse = await zoomSdk.config({
          capabilities: [
            //APIs
            "shareApp",
            "listCameras",
            "setCamera",
            "setVideoMirrorEffect",
            "getMeetingParticipants",
            "cloudRecording",
            "allowParticipantToRecord",
            "getRunningContext",
            "getMeetingContext",
            "getSupportedJsApis",
            "showNotification",
            "openUrl",
            "setVirtualBackground",
            "listCameras",
            "setCamera",
            "sendAppInvitation",
            "sendAppInvitationToAllParticipants",
            "getUserContext",
            "getRecordingContext",
            "getMeetingContext",
            "getMeetingJoinUrl",
            "getMeetingUUID",
            "expandApp",
            "connect",
            "postMessage",
            //Events
            "onShareApp",
            "onSendAppInvitation",
            "onCloudRecording",
            "onActiveSpeakerChange",
            "onAppPopout",
            "onCohostChange",
            "onParticipantChange",
            "onReaction",
            "onConnect",
            "onExpandApp",
            "onMessage",
            "onMeeting",
          ],
          version: "0.16.0",
        });
        console.log("App configured", configResponse);
        // The config method returns the running context of the Zoom App
        setRunningContext(configResponse.runningContext);
        setUserContextStatus(configResponse.auth.status);
        zoomSdk.onSendAppInvitation((data) => {
          console.log(data);
        });
        zoomSdk.onShareApp((data) => {
          console.log(data);
        });
      } catch (error) {
        console.log(error);
        setError("There was an error configuring the JS SDK");
      }
      return () => {
        clearTimeout(configTimer);
      };
    }
    configureSdk();
  }, [counter]);

  // PRE-MEETING
  let on_message_handler_client = useCallback(
    (message) => {
      let content = message.payload.payload;
      if (content === "connected" && preMeeting === true) {
        console.log("Meeting instance exists.");
        zoomSdk.removeEventListener("onMessage", on_message_handler_client);
        console.log("Letting meeting instance know client's current state.");
        sendMessage(window.location.hash, "client");
        setPreMeeting(false); // client instance is finished with pre-meeting
      }
    },
    [preMeeting]
  );

  // PRE-MEETING
  useEffect(() => {
    if (runningContext === "inMainClient" && preMeeting === true) {
      zoomSdk.addEventListener("onMessage", on_message_handler_client);
    }
  }, [on_message_handler_client, preMeeting, runningContext]);

  async function sendMessage(msg, sender) {
    console.log(
      "Message sent from " + sender + " with data: " + JSON.stringify(msg)
    );
    console.log("Calling postmessage...", msg);
    await zoomSdk.postMessage({
      payload: msg,
    });
  }

  const receiveMessage = useCallback(
    (receiver, reason = "") => {
      let on_message_handler = (message) => {
        let content = message.payload.payload;
        console.log(
          "Message received " + receiver + " " + reason + ": " + content
        );
        history.push({ pathname: content });
      };
      if (once === 0) {
        zoomSdk.addEventListener("onMessage", on_message_handler);
        once = 1;
      }
    },
    [history]
  );

  useEffect(() => {
    async function connectInstances() {
      // only can call connect when in-meeting
      if (runningContext === "inMeeting") {
        zoomSdk.addEventListener("onConnect", (event) => {
          console.log("Connected");
          setConnected(true);

          // PRE-MEETING
          // first message to send after connecting instances is for the meeting
          // instance to catch up with the client instance
          if (preMeeting === true) {
            console.log("Letting client know meeting instance exists.");
            sendMessage("connected", "meeting");
            console.log("Adding message listener for client's current state.");
            let on_message_handler_mtg = (message) => {
              console.log(
                "Message from client received. Meeting instance updating its state:",
                message.payload.payload
              );
              window.location.replace(message.payload.payload);
              zoomSdk.removeEventListener("onMessage", on_message_handler_mtg);
              setPreMeeting(false); // meeting instance is finished with pre-meeting
            };
            zoomSdk.addEventListener("onMessage", on_message_handler_mtg);
          }
        });

        try {
          const contextResponse = await zoomSdk.getMeetingContext();
          setMeetingContext(contextResponse);
          const meetingURL = await zoomSdk.getMeetingJoinUrl();
          setJoinUrl(meetingURL.joinUrl);
        } catch (err) {
          throw new err();
        }

        await zoomSdk.connect();
        console.log("Connecting...");
      }
    }

    if (connected === false) {
      console.log(runningContext, location.pathname);
      connectInstances();
    }
  }, [connected, location.pathname, preMeeting, runningContext]);

  // POST-MEETING
  useEffect(() => {
    async function communicateTabChange() {
      // only proceed with post-meeting after pre-meeting is done
      // just one-way communication from in-meeting to client
      if (runningContext === "inMeeting" && connected && preMeeting === false) {
        sendMessage(location.pathname, runningContext);
      } else if (runningContext === "inMainClient" && preMeeting === false) {
        receiveMessage(runningContext, "for tab change");
      }
    }
    communicateTabChange();
  }, [connected, location, preMeeting, receiveMessage, runningContext]);

  if (error) {
    console.log(error);
    return (
      <div className="App">
        <h1>{error.message}</h1>
      </div>
    );
  }

  // NOTE: runningContext can be: "inChat" | "inMeeting" | "inImmersive" | "inWebinar" | "inMainClient" | "inPhone" | "inCollaborate" | "inCamera" | "inDigitalSignage"

  return (
    <div className="App">
      <h1 className="center">Persona AI</h1>
      <Connect
        zoomSdk={zoomSdk}
        runningContext={runningContext}
        meetingContext={meetingContext}
        joinUrl={joinUrl}
      />
      <p>{`User Context Status: ${userContextStatus}`}</p>
      <p>
        {runningContext
          ? `Running Context: ${runningContext}`
          : "Configuring Zoom JavaScript SDK..."}
      </p>
      <p>JoinURL: {joinUrl}</p>
      <p>Meeting context: {JSON.stringify(meetingContext)}</p>
      {/* <Transcription>
        <p>This is where transcriptions would go</p>
      </Transcription> */}
      <Authorization
        handleError={setError}
        handleUserContextStatus={setUserContextStatus}
        handleUser={setUser}
        user={user}
        userContextStatus={userContextStatus}
      />
    </div>
  );
}

export default App;
