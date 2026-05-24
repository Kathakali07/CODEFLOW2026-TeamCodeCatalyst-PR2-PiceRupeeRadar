import React from 'react';

export default function InvestmentRecommendations() {
  return (
    <div style={{ gridColumn: '1 / -1', marginTop: 16, background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)', borderRadius: 16, padding: '48px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Your savings are sleeping. Let's wake them up.</h2>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 40, maxWidth: 650, margin: '0 auto 40px', lineHeight: 1.6 }}>
        Don't let inflation eat your hard-earned money. Based on your recent spending profile, our AI has curated the smartest places to park your cash this month.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, textAlign: 'left' }}>
        
        {/* ICICI */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '4px 12px', borderRadius: 20 }}>Low Risk</div>
            <img src="/icici.jpeg" alt="ICICI Logo" style={{ height: '24px', objectFit: 'contain' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>ICICI Prudential Liquid Fund</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.5, flex: 1 }}>Earn ~7.1% p.a. with instant withdrawal capabilities. A much better alternative to leaving cash idle.</p>
          <button style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 700, color: '#4f46e5', cursor: 'pointer', transition: '0.2s' }}>Explore Fund</button>
        </div>

        {/* HDFC */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: 12, boxShadow: '0 12px 24px rgba(79,70,229,0.1)', border: '2px solid #4f46e5', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#4f46e5', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 16px', borderRadius: 20, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Top Pick</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '4px 12px', borderRadius: 20 }}>Medium Risk</div>
            <img src="/hdfc.jpeg" alt="HDFC Logo" style={{ height: '22px', objectFit: 'contain' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>HDFC Index Fund (Nifty 50)</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.5, flex: 1 }}>Tracks the top 50 Indian companies. Historical 12-14% returns. Perfect for starting a disciplined SIP.</p>
          <button style={{ width: '100%', padding: '12px', background: '#4f46e5', border: 'none', borderRadius: 8, fontWeight: 700, color: '#fff', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>Start SIP</button>
        </div>

        {/* Tata Mutual Fund */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c', background: '#fee2e2', padding: '4px 12px', borderRadius: 20 }}>High Risk</div>
            <img src="/tatamf.jpeg" alt="Tata Mutual Fund Logo" style={{ height: '28px', objectFit: 'contain' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Tata Digital India Fund</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.5, flex: 1 }}>Capitalize on the IT sector's growth with historical 18-20% p.a. returns over 5 years. Ideal for long-term wealth creation.</p>
          <button style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 700, color: '#4f46e5', cursor: 'pointer', transition: '0.2s' }}>Explore Fund</button>
        </div>
      </div>
    </div>
  );
}