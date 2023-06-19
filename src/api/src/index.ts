process
    .on("unhandledRejection", (reason, p) => {
        console.error(reason, "Unhandled Rejection at Promise", p);
    })
    .on("uncaughtException", err => {
        console.error(err, "Uncaught Exception thrown");
        process.exit(1);
    });



import { createApp } from "./app";
import { logger } from "./config/observability";

declare module "express-session" {
    interface SessionData {
        thirdPartyRequestState?: string;
        codeVerifier?: string;
        zoomRequestState?: string;
        state?: string;
        meetingUUID?: string;
        user: any;
    }
}

const main = async () => {
    const app = await createApp();
    const port = process.env.FUNCTIONS_CUSTOMHANDLER_PORT || process.env.PORT || 3100;

    app.listen(port, () => {
        logger.info(`Started listening on port ${port}`);
    });
};

logger.log("info", "Starting server");
main();
