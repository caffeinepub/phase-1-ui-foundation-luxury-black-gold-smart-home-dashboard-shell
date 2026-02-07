import { useState } from 'react';
import { SecurityGatewayProvider, useSecurityGateway } from './hooks/useSecurityGateway';
import { SecurityGatewayPage } from './pages/SecurityGatewayPage';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { RoomsPage } from './pages/RoomsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SupportInfoPage } from './pages/SupportInfoPage';
import { VirtualHome3DPage } from './pages/VirtualHome3DPage';
import { useAutoProvisionUser } from './hooks/useAutoProvisionUser';

export type NavigationView = 'dashboard' | 'rooms' | 'settings' | 'support' | '3d-view';

function AppContent() {
  const { isUnlocked } = useSecurityGateway();
  const [currentView, setCurrentView] = useState<NavigationView>('dashboard');
  const [previousView, setPreviousView] = useState<NavigationView>('dashboard');

  // Trigger auto-provisioning at app level after unlock
  useAutoProvisionUser();

  const handleNavigate = (view: NavigationView) => {
    if (view === '3d-view') {
      setPreviousView(currentView);
    }
    setCurrentView(view);
  };

  const handleExit3D = () => {
    setCurrentView(previousView);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage onExplore3D={() => handleNavigate('3d-view')} />;
      case 'rooms':
        return <RoomsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'support':
        return <SupportInfoPage />;
      case '3d-view':
        return <VirtualHome3DPage onExit={handleExit3D} />;
      default:
        return <DashboardPage onExplore3D={() => handleNavigate('3d-view')} />;
    }
  };

  // Gate: Show entrance screen if not unlocked
  if (!isUnlocked) {
    return <SecurityGatewayPage />;
  }

  // Full-screen 3D view (no AppShell)
  if (currentView === '3d-view') {
    return renderView();
  }

  // Show main app with AppShell for other views
  return (
    <AppShell currentView={currentView} onNavigate={handleNavigate}>
      {renderView()}
    </AppShell>
  );
}

function App() {
  return (
    <SecurityGatewayProvider>
      <AppContent />
    </SecurityGatewayProvider>
  );
}

export default App;
