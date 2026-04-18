import React from 'react';

export default function Toast({ show, message }) {
  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      
      <div style={{ position: 'fixed', top: '30px', right: '30px', backgroundColor: '#28a745', color: 'white', padding: '15px 25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000, animation: 'slideInRight 0.4s ease-out', fontWeight: 'bold', fontSize: '16px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        {message}
      </div>
    </>
  );
}