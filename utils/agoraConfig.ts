export const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID || "a4bbf1d27589458d96d9bc8eaa6600e4";
export const LOBBY_API_URL = process.env.EXPO_PUBLIC_CALL_API_ENDPOINT || ""; // set to your Lambda URL if available

export function getDevToken(): string {
  // In dev, allow empty token when App Certificate is disabled
  return process.env.EXPO_PUBLIC_AGORA_TEMP_TOKEN || "";
}
