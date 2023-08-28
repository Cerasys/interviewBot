import axios from "axios";
import { Persona } from "./persona";
import { v4 as uuidv4 } from "uuid";
import { getQueue } from "../util/queue";
import { CompletionQueue, NotificationQueue } from "./constants";
import { startWorkerIfNotStarted } from "./worker";
import { startWorkerIfNotStarted as startNotificationWorker } from "./workers/notificationWorker";


export default {
  async connectToPersona(req: any, res: any, next: any) {
    const recallToken = process.env.recallai;

    const email = req.body.email;
    const { meetingID, meetingTopic } = req.body.meetingContext;
    const joinUrl = req.body.joinUrl;

    try {
      if (!meetingID || !meetingTopic) {
        throw new Error("No meeting context");
      }

      const personaId = uuidv4();

      const newPersona = new Persona({
        id: personaId,
        email: email,
      });

      await newPersona.save();

      const response = await axios({
        method: "post",
        url: "https://api.recall.ai/api/v1/bot/",
        headers: {
          "Authorization": "Token " + recallToken,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        data: {
          bot_name: "Persona AI",
          // real_time_transcription: {
          //   partial_results: false,
          //   destination_url: `${process.env.PUBLIC_URL}/persona/${personaId}/update`
          // },

          // "transcription_options": {
          //   "provider": "assembly_ai"
          // },

          "transcription_options": {
            "provider": "deepgram",
            "deepgram": {
              "tier": "nova"
            }
          },
          chat: {
            on_bot_join: {
              send_to: "everyone",
              message: "Welcome to Persona! By participating in this recorded and evaluated meeting, you consent to the recording. Thanks!"
            }
          },
          automatic_leave: {
            waiting_room_timeout: 1200,
            noone_joined_timeout: 1200,
            everyone_left_timeout: 2
          },
          recording_mode: "gallery_view_v2",
          meeting_url: joinUrl
        }
      });

      const bot_id = response.data.id;

      newPersona.botId = bot_id;
      await newPersona.save();


      return res.json({ result: "Success" });
    } catch (error) {
      return next(error);
    }
  },

  async personaBotStatusChange(req: any, res: any) {
    const botId = req.body?.data?.bot_id;
    const event = req.body?.event;
    const code = req.body?.data?.status?.code;

    if (!botId || !event || code?.toLowerCase?.() !== "done") {
      return res.json({ result: "Success" });
    }

    const completionQueue = await getQueue(CompletionQueue);
    const notificationQueue = await getQueue(NotificationQueue);
    await Promise.all([notificationQueue.add("botTranscriptReady", { botId }), completionQueue.add("botTranscriptReady", { botId })]);

    await startWorkerIfNotStarted();
    await startNotificationWorker();

    return res.json({ result: "Success" });
  },

  async updatePersona(req: any, res: any) {

    if (!req.body || !req.body.data || !req.body.data.transcript || !req.body.data.bot_id) {
      return res.json({ result: "Success" });
    }
    await Persona.updateOne({ id: req.params.pid }, { $push: { rawTranscript: req.body.data.transcript } });
    return res.json({ result: "Success" });
  }

};