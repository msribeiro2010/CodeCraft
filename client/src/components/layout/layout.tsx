import { ReactNode } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { MobileNavigation } from './mobile-navigation';

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 overflow-auto focus:outline-none pb-16 md:pb-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </div>
      </div>
      
      <MobileNavigation />
    </div>
  );
}
