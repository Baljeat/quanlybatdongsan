import React from 'react';

export default function Header() {
  return (
    <header style={{ backgroundColor: '#1e1e2f', padding: '0 30px', height: '70px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', top: 0, left: '260px', width: 'calc(100% - 260px)', boxSizing: 'border-box', zIndex: 10 }}>
      <h3 style={{ margin: 0, color: '#e0e0e0', fontWeight: '500' }}>Dashboard Overview</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative', cursor: 'pointer', color: '#a0a0a0' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#ff4d4d', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #1e1e2f' }}></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <span style={{ fontWeight: '500', color: '#f0f0f0', fontSize: '15px' }}>Hi, <span style={{ color: '#00aaff', fontWeight: 'bold' }}>Admin</span></span>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#007bff', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
            A
          </div>
        </div>
      </div>
    </header>
  );
}