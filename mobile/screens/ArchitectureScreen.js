import React from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import {
  Server,
  Network,
  BrainCircuit,
  Database,
  FileText,
  ShieldCheck,
  Zap,
  BarChart2,
  ChevronDown,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ArchitectureScreen() {
  const architectureDetails = [
    {
      icon: <Server size={22} color="#7850f0" />,
      title: 'Spring Boot Ingestion',
      accent: '#7850f0',
      bg: '#f5f3ff',
      desc: 'Rapid API layer handling secure statement uploads and regex-based PII sanitization before queuing.',
    },
    {
      icon: <Network size={22} color="#0ea5e9" />,
      title: 'RabbitMQ Event Broker',
      accent: '#0ea5e9',
      bg: '#f0f9ff',
      desc: 'Asynchronous message queuing ensures zero data loss and prevents bottlenecks during heavy ML workloads.',
    },
    {
      icon: <BrainCircuit size={22} color="#f97316" />,
      title: 'FastAPI ML Execution',
      accent: '#f97316',
      bg: '#fff7ed',
      desc: 'Dedicated Python layer running BiLSTM NER transaction categorization and Autoencoder anomaly detection.',
    },
    {
      icon: <Database size={22} color="#059669" />,
      title: 'MongoDB State Manager',
      accent: '#059669',
      bg: '#ecfdf5',
      desc: 'Central NoSQL document store. All microservices query and update this single source of truth.',
    },
  ];

  const flowchartSteps = [
    { label: 'CSV / PDF Upload', desc: 'Secure local statement read', icon: <FileText size={16} color="#7850f0" />, bg: '#f5f3ff', accent: '#7850f0' },
    { label: 'PII Masking', desc: 'Regex filter wipes sensitive data', icon: <ShieldCheck size={16} color="#0ea5e9" />, bg: '#f0f9ff', accent: '#0ea5e9' },
    { label: 'RabbitMQ Queue', desc: 'Saves statement in queue', icon: <Zap size={16} color="#f97316" />, bg: '#fff7ed', accent: '#f97316' },
    { label: 'NER + Autoencoder', desc: 'BiLSTM categorizes transactions', icon: <BrainCircuit size={16} color="#d946ef" />, bg: '#fdf2ff', accent: '#d946ef' },
    { label: 'Health Report', desc: 'Results saved to MongoDB', icon: <BarChart2 size={16} color="#059669" />, bg: '#ecfdf5', accent: '#059669' },
  ];

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Architecture</Text>
        <Text style={styles.headerSubtitle}>Decoupled, Event-Driven Microservices</Text>
      </View>

      {/* Cards List */}
      <View style={styles.grid}>
        {architectureDetails.map((service, index) => (
          <View key={index} style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: service.bg }]}>
              {service.icon}
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{service.title}</Text>
              <Text style={styles.cardDesc}>{service.desc}</Text>
            </View>
            <View style={[styles.accentIndicator, { backgroundColor: service.accent }]} />
          </View>
        ))}
      </View>

      {/* Flowchart Diagram */}
      <View style={styles.flowchartSection}>
        <Text style={styles.flowchartTitle}>Ingestion Pipeline Flow</Text>
        <Text style={styles.flowchartSubtitle}>From Statement Upload to ML Insights</Text>

        <View style={styles.flowContainer}>
          {flowchartSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <View style={styles.flowStepRow}>
                {/* Left side: Icon inside node */}
                <View style={[styles.stepIconContainer, { backgroundColor: step.bg, borderColor: step.accent }]}>
                  {step.icon}
                </View>
                {/* Right side: Texts */}
                <View style={styles.stepTexts}>
                  <Text style={styles.stepName}>{step.label}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>

              {idx < flowchartSteps.length - 1 && (
                <View style={styles.connectorContainer}>
                  <View style={styles.connectorLine} />
                  <ChevronDown size={14} color="#cbd5e1" style={styles.connectorArrow} />
                </View>
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginTop: 24,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  grid: {
    gap: 16,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  accentIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  flowchartSection: {
    backgroundColor: '#0c0a1a',
    borderRadius: 24,
    padding: 24,
  },
  flowchartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  flowchartSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  flowContainer: {
    alignItems: 'center',
    width: '100%',
  },
  flowStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 16,
  },
  stepIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTexts: {
    flex: 1,
  },
  stepName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  stepDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  connectorContainer: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  connectorLine: {
    position: 'absolute',
    width: 1.5,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  connectorArrow: {
    zIndex: 1,
    backgroundColor: '#0c0a1a',
    paddingVertical: 2,
  },
});
