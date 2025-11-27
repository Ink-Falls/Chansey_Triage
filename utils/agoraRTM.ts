/**
 * AGORA RTM INTEGRATION
 * Purpose: Real-time messaging for instant triage results
 * Replaces HTTP polling with push notifications
 * Target latency: <3 seconds
 *
 * Installation:
 * npm install agora-react-native-rtm
 *
 * Client-to-Client Signaling: Mobile App sends
 * 'ALERT' signal directly to Doctor Dashboard.
 */

import RtmEngine from "agora-react-native-rtm";

type RtmPeerMessageHandler = (message: any, peerId: string) => void;

interface RtmEngineClient {
  login(params: { uid: string; token?: string }): Promise<void>;
  logout(): Promise<void>;
  on(event: "MessageFromPeer", handler: RtmPeerMessageHandler): void;
  removeAllListeners?(): void;
  sendMessageToPeer(params: {
    peerId: string;
    text: string;
    offline?: boolean;
  }): Promise<void>;
  // Some versions expose createClient; we handle it conditionally
  createClient?: (appId: string) => Promise<void> | void;
}

export type AgoraMessage = {
  sessionId: string;
  type: "triage_result" | "status_update";
  data: any;
  timestamp: number;
};

/**
 * Agora RTM Client Wrapper (RtmEngine)
 * Handles auth, subscriptions by `sessionId`, and message routing
 */
class AgoraRTMClient {
  private client: RtmEngineClient | null = null;
  private userId: string | null = null;
  private listeners: Map<string, (message: AgoraMessage) => void> = new Map();

  /**
   * Initialize Agora RTM with App ID
   * Call this once when app starts
   */
  async initialize(appId: string, userId: string) {
    if (this.client) return;
    const engine: any = new (RtmEngine as any)({ appId });
    if (typeof engine.createClient === "function") {
      await engine.createClient(appId);
    }
    this.client = engine as RtmEngineClient;
    this.userId = userId;

    this.setupMessageListener();
    console.log("[AGORA] Initialized");
  }

  /**
   * Login to Agora RTM
   * Requires token
   */
  async login(token?: string) {
    if (!this.client) throw new Error("Initialize first");
    if (!this.userId)
      throw new Error(
        "User ID not set. Call initialize(...) with a valid userId before login."
      );

    // HACKATHON OVERRIDE: Use Hardcoded Temp Token if dynamic fails
    const HACKATHON_TOKEN =
      "007eJxSYPhnrzgx9cCDQB+DiA8T5vOZ2L1SOBaaanzTSlg/5MeeK5kKDIkmSUlphilG5qYWliamFimWZimWSckWqYmJZmYGBqkmO7g0MhsCGRn2MU5lZWJgZABhEJ8FTPIxlBRlJqanxidnJOblpeZwMiSm5GbmxSfll4AUQpQiCQICAAD//8JUK30=";

    // If we passed a token, use it. If not, use the hardcoded one.
    const finalToken = token || HACKATHON_TOKEN;

    await this.client.login({ uid: this.userId, token: finalToken });
    console.log("[AGORA] Logged in as", this.userId);
  }

  /**
   * Listen for peer messages from backend Lambda
   */
  private setupMessageListener() {
    if (!this.client) return;

    // RtmEngine event name for peer messages
    this.client.on("MessageFromPeer", (message: any, peerId: string) => {
      try {
        const text = message?.text ?? message;
        const parsedMessage: AgoraMessage =
          typeof text === "string" ? JSON.parse(text) : text;

        const listener = this.listeners.get(parsedMessage.sessionId);
        if (listener) listener(parsedMessage);

        console.log(
          "[AGORA] Message routed from",
          peerId,
          "type:",
          parsedMessage.type
        );
      } catch (error) {
        console.error("[AGORA] Failed to parse message:", error);
      }
    });

    console.log("[AGORA] Message listener set up");
  }

  /**
   * Subscribe to messages for a specific session
   * Returns unsubscribe function
   */
  onSessionMessage(
    sessionId: string,
    callback: (message: AgoraMessage) => void
  ): () => void {
    this.listeners.set(sessionId, callback);

    console.log("[AGORA] Subscribed to session:", sessionId);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(sessionId);
      console.log("[AGORA] Unsubscribed from session:", sessionId);
    };
  }

  /**
   * Send a peer message (JSON serializable payload)
   */
  async sendPeerMessage(peerId: string, payload: any, offline = false) {
    if (!this.client) throw new Error("[AGORA] Client not initialized.");
    await this.client.sendMessageToPeer({
      peerId,
      text: typeof payload === "string" ? payload : JSON.stringify(payload),
      offline,
    });
    console.log("[AGORA] Sent peer message to", peerId);
  }

  /**
   * Logout and cleanup
   */
  async logout() {
    if (!this.client) return;
    try {
      await this.client.logout();
    } catch (e) {
      console.warn("[AGORA] Logout warning:", e);
    }
    try {
      if (typeof this.client.removeAllListeners === "function") {
        this.client.removeAllListeners();
      }
    } catch {}

    this.listeners.clear();
    this.client = null;
    this.userId = null;

    console.log("[AGORA] Logged out");
  }
}

// Singleton instance
export const agoraRTMClient = new AgoraRTMClient();

/**
 * Helper: Get Agora RTM token from your backend
 *
 * Backend Lambda must generate token using Agora SDK:
 *
 * const { RtmTokenBuilder, RtmRole } = require('agora-access-token');
 *
 * const token = RtmTokenBuilder.buildToken(
 *   APP_ID,
 *   APP_CERTIFICATE,
 *   userId,
 *   RtmRole.Rtm_User,
 *   Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
 * );
 */
export async function getAgoraToken(
  userId: string,
  firebaseToken: string
): Promise<string> {
  const API_ENDPOINT = process.env.EXPO_PUBLIC_API_ENDPOINT;

  const response = await fetch(`${API_ENDPOINT}/agora/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseToken}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Agora token: ${response.status}`);
  }

  const { token } = await response.json();
  return token;
}
