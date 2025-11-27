import { agoraRTMClient } from "./agoraRTM";

// Simple SignalService wrapper for hackathon alert use-case
// Uses a fixed patient UID. Replace with authenticated user in production.
const APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID || "";
const PATIENT_UID = "patient_mobile_1";

export const SignalService = {
  _ready: false as boolean,

  async init() {
    if (!APP_ID)
      throw new Error("Missing EXPO_PUBLIC_AGORA_APP_ID env variable");
    if (this._ready) return;
    await agoraRTMClient.initialize(APP_ID, PATIENT_UID);
    // Login without token (hackathon mode). Provide token in production.
    await agoraRTMClient.login();
    this._ready = true;
  },

  async sendAlert(doctorUid: string, urgency: string) {
    if (!this._ready) await this.init();
    await agoraRTMClient.sendPeerMessage(doctorUid, {
      type: "ALERT",
      level: urgency,
    });
  },
};
