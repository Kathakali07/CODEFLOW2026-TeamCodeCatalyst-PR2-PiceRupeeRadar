import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Circle, Text as SvgText } from 'react-native-svg';
import { Activity, CheckCircle, AlertCircle } from 'lucide-react-native';

export default function FinHealthTab() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Activity size={22} color="#059669" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>AI Financial Health Score</Text>
            <Text style={styles.subtitle}>Based on liquidity, debt-ratio, and savings</Text>
          </View>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreNumber}>82</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
        </View>

        {/* SVG Trend Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Health Trend (Last 6 Months)</Text>
          <View style={styles.svgWrapper}>
            <Svg viewBox="0 0 600 200" width="100%" height="150">
              {/* Grid Lines */}
              <Line x1="0" y1="50" x2="600" y2="50" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="0" y1="100" x2="600" y2="100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="0" y1="150" x2="600" y2="150" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Trend Path */}
              <Path d="M 20,120 L 130,110 L 240,135 L 350,90 L 460,70 L 570,50" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Data Points */}
              <Circle cx="20" cy="120" r="6" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <Circle cx="130" cy="110" r="6" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <Circle cx="240" cy="135" r="6" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <Circle cx="350" cy="90" r="6" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <Circle cx="460" cy="70" r="6" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <Circle cx="570" cy="50" r="8" fill="#4f46e5" />
              
              {/* Month Labels */}
              <SvgText x="20" y="180" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">Mar</SvgText>
              <SvgText x="130" y="180" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">Apr</SvgText>
              <SvgText x="240" y="180" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">May</SvgText>
              <SvgText x="350" y="180" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">Jun</SvgText>
              <SvgText x="460" y="180" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">Jul</SvgText>
              <SvgText x="570" y="180" fill="#4f46e5" fontSize="13" fontWeight="800" textAnchor="middle">Aug</SvgText>
            </Svg>
          </View>
        </View>

        {/* Insights Cards */}
        <View style={styles.insights}>
          <View style={[styles.insightCard, styles.successCard]}>
            <View style={styles.insightHeader}>
              <CheckCircle size={16} color="#059669" />
              <Text style={styles.insightTitle}>Strong Liquidity</Text>
            </View>
            <Text style={styles.insightDesc}>Your end-of-month balance has grown by 14% over the last quarter. Excellent cash retention.</Text>
          </View>

          <View style={[styles.insightCard, styles.warningCard]}>
            <View style={styles.insightHeader}>
              <AlertCircle size={16} color="#f59e0b" />
              <Text style={[styles.insightTitle, { color: '#b45309' }]}>High Fixed Costs</Text>
            </View>
            <Text style={styles.insightDesc}>Recurring software and rent subscriptions consume 42% of your monthly inflows.</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  iconWrapper: {
    backgroundColor: '#d1fae5',
    padding: 10,
    borderRadius: 10,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#059669',
  },
  scoreMax: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '700',
    marginLeft: 1,
  },
  chartContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 10,
  },
  svgWrapper: {
    width: '100%',
    height: 150,
  },
  insights: {
    gap: 12,
  },
  insightCard: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  successCard: {
    borderLeftColor: '#059669',
  },
  warningCard: {
    borderLeftColor: '#f59e0b',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  insightDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
});
