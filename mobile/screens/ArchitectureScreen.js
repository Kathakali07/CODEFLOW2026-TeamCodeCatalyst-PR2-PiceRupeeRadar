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

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.underHood}>UNDER THE HOOD</Text>
        <Text style={styles.headerTitle}>Decoupled Microservice Architecture</Text>
        <Text style={styles.headerDesc}>
          PR² stands for Pice Rupee Radar. It is an AI-powered financial intelligence platform designed to help users analyze, understand and optimize their banking expenses effortlessly. A distributed microservice architecture that decouples data ingestion from AI computation, enabling low-latency financial analysis without bottlenecks.
        </Text>
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
    marginBottom: 24,
  },
  underHood: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7850f0',
    letterSpacing: 1,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  headerDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 12,
    lineHeight: 18,
    fontWeight: '400',
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
});
