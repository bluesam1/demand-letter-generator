import { ReactNode, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showSidebar?: boolean;
}

export default function PageLayout({
  children,
  title,
  showSidebar = true
}: PageLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex">
        {showSidebar && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-6 md:p-8">
          {title && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
