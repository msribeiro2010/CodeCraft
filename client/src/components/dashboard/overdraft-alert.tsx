import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, TrendingDown, Shield } from 'lucide-react';

export function OverdraftAlert() {
  const { data: balanceData, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['/api/dashboard/balance'],
  });

  const { data: monthlyData, isLoading: isLoadingMonthly } = useQuery({
    queryKey: ['/api/dashboard/monthly-summary'],
  });

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  if (isLoadingBalance || isLoadingMonthly) {
    return (
      <Card className="bg-white shadow rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-neutral-900">
            Monitoramento de Limite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!balanceData || !monthlyData) {
    return null;
  }

  const currentBalance = parseFloat(balanceData.balance);
  const overdraftLimit = parseFloat(balanceData.overdraftLimit);
  const totalIncome = parseFloat(monthlyData.totalIncome);
  const totalExpense = parseFloat(monthlyData.totalExpense);

  // Limite total disponível (saldo atual + cheque especial)
  const totalAvailable = currentBalance + overdraftLimit;
  
  // Verifica se as despesas ultrapassam o limite disponível
  const isOverLimit = totalExpense > (totalIncome + overdraftLimit);
  
  // Calcula quanto está sendo usado do cheque especial
  const overdraftUsed = currentBalance < 0 ? Math.abs(currentBalance) : 0;
  const overdraftRemaining = overdraftLimit - overdraftUsed;
  
  // Percentual de uso do cheque especial
  const overdraftUsagePercent = overdraftLimit > 0 ? (overdraftUsed / overdraftLimit) * 100 : 0;

  // Calcula o déficit se houver
  const deficit = totalExpense - totalIncome;
  const isInDeficit = deficit > 0;

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-neutral-900 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-600" />
          Monitoramento de Limite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerta principal se ultrapassou o limite */}
        {isOverLimit && (
          <Alert className="border-red-500 bg-red-50 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              <strong>ATENÇÃO:</strong> Suas despesas ultrapassaram o limite disponível!
              <br />
              Déficit: {formatCurrency(deficit - overdraftLimit)}
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta se está usando cheque especial */}
        {overdraftUsed > 0 && !isOverLimit && (
          <Alert className="border-orange-500 bg-orange-50">
            <TrendingDown className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Você está usando o cheque especial: {formatCurrency(overdraftUsed)}
            </AlertDescription>
          </Alert>
        )}

        {/* Status geral em verde se tudo está ok */}
        {!isOverLimit && overdraftUsed === 0 && (
          <Alert className="border-green-500 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Suas finanças estão dentro do limite seguro
            </AlertDescription>
          </Alert>
        )}

        {/* Informações detalhadas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-600">Receita do mês:</span>
              <span className="font-medium text-green-600">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Despesa do mês:</span>
              <span className="font-medium text-red-600">{formatCurrency(totalExpense)}</span>
            </div>
            {isInDeficit && (
              <div className="flex justify-between border-t pt-2">
                <span className="text-neutral-600">Déficit:</span>
                <span className="font-bold text-red-600">{formatCurrency(deficit)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-600">Saldo atual:</span>
              <span className={`font-medium ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(currentBalance)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Limite cheque especial:</span>
              <span className="font-medium text-blue-600">{formatCurrency(overdraftLimit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Limite disponível:</span>
              <span className="font-medium text-orange-600">{formatCurrency(overdraftRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Barra de progresso do cheque especial */}
        {overdraftLimit > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Uso do cheque especial:</span>
              <span className="font-medium">{overdraftUsagePercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  overdraftUsagePercent > 80 ? 'bg-red-500' :
                  overdraftUsagePercent > 50 ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(overdraftUsagePercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Resumo do limite total */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-700">Limite total disponível:</span>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(totalAvailable)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}