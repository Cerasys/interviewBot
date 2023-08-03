import "dotenv/config";

console.log("Process");
console.log(process.env);

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { Email } from '../components/email';
import { sendMail } from '@personaai/connections'; 
import { EmailMessage } from "@azure/communication-email";


interface ISendEmailBody {
    // Fill this section with what you want the post body to look like
    applicantName: string;
}



export async function sendEmail(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    
    // const body = await request.json();

    const email = ReactDOMServer.renderToStaticMarkup(<Email />)

    const mail: EmailMessage = {
        senderAddress: "Completion@298f2941-2b3a-47d9-bc86-75ad53092dce.azurecomm.net",
        content: {
            subject: "React Email Test",
            html: email
        },
        recipients: {
            to: [
                {
                    address: "<osmond@personaai.ca>",
                    displayName: "Osmond",
                }
            ],
        },
    };

    sendMail(mail)
    
    return { body: email };
};

app.http('sendEmail', {
    methods: ['POST'],
    authLevel: 'function',
    handler: sendEmail
});
