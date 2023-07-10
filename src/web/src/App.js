/* globals zoomSdk */
import { useLocation, useHistory } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Connect from "./components/Connect";
import { configureSdk as ConfigureSDK, waitForZoomSdk } from "./SDK/zoomsdkwrapper";
import { AuthorizationContextProvider } from "./contexts/AuthorizationContext";
import Loading from "./components/Loading";
let once = 0; // to prevent increasing number of event listeners being added

function App() {
  const history = useHistory();
  const location = useLocation();
  const [error, setError] = useState(null);
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

      ConfigureSDK()
      try {
        // Configure the JS SDK, required to call JS APIs in the Zoom App
        // These items must be selected in the Features -> Zoom App SDK -> Add APIs tool in Marketplace
        const configResponse = await ConfigureSDK();
        console.log("App configured", configResponse);
        // The config method returns the running context of the Zoom App
        setRunningContext(configResponse.runningContext);
        setUserContextStatus(configResponse.auth.status);
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
  let on_message_handler_client = useCallback(async (message) => {
    let content = message.payload.payload;
    if (content === "connected" && preMeeting === true) {
      console.log("Meeting instance exists.");
      await waitForZoomSdk();
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
      waitForZoomSdk().then(() => zoomSdk.addEventListener("onMessage", on_message_handler_client));
    }
  }, [on_message_handler_client, preMeeting, runningContext]);

  async function sendMessage(msg, sender) {
    console.log(
      "Message sent from " + sender + " with data: " + JSON.stringify(msg)
    );
    console.log("Calling postmessage...", msg);
    await waitForZoomSdk();
    await zoomSdk.postMessage({
      payload: msg,
    });
  }

  const receiveMessage = useCallback(async (receiver, reason = "") => {
    let on_message_handler = (message) => {
      let content = message.payload.payload;
      if (!content) {
        return;
      }
      console.log(
        "Message received " + receiver + " " + reason + ": " + content
      );
      history.push({ pathname: content });
    };
    if (once === 0) {
      waitForZoomSdk();
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
        await waitForZoomSdk();
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
    <div className="App center">
      <h1>Persona AI</h1>
      <AuthorizationContextProvider
        handleError={setError}
        handleUserContextStatus={setUserContextStatus}
        userContextStatus={userContextStatus}
      >
          <Loading runningContext={runningContext}>
            <Connect
              runningContext={runningContext}
              meetingContext={meetingContext}
              joinUrl={joinUrl}
            />
          </Loading>
      </AuthorizationContextProvider>
    </div>
  );
}

export default App;
