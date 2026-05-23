import React, { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  BrainCircuit,
  Network,
  ArrowRight,
  ChevronRight,
  Database,
  Server,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  FileText,
  Zap
} from 'lucide-react';
import Navbar from './Navbar';

/* ─── Animated mesh gradient canvas ─── */
function MeshGradient() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const blobs = [
        { x: w * (0.15 + 0.1 * Math.sin(t * 0.4)), y: h * (0.2 + 0.08 * Math.cos(t * 0.3)), r: w * 0.42, c: [120, 80, 240] },
        { x: w * (0.65 + 0.12 * Math.cos(t * 0.35)), y: h * (0.1 + 0.1 * Math.sin(t * 0.28)), r: w * 0.38, c: [240, 100, 80] },
        { x: w * (0.8 + 0.08 * Math.sin(t * 0.45)), y: h * (0.6 + 0.1 * Math.cos(t * 0.38)), r: w * 0.3, c: [250, 170, 50] },
        { x: w * (0.3 + 0.1 * Math.cos(t * 0.32)), y: h * (0.75 + 0.08 * Math.sin(t * 0.42)), r: w * 0.34, c: [60, 180, 230] },
      ];

      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.72)`);
        g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      t += 0.006;
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}

/* ─── Stripe-style floating product UI card ─── */
function ProductMockup() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
      width: '100%',
      maxWidth: 820,
      margin: '0 auto',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Left: Transaction card */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 20,
        padding: '24px 24px 20px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#7850f0,#4f3dc8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>HDFC Bank Statement</div>
            <div style={{ fontSize: 11, color: '#888' }}>Apr 2025 · 312 transactions</div>
          </div>
          <div style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 700,
            background: '#ecfdf5', color: '#059669',
            padding: '3px 9px', borderRadius: 20,
          }}>Analysed</div>
        </div>

        {[
          { name: 'Swiggy Order', cat: 'Food & Dining', amt: '−₹ 486', color: '#f97316' },
          { name: 'Amazon Pay', cat: 'Shopping', amt: '−₹ 2,340', color: '#7850f0' },
          { name: 'Salary Credit', cat: 'Income', amt: '+₹ 85,000', color: '#059669', positive: true },
          { name: 'Zepto Instant', cat: 'Groceries', amt: '−₹ 1,120', color: '#0ea5e9' },
        ].map((tx, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 0',
            borderBottom: i < 3 ? '0.5px solid #f0f0f0' : 'none',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: tx.color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: tx.color }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{tx.name}</div>
              <div style={{ fontSize: 10, color: '#888' }}>{tx.cat}</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: tx.positive ? '#059669' : '#111' }}>{tx.amt}</div>
          </div>
        ))}
      </div>

      {/* Right: metrics stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Health score */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 20,
          padding: '20px 22px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.14)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.05em', marginBottom: 6, textTransform: 'uppercase' }}>Financial Health Score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <div style={{ fontSize: 38, fontWeight: 800, color: '#111', lineHeight: 1 }}>74</div>
            <div style={{ fontSize: 13, color: '#888' }}>/ 100</div>
          </div>
          <div style={{ marginTop: 12, height: 6, borderRadius: 99, background: '#f0f0f0', overflow: 'hidden' }}>
            <div style={{ width: '74%', height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#7850f0,#4f3dc8)' }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: '#059669', fontWeight: 600 }}>▲ 6 pts vs last month</div>
        </div>

        {/* Anomaly alert */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 20,
          padding: '18px 22px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.14)',
          borderLeft: '3.5px solid #f97316',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={14} color="#f97316" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Anomaly Detected</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>3× spike in UPI transfers</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>Autoencoder flagged Apr 18–22</div>
        </div>

        {/* Category donut placeholder */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 20,
          padding: '18px 22px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.14)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Spend Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              { label: 'Food & Dining', pct: 38, color: '#f97316' },
              { label: 'Shopping', pct: 27, color: '#7850f0' },
              { label: 'Utilities', pct: 20, color: '#0ea5e9' },
              { label: 'Others', pct: 15, color: '#d1d5db' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: 11, color: '#111', fontWeight: 700 }}>{s.pct}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: '#f0f0f0', overflow: 'hidden' }}>
                  <div style={{ width: s.pct + '%', height: '100%', borderRadius: 99, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function HomePage({ onLogin }) {
  const architectureDetails = [
    {
      icon: <Server size={22} color="#7850f0" />,
      accent: '#7850f0',
      bg: '#f3f0ff',
      title: "Spring Boot Ingestion",
      description: "Rapid API layer handling secure CSV/PDF uploads and regex-based PII sanitization before queuing.",
    },
    {
      icon: <Network size={22} color="#0ea5e9" />,
      accent: '#0ea5e9',
      bg: '#e0f2fe',
      title: "RabbitMQ Event Broker",
      description: "Asynchronous message queuing ensures zero data loss and prevents bottlenecks during heavy ML workloads.",
    },
    {
      icon: <BrainCircuit size={22} color="#f97316" />,
      accent: '#f97316',
      bg: '#fff7ed',
      title: "FastAPI ML Execution",
      description: "Dedicated Python layer running BiLSTM NER categorization and Autoencoder anomaly detection.",
    },
    {
      icon: <Database size={22} color="#059669" />,
      accent: '#059669',
      bg: '#ecfdf5',
      title: "MongoDB State Manager",
      description: "The single source of truth. All microservices read and write to a centralized NoSQL document store.",
    },
  ];


  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'DM Sans', sans-serif", color: '#111', overflowX: 'hidden' }}>
      {/* Google font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #c4b5fd; }
        a { text-decoration: none; color: inherit; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-2 { animation: fadeUp 0.8s 0.15s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-3 { animation: fadeUp 0.8s 0.30s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-4 { animation: fadeUp 0.8s 0.45s cubic-bezier(.22,1,.36,1) both; }
        .arch-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.10); transform: translateY(-3px); }
        .arch-card { transition: box-shadow 0.25s, transform 0.25s; }
        .btn-primary:hover { background: #5f3de8; }
        .btn-primary { transition: background 0.18s, transform 0.12s; }
        .btn-primary:active { transform: scale(0.97); }
        .btn-secondary:hover { background: #f9f9f9; }
        .btn-secondary { transition: background 0.18s, transform 0.12s; }
        .btn-secondary:active { transform: scale(0.97); }
      `}</style>

      <Navbar onLogin={onLogin} />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', overflow: 'hidden' }}>
        {/* Animated gradient bg */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <MeshGradient />
        </div>
        {/* Frosted overlay so text is legible */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(0px)', zIndex: 1 }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, textAlign: 'center', marginBottom: 64 }}>

          <h1 className="fade-up-2" style={{ fontSize: 'clamp(48px,8vw,88px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-0.03em', color: '#fff', textShadow: '0 2px 32px rgba(0,0,0,0.18)', marginBottom: 24 }}>
            Drag.Drop.
            <span style={{ fontStyle: 'italic', color: '#fde68a' }}>Decode.</span>
          </h1>

          <p className="fade-up-3" style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(255,255,255,1)', maxWidth: 560, margin: '0 auto 40px', fontWeight: 400 }}>
            Securely process CSV and PDF statements, anonymize sensitive information, uncover spending patterns and flag suspicious activity within milliseconds.Transform static bank statements into live financial insights with AI-driven analysis.
          </p>

          <div className="fade-up-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={onLogin}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#7850f0', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 32px rgba(120,80,240,0.4)' }}
            >
              Open Dashboard <ArrowRight size={16} />
            </button>
            <button
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'rgba(255,255,255,0.85)', color: '#111', border: '0.5px solid rgba(255,255,255,0.6)', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(8px)' }}
            >
              API Docs <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Floating product mockup */}
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 860 }}>
          <ProductMockup />
        </div>
      </section>


      {/* ── ARCHITECTURE ── */}
      <section style={{ background: '#fff', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ maxWidth: 600, marginBottom: 64 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, color: '#7850f0', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Under the Hood
            </div>
            <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#111', marginBottom: 20 }}>
              Decoupled microservice<br />architecture
            </h2>
            <p style={{ fontSize: 17, color: '#555', lineHeight: 1.7, fontWeight: 400 }}>
              PR² stands for Pice Rupee Radar. It is an AI-powered financial intelligence platform designed to help users analyze, understand and optimize their banking expenses effortlessly.
              A distributed microservice architecture that decouples data ingestion from AI computation, enabling low-latency financial analysis without bottlenecks.
            </p>
          </div>

          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px,1fr))', gap: 20 }}>
            {architectureDetails.map((layer, i) => (
              <div
                key={i}
                className="arch-card"
                style={{ background: '#fafafa', border: '0.5px solid #e8e8e8', borderRadius: 20, padding: '32px 28px' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: layer.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                  {layer.icon}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 10 }}>{layer.title}</div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.65 }}>{layer.description}</div>
              </div>
            ))}
          </div>

          
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', background: 'linear-gradient(135deg,#7850f0 0%,#4f3dc8 50%,#2d1fa3 100%)', borderRadius: 28, padding: '72px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 'clamp(28px,3vw,42px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 14 }}>
              Ready to analyse your<br />first statement?
            </div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>No PII ever leaves your server. Privacy-first by design.</div>
          </div>
          <button
            onClick={onLogin}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', background: '#fff', color: '#7850f0', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', flexShrink: 0 }}
          >
            Initialize Dashboard <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '0.5px solid #e8e8e8', padding: '48px 24px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em', color: '#111', marginBottom: 8 }}>
              PR<sup style={{ color: '#7850f0', fontSize: 16, verticalAlign: 'super' }}>2</sup>
            </div>
            <div style={{ fontSize: 13, color: '#888', maxWidth: 220, lineHeight: 1.6 }}>Pice Rupee Radar — AI-driven financial analysis for bank statements.</div>
            <div style={{ marginTop: 14, fontSize: 12, color: '#bbb' }}>Engineered by a specialized team of 4.</div>
          </div>

          <div style={{ display: 'flex', gap: 64 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#111', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>Product</div>
              {['Architecture', 'Security', 'Pricing'].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ fontSize: 13, color: '#666', fontWeight: 500, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = '#7850f0'}
                    onMouseLeave={e => e.target.style.color = '#666'}>
                    {l}
                  </a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#111', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>Developers</div>
              {['API Reference', 'GitHub', 'Status'].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ fontSize: 13, color: '#666', fontWeight: 500, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = '#7850f0'}
                    onMouseLeave={e => e.target.style.color = '#666'}>
                    {l}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
