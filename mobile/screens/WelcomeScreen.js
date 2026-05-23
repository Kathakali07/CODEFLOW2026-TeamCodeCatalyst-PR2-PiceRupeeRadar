import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ onStart }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Pulse animation for the "Live" badge circle
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.6,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Content fade/slide in
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
  }, [pulseAnim, fadeAnim, slideAnim]);

  return (
    <LinearGradient
      colors={['#1e1b4b', '#312e81', '#4f46e5', '#0f172a']}
      locations={[0, 0.3, 0.65, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Pill Badge */}
          <View style={styles.badgeContainer}>
            <View style={styles.pulseContainer}>
              <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.innerCircle} />
            </View>
            <Text style={styles.badgeText}>PR² Engine v1.0 · Live</Text>
          </View>

          {/* Heading */}
          <Text style={styles.title}>
            Indian bank statements,{' '}
            <Text style={styles.titleHighlight}>decoded </Text>
            <Text style={styles.titleItalic}>instantly.</Text>
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            Ingest raw CSV or PDF bank statements. Mask PII natively. Extract financial health metrics and flag anomalies in milliseconds.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={onStart}
            >
              <Text style={styles.primaryButtonText}>Open Dashboard</Text>
              <ArrowRight size={18} color="#7850f0" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
            >
              <BookOpen size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.secondaryButtonText}>API Docs</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy footer info */}
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
  },
  content: {
    paddingHorizontal: 28,
    alignItems: 'center',
    width: '100%',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  pulseContainer: {
    width: 8,
    height: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399',
    opacity: 0.6,
  },
  innerCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  badgeText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: -0.8,
    marginBottom: 20,
  },
  titleHighlight: {
    color: '#e2e8f0',
    opacity: 0.9,
  },
  titleItalic: {
    color: '#fef08a',
    fontStyle: 'italic',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 12,
  },
  buttonContainer: {
    width: '100%',
    gap: 14,
    marginBottom: 48,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#4f46e5',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
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
