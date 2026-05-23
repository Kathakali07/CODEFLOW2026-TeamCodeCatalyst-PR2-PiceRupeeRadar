import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Utensils,
  CreditCard,
  PlusCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Mock statements for user choice
const MOCK_FILES = [
  { id: '1', name: 'hdfc_statement_apr25.pdf', size: '3.4 MB', type: 'PDF' },
  { id: '2', name: 'sbi_salary_statement_2025.csv', size: '1.2 MB', type: 'CSV' },
];

export default function DashboardScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [analyzedFile, setAnalyzedFile] = useState(null);

  // Steps in the backend simulation pipeline
  const pipelineSteps = [
    'Uploading Statement...',
    'Masking PII (Regex Sanitizer)...',
    'Routing message to RabbitMQ...',
    'Running FastAPI NER Categorizer...',
    'Executing Autoencoder anomaly checks...',
    'Generating Financial Health Report...',
  ];

  useEffect(() => {
    let interval;
    if (isUploading) {
      interval = setInterval(() => {
        setUploadStep((prev) => {
          if (prev >= pipelineSteps.length - 1) {
            clearInterval(interval);
            setIsUploading(false);
            setAnalyzedFile(MOCK_FILES[0]); // default to first statement after simulation
            return 0;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isUploading]);

  const handleSelectFile = (file) => {
    setUploadStep(0);
    setIsUploading(true);
    setAnalyzedFile(null);
  };

  const handleReset = () => {
    setAnalyzedFile(null);
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rupee Radar Dashboard</Text>
        <Text style={styles.headerSubtitle}>Real-time Statement Analytics Pipeline</Text>
      </View>

      {!analyzedFile && !isUploading && (
        <View style={styles.uploadCard}>
          <View style={styles.uploadIconContainer}>
            <UploadCloud size={38} color="#4f46e5" />
          </View>
          <Text style={styles.uploadTitle}>Ingest Statement</Text>
          <Text style={styles.uploadDesc}>
            Select a mock bank statement to simulate the decoupled microservices parsing pipeline.
          </Text>

          <View style={styles.fileSelectorList}>
            {MOCK_FILES.map((file) => (
              <TouchableOpacity
                key={file.id}
                style={styles.fileItem}
                onPress={() => handleSelectFile(file)}
                activeOpacity={0.7}
              >
                <FileText size={22} color="#4f46e5" />
                <View style={styles.fileItemMeta}>
                  <Text style={styles.fileName}>{file.name}</Text>
                  <Text style={styles.fileSize}>{file.type} · {file.size}</Text>
                </View>
                <PlusCircle size={18} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {isUploading && (
        <View style={styles.pipelineCard}>
          <ActivityIndicator size="large" color="#4f46e5" style={styles.spinner} />
          <Text style={styles.pipelineTitle}>{pipelineSteps[uploadStep]}</Text>
          <Text style={styles.pipelineDesc}>Microservices state synchronized</Text>

          {/* Progress dots */}
          <View style={styles.dotContainer}>
            {pipelineSteps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === uploadStep && styles.dotActive,
                  i < uploadStep && styles.dotCompleted,
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {analyzedFile && (
        <View style={styles.dashboardView}>
          {/* Active Statement Metadata */}
          <View style={styles.statementMetaCard}>
            <View style={styles.metaIcon}>
              <FileText size={18} color="#fff" />
            </View>
            <View style={styles.metaTexts}>
              <Text style={styles.metaTitle}>HDFC Bank Statement</Text>
              <Text style={styles.metaSubtitle}>Apr 2025 · 312 transactions</Text>
            </View>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
              <RefreshCw size={14} color="#64748b" />
              <Text style={styles.resetText}>New</Text>
            </TouchableOpacity>
          </View>

          {/* Score + Anomaly Stack */}
          <View style={styles.doubleCardRow}>
            {/* Health Score Card */}
            <View style={styles.metricCard}>
              <Text style={styles.metricCardLabel}>Health Score</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreNumber}>74</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '74%' }]} />
              </View>
              <Text style={styles.scoreDelta}>▲ 6 pts vs last month</Text>
            </View>

            {/* Anomaly Alert Card */}
            <View style={[styles.metricCard, styles.anomalyCard]}>
              <View style={styles.anomalyHeader}>
                <AlertTriangle size={14} color="#f97316" />
                <Text style={styles.anomalyLabel}>Anomaly Flagged</Text>
              </View>
              <Text style={styles.anomalyTitle}>3× spike in UPI</Text>
              <Text style={styles.anomalyDesc}>Autoencoder flagged April 18–22 spikes</Text>
            </View>
          </View>

          {/* Spend Breakdown */}
          <View style={styles.largeCard}>
            <Text style={styles.sectionTitle}>Spend Breakdown</Text>
            <View style={styles.breakdownList}>
              {[
                { label: 'Food & Dining', pct: 38, amt: '₹ 15,240', color: '#f97316', icon: <Utensils size={12} color="#fff" /> },
                { label: 'Shopping', pct: 27, amt: '₹ 10,800', color: '#7850f0', icon: <ShoppingBag size={12} color="#fff" /> },
                { label: 'Utilities', pct: 20, amt: '₹ 8,000', color: '#0ea5e9', icon: <CreditCard size={12} color="#fff" /> },
                { label: 'Others', pct: 15, amt: '₹ 6,000', color: '#64748b', icon: <Sparkles size={12} color="#fff" /> },
              ].map((item, idx) => (
                <View key={idx} style={styles.breakdownItem}>
                  <View style={styles.breakdownMeta}>
                    <View style={[styles.itemCircle, { backgroundColor: item.color }]}>
                      {item.icon}
                    </View>
                    <Text style={styles.breakdownLabel}>{item.label}</Text>
                    <Text style={styles.breakdownAmt}>{item.amt}</Text>
                  </View>
                  <View style={styles.breakdownBarBg}>
                    <View style={[styles.breakdownBarFill, { width: `${item.pct}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Transactions List */}
          <View style={styles.largeCard}>
            <Text style={styles.sectionTitle}>Transactions Analyzed</Text>
            {[
              { name: 'Swiggy Order', cat: 'Food & Dining', amt: '−₹ 486', positive: false, color: '#f97316' },
              { name: 'Amazon Pay', cat: 'Shopping', amt: '−₹ 2,340', positive: false, color: '#7850f0' },
              { name: 'Salary Credit', cat: 'Income', amt: '+₹ 85,000', positive: true, color: '#059669' },
              { name: 'Zepto Instant', cat: 'Groceries', amt: '−₹ 1,120', positive: false, color: '#0ea5e9' },
            ].map((tx, i) => (
              <View key={i} style={styles.transactionRow}>
                <View style={[styles.txIndicator, { backgroundColor: tx.color }]} />
                <View style={styles.txMeta}>
                  <Text style={styles.txName}>{tx.name}</Text>
                  <Text style={styles.txCategory}>{tx.cat}</Text>
                </View>
                <Text style={[styles.txAmount, tx.positive ? styles.txPositive : styles.txNegative]}>
                  {tx.amt}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
  uploadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  uploadDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  fileSelectorList: {
    width: '100%',
    gap: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  fileItemMeta: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  fileSize: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  pipelineCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  spinner: {
    marginBottom: 20,
  },
  pipelineTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
  },
  pipelineDesc: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 24,
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  dotActive: {
    backgroundColor: '#4f46e5',
    transform: [{ scale: 1.25 }],
  },
  dotCompleted: {
    backgroundColor: '#10b981',
  },
  dashboardView: {
    gap: 16,
  },
  statementMetaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  metaIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'linear-gradient(135deg,#7850f0,#4f3dc8)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
  },
  metaTexts: {
    flex: 1,
  },
  metaTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  metaSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  resetText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },
  doubleCardRow: {
    flexDirection: 'row',
    gap: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  anomalyCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
  },
  metricCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
  },
  scoreMax: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 2,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#4f46e5',
  },
  scoreDelta: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  anomalyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  anomalyLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f97316',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  anomalyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  anomalyDesc: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 14,
  },
  largeCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  breakdownList: {
    gap: 14,
  },
  breakdownItem: {
    width: '100%',
  },
  breakdownMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  breakdownAmt: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
  breakdownBarBg: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  txIndicator: {
    width: 6,
    height: 24,
    borderRadius: 3,
    marginRight: 12,
  },
  txMeta: {
    flex: 1,
  },
  txName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  txCategory: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  txPositive: {
    color: '#059669',
  },
  txNegative: {
    color: '#0f172a',
  },
});
