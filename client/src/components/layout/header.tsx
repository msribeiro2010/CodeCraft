import { useState } from 'react';
import { Bell, User } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthContext } from '@/providers/auth-provider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { logout } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useAuthContext();
  const { toast } = useToast();

  const handleLogout = () => {
    // Redirecionar imediatamente para a página de login
    window.location.href = '/';
    
    // Executar o logout no background
    logout().catch(error => {
      console.error('Logout error:', error);
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <h1 className="text-xl font-bold text-neutral-800 cursor-pointer">
                  <span className="text-primary">Fin</span>Control
                </h1>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-2 text-neutral-600 hover:text-neutral-900"
              asChild
            >
              <Link href="/reminders">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Ver notificações</span>
              </Link>
            </Button>
            
            <div className="ml-3 relative">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full focus:ring-primary"
                  >
                    <span className="sr-only">Abrir menu de usuário</span>
                    <Avatar className="h-8 w-8 bg-primary text-white">
                      <AvatarFallback>
                        {user ? getInitials(user.username) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <User className="mr-2 h-4 w-4" />
                      <span>Seu Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const Settings = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
