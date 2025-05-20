import { Link, useLocation } from 'wouter';
import { Home, CreditCard, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNavigation() {
  const [location] = useLocation();
  
  const navItems = [
    {
      href: '/dashboard',
      label: 'Início',
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
      href: '/settings',
      label: 'Ajustes',
      icon: Settings,
      active: location === '/settings',
    },
  ];

  return (
    <div className="block md:hidden bg-white border-t border-neutral-200 fixed bottom-0 left-0 right-0 z-20">
      <div className="flex justify-between">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 group inline-flex flex-col items-center justify-center px-3 py-2 text-sm font-medium",
              item.active
                ? "text-primary border-t-2 border-primary"
                : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            <item.icon
              className={cn(
                "h-6 w-6",
                item.active
                  ? "text-primary"
                  : "text-neutral-500 group-hover:text-neutral-900"
              )}
            />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
