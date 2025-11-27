import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ChanseyDashboard() {
  const services = [
    {
      icon: 'book-open',
      title: 'Health Journal',
      titleColor: '#10b981',
      description: 'Access your medical history, prescriptions, and vaccinations.',
    },
    {
      icon: 'calendar',
      title: 'Doctor Availability',
      titleColor: '#a855f7',
      description: 'View real-time availability of our healthcare professionals.',
    },
    {
      icon: 'flask',
      title: 'Lab Test Booking',
      titleColor: '#10b981',
      description: 'Order lab tests with sample collection at your doorstep or visit our partner labs.',
    },
    {
      icon: 'shield-check',
      title: 'Health Plan',
      titleColor: '#a855f7',
      description: 'Add your HMO or browse available health plans to find the perfect coverage.',
    },
    {
      icon: 'bell',
      title: 'Notifications/Alerts',
      titleColor: '#10b981',
      description: 'Stay updated with reminders, lab results, & important health alerts.',
    },
    {
      icon: 'information',
      title: 'About Us',
      titleColor: '#a855f7',
      description: 'Learn more about how we break down access and mission for accessible healthcare.',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoOuter}>
              <View style={styles.logoInner} />
            </View>
          </View>
          <Text style={styles.logoText}>Chansey</Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeSubtitle}>How can we help with you today?</Text>
        </View>

        {/* Dashboard Label */}
        <Text style={styles.dashboardLabel}>Dashboard</Text>

        {/* Main Consultation Card */}
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient
            colors={['#86efac', '#60a5fa', '#a78bfa']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.consultationCard}
          >
            <View style={styles.micContainer}>
              <View style={styles.micOuter}>
                <View style={styles.micMiddle}>
                  <Icon name="mic" size={32} color="#ffffff" />
                </View>
              </View>
            </View>
            <Text style={styles.consultationTitle}>Chansey Consultation</Text>
            <Text style={styles.consultationSubtitle}>
              Get an initial consultation from Chansey, our Triage Bot
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Service Cards Grid */}
        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={styles.serviceCard}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Icon name={service.icon} size={40} color="#1f2937" strokeWidth={1.5} />
              </View>
              <View style={styles.serviceTitleContainer}>
                <GradientText
                  colors={service.gradientColors}
                  style={styles.serviceGradientTitle}
                >
                  {service.title}{' '}
                </GradientText>
                <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
              </View>
              <Text style={styles.serviceDescription}>{service.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoOuter: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 8,
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#374151',
  },
  dashboardLabel: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 12,
  },
  consultationCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  micContainer: {
    marginBottom: 16,
  },
  micOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micMiddle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  consultationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  consultationSubtitle: {
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 18,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 180,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
    height: 50,
    justifyContent: 'center',
  },
  serviceTitleContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  serviceGradientTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  serviceSubtitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 11,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 15,
  },
});

// Installation Requirements:
// npm install react-native-vector-icons
// expo install expo-linear-gradient
// expo install @react-native-masked-view/masked-view
//
// For iOS: cd ios && pod install