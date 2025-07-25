import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../hooks/useAuth';
import { Chat } from '../chat/Chat';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {isAuthenticated && <Sidebar />}
      <main className={`flex-1 overflow-auto ${isAuthenticated ? 'ml-0' : ''}`}>
        {isAuthenticated && <Navbar />}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
      <Chat />
    </div>
  );
};

export default MainLayout;