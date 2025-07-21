import { useState } from 'react';
import { login, register } from '@/lib/auth';
import { signInWithGoogle, firebaseConfigured } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FirebaseConfigWarning } from '@/components/firebase-config-warning';

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

  // Função de login com Google
  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.user) {
        // Get the user data from the Google provider
        const { displayName, email, uid } = result.user;
        
        // Register or login user in our backend
        if (email) {
          // For new users, we'll use the Google info to create an account
          // For existing users, the backend will find them by email
          await register({
            username: displayName || email.split('@')[0],
            email: email,
            password: uid.substring(0, 20), // Use part of the UID as password (they won't need it)
            confirmPassword: uid.substring(0, 20),
            initialBalance: '0',
            overdraftLimit: '0',
            notificationsEnabled: true,
          });
          
          toast({
            title: 'Login com Google realizado com sucesso',
            description: 'Bem-vindo ao FinControl!',
          });
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        title: 'Erro ao entrar com Google',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao tentar entrar com Google. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // UI para o formulário
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-800">
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
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-500">
                      Ou continue com
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  {firebaseConfigured ? (
                    <Button
                      variant="outline"
                      className="w-full mb-3 flex items-center justify-center gap-2"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                          <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                          <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                          <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                          <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                        </g>
                      </svg>
                      Google
                    </Button>
                  ) : (
                    <div className="mb-3">
                      <FirebaseConfigWarning />
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowRegister(true)}
                  >
                    Criar nova conta
                  </Button>
                </div>
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
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-500">
                      Ou continue com
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  {firebaseConfigured ? (
                    <Button
                      variant="outline"
                      className="w-full mb-3 flex items-center justify-center gap-2"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                          <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                          <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                          <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                          <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                        </g>
                      </svg>
                      Google
                    </Button>
                  ) : (
                    <div className="mb-3">
                      <FirebaseConfigWarning />
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowRegister(false)}
                  >
                    Já tenho uma conta
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}