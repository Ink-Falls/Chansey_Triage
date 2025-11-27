import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

export default function VideoCallApp() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={['#7EFD94', '#698DFE', '#7F4EF0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.phoneIcon}
            >
              <Icon name="phone" size={16} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.headerTitle}>Video/Audio Consultation</Text>
          </View>
          <View style={styles.menuDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>

      {/* Video Area */}
      <View style={styles.videoArea}>
        <View style={styles.centerContent}>
          {/* Doctor Avatar */}
          <LinearGradient
            colors={['#7EFD94', '#698DFE', '#7F4EF0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>MS</Text>
          </LinearGradient>

          {/* Doctor Name */}
          <Text style={styles.doctorName}>Maria Santos</Text>

          {/* Call Duration */}
          <View style={styles.durationContainer}>
            <View style={styles.clockIcon}>
              <Icon name="clock" size={16} color="#6b7280" />
            </View>
          </View>

          <Text style={styles.duration}>05:42</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlsRow}>
          {/* End Call Button */}
          <View style={styles.controlItem}>
            <TouchableOpacity style={styles.endCallButton}>
              <Icon name="phone" size={24} color="#ffffff" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Decline</Text>
          </View>

          {/* Mute Button */}
          <View style={styles.controlItem}>
            <TouchableOpacity
              onPress={() => setIsMuted(!isMuted)}
              style={[styles.controlButton, isMuted && styles.activeButton]}
            >
              <Icon name={isMuted ? "mic-off" : "mic"} size={24} color={isMuted ? "#ffffff" : "#374151"} />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Mute</Text>
          </View>

          {/* Video Toggle Button */}
          <View style={styles.controlItem}>
            <TouchableOpacity
              onPress={() => setIsVideoOff(!isVideoOff)}
              style={[styles.controlButton, isVideoOff && styles.activeButton]}
            >
              <Icon name={isVideoOff ? "video-off" : "video"} size={24} color={isVideoOff ? "#ffffff" : "#374151"} />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Video</Text>
          </View>

          {/* Speaker Button */}
          <View style={styles.controlItem}>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="volume-2" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Audio</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: '500',
    fontSize: 14,
  },
  menuDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9ca3af',
  },
  videoArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  doctorName: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 32,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  clockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    color: '#6b7280',
    fontSize: 12,
  },
  controls: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  controlItem: {
    alignItems: 'center',
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  activeButton: {
    backgroundColor: '#ef4444',
  },
  controlLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
});