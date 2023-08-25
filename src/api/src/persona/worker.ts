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
      const transcript = transcriptSections.reduce((acc, section) => {
        const sentence = convertToSentence(section);
        transcriptSentences.push(sentence);
        // eslint-disable-next-line quotes
        return acc + " " + convertToSentence(section);
      }, "");

      console.log("transcript made");

      var newTranscript = "";
      async function detailedTranscript() {
        console.log("Asking GPT for a better transcript");
        newTranscript = await correctTranscript(transcript, "gpt-4");
        console.log("Transcript improvement completion complete.");
      }
      console.log("transcript improved");

      persona.transcript = newTranscript;
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

      await Promise.all([
        detailedTranscript(),
        turboCompletion(),
        detailedCompletion(),
      ]);

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
