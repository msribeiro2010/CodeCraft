import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, TrendingDown, TrendingUp, CircleDollarSign } from 'lucide-react';
import { Decimal } from 'decimal.js';

export function BalanceCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/dashboard/balance'],
  });

  const formatCurrency = (value: string | number) => {
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

  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CreditCard className="h-6 w-6 text-neutral-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">Saldo Atual</dt>
              <dd className="flex items-baseline">
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className={`text-2xl font-semibold ${isNegative() ? 'text-red-600' : 'text-neutral-900'}`}>
                    {formatCurrency(data.balance)}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <div className={`px-5 py-3 ${isNegative() ? 'bg-red-50' : 'bg-neutral-50'}`}>
        <div className="text-sm">
          {isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : isNegative() ? (
            <span className="font-medium text-red-600 flex items-center">
              <TrendingDown className="mr-1 h-4 w-4" />
              Você está usando {formatCurrency(data.overdraftLimit)} de cheque especial!
            </span>
          ) : isUsingOverdraft() ? (
            <span className="font-medium text-amber-600 flex items-center">
              <CircleDollarSign className="mr-1 h-4 w-4" />
              Cuidado! Seu saldo está diminuindo.
            </span>
          ) : (
            <span className="font-medium text-green-600 flex items-center">
              <TrendingUp className="mr-1 h-4 w-4" />
              Você está no positivo!
            </span>
          )}
        </div>
      </div>
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
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">Receitas (Mês)</dt>
              <dd className="flex items-baseline">
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-2xl font-semibold text-neutral-900">
                    {formatCurrency(data?.totalIncome)}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <div className="bg-neutral-50 px-5 py-3">
        <div className="text-sm">
          <a href="/transactions" className="font-medium text-primary hover:text-primary-dark">
            Ver detalhes
          </a>
        </div>
      </div>
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
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">Despesas (Mês)</dt>
              <dd className="flex items-baseline">
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-2xl font-semibold text-neutral-900">
                    {formatCurrency(data?.totalExpense)}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <div className="bg-neutral-50 px-5 py-3">
        <div className="text-sm">
          <a href="/transactions" className="font-medium text-primary hover:text-primary-dark">
            Ver detalhes
          </a>
        </div>
      </div>
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
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CircleDollarSign className="h-6 w-6 text-amber-500" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">Cheque Especial</dt>
              <dd className="flex items-baseline">
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-2xl font-semibold text-neutral-900">
                    {formatCurrency(data?.overdraftLimit)}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <div className="bg-neutral-50 px-5 py-3">
        <div className="text-sm">
          <a href="/settings" className="font-medium text-primary hover:text-primary-dark">
            Ajustar limite
          </a>
        </div>
      </div>
    </Card>
  );
}
