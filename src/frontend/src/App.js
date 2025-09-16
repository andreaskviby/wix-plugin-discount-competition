import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Layout, Page } from '@wix/design-system';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import Competitions from './pages/Competitions/Competitions';
import Analytics from './pages/Analytics/Analytics';
import Settings from './pages/Settings/Settings';
import Login from './pages/Login/Login';
import { selectIsAuthenticated } from './store/authSlice';
import './App.css';

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app">
      <Layout>
        <Layout.Header>
          <Header />
        </Layout.Header>
        
        <Layout.Content>
          <Layout>
            <Layout.Sidebar width="240px">
              <Sidebar />
            </Layout.Sidebar>
            
            <Layout.Content>
              <Page height="100vh">
                <Page.Content>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/competitions" element={<Competitions />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Page.Content>
              </Page>
            </Layout.Content>
          </Layout>
        </Layout.Content>
      </Layout>
    </div>
  );
}

export default App;