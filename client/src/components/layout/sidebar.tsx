import { Link, useLocation } from 'wouter';
import { Home, CreditCard, FileText, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [location] = useLocation();
  
  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      active: location === '/dashboard',
    },
    {
      href: '/transactions',
      label: 'Transações',
      icon: CreditCard,
      active: location === '/transactions',
    },
    {
      href: '/invoices',
      label: 'Faturas',
      icon: FileText,
      active: location === '/invoices',
    },
    {
      href: '/reminders',
      label: 'Lembretes',
      icon: Bell,
      active: location === '/reminders',
    },
    {
      href: '/settings',
      label: 'Configurações',
      icon: Settings,
      active: location === '/settings',
    },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    item.active
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  )}
                >
                  <item.icon
                    className={cn(
                      item.active
                        ? "text-neutral-500"
                        : "text-neutral-400 group-hover:text-neutral-500",
                      "mr-3 h-6 w-6"
                    )}
                  />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
