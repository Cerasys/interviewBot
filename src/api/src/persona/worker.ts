import { Worker, Job } from "bullmq";
import { CompletionQueue } from "./constants";
import { Persona } from "./persona";
import axios from "axios";
import { RedisClient } from "../util/store";
import { gradeTranscript } from "./completions";
import { sendEmail } from "./sendEmail";
import { correctTranscript } from "./transcript";

type CompletionJob = Job<{ botId: string }>;

let completionWorker: Worker<{ botId: string }, any, string>;
let completionWorkerStarted = false;

const createWorker = async () => {
  if (completionWorkerStarted) return;

  completionWorkerStarted = true;

  completionWorker = new Worker(
    CompletionQueue,
    async (job: CompletionJob) => {
      const botId = job.data.botId;

      const persona = await Persona.findOne({ botId: botId });

      if (!persona) {
        console.log("No persona with bot id found");
        return { result: "Success" };
      }

      const response = await axios({
        method: "get",
        url: `https://api.recall.ai/api/v1/bot/${botId}/transcript/`,
        headers: {
          Authorization: "Token " + process.env.recallai,
          Accept: "application/json",
        },
      });

      const transcriptSections: {
        words: {
          text: string;
          start_timestamp: number;
          end_timestamp: number;
        }[];
        speaker: string;
      }[] = response.data;

      const convertToSentence = ({
        words,
        speaker,
      }: {
        words: {
          text: string;
          start_timestamp: number;
          end_timestamp: number;
        }[];
        speaker: string;
      }) => {
        return words.reduce((acc, word) => {
          return acc + word.text + " ";
        }, `${speaker}: `);
      };

      const transcriptSentences: string[] = [];
      var transcript = transcriptSections.reduce((acc, section) => {
        const sentence = convertToSentence(section);
        transcriptSentences.push(sentence);
        // eslint-disable-next-line quotes
        return acc + " " + convertToSentence(section);
      }, "");

      console.log("Transcript made");
      persona.uneditedTranscript = transcript;
      console.log("Saving unedited transcript");
      await persona.save();

      transcript =
        "Ileana Rouse Okay. Great. Alright. So first questions will be around front end, and the first one is for React. Have you used React hooks and if so, what was the impact on the project using React Hooks?\nRaymond Szeto Yes. So we have hopes this very important that we act framework, some of the react hooks that I use, the most common one is youth state. Where when being used, you can update and render things onto the UI when verapost has been updated. Now if you don't use use state, then values in the back behind the scene can be updated, but then no vendor with what happened. And that's what you don't want. And there are laptop we have, that out there but the most common one is you state that everyone used. Use c fact. You know, when loading a page to call a API call, to get things back. That's to name a few. A lot more. I would say, you know, use weapon to find something on the component on the tweet to update value, to blur it, to make it our focus or end focus those are all can be done. Seven home, That that's some of the the acts, hooks that I Perfect.";

      async function detailedTranscript() {
        console.log("Editing transcript");
        const newTranscript = await correctTranscript(transcript, "gpt-4");
        console.log("Finished editing transcript");
        return newTranscript;
      }

      transcript = await detailedTranscript();
      console.log("Saving edited transcript");

      persona.transcript = transcript;
      await persona.save();

      async function turboCompletion() {
        console.log("Generating turbo completion");
        const completion = await gradeTranscript(
          transcript,
          "gpt-3.5-turbo-16k"
        );
        console.log("Turbo completion complete, sending mail");
        await sendEmail(
          {
            completions: completion.results,
            score: completion.score,
            transcript: transcriptSentences,
            candidate_name: completion.candidate,
            recruiter_name: completion.interviewer,
          },
          "Turbo interview completion"
        );
      }

      async function detailedCompletion() {
        console.log("Generating detailed completion");
        const completion = await gradeTranscript(transcript, "gpt-4");
        console.log("Detailed completion complete, sending email");
        await sendEmail(
          {
            completions: completion.results,
            score: completion.score,
            transcript: transcriptSentences,
            candidate_name: completion.candidate,
            recruiter_name: completion.interviewer,
          },
          "Detailed interview completion"
        );
      }

      await Promise.all([turboCompletion(), detailedCompletion()]);

      return { result: "Success" };
    },
    {
      connection: await RedisClient(),
    }
  );
};

export const startWorkerIfNotStarted = async () => {
  if (completionWorker) {
    return;
  }
  await createWorker();
};
