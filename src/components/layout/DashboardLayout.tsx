import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav'; // 👈 new import

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - visible only on md and up */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-auto relative pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom navigation - only visible on mobile */}
      <BottomNav />
    </div>
  );
};
