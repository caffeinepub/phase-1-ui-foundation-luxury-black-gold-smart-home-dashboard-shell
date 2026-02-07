import { Home, DoorOpen, Settings, Zap, HeadphonesIcon } from 'lucide-react';
import { type NavigationView } from '../../App';
import { useCustomSidebarAction } from '../../hooks/useCustomSidebarAction';
import { useSecurityGateway } from '../../hooks/useSecurityGateway';
import { cn } from '../../lib/utils';

interface SidebarNavProps {
  currentView: NavigationView;
  onNavigate: (view: NavigationView) => void;
}

interface NavItem {
  id: NavigationView;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'rooms', label: 'Rooms', icon: DoorOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'support', label: 'Support & Info', icon: HeadphonesIcon },
];

export function SidebarNav({ currentView, onNavigate }: SidebarNavProps) {
  const { config } = useCustomSidebarAction();
  const { lock } = useSecurityGateway();

  const handleCustomAction = () => {
    switch (config.action) {
      case 'navigate-dashboard':
        onNavigate('dashboard');
        break;
      case 'navigate-rooms':
        onNavigate('rooms');
        break;
      case 'navigate-settings':
        onNavigate('settings');
        break;
      case 'lock-session':
        lock();
        break;
    }
  };

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-sidebar">
      {/* Sidebar Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-gold-dark shadow-gold-glow-sm">
          <Home className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-gold-glow-sm border border-sidebar-primary/30'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/70 group-hover:text-sidebar-primary'
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-sidebar-primary shadow-gold-glow-sm" />
              )}
            </button>
          );
        })}

        {/* Custom Action Button */}
        <div className="pt-4">
          <div className="mb-2 px-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            Quick Action
          </div>
          <button
            onClick={handleCustomAction}
            className="group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 hover:shadow-gold-glow-sm"
          >
            <Zap className="h-5 w-5" />
            <span>{config.name}</span>
          </button>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent/30 p-3 text-xs text-sidebar-foreground/70">
          <p className="font-medium text-sidebar-foreground">Premium Edition</p>
          <p className="mt-1">Luxury Smart Home Control</p>
        </div>
      </div>
    </aside>
  );
}
