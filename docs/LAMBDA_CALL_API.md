# Lambda: Call/Lobby API

## Purpose
Generate Agora RTC tokens and coordinate video calls between patients and specialists.

## Endpoint
`POST /call/join`

## Request Body
```json
{
  "sessionId": "session-1732743000000",
  "userId": "patient_abc123",
  "role": "patient" // or "doctor"
}
```

## Response
```json
{
  "channelName": "triage-session-1732743000000",
  "token": "007eJxS...",
  "uid": 12345,
  "appId": "a4bbf1d27589458d96d9bc8eaa6600e4"
}
```

## Lambda Code (Node.js)

```javascript
const { RtcTokenBuilder, RtcRole } = require('agora-token');

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { sessionId, userId, role } = body;

    // Channel name format: triage-{sessionId}
    const channelName = `triage-${sessionId}`;
    
    // Generate unique UID (or use userId hash)
    const uid = Math.floor(Math.random() * 100000);
    
    // Token expires in 24 hours
    const expirationTimeInSeconds = 86400;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    
    // Generate RTC token
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      RtcRole.PUBLISHER, // Both can publish audio/video
      privilegeExpiredTs
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        channelName,
        token,
        uid,
        appId: AGORA_APP_ID
      })
    };
    
  } catch (error) {
    console.error('Error generating token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate call token' })
    };
  }
};
```

## Setup Steps

### 1. Install Dependencies
```bash
npm install agora-token
```

### 2. Set Environment Variables in Lambda
- `AGORA_APP_ID`: Your Agora App ID (same as mobile)
- `AGORA_APP_CERTIFICATE`: From Agora console (enable certificate)

### 3. Deploy Lambda
```bash
# Using AWS CLI
zip -r function.zip .
aws lambda create-function \
  --function-name chansey-call-api \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role
```

### 4. Create API Gateway Endpoint
```bash
# Create REST API
aws apigateway create-rest-api --name chansey-call-api

# Create resource /call/join
# Link to Lambda function
# Enable CORS
# Deploy to stage
```

## Environment Variable for Mobile App

Add to your `.env`:
```
EXPO_PUBLIC_CALL_API_ENDPOINT=https://your-api.execute-api.us-east-1.amazonaws.com/call/join
```

## Update Mobile App to Use Real Tokens

In `app/call/[sessionId].tsx`, replace the simulated connection:

```typescript
const initializeAgoraCall = async () => {
  try {
    console.log("Starting Agora RTC initialization...");
    
    // Get token from backend
    const response = await fetch(process.env.EXPO_PUBLIC_CALL_API_ENDPOINT!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        userId: 'patient_test', // Replace with actual user ID
        role: 'patient'
      })
    });
    
    const { channelName, token, uid, appId } = await response.json();
    console.log("Got token, joining channel:", channelName);
    
    const engine = createAgoraRtcEngine();
    engineRef.current = engine;

    await engine.initialize({ appId });
    await engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
    await engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
    
    await engine.enableAudio();
    
    await engine.joinChannel(token, channelName, uid, {});
    
    setIsConnected(true);
    console.log("Successfully joined Agora channel");
    
  } catch (error) {
    console.error("Failed to initialize Agora call:", error);
    Alert.alert("Connection Failed", "Could not connect to specialist.");
  }
};
```

## Web Dashboard Integration

Share this endpoint with your web team so doctors can join the same channel:

```javascript
// Web dashboard code
const joinCall = async (sessionId) => {
  const response = await fetch('YOUR_API_ENDPOINT/call/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      userId: 'doctor_dashboard',
      role: 'doctor'
    })
  });
  
  const { channelName, token, uid, appId } = await response.json();
  
  // Use Agora Web SDK to join
  await agoraClient.join(appId, channelName, token, uid);
};
```

## Security Notes

- **Never** expose `AGORA_APP_CERTIFICATE` in client code
- Tokens should be generated server-side only
- Add Firebase Auth validation in production
- Implement rate limiting
- Log all call sessions for audit

## Testing

1. Mobile app calls `/call/join` with sessionId
2. Lambda returns token
3. Mobile joins Agora channel
4. Web dashboard calls same endpoint with same sessionId
5. Both connect to same channel and can communicate

## Hackathon Shortcut

If Lambda deployment is blocked, you can generate a 24-hour test token from Agora Console:
1. Go to Agora Console → Project Settings
2. Enable Primary Certificate
3. Use "Token Generator" tool
4. Hardcode token in mobile app (temporary only!)

```typescript
const TEMP_TOKEN = "007eJxS..."; // From Agora Console
await engine.joinChannel(TEMP_TOKEN, channelName, uid, {});
```

This works for demo but replace with Lambda before production!
