const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID || "";
const LOBBY_API_URL = process.env.EXPO_PUBLIC_CALL_API_ENDPOINT || "";

type LobbyResponse = {
  appId: string;
  channelName: string;
  token: string;
  uid: number | string;
  expiresIn?: number;
};

async function validateLobby(sessionId: string) {
  console.log("Validate Lobby: starting", { sessionId, AGORA_APP_ID, LOBBY_API_URL });

  if (!LOBBY_API_URL) {
    console.error("LOBBY_API_URL is not set. Configure EXPO_PUBLIC_CALL_API_ENDPOINT.");
    process.exitCode = 1;
    return;
  }

  try {
    const url = `${LOBBY_API_URL}?sessionId=${encodeURIComponent(sessionId)}`;
    console.log("Fetching:", url);
    const res = await fetch(url, { method: "GET" });
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Response is not JSON:", text);
      process.exitCode = 1;
      return;
    }

    const ok = res.ok;
    console.log("HTTP Status:", res.status, ok ? "OK" : "ERROR");
    console.log("Response JSON:", data);

    const missing: string[] = [];
    for (const key of ["appId", "channelName", "token", "uid"]) {
      if (!(key in data)) missing.push(key);
    }

    if (missing.length) {
      console.error("Missing fields:", missing.join(", "));
      process.exitCode = 1;
      return;
    }

    const resp = data as LobbyResponse;
    const appIdMatch = resp.appId === AGORA_APP_ID;
    const tokenLooksValid = typeof resp.token === "string" && resp.token.length > 0;
    const channelOk = typeof resp.channelName === "string" && resp.channelName.length > 0;

    console.log("Checks:", {
      appIdMatch,
      tokenLooksValid,
      channelOk,
      uidType: typeof resp.uid,
      expiresIn: resp.expiresIn ?? null,
    });

    if (!appIdMatch) {
      console.error("App ID mismatch. Mobile/Web must use:", AGORA_APP_ID);
      process.exitCode = 1;
      return;
    }

    if (!tokenLooksValid) {
      console.warn("Token is empty. If App Certificate is enabled, this will fail.");
    }

    console.log("Lobby endpoint validation passed for session:", sessionId);
  } catch (err) {
    console.error("Lobby validation error:", err);
    process.exitCode = 1;
  }
}

const sessionId = process.argv[2] || "triage_room_1";
validateLobby(sessionId);
