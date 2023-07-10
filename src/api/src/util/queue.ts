import { Queue } from "bullmq";
import { RedisClient } from "./store";

const queueMap: {[queueName: string]: Queue} = {};

export const getQueue = async (queueName: string) => {
    if (!queueMap[queueName]) {
        queueMap[queueName] = new Queue(queueName, { connection: await RedisClient() });
    }
    return queueMap[queueName];
};