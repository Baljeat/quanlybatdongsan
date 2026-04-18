import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ paddingTop: '70px' }}>
        <Header />
        <main style={{ padding: '30px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}