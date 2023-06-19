import axios from "axios";

const url = "https://webhook.site/cf557441-52f5-48c3-8e39-f706124c156c";

export default {
  async connectToPersona(req: any, res: any, next: any) {
    console.log("IN-CLIENT CONNECTION TO PERSONA", "\n");

    const zoomAuthorizationCode = req.body.code;
    const href = req.body.href;
    const codeVerifier = req.session.codeVerifier;
    const { meetingID, meetingTopic } = req.body.meetingContext;
    const joinUrl = req.body.joinUrl;

    console.log("1. Verify meeting context exists and is not null");
    console.log(joinUrl);

    try {
      if (!meetingID || !meetingTopic) {
        throw new Error("No meeting context");
      }

      console.log("2. Send post request to persona server", "\n");
      console.log(req.body);
      await axios(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: {
          zoomAuthorizationCode: zoomAuthorizationCode,
          href: href,
          codeVerifier: codeVerifier,
          meetingID: meetingID,
          meetingTopic: meetingTopic,
          joinUrl,
        },
      });

      console.log("Successfully made request");

      return res.json({ result: "Success" });
    } catch (error) {
      console.log("Something went wrong: \n" + error);
      return next(error);
    }
  },

  async hello(req: any, res: any) {
    res.send("Hello Zoom Apps!");
  },
};