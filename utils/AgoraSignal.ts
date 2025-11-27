// SignalService has been removed - using polling approach instead
// All real-time messaging functionality is handled by polling the backend

export const SignalService = {
  _ready: false as boolean,

  async init() {
    // No-op - using polling instead of real-time messaging
    this._ready = true;
  },

  async sendAlert(doctorUid: string, urgency: string) {
    // No-op - using polling instead of real-time messaging
    console.log("Alert would be sent via polling mechanism");
  },
};
