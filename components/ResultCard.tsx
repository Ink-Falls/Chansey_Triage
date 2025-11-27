import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { TriageResult } from "../hooks/useTriageRecorder";
// Removed AgoraSignal/RTM; relying on polling + manual call start
import { useRouter } from "expo-router";

interface ResultCardProps {
  result: TriageResult;
  colors: any;
  fadeAnim: Animated.Value;
  sessionId?: string;
}

function ConnectButton({
  result,
  urgencyColor,
  sessionId,
}: {
  result: TriageResult;
  urgencyColor: string;
  sessionId?: string;
}) {
  const router = useRouter();

  const handleConnect = () => {
    console.log("Connect button pressed for:", result.specialist);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Generate or use existing sessionId

    // TEMPORARY FOR TESTING
    const callSessionId = "triage_room_1";
    // const callSessionId = sessionId || `session-${Date.now()}`;

    console.log("Initiating call with sessionId:", callSessionId);

    // Navigate to call screen
    router.push({
      pathname: "/call/[sessionId]",
      params: { sessionId: callSessionId },
    });
  };

  return (
    <Pressable
      style={{
        backgroundColor: urgencyColor,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 16,
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
      }}
      onPress={handleConnect}
    >
      <Ionicons name="call" size={24} color="#FFF" />
      <Text
        style={{
          color: "#FFF",
          fontSize: 16,
          fontWeight: "bold",
          letterSpacing: 0.5,
        }}
      >
        Connect to {result.specialist}
      </Text>
    </Pressable>
  );
}

export function ResultCard({
  result,
  colors,
  fadeAnim,
  sessionId,
}: ResultCardProps) {
  const urgencyColor =
    result.urgency === "High"
      ? "#FF4444"
      : result.urgency === "Medium"
      ? "#FFA500"
      : "#4CAF50";

  const urgencyIcon =
    result.urgency === "High"
      ? "alert-circle"
      : result.urgency === "Medium"
      ? "warning"
      : "checkmark-circle";

  // RTM auto-alert removed; alerting handled by backend or manual flow

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <View
        style={{
          borderWidth: 2,
          borderColor: urgencyColor,
          borderRadius: 16,
          padding: 20,
          backgroundColor: colors.card,
          shadowColor: urgencyColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {/* Urgency Badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              backgroundColor: urgencyColor,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name={urgencyIcon} size={18} color="#FFF" />
            <Text
              style={{
                color: "#FFF",
                fontWeight: "bold",
                fontSize: 14,
                letterSpacing: 1,
              }}
            >
              {result.urgency.toUpperCase()} URGENCY
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 6,
              opacity: 0.7,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Summary
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              lineHeight: 24,
            }}
          >
            {result.summary}
          </Text>
        </View>

        {/* Category & Specialist Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 16,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: colors.subtle,
            borderRadius: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 12,
                opacity: 0.6,
                marginBottom: 4,
                fontWeight: "600",
              }}
            >
              CATEGORY
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {result.category}
            </Text>
          </View>
          <View
            style={{
              width: 1,
              backgroundColor: colors.border,
              marginHorizontal: 16,
            }}
          />
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 12,
                opacity: 0.6,
                marginBottom: 4,
                fontWeight: "600",
              }}
            >
              SPECIALIST
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "700",
                textAlign: "right",
              }}
            >
              {result.specialist}
            </Text>
          </View>
        </View>

        {/* Suggested Action */}
        <View
          style={{
            backgroundColor: colors.bg,
            padding: 16,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: urgencyColor,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="arrow-forward-circle"
              size={20}
              color={colors.text}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Next Step
            </Text>
          </View>
          <Text
            style={{
              color: colors.text,
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            {result.suggested_action}
          </Text>
        </View>

        {/* Connect Button for High Urgency */}
        {result.urgency === "High" && (
          <ConnectButton
            result={result}
            urgencyColor={urgencyColor}
            sessionId={sessionId}
          />
        )}
      </View>
    </Animated.View>
  );
}
