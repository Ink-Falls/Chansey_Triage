//new
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Icon from 'react-native-vector-icons/Feather';
import { useFonts } from 'expo-font';

// Gradient Text Component
const GradientText = ({ colors, style, children }) => {
  // For web, use CSS gradient
  if (Platform.OS === 'web') {
    return (
      <Text
        style={[
          style,
          {
            background: `linear-gradient(90deg, ${colors.join(', ')})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          } as any,
        ]}
      >
        {children}
      </Text>
    );
  }
  
  // For native, use MaskedView
  return (
    <MaskedView maskElement={<Text style={style}>{children}</Text>}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

export default function ChanseyDashboard() {
  const [fontsLoaded] = useFonts({
    'Arboria-Book': require('../assets/fonts/Arboria-Book.ttf'),
    'Arboria-Medium': require('../assets/fonts/Arboria-Medium.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }
  const services = [
    {
      icon: 'book-open',
      title: 'Health',
      subtitle: 'Journal',
      gradientColors: ['#7EFD94', '#7F4EF0', '#698DFE'],
      description: 'Access your medical history, prescriptions, and vaccinations.',
    },
    {
      icon: 'calendar',
      title: 'Doctor',
      subtitle: 'Availability',
      gradientColors: ['#7EFD94', '#7F4EF0', '#698DFE'],
      description: 'View real-time availability of our healthcare professionals.',
    },
    {
      icon: 'activity',
      title: 'Lab Test',
      subtitle: 'Booking',
      gradientColors: ['#7EFD94', '#7F4EF0', '#698DFE'],
      description: 'Order lab tests with sample collection at your doorstep or visit our partner labs.',
    },
    {
      icon: 'shield',
      title: 'Health',
      subtitle: 'Plan',
      gradientColors: ['#7EFD94', '#7F4EF0', '#698DFE'],
      description: 'Add your HMO or browse available health plans to find the perfect coverage.',
    },
    {
      icon: 'bell',
      title: 'Notifications/',
      subtitle: 'Alerts',
      gradientColors: ['#7EFD94', '#7F4EF0', '#698DFE'],
      description: 'Stay updated with reminders, lab results, & important health alerts.',
    },
    {
      icon: 'info',
      title: 'About',
      subtitle: 'Us',
      gradientColors: ['#7EFD94', '#7F4EF0', '#698DFE'],
      description: 'Learn more about how we break down access and mission for accessible healthcare.',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/chansey-light-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
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
            <View style={styles.consultationContent}>
              <Image 
                source={require('../assets/images/chansey-white.png')} 
                style={styles.consultationImage}
                resizeMode="contain"
              />
              <View style={styles.consultationTextContainer}>
                <GradientText
                  colors={['#ffffff', '#f0fdfa']}
                  style={styles.consultationTitle}
                >
                  Chansey Consultation
                </GradientText>
                <Text style={styles.consultationSubtitle}>
                  Get an initial consultation from Chansey, our Triage Bot
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Service Cards Grid */}
        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <LinearGradient
              key={index}
              colors={service.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}
            >
              <TouchableOpacity
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
                    {service.title}
                  </GradientText>
                  <GradientText
                    colors={service.gradientColors}
                    style={styles.serviceSubtitle}
                  >
                    {service.subtitle}
                  </GradientText>
                </View>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 40,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: 'Arboria-Medium',
    color: '#000000',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontFamily: 'Arboria-Book',
    color: '#374151',
  },
  dashboardLabel: {
    fontSize: 14,
    fontFamily: 'Arboria-Book',
    color: '#1f2937',
    marginBottom: 12,
  },
  consultationCard: {
    borderRadius: 24,
    padding: 40,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  consultationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  consultationImage: {
    width: 160,
    height: 160,
  },
  consultationTextContainer: {
    flex: 1,
    marginRight: 8,
    alignItems: 'flex-end',
  },
  consultationTitle: {
    fontSize: 24,
    fontFamily: 'Arboria-Medium',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'right',
  },
  consultationSubtitle: {
    fontSize: 13,
    fontFamily: 'Arboria-Book',
    color: '#ffffff',
    lineHeight: 18,
    textAlign: 'right',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  gradientBorder: {
    width: '48%',
    borderRadius: 20,
    padding: 2,
    marginBottom: 16,
  },
  serviceCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
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
    fontFamily: 'Arboria-Medium',
    textAlign: 'center',
  },
  serviceSubtitle: {
    fontSize: 15,
    fontFamily: 'Arboria-Medium',
    color: '#1f2937',
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 11,
    fontFamily: 'Arboria-Book',
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