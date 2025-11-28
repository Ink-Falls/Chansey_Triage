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
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 24,
          paddingBottom: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F3F4F6",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#000000" />
          </Pressable>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#7EFD94",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="call" size={20} color="#FFFFFF" />
          </View>
          <Text
            style={{
              color: "#000000",
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Video/Audio Consultation
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 6 }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#9CA3AF",
            }}
          />
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#9CA3AF",
            }}
          />
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#9CA3AF",
            }}
          />
        </View>
      </View>

      {/* Video/Specialist Area */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: "#8B5CF6",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
            borderWidth: 4,
            borderColor: "#FFFFFF",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 48,
              fontWeight: "600",
            }}
          >
            N
          </Text>
        </View>

        <Text
          style={{
            color: "#000000",
            fontSize: 28,
            fontWeight: "700",
            marginBottom: 12,
          }}
        >
          Neurologist
        </Text>

        <Text
          style={{
            color: "#666666",
            fontSize: 15,
            fontWeight: "500",
            marginBottom: 20,
          }}
        >
          Specialist Available
        </Text>

        {isConnected ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 24,
              paddingVertical: 12,
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              borderRadius: 24,
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: "#8B5CF6",
              }}
            />
            <Text
              style={{
                color: "#8B5CF6",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Connected • {formatDuration(callDuration)}
            </Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 24,
              paddingVertical: 12,
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              borderRadius: 24,
            }}
          >
            <ActivityIndicator size="small" color="#8B5CF6" />
            <Text
              style={{
                color: "#8B5CF6",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Waiting to connect...
            </Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: 48,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            paddingTop: 24,
          }}
        >
          {/* End Call Button */}
          <View style={{ alignItems: "center" }}>
            <Pressable
              onPress={handleEndCall}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "#EF4444",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="call" size={28} color="#FFFFFF" />
            </Pressable>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 13,
                fontWeight: "500",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              End Call
            </Text>
          </View>

          {/* Mute Button */}
          <View style={{ alignItems: "center" }}>
            <Pressable
              onPress={toggleMute}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: isMuted ? "#EF4444" : "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Ionicons
                name={isMuted ? "mic-off" : "mic"}
                size={28}
                color={isMuted ? "#FFFFFF" : "#000000"}
              />
            </Pressable>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 13,
                fontWeight: "500",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              Mute
            </Text>
          </View>

          {/* Speaker Button */}
          <View style={{ alignItems: "center" }}>
            <Pressable
              onPress={toggleSpeaker}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Ionicons
                name={isSpeakerOn ? "volume-high" : "volume-mute"}
                size={28}
                color={isSpeakerOn ? "#7EFD94" : "#000000"}
              />
            </Pressable>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 13,
                fontWeight: "500",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              Speaker
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
