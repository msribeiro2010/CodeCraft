import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, TrendingDown, TrendingUp, CircleDollarSign } from 'lucide-react';
import { Decimal } from 'decimal.js';

export function BalanceCard() {
  const { data, isLoading } = useQuery<{
    balance: string;
    overdraftLimit: string;
    initialBalance: string;
    totalIncome: string;
    totalExpense: string;
  }>({
    queryKey: ['/api/dashboard/balance'],
    refetchInterval: 3000, // Atualiza a cada 3 segundos
  });

  const formatCurrency = (value: string | number | Decimal) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  const isNegative = () => {
    if (!data) return false;
    return new Decimal(data.balance).lessThan(0);
  };

  const isUsingOverdraft = () => {
    if (!data) return false;
    const balance = new Decimal(data.balance);
    const initialBalance = new Decimal(data.initialBalance);
    
    return balance.lessThan(initialBalance);
  };
  
  // Calcula o valor do cheque especial sendo utilizado (quanto do negativo)
  const getOverdraftUsed = () => {
    if (!data || !isNegative()) return new Decimal(0);
    return new Decimal(data.balance).abs();
  };
  
  // Calcula quanto ainda resta de limite disponível no cheque especial
  const getOverdraftRemaining = () => {
    if (!data) return new Decimal(0);
    const overdraftLimit = new Decimal(data.overdraftLimit);
    const overdraftUsed = getOverdraftUsed();
    return overdraftLimit.minus(overdraftUsed);
  };

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-3 rounded-xl ${isNegative() ? 'bg-red-100' : 'bg-blue-100'}`}>
                <CreditCard className={`h-6 w-6 ${isNegative() ? 'text-red-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">Saldo Atual</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {isNegative() && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <Skeleton className="h-10 w-36" />
            ) : (
              <div className={`text-3xl font-bold ${isNegative() ? 'text-red-600' : 'text-slate-800'}`}>
                {formatCurrency(data.balance)}
              </div>
            )}
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          {isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : isNegative() ? (
            <div className="space-y-2">
              <div className="flex items-center text-red-600 font-medium">
                <TrendingDown className="mr-2 h-4 w-4" />
                Usando cheque especial
              </div>
              <div className="text-sm text-slate-600">
                {formatCurrency(getOverdraftUsed())} de {formatCurrency(data.overdraftLimit)}
              </div>
            </div>
          ) : isUsingOverdraft() ? (
            <div className="flex items-center text-amber-600 font-medium">
              <CircleDollarSign className="mr-2 h-4 w-4" />
              Atenção aos gastos
            </div>
          ) : (
            <div className="flex items-center text-green-600 font-medium">
              <TrendingUp className="mr-2 h-4 w-4" />
              Situação estável
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function IncomeCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/dashboard/monthly-summary'],
  });

  const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">Receitas do Mês</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
              </div>
            </div>
            
            {isLoading ? (
              <Skeleton className="h-10 w-36" />
            ) : (
              <div className="text-3xl font-bold text-slate-800 mb-2">
                {formatCurrency(data?.totalIncome)}
              </div>
            )}
            
            <a 
              href="/transactions" 
              className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 transition-colors group"
            >
              Ver detalhes
              <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExpenseCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/dashboard/monthly-summary'],
  });

  const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  return (
    <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">Despesas do Mês</h3>
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1"></div>
              </div>
            </div>
            
            {isLoading ? (
              <Skeleton className="h-10 w-36" />
            ) : (
              <div className="text-3xl font-bold text-slate-800 mb-2">
                {formatCurrency(data?.totalExpense)}
              </div>
            )}
            
            <a 
              href="/transactions" 
              className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700 transition-colors group"
            >
              Ver detalhes
              <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OverdraftCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/dashboard/balance'],
  });

  const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <CircleDollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">Cheque Especial</h3>
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-1"></div>
              </div>
            </div>
            
            {isLoading ? (
              <Skeleton className="h-10 w-36" />
            ) : (
              <div className="text-3xl font-bold text-slate-800 mb-2">
                {formatCurrency(data?.overdraftLimit)}
              </div>
            )}
            
            <a 
              href="/settings" 
              className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors group"
            >
              Ajustar limite
              <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
