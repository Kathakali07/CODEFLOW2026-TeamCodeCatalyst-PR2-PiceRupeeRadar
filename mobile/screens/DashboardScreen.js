import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  Database,
  BrainCircuit,
  PieChart,
  BarChart2,
  RotateCcw,
  Activity,
  Repeat,
  Calendar,
  AlertCircle,
  MoreVertical,
} from 'lucide-react-native';
import SubscriptionsTab from './components/SubscriptionsTab';
import FinHealthTab from './components/FinHealthTab';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'http://10.0.2.2:8081';

const MOCK_FILES = [
  { name: 'september_statement_2024.csv', size: '2.8 MB', type: 'CSV' },
  { name: 'sbi_transactions_q3.pdf', size: '4.5 MB', type: 'PDF' },
];

export default function DashboardScreen({ tokenData }) {
  const [activeView, setActiveView] = useState('Overview'); // Overview, Subscriptions, FinHealth
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pollMessage, setPollMessage] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [chartView, setChartView] = useState('pie'); // pie, bar
  const [activeMonth, setActiveMonth] = useState('Current');
  const [activeTab, setActiveTab] = useState('All'); // All, Credit, Debit, Savings
  const [debitCategory, setDebitCategory] = useState('All');

  // Mappers
  const mapTransactions = (backendTxns = []) => {
    return backendTxns.map(tx => ({
      ref: tx.txnId || Math.random().toString(36).substring(7),
      date: tx.date || 'Unknown Date',
      customer: tx.rawNarration || 'Unknown',
      amount: tx.amount || 0,
      status: 'Completed',
      type: tx.type || 'Other',
      isCredit: ['Income', 'Savings', 'Refund', 'Credit'].includes(tx.type)
    }));
  };

  const COLORS = ['#4f46e5', '#0ea5e9', '#f59e0b', '#10b981', '#f97316', '#8b5cf6'];
  const mapChartData = (breakdown = {}, totalExp = 1) => {
    let index = 0;
    return Object.entries(breakdown).map(([label, amt]) => ({
      label,
      pct: Math.round((amt / (totalExp || 1)) * 100),
      color: COLORS[index++ % COLORS.length]
    })).sort((a, b) => b.pct - a.pct);
  };

  const mapSubscriptions = (recurring = []) => {
    return recurring.map((tx, i) => ({
      id: i.toString(),
      name: tx.rawNarration,
      category: tx.type,
      amount: tx.amount,
      nextDue: 'Next Month',
      status: 'Active',
      icon: '🔄'
    }));
  };

  const [transactionHistory, setTransactionHistory] = useState([]);
  const [pastStatements, setPastStatements] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalIncome: 0, totalExpense: 0, financialHealth: 'CALCULATING', categoryBreakdown: {}
  });
  const [subscriptionsList, setSubscriptionsList] = useState([]);
  const [aiSummaryText, setAiSummaryText] = useState('');

  // Hydrate on startup
  useEffect(() => {
    const fetchMyStatements = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/statements/my-statements`, {
          headers: { 'Authorization': `Bearer ${tokenData?.token}` }
        });
        if (res.ok) {
          const docs = await res.json();
          if (docs.length > 0) {
            const latestDoc = docs[docs.length - 1];
            if (latestDoc.status === 'COMPLETED') {
               await loadCompletedDocument(latestDoc.id);
            } else if (latestDoc.status === 'EXTRACTING_PDF' || latestDoc.status === 'PROCESSING') {
               setActiveDocId(latestDoc.id);
               setIsAnalyzing(true);
            }
            setPastStatements(docs.map(d => ({
               id: d.id, month: d.id.substring(0,8), txCount: d.transactions?.length || 0, status: d.status
            })));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (tokenData?.token) fetchMyStatements();
  }, [tokenData]);

  const loadCompletedDocument = async (docId) => {
    try {
      const docRes = await fetch(`${API_BASE_URL}/api/statements/${docId}`, {
        headers: { 'Authorization': `Bearer ${tokenData?.token}` }
      });
      const docData = await docRes.json();
      
      const statRes = await fetch(`${API_BASE_URL}/api/statements/status/${docId}`, {
        headers: { 'Authorization': `Bearer ${tokenData?.token}` }
      });
      const statData = await statRes.json();

      setTransactionHistory(mapTransactions(docData.transactions || []));
      setSubscriptionsList(mapSubscriptions(docData.recurringTransactions || []));
      
      if (statData.summaryMetrics) setSummaryMetrics(statData.summaryMetrics);
      if (statData.aiSummary) setAiSummaryText(statData.aiSummary);

      setActiveMonth(docId.substring(0,8));
      setShowResults(true);
      setIsAnalyzing(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Real Polling Logic
  useEffect(() => {
    let pollInterval;
    if (isAnalyzing && activeDocId) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/statements/status/${activeDocId}`, {
             headers: { 'Authorization': `Bearer ${tokenData?.token}` }
          });
          const data = await res.json();
          if (data.status === 'EXTRACTING_PDF') {
             setPollMessage('Extracting PDF & Anonymizing PII...');
          } else if (data.status === 'PROCESSING') {
             setPollMessage('AI Categorization & Anomaly Detection running...');
          } else if (data.status === 'COMPLETED') {
             clearInterval(pollInterval);
             await loadCompletedDocument(activeDocId);
          } else if (data.status === 'FAILED') {
             clearInterval(pollInterval);
             setIsAnalyzing(false);
             Alert.alert('Error', 'Processing failed!');
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000); 
    }
    return () => clearInterval(pollInterval);
  }, [isAnalyzing, activeDocId]); 

  // Dynamic calculations
  const startingBalance = 0;
  const totalCredit = summaryMetrics.totalIncome || transactionHistory
    .filter((tx) => tx.isCredit)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = summaryMetrics.totalExpense || transactionHistory
    .filter((tx) => !tx.isCredit)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const currentBalance = startingBalance + totalCredit - totalExpense;

  const formatCurrency = (num) => '₹' + num.toLocaleString('en-IN');

  const chartData = mapChartData(summaryMetrics.categoryBreakdown, totalExpense);

  const handleSelectFile = (file) => {
    setSelectedFile(file);
  };

  const handleProcessFile = () => {
    // Native document upload not fully supported here without expo-document-picker
    // Leaving mock behavior or simply alert user for mobile version
    Alert.alert("Upload not supported in mock client. Please use Web client to upload statements.");
    setSelectedFile(null);
  };

  const loadPastStatement = (id) => {
    loadCompletedDocument(id);
  };

  const resetUploader = () => {
    setShowResults(false);
    setSelectedFile(null);
    setTransactionHistory([]);
    setActiveMonth('Current');
    setActiveTab('All');
  };

  // Filter transactions
  const filteredTransactions = transactionHistory.filter((tx) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Savings') return tx.type.toLowerCase() === 'savings';
    if (activeTab === 'Credit') return tx.isCredit === true;
    if (activeTab === 'Debit') {
      if (tx.isCredit) return false;
      if (debitCategory !== 'All' && tx.type !== debitCategory) return false;
      return true;
    }
    return true;
  });

  // Extract unique categories for debits
  const uniqueDebitCategories = [
    'All',
    ...new Set(transactionHistory.filter((tx) => !tx.isCredit).map((tx) => tx.type)),
  ];

  const simulateExport = () => {
    Alert.alert(
      'Export Successful',
      `Simulated CSV export for ${activeMonth} (${activeTab} view) generated and saved.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      
      {/* ── TOP SEGMENT TABS ── */}
      <View style={styles.segmentBar}>
        {['Overview', 'Subscriptions', 'FinHealth'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.segmentButton, activeView === tab && styles.segmentButtonActive]}
            onPress={() => setActiveView(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentText, activeView === tab && styles.segmentTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Render sub views */}
      {activeView === 'Overview' && (
        <View style={styles.overviewContainer}>
          {/* UPLOADER BLOCK */}
          {!showResults && !isAnalyzing && !isUploading && (
            <View style={styles.uploaderCard}>
              <Text style={styles.cardHeaderTitle}>Process New Data</Text>
              <Text style={styles.cardHeaderSubtitle}>
                Select a statement template to simulate analysis.
              </Text>

              {!selectedFile ? (
                <View style={styles.uploaderList}>
                  {MOCK_FILES.map((file, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.fileSelectorItem}
                      onPress={() => handleSelectFile(file)}
                      activeOpacity={0.7}
                    >
                      <UploadCloud size={20} color="#4f46e5" />
                      <View style={styles.fileItemText}>
                        <Text style={styles.fileItemName}>{file.name}</Text>
                        <Text style={styles.fileItemSize}>{file.type} · {file.size}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.selectedFileView}>
                  <View style={styles.fileRow}>
                    <CheckCircle size={20} color="#059669" />
                    <View style={styles.fileTextWrapper}>
                      <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                      <Text style={styles.selectedFileSize}>{selectedFile.size}</Text>
                    </View>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedFile(null)}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.analyzeBtn} onPress={handleProcessFile}>
                      <Database size={14} color="#fff" />
                      <Text style={styles.analyzeBtnText}>Analyze</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* SPINNER ANIMATION STATE */}
          {isUploading && (
            <View style={styles.simulationCard}>
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text style={styles.simulationTitle}>Uploading statement...</Text>
              <Text style={styles.simulationSub}>Securing data stream</Text>
            </View>
          )}

          {isAnalyzing && (
            <View style={styles.simulationCard}>
              <View style={styles.brainIconRow}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <View style={styles.brainWrapper}>
                  <BrainCircuit size={18} color="#4f46e5" />
                </View>
              </View>
              <Text style={styles.simulationTitle}>AI Analysis in Progress</Text>
              <Text style={styles.simulationSub}>{pollMessage}</Text>
            </View>
          )}

          {/* BREAKDOWN CHART PREVIEW */}
          {showResults && (
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownHeader}>
                <View style={styles.titleRow}>
                  {chartView === 'pie' ? (
                    <PieChart size={18} color="#4f46e5" />
                  ) : (
                    <BarChart2 size={18} color="#4f46e5" />
                  )}
                  <Text style={styles.chartTitleText}>Expense Breakdown</Text>
                </View>

                <View style={styles.chartControls}>
                  <TouchableOpacity
                    style={styles.toggleBtn}
                    onPress={() => setChartView(chartView === 'pie' ? 'bar' : 'pie')}
                  >
                    <Text style={styles.toggleBtnText}>
                      {chartView === 'pie' ? 'Bar View' : 'Pie View'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.refreshBtn} onPress={resetUploader}>
                    <RotateCcw size={13} color="#4f46e5" />
                  </TouchableOpacity>
                </View>
              </View>

              {chartView === 'pie' ? (
                <View style={styles.donutRow}>
                  <View style={styles.donutOuter}>
                    <View style={styles.donutInner}>
                      <Text style={styles.donutLabel}>Total</Text>
                      <Text style={styles.donutVal}>₹5.7L</Text>
                    </View>
                  </View>
                  <View style={styles.donutLegend}>
                    {chartData.map((cat, i) => (
                      <View key={i} style={styles.legendItem}>
                        <View style={styles.legendRow}>
                          <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                          <Text style={styles.legendText}>{cat.label}</Text>
                        </View>
                        <View style={styles.barWrap}>
                          <View style={[styles.barFill, { width: `${cat.pct}%`, backgroundColor: cat.color }]} />
                          <Text style={styles.barPct}>{cat.pct}%</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.barGraphRow}>
                  {chartData.map((cat, i) => (
                    <View key={i} style={styles.graphCol}>
                      <Text style={styles.graphPctLabel}>{cat.pct}%</Text>
                      <View style={styles.graphBarContainer}>
                        <View style={[styles.graphBarFill, { height: `${cat.pct}%`, backgroundColor: cat.color }]} />
                      </View>
                      <Text style={styles.graphNameLabel} numberOfLines={1}>{cat.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* PROCESSED STATEMENTS LIST */}
          <View style={styles.statementsHistoryCard}>
            <Text style={styles.statementsHeaderTitle}>Processed Statements</Text>
            <View style={styles.statementsList}>
              {pastStatements.map((stmt, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.statementItemBtn,
                    activeMonth === stmt.month && styles.statementItemBtnActive,
                  ]}
                  onPress={() => loadPastStatement(stmt.month)}
                  activeOpacity={0.7}
                >
                  <View style={styles.statementTextCol}>
                    <Text
                      style={[
                        styles.statementMonthText,
                        activeMonth === stmt.month && styles.statementMonthTextActive,
                      ]}
                    >
                      {stmt.month}
                    </Text>
                    <Text style={styles.statementTxnText}>{stmt.txCount} txns</Text>
                  </View>
                  <View style={styles.statementBadge}>
                    <Text style={styles.statementBadgeText}>{stmt.status}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* BALANCES SUMMARY CARD */}
          <View style={styles.balancesContainer}>
            <View style={styles.balanceItemCard}>
              <Text style={styles.balanceCardLabel}>Balances</Text>
              <Text style={styles.balanceCardVal}>{formatCurrency(currentBalance)}</Text>
            </View>
            <View style={styles.balanceRowTwo}>
              <View style={[styles.balanceItemCard, styles.flexCard]}>
                <View style={styles.balanceHeaderIconRow}>
                  <ArrowUpRight size={14} color="#059669" />
                  <Text style={styles.balanceCardLabel}>Credit</Text>
                </View>
                <Text style={[styles.balanceCardVal, styles.smallerVal]}>{formatCurrency(totalCredit)}</Text>
              </View>
              <View style={[styles.balanceItemCard, styles.flexCard]}>
                <View style={styles.balanceHeaderIconRow}>
                  <ArrowDownRight size={14} color="#ef4444" />
                  <Text style={styles.balanceCardLabel}>Expenses</Text>
                </View>
                <Text style={[styles.balanceCardVal, styles.smallerVal]}>{formatCurrency(totalExpense)}</Text>
              </View>
            </View>
          </View>

          {/* TRANSACTIONS TABLE CARD */}
          <View style={styles.transactionsCard}>
            <View style={styles.transactionsHeaderRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
                {['All', 'Credit', 'Debit', 'Savings'].map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.pillBtn,
                      activeTab === tab && styles.pillBtnActive,
                    ]}
                    onPress={() => {
                      setActiveTab(tab);
                      if (tab !== 'Debit') setDebitCategory('All');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        activeTab === tab && styles.pillTextActive,
                      ]}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.exportBtn} onPress={simulateExport} activeOpacity={0.7}>
                <Text style={styles.exportBtnText}>Export CSV</Text>
              </TouchableOpacity>
            </View>

            {/* DEBIT CATEGORIES FILTER ROW */}
            {activeTab === 'Debit' && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesFilterScroll}>
                {uniqueDebitCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catFilterBtn,
                      debitCategory === cat && styles.catFilterBtnActive,
                    ]}
                    onPress={() => setDebitCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.catFilterText,
                        debitCategory === cat && styles.catFilterTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Log Transactions */}
            <View style={styles.transactionsList}>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <View key={tx.ref} style={styles.txRow}>
                    <View
                      style={[
                        styles.txAvatar,
                        { backgroundColor: tx.isCredit ? '#eef2ff' : '#fff7ed' },
                      ]}
                    >
                      <Text style={[styles.txAvatarText, { color: tx.isCredit ? '#4f46e5' : '#d97706' }]}>
                        {tx.customer.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.txMetaCol}>
                      <Text style={styles.txNameText}>{tx.customer}</Text>
                      <Text style={styles.txDateText}>{tx.date}</Text>
                    </View>
                    <View style={styles.txAmountCol}>
                      <Text
                        style={[
                          styles.txAmountText,
                          tx.isCredit ? styles.txCreditText : styles.txDebitText,
                        ]}
                      >
                        {tx.isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                      </Text>
                      <Text style={styles.txTypeText}>{tx.type}</Text>
                    </View>
                    <MoreVertical size={14} color="#cbd5e1" style={styles.actionsIcon} />
                  </View>
                ))
              ) : (
                <View style={styles.noTxnWrapper}>
                  <Text style={styles.noTxnText}>No transactions found.</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {activeView === 'Subscriptions' && (
        <View style={styles.subTabWrapper}>
          <SubscriptionsTab 
            formatCurrency={formatCurrency} 
            subscriptionsList={subscriptionsList}
            totalRecurringExpense={summaryMetrics.totalRecurringExpense || 0}
          />
        </View>
      )}

      {activeView === 'FinHealth' && (
        <View style={styles.subTabWrapper}>
          <FinHealthTab 
            summaryMetrics={summaryMetrics} 
            aiSummaryText={aiSummaryText} 
          />
        </View>
      )}

      {/* ── INVESTMENT RECOMMENDATIONS SECTION ── */}
      <View style={styles.investmentsSection}>
        <Text style={styles.investmentsMainTitle}>Your savings are sleeping. Let's wake them up.</Text>
        <Text style={styles.investmentsMainDesc}>
          Don't let inflation eat your hard-earned money. Based on your recent spending profile, our AI has curated the smartest places to park cash.
        </Text>

        <View style={styles.recommendationList}>
          {/* Card 1 */}
          <View style={styles.investmentCard}>
            <View style={styles.investmentCardHeader}>
              <View style={[styles.riskBadge, styles.lowRiskBg]}>
                <Text style={[styles.riskText, styles.lowRiskColor]}>Low Risk</Text>
              </View>
              <Text style={styles.bankNameText}>ICICI Prudential</Text>
            </View>
            <Text style={styles.investNameTitle}>ICICI Prudential Liquid Fund</Text>
            <Text style={styles.investDescText}>
              Earn ~7.1% p.a. with instant withdrawal capabilities. A much better alternative to leaving cash idle.
            </Text>
            <TouchableOpacity style={styles.investActionBtn} activeOpacity={0.7}>
              <Text style={styles.investActionBtnText}>Explore Fund</Text>
            </TouchableOpacity>
          </View>

          {/* Card 2 */}
          <View style={[styles.investmentCard, styles.topPickCard]}>
            <View style={styles.topPickBadge}>
              <Text style={styles.topPickBadgeText}>TOP PICK</Text>
            </View>
            <View style={styles.investmentCardHeader}>
              <View style={[styles.riskBadge, styles.medRiskBg]}>
                <Text style={[styles.riskText, styles.medRiskColor]}>Medium Risk</Text>
              </View>
              <Text style={styles.bankNameText}>HDFC Bank</Text>
            </View>
            <Text style={styles.investNameTitle}>HDFC Index Fund (Nifty 50)</Text>
            <Text style={styles.investDescText}>
              Tracks top 50 Indian companies. Historical 12-14% returns. Perfect for starting a disciplined SIP.
            </Text>
            <TouchableOpacity style={[styles.investActionBtn, styles.topPickActionBtn]} activeOpacity={0.7}>
              <Text style={[styles.investActionBtnText, styles.topPickActionBtnText]}>Start SIP</Text>
            </TouchableOpacity>
          </View>

          {/* Card 3 */}
          <View style={styles.investmentCard}>
            <View style={styles.investmentCardHeader}>
              <View style={[styles.riskBadge, styles.zeroRiskBg]}>
                <Text style={[styles.riskText, styles.zeroRiskColor]}>Zero Risk</Text>
              </View>
              <Text style={styles.bankNameText}>India Post</Text>
            </View>
            <Text style={styles.investNameTitle}>Post Office Time Deposit</Text>
            <Text style={styles.investDescText}>
              Lock in sovereign-backed, guaranteed returns up to 7.5% p.a. Complete peace of mind.
            </Text>
            <TouchableOpacity style={styles.investActionBtn} activeOpacity={0.7}>
              <Text style={styles.investActionBtnText}>View Rates</Text>
            </TouchableOpacity>
          </View>
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
    padding: 16,
    paddingTop: 48,
    paddingBottom: 90,
  },
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  segmentTextActive: {
    color: '#4f46e5',
    fontWeight: '800',
  },
  overviewContainer: {
    gap: 16,
  },
  subTabWrapper: {
    width: '100%',
  },
  uploaderCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardHeaderSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 16,
  },
  uploaderList: {
    gap: 10,
  },
  fileSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  fileItemText: {
    marginLeft: 10,
  },
  fileItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  fileItemSize: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  selectedFileView: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fileTextWrapper: {
    flex: 1,
  },
  selectedFileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  selectedFileSize: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  analyzeBtn: {
    flex: 2,
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  analyzeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  simulationCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  brainIconRow: {
    position: 'relative',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brainWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 16,
  },
  simulationSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  breakdownCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  chartControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleBtn: {
    backgroundColor: '#eef2ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4f46e5',
  },
  refreshBtn: {
    backgroundColor: '#f1f5f9',
    padding: 5,
    borderRadius: 6,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  donutOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#4f46e5',
    // Conic gradient representation on mobile
    borderWidth: 12,
    borderColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '600',
  },
  donutVal: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '800',
    marginTop: 2,
  },
  donutLegend: {
    flex: 1,
    gap: 8,
  },
  legendItem: {
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  barWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  barFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#eef2ff',
    flex: 1,
  },
  barPct: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
  },
  barGraphRow: {
    flexDirection: 'row',
    height: 140,
    alignItems: 'flex-end',
    gap: 12,
    paddingTop: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
  },
  graphCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
  },
  graphPctLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  graphBarContainer: {
    flex: 1,
    width: '50%',
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  graphBarFill: {
    width: '100%',
    borderRadius: 4,
  },
  graphNameLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0f172a',
  },
  statementsHistoryCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  statementsHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  statementsList: {
    gap: 8,
  },
  statementItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderColor: '#f1f5f9',
    borderWidth: 1,
    borderRadius: 10,
  },
  statementItemBtnActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#4f46e5',
  },
  statementTextCol: {
    flex: 1,
  },
  statementMonthText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  statementMonthTextActive: {
    color: '#4f46e5',
  },
  statementTxnText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  statementBadge: {
    backgroundColor: '#d1fae5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statementBadgeText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: '700',
  },
  balancesContainer: {
    gap: 12,
  },
  balanceItemCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  balanceRowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  flexCard: {
    flex: 1,
  },
  balanceHeaderIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  balanceCardLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  balanceCardVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 4,
  },
  smallerVal: {
    fontSize: 18,
  },
  transactionsCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  transactionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
  },
  pillsScroll: {
    flex: 1,
  },
  pillBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 6,
  },
  pillBtnActive: {
    backgroundColor: '#4f46e5',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  exportBtn: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
  exportBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  categoriesFilterScroll: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  catFilterBtn: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 6,
  },
  catFilterBtnActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#4f46e5',
  },
  catFilterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  catFilterTextActive: {
    color: '#4f46e5',
  },
  transactionsList: {
    padding: 12,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  txAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txAvatarText: {
    fontSize: 12,
    fontWeight: '800',
  },
  txMetaCol: {
    flex: 1,
    marginLeft: 12,
  },
  txNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  txDateText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  txAmountCol: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  txAmountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  txCreditText: {
    color: '#059669',
  },
  txDebitText: {
    color: '#0f172a',
  },
  txTypeText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  actionsIcon: {
    alignSelf: 'center',
  },
  noTxnWrapper: {
    padding: 24,
    alignItems: 'center',
  },
  noTxnText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  investmentsSection: {
    marginTop: 32,
    paddingHorizontal: 4,
  },
  investmentsMainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  investmentsMainDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 24,
  },
  recommendationList: {
    gap: 16,
  },
  investmentCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  topPickCard: {
    borderColor: '#4f46e5',
    borderWidth: 2,
    position: 'relative',
    marginTop: 8,
  },
  topPickBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: '#4f46e5',
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 1,
  },
  topPickBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  investmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  riskBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  lowRiskBg: {
    backgroundColor: '#d1fae5',
  },
  lowRiskColor: {
    color: '#059669',
  },
  medRiskBg: {
    backgroundColor: '#fef3c7',
  },
  medRiskColor: {
    color: '#d97706',
  },
  zeroRiskBg: {
    backgroundColor: '#eef2ff',
  },
  zeroRiskColor: {
    color: '#4f46e5',
  },
  riskText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bankNameText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  investNameTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  investDescText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 16,
  },
  investActionBtn: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topPickActionBtn: {
    backgroundColor: '#4f46e5',
    borderWidth: 0,
  },
  investActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4f46e5',
  },
  topPickActionBtnText: {
    color: '#ffffff',
  },
});
