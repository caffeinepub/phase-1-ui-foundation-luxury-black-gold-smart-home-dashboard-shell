import { type ReactNode } from 'react';
import { BrandHeader } from './BrandHeader';
import { SidebarNav } from '../navigation/SidebarNav';
import { type NavigationView } from '../../App';

interface AppShellProps {
  children: ReactNode;
  currentView: NavigationView;
  onNavigate: (view: NavigationView) => void;
}

export function AppShell({ children, currentView, onNavigate }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Fixed Sidebar */}
      <SidebarNav currentView={currentView} onNavigate={onNavigate} />
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Brand Header */}
        <BrandHeader />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
