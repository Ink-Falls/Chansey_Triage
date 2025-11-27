# Web Dashboard: Join Instructions

Use the Agora Web SDK to join the same channel as mobile.

- App ID: `a4bbf1d27589458d96d9bc8eaa6600e4`
- Channel: mobile `sessionId` (e.g., `triage_room_1`)
- Token:
  - Production: token from lobby Lambda
  - Dev/Testing: empty when App Certificate is disabled

## Minimal Join Snippet

```html
<script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.19.0.js"></script>
<script>
  const APP_ID = 'a4bbf1d27589458d96d9bc8eaa6600e4';
  const CHANNEL = 'triage_room_1';
  const TOKEN = '';
  const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

  async function join() {
    await client.join(APP_ID, CHANNEL, TOKEN || null, null);
    const mic = await AgoraRTC.createMicrophoneAudioTrack();
    await client.publish([mic]);
    console.log('Joined and published microphone');
  }
</script>
```

## Troubleshooting
- Error `CAN_NOT_GET_GATEWAY_SERVER: invalid vendor key`: App Certificate enabled → disable it or use a valid token.
- No audio: ensure microphone permissions granted in the browser.
- Different channels: verify the web `CHANNEL` equals mobile `sessionId`.
