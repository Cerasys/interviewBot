import { EmailClient, EmailMessage, KnownEmailSendStatus } from "@azure/communication-email";

let emailClient: EmailClient;

export const createEmailClient = () => {
  const connectionString = process.env["COMMUNICATION_SERVICES_CONNECTION_STRING"];
  console.log("Email connection string", connectionString);
  emailClient = new EmailClient(connectionString as string);
};

export const getEmailClient = () => {
  if (!emailClient) {
    createEmailClient();
  }
  return emailClient;
};

export const sendMail = async (message: EmailMessage) => {
  getEmailClient();

  try {
    console.log("Email send polling initiated");

    const poller = await emailClient.beginSend(message);

    console.log("Email send polling start");


    if (!poller.getOperationState().isStarted) {
      throw "Poller was not started.";
    }

    await poller.pollUntilDone();

    if (poller.getResult()?.status === KnownEmailSendStatus.Succeeded) {
      console.log(`Successfully sent the email (operation id: ${poller.getResult()?.id})`);
    }
    else {
      throw poller.getResult()?.error;
    }
  } catch (e) {
    console.log("Failed to send email");
    console.log(e);
  }
};