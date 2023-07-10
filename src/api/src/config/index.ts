import { AppConfig } from "./appConfig";
import dotenv from "dotenv";
import "dotenv/config";
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { logger } from "../config/observability";

// Load any ENV vars from local .env file
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

export const getConfig: () => Promise<AppConfig> = async () => {
    await populateEnvironmentFromKeyVault();

    return {
        observability: {
            connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING as string,
        },
        database: {
            connectionString: process.env.AZURE_COSMOS_CONNECTION_STRING as string,
        },
        recall: {
            apiKey: process.env.RECALL_API_KEY || "",
        }
    };
};

const populateEnvironmentFromKeyVault = async () => {
    // If Azure key vault endpoint is defined
    // 1. Login with Default credential (managed identity or service principal)
    // 2. Overlay key vault secrets on top of ENV vars
    const keyVaultEndpoint = process.env.AZURE_KEY_VAULT_ENDPOINT || "";

    if (!keyVaultEndpoint) {
        logger.warn("AZURE_KEY_VAULT_ENDPOINT has not been set. Configuration will be loaded from current environment.");
        return;
    }

    try {
        logger.info("Populating environment from Azure KeyVault...");
        const credential = new DefaultAzureCredential({});
        const secretClient = new SecretClient(keyVaultEndpoint, credential);

        for await (const secretProperties of secretClient.listPropertiesOfSecrets()) {
            const secret = await secretClient.getSecret(secretProperties.name);

            // KeyVault does not support underscores in key names and replaces '-' with '_'
            // Expect KeyVault secret names to be in conventional capitalized snake casing after conversion
            const keyName = secret.name.replace(/-/g, "_");
            if (!process.env[keyName]) {
                console.log("Loading key vault secret: " + keyName);
                process.env[keyName] = secret.value;
            }
        }
    }
    catch (err: any) {
        logger.error(`Error authenticating with Azure KeyVault.  Ensure your managed identity or service principal has GET/LIST permissions. Error: ${err}`);
        throw err;
    }
};