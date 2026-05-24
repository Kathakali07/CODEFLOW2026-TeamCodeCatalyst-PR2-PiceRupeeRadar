import React from 'react';
import { Landmark, Building2, Mail } from 'lucide-react';

export default function InvestmentRecommendations() {
  return (
    <div style={{ gridColumn: '1 / -1', marginTop: 16, background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)', borderRadius: 16, padding: '48px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Your savings are sleeping. Let's wake them up.</h2>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 40, maxWidth: 650, margin: '0 auto 40px', lineHeight: 1.6 }}>
        Don't let inflation eat your hard-earned money. Based on your recent spending profile, our AI has curated the smartest places to park your cash this month.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, textAlign: 'left' }}>
        
        {/* ICICI */}
        <div className="inv-card-hover" style={{ background: '#fff', padding: '24px', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '4px 12px', borderRadius: 20 }}>Low Risk</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b91c1c', fontWeight: 800, fontSize: 14 }}>
              <Landmark size={20} /> ICICI
            </div>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>ICICI Prudential Liquid Fund</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.5, flex: 1 }}>Earn ~7.1% p.a. with instant withdrawal capabilities. A much better alternative to leaving cash idle.</p>
          <button className="inv-btn-hover" style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 700, color: '#4f46e5', cursor: 'pointer', transition: '0.2s' }}>Explore Fund</button>
        </div>

        {/* HDFC */}
        <div className="inv-card-hover-primary" style={{ background: '#fff', padding: '24px', borderRadius: 12, boxShadow: '0 12px 24px rgba(79,70,229,0.1)', border: '2px solid #4f46e5', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#4f46e5', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 16px', borderRadius: 20, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Top Pick</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '4px 12px', borderRadius: 20 }}>Medium Risk</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1d4ed8', fontWeight: 800, fontSize: 14 }}>
              <Building2 size={20} /> HDFC
            </div>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>HDFC Index Fund (Nifty 50)</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.5, flex: 1 }}>Tracks the top 50 Indian companies. Historical 12-14% returns. Perfect for starting a disciplined SIP.</p>
          <button className="inv-btn-primary-hover" style={{ width: '100%', padding: '12px', background: '#4f46e5', border: 'none', borderRadius: 8, fontWeight: 700, color: '#fff', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>Start SIP</button>
        </div>

        {/* India Post */}
        <div className="inv-card-hover" style={{ background: '#fff', padding: '24px', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '4px 12px', borderRadius: 20 }}>Zero Risk</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ea580c', fontWeight: 800, fontSize: 14 }}>
              <Mail size={20} /> India Post
            </div>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Post Office Time Deposit</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.5, flex: 1 }}>Lock in sovereign-backed, guaranteed returns up to 7.5% p.a. Complete peace of mind.</p>
          <button className="inv-btn-hover" style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 700, color: '#4f46e5', cursor: 'pointer', transition: '0.2s' }}>View Rates</button>
        </div>
      </div>
      <style>{`
        .inv-card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: default; }
        .inv-card-hover:hover { transform: translateY(-6px); box-shadow: 0 16px 32px rgba(0,0,0,0.08) !important; }
        .inv-card-hover-primary { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: default; }
        .inv-card-hover-primary:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(79,70,229,0.2) !important; }
        .inv-btn-hover { transition: all 0.2s ease; }
        .inv-btn-hover:hover { background: #eef2ff !important; border-color: #4f46e5 !important; }
        .inv-btn-primary-hover { transition: all 0.2s ease; }
        .inv-btn-primary-hover:hover { background: #4338ca !important; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79,70,229,0.4) !important; }
        .inv-btn-primary-hover:active { transform: translateY(0); }
      `}</style>
    </div>
  );
}