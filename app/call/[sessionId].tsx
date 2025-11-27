import React, { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../context/ThemeContext";

import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  IRtcEngineEventHandler,
  AudioProfileType,
  AudioScenarioType,
  AudioAinsMode,
} from "react-native-agora";
import { getAuth } from "@react-native-firebase/auth";
import {
  AGORA_APP_ID,
  getDevToken,
  LOBBY_API_URL,
} from "../../utils/agoraConfig";

// App ID is centralized in agoraConfig

export default function CallScreen() {
  const { sessionId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const engineRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    console.log("Initializing call for session:", sessionId);
    initializeAgoraCall();

    return () => {
      endCall();
    };
  }, []);

  useEffect(() => {
    if (isConnected) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isConnected]);

  const initializeAgoraCall = async () => {
    try {
      console.log("Starting Agora RTC initialization...");

      // Get current user
      const auth = getAuth();
      const user = auth.currentUser;

      // Use sessionId directly as channel name (matching web dashboard)
      const channelName = String(sessionId);
      let uid = 0; // Let Agora assign UID automatically

      // Prefer lobby Lambda token; fallback to dev token helper
      let token = getDevToken();
      try {
        if (LOBBY_API_URL) {
          console.log("Fetching token from lobby:", LOBBY_API_URL);
          const res = await fetch(LOBBY_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: channelName,
              userId: user?.uid ?? "patient_test",
              role: "patient",
            }),
          });
          if (res.ok) {
            const data = await res.json();
            token = data.token ?? token;
            uid = data.uid ?? uid;
            console.log("Lobby token received. UID:", uid);
          } else {
            console.warn("Lobby API responded:", res.status);
          }
        }
      } catch (e) {
        console.warn("Lobby token fetch failed:", e);
      }

      console.log("Joining channel (no token):", channelName);
      console.log("App ID:", AGORA_APP_ID);

      // Step 2: Initialize Agora engine
      const engine = createAgoraRtcEngine();
      engineRef.current = engine;

      // Set up event handlers
      const eventHandler: IRtcEngineEventHandler = {
        onJoinChannelSuccess: (connection) => {
          console.log("✅ Successfully joined channel:", connection.channelId);
          setIsConnected(true);
        },
        onUserJoined: (connection, remoteUid) => {
          console.log("👤 Remote user joined:", remoteUid);
        },
        onUserOffline: (connection, remoteUid) => {
          console.log("👋 Remote user left:", remoteUid);
        },
        onError: (err, msg) => {
          console.error("❌ Agora error:", err, msg);
        },
      };

      engine.registerEventHandler(eventHandler);

      if (!AGORA_APP_ID) {
        throw new Error("Missing AGORA_APP_ID. Set EXPO_PUBLIC_AGORA_APP_ID.");
      }
      engine.initialize({ appId: AGORA_APP_ID });
      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

      // Enable audio
      engine.enableAudio();

      // Enable AI Noise Suppression (AINS) with explicit mode when available
      try {
        // Newer SDKs expose setAINSMode(enabled, mode)
        engine.setAINSMode?.(true, AudioAinsMode.AinsModeUltralowlatency);
      } catch (e) {
        // Preferred API alternative if only boolean toggle exists
        // @ts-ignore: method availability depends on SDK version
        engine.enableAiNoiseSuppression?.(true);
      }
      // Fallbacks for older SDKs: enable classic noise suppression via parameters
      try {
        // Enable built-in noise suppression
        engine.setParameters('{"che.audio.ns.enable":true}');
        // Set high-quality speech profile and meeting scenario
        // AudioProfileType.AudioProfileSpeechStandard (or choose HighQualityStereo per needs)
        // AudioScenarioType.AudioScenarioMeeting: optimized for voice clarity
        engine.setAudioProfile(
          AudioProfileType.AudioProfileSpeechStandard,
          AudioScenarioType.AudioScenarioMeeting
        );
      } catch {}

      // Join channel without token (testing mode)
      console.log("📞 Calling joinChannel...");
      engine.joinChannel(token, channelName, uid, {});

      console.log("Agora join channel called successfully");
    } catch (error) {
      console.error("Failed to initialize Agora call:", error);
      Alert.alert(
        "Connection Failed",
        `Could not connect to specialist. ${error}`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  const endCall = async () => {
    try {
      console.log("Ending call...");

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (engineRef.current) {
        await engineRef.current.leaveChannel();
        engineRef.current.unregisterEventHandler();
        engineRef.current.release();
        engineRef.current = null;
      }

      setIsConnected(false);
      console.log("Call ended");
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };
  const toggleMute = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (engineRef.current) {
        await engineRef.current.muteLocalAudioStream(!isMuted);
      }

      setIsMuted(!isMuted);
      console.log("Mute toggled:", !isMuted);
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  const toggleSpeaker = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (engineRef.current) {
        await engineRef.current.setEnableSpeakerphone(!isSpeakerOn);
      }

      setIsSpeakerOn(!isSpeakerOn);
      console.log("Speaker toggled:", !isSpeakerOn);
    } catch (error) {
      console.error("Error toggling speaker:", error);
    }
  };

  const handleEndCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert("End Call", "Are you sure you want to end this call?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Call",
        style: "destructive",
        onPress: async () => {
          await endCall();
          router.back();
        },
      },
    ]);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 20,
          paddingBottom: 20,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: theme.text,
            fontSize: 24,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Specialist Call
        </Text>

        {isConnected ? (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#4CAF50",
                  marginRight: 8,
                }}
              />
              <Text
                style={{
                  color: "#4CAF50",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Connected
              </Text>
            </View>
            <Text
              style={{
                color: theme.text,
                fontSize: 18,
                fontWeight: "600",
                marginTop: 12,
                opacity: 0.8,
              }}
            >
              {formatDuration(callDuration)}
            </Text>
          </>
        ) : (
          <>
            <ActivityIndicator
              size="large"
              color={theme.accent}
              style={{ marginTop: 20 }}
            />
            <Text
              style={{
                color: theme.text,
                fontSize: 16,
                marginTop: 12,
                opacity: 0.7,
              }}
            >
              Connecting...
            </Text>
          </>
        )}
      </View>

      {/* Video/Audio Display Area */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.card,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 3,
            borderColor: isConnected ? "#4CAF50" : theme.cardBorder,
          }}
        >
          <Ionicons
            name="person"
            size={60}
            color={theme.text}
            style={{ opacity: 0.5 }}
          />
        </View>
        <Text
          style={{
            color: theme.text,
            fontSize: 20,
            fontWeight: "600",
            marginTop: 20,
          }}
        >
          Neurologist
        </Text>
        {isConnected && (
          <Text
            style={{
              color: theme.text,
              fontSize: 14,
              marginTop: 8,
              opacity: 0.6,
            }}
          >
            Audio Call Active
          </Text>
        )}
      </View>

      {/* Call Controls */}
      {isConnected && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: 30,
            }}
          >
            {/* Mute Button */}
            <Pressable
              onPress={toggleMute}
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: isMuted ? "#FF4444" : theme.card,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: isMuted ? "#FF4444" : theme.cardBorder,
              }}
            >
              <Ionicons
                name={isMuted ? "mic-off" : "mic"}
                size={32}
                color={isMuted ? "#FFF" : theme.text}
              />
            </Pressable>

            {/* Speaker Button */}
            <Pressable
              onPress={toggleSpeaker}
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: isSpeakerOn ? theme.accent : theme.card,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: isSpeakerOn ? theme.accent : theme.cardBorder,
              }}
            >
              <Ionicons
                name={isSpeakerOn ? "volume-high" : "volume-mute"}
                size={32}
                color={isSpeakerOn ? "#FFF" : theme.text}
              />
            </Pressable>
          </View>

          {/* End Call Button */}
          <Pressable
            onPress={handleEndCall}
            style={{
              backgroundColor: "#FF4444",
              paddingVertical: 18,
              borderRadius: 16,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Ionicons name="call" size={24} color="#FFF" />
            <Text
              style={{
                color: "#FFF",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              End Call
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
