import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, FileText, CheckCircle, ArrowDownRight, ArrowUpRight, 
  Loader2, Database, BrainCircuit, PieChart, BarChart2, RotateCcw, 
  Activity, Repeat, Calendar, AlertCircle
} from 'lucide-react';

// Import your new components (make sure paths match your folder structure)
import TransactionTable from './TransactionTable';
import InvestmentRecommendations from './InvestmentRecommendations';

export default function Dashboard({ onLogout }) {
  // --- UI & UPLOAD STATES ---
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pollMessage, setPollMessage] = useState('');
  
  // Results & Viewing States
  const [showResults, setShowResults] = useState(false); 
  const [chartView, setChartView] = useState('pie'); 
  const [activeMonth, setActiveMonth] = useState('Current'); 
  const [activeTab, setActiveTab] = useState('All'); 
  const [debitCategory, setDebitCategory] = useState('All'); 
  const [activeView, setActiveView] = useState('Overview'); 
  
  const fileInputRef = useRef(null);
  const currentMonthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  // --- MOCK DATABASE ---
  const mockDB = {
    'August 2024': [
      { ref: 'AUG-001', date: 'Aug 28, 2024, 02:15pm', customer: 'Microsoft Azure', amount: 110000, status: 'Completed', type: 'Software', isCredit: false },
      { ref: 'AUG-002', date: 'Aug 21, 2024, 11:00am', customer: 'Stripe Payouts', amount: 520000, status: 'Completed', type: 'Income', isCredit: true },
      { ref: 'AUG-003', date: 'Aug 14, 2024, 09:30am', customer: 'WeWork India', amount: 185000, status: 'Completed', type: 'Rent', isCredit: false },
    ],
    'July 2024': [
      { ref: 'JUL-001', date: 'Jul 29, 2024, 04:12pm', customer: 'Razorpay Nodal', amount: 480000, status: 'Completed', type: 'Income', isCredit: true },
      { ref: 'JUL-002', date: 'Jul 15, 2024, 10:00am', customer: 'Facebook Ads', amount: 75000, status: 'Completed', type: 'Advertising', isCredit: false },
      { ref: 'JUL-003', date: 'Jul 04, 2024, 01:20pm', customer: 'HDFC Savings', amount: 45000, status: 'Completed', type: 'Savings', isCredit: true },
    ]
  };

  const defaultHistory = [
    { ref: '456789356', date: 'Sep 8, 2024, 03:13pm', customer: 'Amazon AWS', amount: 150000, status: 'Completed', type: 'Software', isCredit: false },
    { ref: '456789357', date: 'Sep 7, 2024, 1:00pm', customer: 'RR Enterprise', amount: 31456, status: 'Completed', type: 'Expenses', isCredit: false },
    { ref: '456789358', date: 'Sep 6, 2024, 04:30pm', customer: 'TechCorp Solutions', amount: 250000, status: 'Completed', type: 'Income', isCredit: true },
    { ref: '456789359', date: 'Sep 5, 2024, 10:15am', customer: 'ICICI Savings', amount: 25000, status: 'Completed', type: 'Savings', isCredit: true },
    { ref: '456789360', date: 'Sep 3, 2024, 10:15am', customer: 'Agrico Private Limit...', amount: 168600, status: 'Partial', type: 'Expense', isCredit: false },
  ];

  const mockSubscriptions = [
    { id: 1, name: 'HDFC Home Loan EMI', category: 'EMI', amount: 45000, nextDue: 'Oct 5, 2024', status: 'Active', icon: '🏦' },
    { id: 2, name: 'AWS Cloud Hosting', category: 'Software', amount: 150000, nextDue: 'Oct 8, 2024', status: 'Active', icon: '☁️' },
    { id: 3, name: 'Google Workspace', category: 'Software', amount: 12500, nextDue: 'Oct 12, 2024', status: 'Active', icon: '📧' },
    { id: 4, name: 'WeWork Office Rent', category: 'Rent', amount: 185000, nextDue: 'Oct 15, 2024', status: 'Active', icon: '🏢' },
  ];

  const [transactionHistory, setTransactionHistory] = useState(defaultHistory);
  const [pastStatements, setPastStatements] = useState([
    { month: 'August 2024', txCount: 142, status: 'Analysed' },
    { month: 'July 2024', txCount: 128, status: 'Analysed' },
  ]);

  // --- DYNAMIC CALCULATIONS ---
  const startingBalance = 2900000; 
  const totalCredit = transactionHistory.filter(tx => tx.isCredit).reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactionHistory.filter(tx => !tx.isCredit).reduce((sum, tx) => sum + tx.amount, 0);
  const currentBalance = startingBalance + totalCredit - totalExpense;
  const formatCurrency = (num) => '₹' + num.toLocaleString('en-IN');

  const chartData = [
    { label: 'Software', pct: 40, color: '#4f46e5' },
    { label: 'Rent', pct: 30, color: '#0ea5e9' },
    { label: 'Advertising', pct: 15, color: '#f59e0b' },
    { label: 'Utilities', pct: 15, color: '#10b981' }
  ];

  // --- INLINE SHORT POLLING LOGIC ---
  useEffect(() => {
    let pollInterval;
    if (isAnalyzing) {
      let pollAttempt = 0;
      const stages = ["Initializing AI engine...", "Detecting recurring patterns...", "Calculating FinHealth score...", "Generating insights..."];
      setPollMessage(stages[0]);

      pollInterval = setInterval(() => {
        pollAttempt++;
        if (pollAttempt < stages.length) {
          setPollMessage(stages[pollAttempt]);
        } else {
          clearInterval(pollInterval);
          const newStatement = { month: 'September 2024', txCount: 312, status: 'Analysed' };
          const newTx = { ref: '998877665', date: 'Sep 24, 2024, 09:45am', customer: 'Google Cloud Ads', amount: 85000, status: 'Completed', type: 'Advertising', isCredit: false };
          
          setPastStatements(prev => [newStatement, ...prev]);
          setTransactionHistory([newTx, ...defaultHistory]); 
          setActiveMonth('September 2024');
          setIsAnalyzing(false);
          setShowResults(true);
        }
      }, 600); 
    }
    return () => clearInterval(pollInterval);
  }, [isAnalyzing]); 

  // --- HANDLERS ---
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  };
  const handleFileInput = (e) => { if (e.target.files && e.target.files.length > 0) handleFile(e.target.files[0]); };
  
  const handleFile = (file) => {
    if (file.type === 'text/csv' || file.type === 'application/pdf' || file.name.endsWith('.csv')) {
      setSelectedFile(file);
    } else alert('Please upload a valid CSV file.');
  };

  const processFile = () => {
    if (!selectedFile) return;
    setIsUploading(true); 
    setTimeout(() => { setIsUploading(false); setIsAnalyzing(true); }, 500);
  };

  const loadPastStatement = (month) => {
    if (mockDB[month]) {
      setTransactionHistory(mockDB[month]);
      setActiveMonth(month);
      setShowResults(true);
      setActiveTab('All'); 
    }
  };

  const resetUploader = () => {
    setShowResults(false); setSelectedFile(null); setTransactionHistory(defaultHistory);
    setActiveMonth('Current'); setActiveTab('All');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', scrollBehavior: 'smooth' }}>
      
      {/* ── NAVBAR ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a', cursor: 'pointer' }} onClick={() => setActiveView('Overview')}>
          PR<sup style={{ color: '#4f46e5', fontSize: 14, verticalAlign: 'super' }}>2</sup>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          
          <span onClick={() => setActiveView('Overview')} style={{ fontSize: 14, fontWeight: activeView === 'Overview' ? 800 : 600, color: activeView === 'Overview' ? '#4f46e5' : '#64748b', cursor: 'pointer', transition: 'color 0.2s' }}>Overview</span>
          <span onClick={() => setActiveView('Subscriptions')} style={{ fontSize: 14, fontWeight: activeView === 'Subscriptions' ? 800 : 600, color: activeView === 'Subscriptions' ? '#4f46e5' : '#64748b', cursor: 'pointer', transition: 'color 0.2s' }}>Subscriptions</span>
          <span onClick={() => setActiveView('FinHealth')} style={{ fontSize: 14, fontWeight: activeView === 'FinHealth' ? 800 : 600, color: activeView === 'FinHealth' ? '#4f46e5' : '#64748b', cursor: 'pointer', transition: 'color 0.2s' }}>FinHealth</span>

          <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: '0.2s', marginLeft: '16px' }}>
            Optimize Savings
          </button>
          <button onClick={onLogout} style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px', display: 'grid', gridTemplateColumns: '400px 1fr', gap: 32 }}>
        
        {/* LEFT COLUMN: UPLOADER & PAST STATEMENTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            {!showResults && (
              <>
                <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Process New Data</h1>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>Upload bank statements to generate AI insights.</p>
              </>
            )}

            {/* DYNAMIC UPLOAD BOX */}
            <div 
              onDragOver={!showResults && !isAnalyzing ? handleDragOver : undefined}
              onDragLeave={!showResults && !isAnalyzing ? handleDragLeave : undefined}
              onDrop={!showResults && !isAnalyzing ? handleDrop : undefined}
              onClick={() => !selectedFile && !isUploading && !isAnalyzing && !showResults && fileInputRef.current.click()}
              style={{
                border: showResults || isAnalyzing ? 'none' : `2px dashed ${isDragging ? '#4f46e5' : '#cbd5e1'}`,
                background: isDragging ? '#eef2ff' : (showResults || isAnalyzing ? '#fff' : '#f8fafc'),
                borderRadius: 12, padding: showResults || isAnalyzing ? '0' : '20px 16px', textAlign: 'center',
                cursor: (selectedFile || isUploading || isAnalyzing || showResults) ? 'default' : 'pointer',
                transition: 'all 0.2s ease', minHeight: showResults ? '240px' : '120px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileInput} accept=".csv, .pdf" style={{ display: 'none' }} />
              
              {showResults ? (
                <div style={{ width: '100%', textAlign: 'left', animation: 'fadeIn 0.5s ease-in' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {chartView === 'pie' ? <PieChart size={18} color="#4f46e5"/> : <BarChart2 size={18} color="#4f46e5"/>} Expense Breakdown
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <select value={chartView} onChange={(e) => setChartView(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#0f172a', cursor: 'pointer', outline: 'none' }}>
                        <option value="pie">Pie Chart</option>
                        <option value="bar">Bar Chart</option>
                      </select>
                      <button onClick={resetUploader} style={{ background: '#f1f5f9', border: 'none', color: '#4f46e5', padding: '6px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><RotateCcw size={14}/></button>
                    </div>
                  </div>

                  {chartView === 'pie' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '10px 0' }}>
                      <div style={{ width: '140px', height: '140px', borderRadius: '50%', flexShrink: 0, background: 'conic-gradient(#4f46e5 0% 40%, #0ea5e9 40% 70%, #f59e0b 70% 85%, #10b981 85% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: '85px', height: '85px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total</span>
                          <span style={{ fontSize: 15, color: '#0f172a', fontWeight: 800 }}>₹5.7L</span>
                        </div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {chartData.map(cat => (
                          <div key={cat.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#0f172a' }}><span>{cat.label}</span><span style={{ color: '#64748b' }}>{cat.pct}%</span></div>
                            <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}><div style={{ width: `${cat.pct}%`, height: '100%', background: cat.color, borderRadius: '99px' }} /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '160px', gap: 16, borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginTop: '20px' }}>
                      {chartData.map(cat => (
                        <div key={cat.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 8, height: '100%' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{cat.pct}%</span>
                          <div style={{ width: '100%', maxWidth: '40px', height: `${cat.pct}%`, background: cat.color, borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease' }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>{cat.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : isAnalyzing ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', padding: '24px 0' }}>
                  <div style={{ position: 'relative', width: 56, height: 56 }}><Loader2 size={56} color="#4f46e5" style={{ animation: 'spin 1s linear infinite' }} /><div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BrainCircuit size={24} color="#4f46e5" /></div></div>
                  <div><div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>AI Analysis in Progress</div><div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{pollMessage}</div></div>
                  <div style={{ width: '80%', height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', marginTop: 8 }}><div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #4f46e5, #818cf8)', borderRadius: 99, animation: 'shimmer 1s infinite linear', backgroundSize: '200% 100%' }} /></div>
                </div>
              ) : isUploading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Loader2 size={24} color="#4f46e5" style={{ animation: 'spin 0.6s linear infinite' }} />
                  <div style={{ textAlign: 'left' }}><div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Uploading statement...</div><div style={{ fontSize: 11, color: '#64748b' }}>Securing data stream</div></div>
                </div>
              ) : !selectedFile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UploadCloud size={20} color="#4f46e5" /></div>
                  <div style={{ textAlign: 'left' }}><div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Click to upload or drag & drop</div><div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>CSV or PDF (Max. 10MB)</div></div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><CheckCircle size={20} color="#059669" /><div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}><div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{selectedFile.name}</div><div style={{ fontSize: 11, color: '#64748b' }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div></div></div>
                  <div style={{ display: 'flex', gap: 8 }}><button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Cancel</button><button onClick={(e) => { e.stopPropagation(); processFile(); }} style={{ flex: 2, background: '#4f46e5', color: '#fff', border: 'none', padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Database size={14}/> Analyze</button></div>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} color="#4f46e5" /> Processed Statements</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pastStatements.map((stmt, i) => (
                <div 
                  key={i} onClick={() => { loadPastStatement(stmt.month); setActiveView('Overview'); }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: activeMonth === stmt.month ? '#eef2ff' : '#f8fafc', borderRadius: 8, border: activeMonth === stmt.month ? '1px solid #4f46e5' : '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <div><div style={{ fontSize: 13, fontWeight: 700, color: activeMonth === stmt.month ? '#4f46e5' : '#0f172a' }}>{stmt.month}</div><div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{stmt.txCount} txns</div></div>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#d1fae5', color: '#059669', padding: '4px 8px', borderRadius: 6 }}>{stmt.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC VIEWS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              {activeView}: {activeMonth === 'Current' ? `Current (${currentMonthYear})` : activeMonth}
            </h2>
          </div>

          {/* VIEW 1: OVERVIEW (Using the new external Component!) */}
          {activeView === 'Overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease-in' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                <div style={{ background: '#fff', padding: '24px', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}><div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>Balances</div><div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{formatCurrency(currentBalance)}</div></div>
                <div style={{ background: '#fff', padding: '24px', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}><div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><ArrowUpRight size={14} color="#059669"/> Credit</div><div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{formatCurrency(totalCredit)}</div></div>
                <div style={{ background: '#fff', padding: '24px', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}><div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><ArrowDownRight size={14} color="#ef4444"/> Expenses</div><div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{formatCurrency(totalExpense)}</div></div>
              </div>
              
              {/* WE NOW CALL THE NEW TRANSACTION TABLE COMPONENT HERE */}
              <TransactionTable 
                transactionHistory={transactionHistory}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                debitCategory={debitCategory}
                setDebitCategory={setDebitCategory}
                activeMonth={activeMonth}
                formatCurrency={formatCurrency}
              />
            </div>
          )}

          {/* VIEW 2: SUBSCRIPTIONS & EMIs */}
          {activeView === 'Subscriptions' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '32px', animation: 'fadeIn 0.4s ease-in' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                <div style={{ background: '#eef2ff', padding: '12px', borderRadius: '12px' }}><Repeat size={24} color="#4f46e5" /></div>
                <div><h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Active Recurring Payments</h3><p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Auto-detected from your transaction history</p></div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}><div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Monthly</div><div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{formatCurrency(392500)}</div></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {mockSubscriptions.map((sub) => (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 24, background: '#fff', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>{sub.icon}</div>
                    <div style={{ marginLeft: 16, flex: 1 }}><div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{sub.name}</div><div style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, color: '#475569' }}>{sub.category}</span></div></div>
                    <div style={{ textAlign: 'right', marginRight: 32 }}><div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><Calendar size={12} /> Next Due: {sub.nextDue}</div></div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{formatCurrency(sub.amount)}/mo</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: FINHEALTH */}
          {activeView === 'FinHealth' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '32px', animation: 'fadeIn 0.4s ease-in' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                <div style={{ background: '#d1fae5', padding: '12px', borderRadius: '12px' }}><Activity size={24} color="#059669" /></div>
                <div><h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>AI Financial Health Score</h3><p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Calculated based on liquidity, debt-ratio, and savings rate</p></div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: 4 }}><span style={{ fontSize: 42, fontWeight: 900, color: '#059669', lineHeight: 1 }}>82</span><span style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8' }}>/ 100</span></div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '24px', border: '1px solid #f1f5f9', marginBottom: 32 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 16 }}>Health Trend (Last 6 Months)</div>
                <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                  <svg viewBox="0 0 600 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    <line x1="0" y1="50" x2="600" y2="50" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="600" y2="100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="150" x2="600" y2="150" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M 20,120 L 130,110 L 240,135 L 350,90 L 460,70 L 570,50" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="20" cy="120" r="6" fill="#fff" stroke="#4f46e5" strokeWidth="3" /><circle cx="130" cy="110" r="6" fill="#fff" stroke="#4f46e5" strokeWidth="3" /><circle cx="240" cy="135" r="6" fill="#fff" stroke="#4f46e5" strokeWidth="3" /><circle cx="350" cy="90" r="6" fill="#fff" stroke="#4f46e5" strokeWidth="3" /><circle cx="460" cy="70" r="6" fill="#fff" stroke="#4f46e5" strokeWidth="3" /><circle cx="570" cy="50" r="8" fill="#4f46e5" />
                    <text x="20" y="180" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">Mar</text><text x="130" y="180" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">Apr</text><text x="240" y="180" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">May</text><text x="350" y="180" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">Jun</text><text x="460" y="180" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">Jul</text><text x="570" y="180" fill="#4f46e5" fontSize="13" fontWeight="800" textAnchor="middle">Aug</text>
                  </svg>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #059669' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={16} color="#059669"/> Strong Liquidity</div>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Your end-of-month balance has grown by 14% over the last quarter. Excellent cash retention.</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><AlertCircle size={16} color="#f59e0b"/> High Fixed Costs</div>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Recurring software and rent subscriptions consume 42% of your monthly inflows.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* WE NOW CALL THE NEW RECOMMENDATIONS COMPONENT HERE */}
        <InvestmentRecommendations />

      </main>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}