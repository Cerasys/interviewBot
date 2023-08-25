import { Worker, Job } from "bullmq";
import { NotificationQueue } from "../constants";
import { Persona } from "../persona";
import { RedisClient } from "../../util/store";
import { sendEmail } from "./notificationEmail";

type CompletionJob = Job<{ botId: string }>;

let notificationWorker: Worker<{ botId: string; }, any, string>;
let notificationWorkerStarted = false;

const worker = async (job: CompletionJob) => {
    const botId = job.data.botId;
    console.log("botId: ", botId);
    const persona = await Persona.findOne({ botId: botId });

    if (!persona || !persona.email) {
        console.log("No persona with bot id found");
        return { result: "Success" };
    }

    await sendEmail(persona.email as string, "Interview recording recived!");

    return { result: "Success" };
};

const createWorker = async () => {
    if (notificationWorkerStarted) return;

    notificationWorkerStarted = true;

    notificationWorker = new Worker(NotificationQueue, worker, {
        connection: await RedisClient()
    });
};

export const startWorkerIfNotStarted = async () => {
    if (notificationWorker) {
        return;
    }
    await createWorker();
};