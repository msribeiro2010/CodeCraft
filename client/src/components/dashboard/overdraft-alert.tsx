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

  // Calcula o déficit (quanto está gastando além da receita)
  const deficit = totalExpense - totalIncome;
  const isInDeficit = deficit > 0;
  
  // Verifica se está usando o cheque especial
  const overdraftUsed = currentBalance < 0 ? Math.abs(currentBalance) : 0;
  
  // Verifica se ultrapassou completamente o cheque especial
  const totalExceeded = deficit > overdraftLimit;
  const amountExceeded = totalExceeded ? deficit - overdraftLimit : 0;
  
  // Limite restante do cheque especial
  const overdraftRemaining = overdraftLimit - overdraftUsed;
  
  // Se o déficit é maior que o cheque especial, está gastando além do limite total
  const isOverTotalLimit = deficit > overdraftLimit;
  
  // Percentual de uso do cheque especial baseado no déficit
  const overdraftUsagePercent = overdraftLimit > 0 ? Math.min((deficit / overdraftLimit) * 100, 100) : 0;

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-neutral-900 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-600" />
          Monitoramento de Limite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerta principal se ultrapassou completamente o limite */}
        {isOverTotalLimit && (
          <Alert className="border-red-500 bg-red-50 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              <strong>Você está usando o valor acima do cheque especial e da receita</strong>
              <br />
              <strong>Você está usando {formatCurrency(amountExceeded)} além do seu cheque especial!</strong>
              <br />
              Limite restante: -{formatCurrency(Math.abs(overdraftRemaining))} de {formatCurrency(overdraftLimit)}
              <br />
              <strong>Atenção: Despesas futuras podem comprometer seu orçamento.</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta se está usando cheque especial mas ainda dentro do limite */}
        {isInDeficit && !isOverTotalLimit && (
          <Alert className="border-orange-500 bg-orange-50">
            <TrendingDown className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 font-medium">
              <strong>Você está usando {formatCurrency(deficit)} do seu cheque especial!</strong>
              <br />
              Limite restante: {formatCurrency(overdraftRemaining)} de {formatCurrency(overdraftLimit)}
              <br />
              Atenção: Monitore seus gastos para não ultrapassar o limite.
            </AlertDescription>
          </Alert>
        )}

        {/* Status geral em verde se tudo está ok */}
        {!isInDeficit && (
          <Alert className="border-green-500 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Suas finanças estão dentro do limite seguro. Você tem {formatCurrency(overdraftLimit)} de cheque especial disponível.
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
                <span className="text-neutral-600">Déficit (usando do cheque especial):</span>
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
              <span className="text-neutral-600">Cheque especial restante:</span>
              <span className={`font-medium ${overdraftRemaining >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {overdraftRemaining >= 0 ? formatCurrency(overdraftRemaining) : `-${formatCurrency(Math.abs(overdraftRemaining))}`}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de progresso do cheque especial */}
        {overdraftLimit > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Uso do cheque especial:</span>
              <span className="font-medium">
                {overdraftUsagePercent > 100 ? '100%+ (EXCEDEU)' : `${overdraftUsagePercent.toFixed(1)}%`}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  overdraftUsagePercent > 100 ? 'bg-red-600 animate-pulse' :
                  overdraftUsagePercent > 80 ? 'bg-red-500' :
                  overdraftUsagePercent > 50 ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(overdraftUsagePercent, 100)}%` }}
              />
              {overdraftUsagePercent > 100 && (
                <div className="text-xs text-red-600 font-bold mt-1 text-center">
                  LIMITE ULTRAPASSADO!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resumo do limite total */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-700">
              {isOverTotalLimit ? 'Valor excedido além do limite:' : 'Limite do cheque especial:'}
            </span>
            <span className={`text-lg font-bold ${isOverTotalLimit ? 'text-red-600' : 'text-blue-600'}`}>
              {isOverTotalLimit ? formatCurrency(amountExceeded) : formatCurrency(overdraftLimit)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}