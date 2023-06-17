import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import * as dotenv from "dotenv";
dotenv.config();

const credential = new DefaultAzureCredential();

const vaultName = process.env.KEYVAULT_NAME;
const url = `https://${vaultName}.vault.azure.net`;

const secretCLient = new SecretClient(url, credential);

export const getSecretClient = () => {
    return secretCLient;
};

