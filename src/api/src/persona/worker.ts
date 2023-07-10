import { Worker, Job } from "bullmq";
import { CompletionQueue } from "./constants";
import { Persona } from "./persona";
import axios from "axios";
import { RedisClient } from "../util/store";
import { getEmailClient, sendMail } from "../util/EmailClient";

type CompletionJob = Job<{ botId: string }>;

let completionWorker: Worker<{ botId: string; }, any, string>;
let completionWorkerStarted = false;

const createWorker = async () => {
    if (completionWorkerStarted) return;

    completionWorkerStarted = true;

    completionWorker = new Worker(CompletionQueue, async (job: CompletionJob) => {
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
                "Authorization": "Token " + process.env.recallai,
                "Accept": "application/json",
            }
        });

        const transcriptSections: { words: { text: string, start_timestamp: number, end_timestamp: number }[], speaker: string }[] = response.data;

        console.log(transcriptSections);
        const convertToSentence = ({ words, speaker }: { words: { text: string, start_timestamp: number, end_timestamp: number }[], speaker: string }) => {
            return words.reduce((acc, word) => {
                return acc + word.text + " ";
            }, `${speaker}: `);
        };

        const transcript = transcriptSections.reduce((acc, section) => {
            // eslint-disable-next-line quotes
            return acc + "||" + convertToSentence(section);
        }, "");

        console.log("transcript made");
        console.log(transcript);

        persona.transcript = transcript;
        await persona.save();

        let completion;
        console.log("Sending transcript to completion server");
        try {
            completion = await axios.post("https://personainterviewcompletion.azurewebsites.net/api/generatecompletions?code=BVPn81P5CyI6-7KZLL4TMuYCfkhKeXoVVe1e7L7zUxIwAzFukmWOHQ==", {
                transcript
            });
        } catch (error) {
            console.log("Something went wrong: \n");
            console.log(error);
        }
        console.log("Completion generated");
        if (!completion) {
            console.log("Completion not generated");
            return { result: "Success" };
        }

        const mail = {
            senderAddress: "Completion@298f2941-2b3a-47d9-bc86-75ad53092dce.azurecomm.net",
            content: {
                subject: "Persona Interview Completion",
                plainText: `
                completion: ${completion.data}
                --------------------------
                email: ${persona.email}
                `
            },
            recipients: {
                to: [
                  {
                    address: "<osmond@personaai.ca>",
                    displayName: "Osmond",
                  },
                ],
              },
        };

        console.log("Sending mail");
        await sendMail(mail);
        console.log("Mail sent");

        return { result: "Success" };
    }, {
        connection: await RedisClient()
    });
};

export const startWorkerIfNotStarted = async () => {
    if (completionWorker) {
        return;
    }
    await createWorker();
};