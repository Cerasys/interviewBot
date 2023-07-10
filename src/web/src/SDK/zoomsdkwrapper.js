/* globals zoomSdk */
let zoomConfigPromise;
let zoomContext
export function configureSdk() {
    if (zoomContext) {
        return Promise.resolve(zoomContext);
    }
    if (zoomConfigPromise) {
        return zoomConfigPromise.then(() => zoomContext);
    }
    // Configure the JS SDK, required to call JS APIs in the Zoom App
    // These items must be selected in the Features -> Zoom App SDK -> Add APIs tool in Marketplace
    zoomConfigPromise = zoomSdk.config({
        capabilities: [
            //APIs
            "authorize",
            "allowParticipantToRecord",
            "cloudRecording",
            "connect",
            "expandApp",
            "getMeetingContext",
            "getMeetingJoinUrl",
            "getMeetingParticipants",
            "getMeetingUUID",
            "getRecordingContext",
            "getRunningContext",
            "getSupportedJsApis",
            "getUserContext",
            "openUrl",
            "postMessage",
            "sendAppInvitation",
            "sendAppInvitationToAllParticipants",
            "showNotification",
            //Events
            // add here:
            "onAuthorized",
            "onShareApp",
            "onSendAppInvitation",
            "onCloudRecording",
            "onActiveSpeakerChange",
            "onAppPopout",
            "onCohostChange",
            "onParticipantChange",
            "onReaction",
            "onConnect",
            "onExpandApp",
            "onMessage",
            "onMeeting",
        ],
        version: "0.16.15",
    });

    return zoomConfigPromise.then((zc) => {
        zoomContext = zc;
        console.log("App configured", zoomContext);
        // The config method returns the running context of the Zoom App
        zoomSdk.onSendAppInvitation((data) => {
            console.log(data);
        });
        zoomSdk.onShareApp((data) => {
            console.log(data);
        });
    
        return zoomContext
    });
}

export const waitForZoomSdk = () => {
    if (zoomContext) {
        return Promise.resolve(true);
    }
    if (!zoomConfigPromise) {
        configureSdk();
    }
    return zoomConfigPromise.then(() => {
        return true;
    });
};