import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Server,
  Network,
  BrainCircuit,
  Database,
} from 'lucide-react-native';

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

  const architectureDetails = [
    {
      icon: <Server size={20} color="#7850f0" />,
      title: 'Spring Boot Ingestion',
      accent: '#7850f0',
      bg: '#f5f3ff',
      desc: 'Rapid API layer handling secure statement uploads and regex-based PII sanitization.',
    },
    {
      icon: <Network size={20} color="#0ea5e9" />,
      title: 'RabbitMQ Event Broker',
      accent: '#0ea5e9',
      bg: '#f0f9ff',
      desc: 'Asynchronous message queuing ensures zero data loss and prevents bottlenecks.',
    },
    {
      icon: <BrainCircuit size={20} color="#f97316" />,
      title: 'FastAPI ML Execution',
      accent: '#f97316',
      bg: '#fff7ed',
      desc: 'Dedicated Python layer running BiLSTM NER and Autoencoder anomaly detection.',
    },
    {
      icon: <Database size={20} color="#059669" />,
      title: 'MongoDB State Manager',
      accent: '#059669',
      bg: '#ecfdf5',
      desc: 'Central NoSQL document store. All microservices query and update this state.',
    },
  ];

  return (
    <View style={styles.container}>
      {/* ── FIXED TOP NAVBAR ── */}
      <SafeAreaView style={styles.navbarContainer}>
        <View style={styles.navbar}>
          <View style={styles.navbarLeft}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../assets/logo_pr2.jpeg')}
                style={styles.logoImg}
              />
            </View>
            <Text style={styles.navbarBrand}>PR²</Text>
          </View>

          <TouchableOpacity style={styles.navActionBtn} onPress={onStart} activeOpacity={0.8}>
            <Text style={styles.navActionBtnText}>Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        {/* ── HERO BANNER ── */}
        <LinearGradient
          colors={['#1e1b4b', '#312e81', '#4f46e5', '#0f172a']}
          locations={[0, 0.3, 0.65, 1]}
          style={styles.heroSection}
        >
          <Animated.View style={[styles.heroContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Heading */}
            <Text style={styles.title}>
              Drag.Drop.{' '}
              <Text style={styles.titleItalic}>Decode.</Text>
            </Text>

            {/* Description */}
            <Text style={styles.description}>
              Securely process CSV and PDF statements, anonymize sensitive information, uncover spending patterns and flag suspicious activity within milliseconds. Transform static bank statements into live financial insights with AI-driven analysis.
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

            {/* Privacy info */}
            <View style={styles.privacyFooter}>
              <ShieldCheck size={14} color="#a7f3d0" />
              <Text style={styles.privacyText}>Privacy-First. No PII leaves the app.</Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* ── PRODUCT MOCKUP PREVIEW ── */}
        <View style={styles.mockupSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionBadge}>LIVE INSIGHTS</Text>
            <Text style={styles.sectionTitle}>Product Mockup</Text>
          </View>

          {/* Transaction Mockup Card */}
          <View style={styles.card}>
            <View style={styles.statementMeta}>
              <View style={styles.metaIcon}>
                <FileText size={18} color="#fff" />
              </View>
              <View style={styles.metaTexts}>
                <Text style={styles.metaTitle}>HDFC Bank Statement</Text>
                <Text style={styles.metaSubtitle}>Apr 2025 · 312 transactions</Text>
              </View>
              <View style={styles.analyzedBadge}>
                <Text style={styles.analyzedBadgeText}>Analysed</Text>
              </View>
            </View>

          {[
            { name: 'Swiggy Order', cat: 'Food & Dining', amt: '−₹ 486', color: '#f97316' },
            { name: 'Amazon Pay', cat: 'Shopping', amt: '−₹ 2,340', color: '#7850f0' },
            { name: 'Salary Credit', cat: 'Income', amt: '+₹ 85,000', color: '#059669', positive: true },
            { name: 'Zepto Instant', cat: 'Groceries', amt: '−₹ 1,120', color: '#0ea5e9' },
          ].map((tx, i) => (
            <View key={i} style={[styles.transactionRow, i === 3 && { borderBottomWidth: 0 }]}>
              <View style={[styles.txIndicator, { backgroundColor: tx.color }]} />
              <View style={styles.txMeta}>
                <Text style={styles.txName}>{tx.name}</Text>
                <Text style={styles.txCategory}>{tx.cat}</Text>
              </View>
              <Text style={[styles.txAmount, tx.positive && { color: '#059669' }]}>
                {tx.amt}
              </Text>
            </View>
          ))}
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Health Score Card */}
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Health Score</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreNumber}>74</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '74%' }]} />
            </View>
            <Text style={styles.scoreDelta}>▲ 6 pts vs last month</Text>
          </View>

            {/* Anomaly Alert */}
            <View style={[styles.metricItem, styles.anomalyCard]}>
              <View style={styles.anomalyHeader}>
                <AlertTriangle size={14} color="#f97316" />
                <Text style={styles.anomalyLabel}>Anomaly Flagged</Text>
              </View>
              <Text style={styles.anomalyTitle}>3× UPI Spike</Text>
              <Text style={styles.anomalyDesc}>Autoencoder flagged April 18–22</Text>
            </View>
          </View>

          {/* Spend Breakdown Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Spend Breakdown</Text>
            <View style={styles.breakdownList}>
              {[
                { label: 'Food & Dining', pct: 38, color: '#f97316' },
                { label: 'Shopping', pct: 27, color: '#7850f0' },
                { label: 'Utilities', pct: 20, color: '#0ea5e9' },
                { label: 'Others', pct: 15, color: '#64748b' },
              ].map((s, i) => (
                <View key={i} style={styles.breakdownItem}>
                  <View style={styles.breakdownMeta}>
                    <Text style={styles.breakdownLabel}>{s.label}</Text>
                    <Text style={styles.breakdownPct}>{s.pct}%</Text>
                  </View>
                  <View style={styles.breakdownBarBg}>
                    <View style={[styles.breakdownBarFill, { width: `${s.pct}%`, backgroundColor: s.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── SYSTEM ARCHITECTURE SECTION ── */}
        <View style={styles.architectureSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionBadge}>UNDER THE HOOD</Text>
            <Text style={styles.sectionTitle}>Decoupled Architecture</Text>
            <Text style={styles.sectionDesc}>
              PR² stands for Pice Rupee Radar. It is an AI-powered financial intelligence platform designed to help users analyze, understand and optimize banking expenses. A distributed microservice architecture decouples ingestion from AI computation.
            </Text>
          </View>

          <View style={styles.archGrid}>
            {architectureDetails.map((service, index) => (
              <View key={index} style={styles.archCard}>
                <View style={[styles.archIconContainer, { backgroundColor: service.bg }]}>
                  {service.icon}
                </View>
                <View style={styles.archContent}>
                  <Text style={styles.archTitle}>{service.title}</Text>
                  <Text style={styles.archDesc}>{service.desc}</Text>
                </View>
                <View style={[styles.accentIndicator, { backgroundColor: service.accent }]} />
              </View>
            ))}
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>PR²</Text>
          <Text style={styles.footerDesc}>
            Pice Rupee Radar — AI-driven financial analysis for bank statements.
          </Text>
          <Text style={styles.footerCredits}>Engineered by a specialized team of 4.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  navbarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ebebeb',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  navbar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderColor: '#e8e6ff',
    borderWidth: 1.5,
  },
  logoImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  navbarBrand: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  navActionBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingTop: Platform.OS === 'ios' ? 70 : 80,
    paddingBottom: 80,
  },
  heroSection: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 50,
    letterSpacing: -1,
    marginBottom: 20,
  },
  titleItalic: {
    color: '#fef08a',
    fontStyle: 'italic',
  },
  description: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 36,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
  mockupSection: {
    paddingHorizontal: 20,
    marginTop: 32,
    gap: 16,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7850f0',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  statementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  metaIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaTexts: {
    flex: 1,
  },
  metaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  metaSubtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  analyzedBadge: {
    backgroundColor: '#ecfdf5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  analyzedBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  txIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 10,
  },
  txMeta: {
    flex: 1,
  },
  txName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  txCategory: {
    fontSize: 10,
    color: '#64748b',
  },
  txAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: '950',
    color: '#0f172a',
  },
  scoreMax: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 1,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },
  scoreDelta: {
    fontSize: 9,
    color: '#059669',
    fontWeight: '700',
  },
  anomalyCard: {
    borderLeftWidth: 3.5,
    borderLeftColor: '#f97316',
  },
  anomalyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  anomalyLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#f97316',
    textTransform: 'uppercase',
  },
  anomalyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  anomalyDesc: {
    fontSize: 9,
    color: '#64748b',
  },
  breakdownList: {
    gap: 10,
  },
  breakdownItem: {
    width: '100%',
  },
  breakdownMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  breakdownPct: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: '700',
  },
  breakdownBarBg: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  architectureSection: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  archGrid: {
    gap: 14,
    marginTop: 20,
  },
  archCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  archIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  archContent: {
    flex: 1,
  },
  archTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  archDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
  accentIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
  },
  footerSection: {
    marginTop: 48,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  footerDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
    marginBottom: 12,
  },
  footerCredits: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
