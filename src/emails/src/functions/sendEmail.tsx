import "dotenv/config";

console.log("Process");
console.log(process.env);

import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { Email } from "../components/email";
import { sendMail } from "@personaai/connections";
import { EmailMessage } from "@azure/communication-email";

interface Completion {
  subpoints: string[];
  grade: string;
  explanation: string;
  question: string;
  answer: string;
}

export interface CompletionData {
  completions: Completion[];
  score: number;
  transcript: string;
}

export async function sendEmail(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const body = (await request.json()) as CompletionData;

  const email = ReactDOMServer.renderToStaticMarkup(<Email body={body} />);

  const mail: EmailMessage = {
    senderAddress:
      "Completion@298f2941-2b3a-47d9-bc86-75ad53092dce.azurecomm.net",
    content: {
      subject: "Test Interview Report Card",
      html: email,
    },
    recipients: {
      to: [
        {
          address: "<nathan@personaai.ca>",
          displayName: "Nathan",
        },
      ],
    },
  };

  sendMail(mail);

  return { body: email };
}

app.http("sendEmail", {
  methods: ["POST"],
  authLevel: "function",
  handler: sendEmail,
});
