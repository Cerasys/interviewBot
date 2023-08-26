import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { sendMail } from "../../util/EmailClient";
import { EmailContent } from "./email";
import { EmailMessage } from "@azure/communication-email";

export const sendEmail = (emailAddress: string, title?: string, videoLink?: string | null) => {

    const email = ReactDOMServer.renderToStaticMarkup(<EmailContent videoLink={videoLink}/>);

    const mail: EmailMessage = {
        senderAddress: "Completion@298f2941-2b3a-47d9-bc86-75ad53092dce.azurecomm.net",
        content: {
            subject: title || "Test Interview Report Card",
            html: email,
        },
        recipients: {
            to: [
                {
                    address: `${emailAddress}`,
                }
            ],
        },
    };

    return sendMail(mail);
};