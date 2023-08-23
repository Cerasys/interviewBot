import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { sendMail } from "../util/EmailClient";
import { CompletionData, Email } from "./email";
import { EmailMessage } from "@azure/communication-email";

export const sendEmail = (body: CompletionData, title? : string) => {

    console.log("Rendering email");

    console.log(body);

    const email = ReactDOMServer.renderToStaticMarkup(<Email body={body} />);

    console.log(email);

    const mail: EmailMessage = {
        senderAddress: "Completion@298f2941-2b3a-47d9-bc86-75ad53092dce.azurecomm.net",
        content: {
            subject: title || "Test Interview Report Card",
            html: email,
        },
        recipients: {
            to: [
                {
                    address: "<osmond@personaai.ca>",
                    displayName: "Osmond",
                },
                {
                    address: "<nathan@personaai.ca>",
                    displayName: "Nathan",
                },
                {
                    address: "<Amol@personaai.ca>",
                    displayName: "Amol",
                },
            ],
        },
    };

    return sendMail(mail);
};