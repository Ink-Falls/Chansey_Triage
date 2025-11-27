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
} from "react-native-agora";
import { getAuth } from "@react-native-firebase/auth";

const AGORA_APP_ID =
  process.env.EXPO_PUBLIC_AGORA_APP_ID || "a4bbf1d27589458d96d9bc8eaa6600e4";

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
      const channelName = sessionId as string;
      const uid = 0; // Let Agora assign UID automatically

      // TEMPORARY TOKEN - Replace with token from Agora Console
      // Go to: console.agora.io → Project → Generate Temp Token
      // Channel: triage_room_1, UID: 0
      const TEMP_TOKEN =
        "007eJxTYMj8v2S9rPREJ4E/thUzcg94PFqVWXR2VsRXF6VpvwX2JMgoMCSaJCWlGaYYmZtaWJqYWqRYmqVYJiVbpCYmmpkZGKSaVKZqZDYEMjK47kplZGSAQBCfl6GkKDMxPTW+KD8/N96QgQEAmWgi3Q=="; // Replace this
      const token = process.env.EXPO_PUBLIC_AGORA_TEMP_TOKEN || TEMP_TOKEN;

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

      await engine.initialize({ appId: AGORA_APP_ID });
      await engine.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication
      );
      await engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

      // Enable audio
      await engine.enableAudio();

      // Join channel without token (testing mode)
      console.log("📞 Calling joinChannel...");
      await engine.joinChannel(token, channelName, uid, {});

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
