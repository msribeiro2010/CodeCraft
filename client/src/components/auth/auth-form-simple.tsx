import { useState } from 'react';
import { login, register } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function AuthFormSimple() {
  // Estados para controlar a UI
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { toast } = useToast();
  
  // Estados para formulário de login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Estados para formulário de registro
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [overdraftLimit, setOverdraftLimit] = useState('0');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Função de login
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await login({
        email: loginEmail,
        password: loginPassword
      });
      
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo ao FinControl!',
      });
      
      // Aguardar um pouco e então redirecionar
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Erro ao fazer login',
        description: error instanceof Error ? error.message : 'Credenciais inválidas. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Função de registro
  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    // Validação básica
    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: 'Erro ao criar conta',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await register({
        username: registerName,
        email: registerEmail,
        password: registerPassword,
        confirmPassword: registerConfirmPassword,
        initialBalance: initialBalance,
        overdraftLimit: overdraftLimit,
        notificationsEnabled: notificationsEnabled,
      });
      
      toast({
        title: 'Conta criada com sucesso',
        description: 'Bem-vindo ao FinControl!',
      });
      
      // Redirecionar para o dashboard após o registro bem-sucedido
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Erro ao criar conta',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao criar sua conta. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Firebase/Google desabilitado neste projeto
  // UI para o formulário
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-800 font-display">
          <span className="text-primary">Fin</span>Control
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Controle Financeiro Pessoal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Formulário de Login */}
          {!showRegister ? (
            <>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email</label>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700">Senha</label>
                  <div className="mt-1">
                    <input
                      id="password"
                      type="password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                      Lembrar-me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary hover:text-primary-dark">
                      Esqueceu a senha?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRegister(true)}
                >
                  Criar nova conta
                </Button>
              </div>
            </>
          ) : (
            /* Formulário de Registro */
            <>
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Nome completo</label>
                  <div className="mt-1">
                    <input
                      id="name"
                      type="text"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Seu nome"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-neutral-700">Email</label>
                  <div className="mt-1">
                    <input
                      id="register-email"
                      type="email"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="seu@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-neutral-700">Senha</label>
                  <div className="mt-1">
                    <input
                      id="register-password"
                      type="password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700">Confirmar senha</label>
                  <div className="mt-1">
                    <input
                      id="confirm-password"
                      type="password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="initial-balance" className="block text-sm font-medium text-neutral-700">Saldo Inicial (R$)</label>
                  <div className="mt-1">
                    <input
                      id="initial-balance"
                      type="number"
                      step="0.01"
                      className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">Pode ser negativo.</p>
                </div>

                <div>
                  <label htmlFor="overdraft-limit" className="block text-sm font-medium text-neutral-700">Limite de Cheque Especial (R$)</label>
                  <div className="mt-1">
                    <input
                      id="overdraft-limit"
                      type="number"
                      step="0.01"
                      min="0"
                      className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={overdraftLimit}
                      onChange={(e) => setOverdraftLimit(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="notifications"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    disabled={isLoading}
                  />
                  <label htmlFor="notifications" className="ml-2 block text-sm text-neutral-700">
                    Ativar notificações
                  </label>
                </div>
                <p className="text-sm text-neutral-500">Receba lembretes sobre pagamentos e transações.</p>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </form>

              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRegister(false)}
                >
                  Já tenho uma conta
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}