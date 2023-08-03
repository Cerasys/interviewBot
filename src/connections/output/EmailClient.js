"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = exports.getEmailClient = exports.createEmailClient = void 0;
const communication_email_1 = require("@azure/communication-email");
let emailClient;
const POLLER_WAIT_TIME = 10;
const createEmailClient = () => {
    const connectionString = process.env["COMMUNICATION_SERVICES_CONNECTION_STRING"];
    console.log(process.env);
    emailClient = new communication_email_1.EmailClient(connectionString);
};
exports.createEmailClient = createEmailClient;
const getEmailClient = () => {
    if (!emailClient) {
        (0, exports.createEmailClient)();
    }
    return emailClient;
};
exports.getEmailClient = getEmailClient;
const sendMail = (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    (0, exports.getEmailClient)();
    try {
        const poller = yield emailClient.beginSend(message);
        if (!poller.getOperationState().isStarted) {
            throw "Poller was not started.";
        }
        let timeElapsed = 0;
        while (!poller.isDone()) {
            poller.poll();
            console.log("Email send polling in progress");
            yield new Promise(resolve => setTimeout(resolve, POLLER_WAIT_TIME * 1000));
            timeElapsed += 10;
            if (timeElapsed > 18 * POLLER_WAIT_TIME) {
                throw "Polling timed out.";
            }
        }
        if (((_a = poller.getResult()) === null || _a === void 0 ? void 0 : _a.status) === communication_email_1.KnownEmailSendStatus.Succeeded) {
            console.log(`Successfully sent the email (operation id: ${(_b = poller.getResult()) === null || _b === void 0 ? void 0 : _b.id})`);
        }
        else {
            throw (_c = poller.getResult()) === null || _c === void 0 ? void 0 : _c.error;
        }
    }
    catch (e) {
        console.log(e);
    }
});
exports.sendMail = sendMail;
