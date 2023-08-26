import { drive_v3, google } from "googleapis";
import { writeFile } from "node:fs/promises";

const gdrivecredentialsPath = "./gdrivecredentials.json";

let driveClient: drive_v3.Drive;

export const createGDriveClient = async () => {
    if (!driveClient) {
        const GDRIVEConnectionjson = process.env["GOOGLE_DRIVE_SERVICE_ACCOUNT"];

        await writeFile(gdrivecredentialsPath, GDRIVEConnectionjson as string);

        const auth = new google.auth.GoogleAuth({
            keyFile: gdrivecredentialsPath,
            scopes: ["https://www.googleapis.com/auth/drive"],
        });

        driveClient = google.drive({ version: "v3", auth });

        console.log("Connected to google drive");
    }

    return driveClient;

};