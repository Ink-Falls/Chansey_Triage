import React, { useState } from "react";
import { View, Text, Switch, ScrollView, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useTriageRecorder } from "../hooks/useTriageRecorder";
import { useTriageAnimations } from "../hooks/useTriageAnimations";
import { TriageButton } from "../components/TriageButton";
import { ResultCard } from "../components/ResultCard";
import { getTriageColors } from "../utils/triageColors";

export default function TriageScreen() {
  const { theme, isDark } = useTheme();
  const [highContrast, setHighContrast] = useState(false);
  const router = useRouter();

  const { status, lastResult, startRecording, stopRecording } =
    useTriageRecorder();
  const { pulseAnim, fadeAnim } = useTriageAnimations(status, lastResult);
  const colors = getTriageColors(theme, highContrast);

  // Use white background and black text for normal view
  const bgColor = highContrast ? colors.bg : "#FFFFFF";
  const textColor = highContrast ? colors.text : "#000000";

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar style={highContrast ? "light" : "dark"} />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          justifyContent: "space-between",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View>
          <Text
            style={{
              color: textColor,
              fontSize: 28,
              fontWeight: "800",
              marginTop: 40,
              marginBottom: 8,
              letterSpacing: -0.5,
            }}
          >
            Chansey Triage
          </Text>
          <Text
            style={{
              color: textColor,
              fontSize: 15,
              opacity: 0.7,
              lineHeight: 22,
            }}
          >
            Hold the button and describe your symptoms. Our AI will analyze and
            route you to the appropriate specialist.
          </Text>
        </View>

        {/* Center Button with Logo */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 40,
            gap: 20,
          }}
        >
          {/* Chansey Logo and Text */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            {/* Chansey Text */}
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: textColor,
                letterSpacing: -0.5,
              }}
            >
              Chansey
            </Text>
            {/* Logo */}
            <Image
              source={require("../assets/images/chansey-logo.png")}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </View>

          {/* Button */}
          <TriageButton
            status={status}
            colors={colors}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            pulseAnim={pulseAnim}
          />
        </View>

        {/* Bottom Section */}
        <View style={{ gap: 16 }}>
          {/* High Contrast Toggle */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: highContrast ? colors.card : "#F5F5F5",
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: highContrast ? colors.border : "#E0E0E0",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Ionicons
                name="contrast"
                size={24}
                color={highContrast ? colors.text : textColor}
              />
              <Text
                style={{
                  color: highContrast ? colors.text : textColor,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                High-Contrast Mode
              </Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              thumbColor={highContrast ? "#FFFFFF" : undefined}
              trackColor={{ true: "#FFFFFF" }}
            />
          </View>

          {/* Result Card */}
          {lastResult && (
            <ResultCard
              result={lastResult}
              colors={colors}
              fadeAnim={fadeAnim}
              sessionId={lastResult.sessionId}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
