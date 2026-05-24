import React from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LogIn({ onLoginSuccess, onNavigateToSignUp }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="animate-fade-scale" style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)', display: 'flex', overflow: 'hidden', maxWidth: '1000px', width: '100%', minHeight: '600px' }}>
        
        {/* Left Side: Branding / Value Prop */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #7850f0 0%, #4f3dc8 100%)', padding: '48px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div className="animate-float" style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
          
          <div className="animate-fade-up-1">
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', color: '#fff' }}>
              PR<sup style={{ color: '#e0e7ff', fontSize: 16, verticalAlign: 'super' }}>2</sup>
            </div>
          </div>

          <div style={{ zIndex: 1 }} className="animate-fade-up-2">
            <h2 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
              Welcome back to your financial hub.
            </h2>
            <p style={{ fontSize: '15px', color: '#e0e7ff', lineHeight: 1.6, maxWidth: '85%' }}>
              Log in to continue analyzing your bank statements and uncovering actionable insights.
            </p>
          </div>

          <div className="animate-fade-up-3" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#e0e7ff', fontWeight: 500 }}>
            <ShieldCheck size={18} color="#e0e7ff" />
            Bank-grade 256-bit encryption
          </div>
        </div>

        {/* Right Side: Log In Form */}
        <div style={{ flex: 1, padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ maxWidth: '360px', width: '100%', margin: '0 auto' }}>
            
            <div className="animate-fade-up-1">
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Log In</h1>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
                Don't have an account? <span onClick={onNavigateToSignUp} className="text-link" style={{ color: '#4f46e5', fontWeight: 700, cursor: 'pointer' }}>Sign up</span>
              </p>
            </div>

            <div className="animate-fade-up-2">
              <button className="google-btn" style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Log in with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Or log in with email</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); onLoginSuccess(); }} className="animate-fade-up-3">
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="email" placeholder="you@company.com" required style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Password</label>
                  <span className="text-link" style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}>Forgot password?</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="password" placeholder="••••••••" required style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box' }} />
                </div>
              </div>

              <button type="submit" className="primary-btn" style={{ width: '100%', background: '#4f46e5', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
                Log In <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        input:hover { border-color: #94a3b8 !important; }
        input:focus { border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1) !important; }
        .text-link { transition: color 0.2s ease, text-decoration 0.2s ease; }
        .text-link:hover { color: #3730a3 !important; text-decoration: underline !important; }
        .google-btn { transition: all 0.2s ease !important; }
        .google-btn:hover { background: #f8fafc !important; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.06) !important; }
        .google-btn:active { transform: translateY(0); }
        .primary-btn { transition: all 0.2s ease !important; }
        .primary-btn:hover { background: #4338ca !important; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4) !important; }
        .primary-btn:active { transform: translateY(0); }
        @keyframes fadeScale { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
        .animate-fade-scale { animation: fadeScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fade-up-1 { opacity: 0; animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.1s; }
        .animate-fade-up-2 { opacity: 0; animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.2s; }
        .animate-fade-up-3 { opacity: 0; animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}