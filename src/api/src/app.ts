import express, { Express } from "express";
import cors from "cors";
import { getConfig } from "./config";
import { configureMongoose } from "./models/mongoose";
import { observability } from "./config/observability";

console.log("debug", "Loading Routes...");
// Routes
console.log("Loading Candidate Routes...");
import CanidateRoutes from "./canidates/candidates-routes";
console.log("Candidate Routes Loaded");

console.log("Loading Interview Routes...");
import InterviewRoutes from "./interviews/interviews-routes";
console.log("Interview Routes Loaded");

console.log("Loading Persona Routes...");
import PersonaRoutes from "./persona/router";
console.log("Persona Routes Loaded");

console.log("Loading Roles Routes...");
import RolesRoutes from "./roles/roles-routes";
console.log("Roles Routes Loaded");

console.log("Loading Third Party Auth Routes...");
import thirdPartyAuthRoutes from "./thirdpartyauth/router";
console.log("Third Party Auth Routes Loaded");

console.log("Loading Zoom Routes...");
import zoomRoutes from "./zoom/router";
console.log("Zoom Routes Loaded");

console.log("Loading Zoom App Routes...");
import zoomAppRoutes from "./zoomapp/router";
import { middleware } from "./middleware/middleware";
import { startWorkerIfNotStarted } from "./persona/worker";
import { createEmailClient } from "./util/EmailClient";
console.log("Zoom App Routes Loaded");
console.log("debug", "Routes Loaded");

// Use API_ALLOW_ORIGINS env var with comma separated urls like
// `http://localhost:300, http://otherurl:100`
// Requests coming to the api server from other urls will be rejected as per
// CORS.
const allowOrigins = process.env.API_ALLOW_ORIGINS;

// Use NODE_ENV to change webConfiguration based on this value.
// For example, setting NODE_ENV=development disables CORS checking,
// allowing all origins.
const environment = process.env.NODE_ENV;

const originList = (): string[] | string => {

    if (environment && environment === "development") {
        console.log(`Allowing requests from any origins. NODE_ENV=${environment}`);
        return "*";
    }

    const origins = [
        "https://portal.azure.com",
        "https://ms.portal.azure.com",
    ];

    if (allowOrigins && allowOrigins !== "") {
        allowOrigins.split(",").forEach(origin => {
            origins.push(origin);
        });
    }

    return origins;
};

export const createApp = async (): Promise<Express> => {
    const config = await getConfig();
    const app = express();

    // Configuration
    observability(config.observability);
    await configureMongoose(config.database);

    // Middleware
    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
        next();
    });
    
    app.use(await middleware.session());

    app.use(express.json());
    app.use(cors({
        origin: originList()
    }));

    // API Routes
    // Zoom App routes
    app.use("/api/zoomapp", zoomAppRoutes);
    if (
        process.env.AUTH0_CLIENT_ID &&
        process.env.AUTH0_CLIENT_SECRET &&
        process.env.AUTH0_ISSUER_BASE_URL
    ) {
        app.use("/api/auth0", thirdPartyAuthRoutes);
    } else {
        console.log("Please add Auth0 env variables to enable the /auth0 route");
    }

    app.use("/zoom", zoomRoutes);
    app.use("/persona", PersonaRoutes);
    app.use("/api/roles", RolesRoutes);
    app.use("/api/interviews", InterviewRoutes);
    app.use("/api/candidates", CanidateRoutes);

    await startWorkerIfNotStarted();
    createEmailClient();
    return app;
};
