import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

// Dynamically import Agora only on web
let AgoraRTC: any = null;
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  AgoraRTC = require('agora-rtc-sdk-ng').default;
}

// Agora Configuration
const AGORA_CONFIG = {
  appId: '1364f588b53c42baac5772751347347a',
  token: null,
  channelName: 'consultation-channel',
};

export default function VideoCallApp() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  
  const client = useRef<any>(null);
  const localAudioTrack = useRef<any>(null);
  const localVideoTrack = useRef<any>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initAgora();
    return () => {
      leaveChannel();
    };
  }, []);

  const initAgora = async () => {
    if (Platform.OS !== 'web') {
      console.log('Agora Web SDK only works on web platform');
      return;
    }

    try {
      // Create Agora client
      client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      // Set up event listeners
      client.current.on('user-published', async (user: any, mediaType: string) => {
        await client.current.subscribe(user, mediaType);
        console.log('Subscribe success');
        
        if (mediaType === 'video') {
          setRemoteUid(user.uid);
          setRemoteUsers((prev) => [...prev, user]);
          
          // Play remote video
          setTimeout(() => {
            if (remoteVideoRef.current) {
              user.videoTrack?.play(remoteVideoRef.current);
            }
          }, 100);
        }
        
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      client.current.on('user-unpublished', (user: any) => {
        console.log('User unpublished:', user.uid);
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        if (remoteUid === user.uid) {
          setRemoteUid(null);
        }
      });

      // Join channel
      await client.current.join(
        AGORA_CONFIG.appId,
        AGORA_CONFIG.channelName,
        AGORA_CONFIG.token,
        null
      );
      
      setIsJoined(true);
      console.log('Joined channel successfully');

      // Create and publish local tracks
      localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
      localVideoTrack.current = await AgoraRTC.createCameraVideoTrack();

      await client.current.publish([localAudioTrack.current, localVideoTrack.current]);
      console.log('Published local tracks');

      // Play local video
      if (localVideoRef.current) {
        localVideoTrack.current.play(localVideoRef.current);
      }
    } catch (error) {
      console.error('Error initializing Agora:', error);
    }
  };

  const leaveChannel = async () => {
    try {
      // Stop and close local tracks
      localAudioTrack.current?.stop();
      localAudioTrack.current?.close();
      localVideoTrack.current?.stop();
      localVideoTrack.current?.close();
      
      // Leave the channel
      await client.current?.leave();
      
      setIsJoined(false);
      setRemoteUid(null);
      setRemoteUsers([]);
      console.log('Left channel successfully');
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  };

  const toggleMute = async () => {
    try {
      const newMutedState = !isMuted;
      if (localAudioTrack.current) {
        await localAudioTrack.current.setEnabled(!newMutedState);
      }
      setIsMuted(newMutedState);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const toggleVideo = async () => {
    try {
      const newVideoOffState = !isVideoOff;
      if (localVideoTrack.current) {
        await localVideoTrack.current.setEnabled(!newVideoOffState);
      }
      setIsVideoOff(newVideoOffState);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  const switchCamera = async () => {
    try {
      if (localVideoTrack.current) {
        // Get available cameras
        const cameras = await AgoraRTC.getCameras();
        if (cameras.length > 1) {
          const currentDevice = localVideoTrack.current.getTrackLabel();
          const nextCamera = cameras.find((cam: any) => cam.label !== currentDevice) || cameras[0];
          await localVideoTrack.current.setDevice(nextCamera.deviceId);
          console.log('Switched camera to:', nextCamera.label);
        }
      }
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

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
        {/* Remote Video (Doctor) */}
        {remoteUid ? (
          Platform.OS === 'web' ? (
            <div ref={remoteVideoRef as any} style={{
              flex: 1,
              backgroundColor: '#000000',
              borderRadius: 16,
              overflow: 'hidden',
              width: '100%',
              height: '100%',
            }} />
          ) : (
            <View style={styles.remoteVideo}>
              <LinearGradient
                colors={['#7EFD94', '#698DFE', '#7F4EF0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>MS</Text>
              </LinearGradient>
              <Text style={styles.doctorName}>Maria Santos</Text>
              <Text style={styles.waitingText}>Video call connected</Text>
            </View>
          )
        ) : (
          <View style={styles.centerContent}>
            <LinearGradient
              colors={['#7EFD94', '#698DFE', '#7F4EF0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>MS</Text>
            </LinearGradient>
            <Text style={styles.doctorName}>Maria Santos</Text>
            <View style={styles.durationContainer}>
              <View style={styles.clockIcon}>
                <Icon name="clock" size={16} color="#6b7280" />
              </View>
            </View>
            <Text style={styles.duration}>Waiting to connect...</Text>
          </View>
        )}
        
        {/* Local Video Preview (Your camera) - Small overlay */}
        {isJoined && !isVideoOff && (
          Platform.OS === 'web' ? (
            <div ref={localVideoRef as any} style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 120,
              height: 160,
              backgroundColor: '#1f2937',
              borderRadius: 12,
              border: '2px solid #ffffff',
              overflow: 'hidden',
            }} />
          ) : (
            <View style={styles.localVideo}>
              <Icon name="user" size={32} color="#ffffff" />
              <Text style={styles.localVideoText}>You</Text>
            </View>
          )
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlsRow}>
          {/* End Call Button */}
          <View style={styles.controlItem}>
            <TouchableOpacity style={styles.endCallButton} onPress={leaveChannel}>
              <Icon name="phone" size={24} color="#ffffff" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>End Call</Text>
          </View>

          {/* Mute Button */}
          <View style={styles.controlItem}>
            <TouchableOpacity
              onPress={toggleMute}
              style={[styles.controlButton, isMuted && styles.activeButton]}
            >
              <Icon name={isMuted ? "mic-off" : "mic"} size={24} color={isMuted ? "#ffffff" : "#374151"} />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Mute</Text>
          </View>

          {/* Video Toggle Button */}
          <View style={styles.controlItem}>
            <TouchableOpacity
              onPress={toggleVideo}
              style={[styles.controlButton, isVideoOff && styles.activeButton]}
            >
              <Icon name={isVideoOff ? "video-off" : "video"} size={24} color={isVideoOff ? "#ffffff" : "#374151"} />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Video</Text>
          </View>

          {/* Switch Camera Button */}
          <View style={styles.controlItem}>
            <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
              <Icon name="refresh-cw" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Flip</Text>
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
  placeholderVideo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 16,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 16,
  },
  localVideo: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  localVideoText: {
    color: '#ffffff',
    fontSize: 12,
  },
  waitingText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 8,
  },
});