import { Worker, Job } from "bullmq";
import { NotificationQueue } from "../constants";
import { Persona } from "../persona";
import { RedisClient } from "../../util/store";
import { sendEmail } from "./notificationEmail";
import axios from "axios";
import { createGDriveClient } from "../../util/GDrive";

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

    const email = persona.email as string;

    const bot = await axios({
        method: "get",
        url: `https://api.recall.ai/api/v1/bot/${botId}/`,
        headers: {
            Authorization: "Token " + process.env.recallai,
            Accept: "application/json",
        },
    });

    const videoUrl = bot.data.video_url;
    let videoLink;
    if (videoUrl) {
        const gDriveClient = await createGDriveClient();

        const rawVideo = await axios({
            "method": "get",
            responseType: "stream",
            url: videoUrl
        });

        const requestBody = {
            name: "interview.mp4",
            fields: "id",
        };
        const media = {
            mimeType: "video/mp4",
            body: rawVideo.data,
        };

        try {
            const file = await gDriveClient.files.create({
                requestBody,
                media: media,
                includePermissionsForView: "published",
                uploadType: "resumable"
            });

            console.log("File Id:", file.data.id);
            console.log(file.data);
            console.log(file.status);

            await gDriveClient.permissions.create({
                fileId: file.data.id as string,
                sendNotificationEmail: false,
                requestBody: {
                    type: "user",
                    role: "reader",
                    emailAddress: email,
                }
            });

            const webViewLink = await gDriveClient.files.get({
                fileId: file.data.id as string,
                fields: "webViewLink"
            });

            videoLink = webViewLink.data.webViewLink;
        } catch (err) {
            console.log(err);
            // do nothing
        }
    }



    await sendEmail(email, "Interview recording recived!", videoLink);

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