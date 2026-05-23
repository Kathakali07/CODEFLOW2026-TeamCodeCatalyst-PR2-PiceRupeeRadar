import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, ChevronRight, ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ onStart }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <LinearGradient
      colors={['#1e1b4b', '#312e81', '#4f46e5', '#0f172a']}
      locations={[0, 0.3, 0.65, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Heading */}
          <Text style={styles.title}>
            Drag.Drop.{' '}
            <Text style={styles.titleItalic}>Decode.</Text>
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            Securely process CSV and PDF statements, anonymize PII data, uncover spending patterns and flag suspicious activity in milliseconds. Transform static bank statements into live financial insights.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={onStart}
            >
              <Text style={styles.primaryButtonText}>Open Dashboard</Text>
              <ArrowRight size={18} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>API Docs</Text>
              <ChevronRight size={16} color="#111111" />
            </TouchableOpacity>
          </View>

          {/* Privacy footer */}
          <View style={styles.privacyFooter}>
            <ShieldCheck size={14} color="#a7f3d0" />
            <Text style={styles.privacyText}>Privacy-First. No PII leaves the app.</Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 52,
    letterSpacing: -1.2,
    marginBottom: 20,
  },
  titleItalic: {
    color: '#fef08a',
    fontStyle: 'italic',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 36,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 36,
  },
  primaryButton: {
    backgroundColor: '#7850f0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#7850f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 6,
  },
  secondaryButtonText: {
    color: '#111111',
    fontWeight: '700',
    fontSize: 15,
  },
  privacyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  privacyText: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '600',
  },
});
