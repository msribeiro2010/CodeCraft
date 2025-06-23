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

  // Se o saldo atual é negativo, já está usando o cheque especial
  const overdraftUsed = currentBalance < 0 ? Math.abs(currentBalance) : 0;
  
  // Verifica se ultrapassou completamente o cheque especial
  const isOverTotalLimit = overdraftUsed > overdraftLimit;
  const amountExceeded = isOverTotalLimit ? overdraftUsed - overdraftLimit : 0;
  
  // Limite restante do cheque especial
  const overdraftRemaining = overdraftLimit - overdraftUsed;
  
  // Se está usando o cheque especial (saldo negativo)
  const isUsingOverdraft = overdraftUsed > 0;
  
  // Percentual de uso do cheque especial baseado no saldo atual
  const overdraftUsagePercent = overdraftLimit > 0 ? Math.min((overdraftUsed / overdraftLimit) * 100, 100) : 0;

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white pb-6">
        <CardTitle className="text-xl font-bold flex items-center">
          <div className="p-2 bg-white/20 rounded-lg mr-3">
            <Shield className="h-6 w-6" />
          </div>
          Monitoramento Financeiro Inteligente
        </CardTitle>
        <p className="text-indigo-100 text-sm mt-2">
          Acompanhe seus limites em tempo real
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Alerta principal se ultrapassou completamente o limite */}
        {isOverTotalLimit && (
          <div className="relative p-6 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl text-white animate-pulse">
            <div className="absolute top-4 right-4">
              <AlertTriangle className="h-8 w-8 opacity-80" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold">⚠️ Limite Ultrapassado</h3>
              <div className="text-red-100 space-y-2">
                <p className="font-semibold">Você excedeu seu cheque especial em {formatCurrency(amountExceeded)}</p>
                <p className="text-sm">Limite restante: -{formatCurrency(Math.abs(overdraftRemaining))} de {formatCurrency(overdraftLimit)}</p>
                <p className="text-sm bg-white/20 p-3 rounded-lg">
                  🔴 Ação necessária: Revisar gastos urgentemente
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alerta se está usando cheque especial mas ainda dentro do limite */}
        {isUsingOverdraft && !isOverTotalLimit && (
          <div className="relative p-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl text-white">
            <div className="absolute top-4 right-4">
              <TrendingDown className="h-6 w-6 opacity-80" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold">⚡ Usando Cheque Especial</h3>
              <div className="text-orange-100 space-y-2">
                <p className="font-semibold">Valor utilizado: {formatCurrency(overdraftUsed)}</p>
                <p className="text-sm">Limite restante: {formatCurrency(overdraftRemaining)} de {formatCurrency(overdraftLimit)}</p>
                <p className="text-sm bg-white/20 p-3 rounded-lg">
                  🟡 Monitore os gastos para manter o controle
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status geral em verde se tudo está ok */}
        {!isUsingOverdraft && (
          <div className="relative p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white">
            <div className="absolute top-4 right-4">
              <Shield className="h-6 w-6 opacity-80" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold">✅ Situação Estável</h3>
              <div className="text-green-100 space-y-2">
                <p className="font-semibold">Finanças dentro do limite seguro</p>
                <p className="text-sm bg-white/20 p-3 rounded-lg">
                  🟢 Cheque especial disponível: {formatCurrency(overdraftLimit)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informações detalhadas com cards modernos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl space-y-3">
            <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Movimentação Mensal</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <span className="text-slate-600 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Receitas
                </span>
                <span className="font-bold text-green-600">{formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <span className="text-slate-600 flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  Despesas
                </span>
                <span className="font-bold text-red-600">{formatCurrency(totalExpense)}</span>
              </div>
              {isUsingOverdraft && (
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-amber-700 flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                    Cheque especial usado
                  </span>
                  <span className="font-bold text-amber-700">{formatCurrency(overdraftUsed)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl space-y-3">
            <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Status Atual</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <span className="text-slate-600">Saldo atual</span>
                <span className={`font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(currentBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <span className="text-slate-600">Limite total</span>
                <span className="font-bold text-blue-600">{formatCurrency(overdraftLimit)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <span className="text-slate-600">Disponível</span>
                <span className={`font-bold ${overdraftRemaining >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {overdraftRemaining >= 0 ? formatCurrency(overdraftRemaining) : `-${formatCurrency(Math.abs(overdraftRemaining))}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progresso moderna do cheque especial */}
        {overdraftLimit > 0 && (
          <div className="bg-gradient-to-r from-slate-50 to-white p-5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-700 font-medium">Uso do Cheque Especial</span>
              <span className={`font-bold text-lg ${
                overdraftUsagePercent > 100 ? 'text-red-600' :
                overdraftUsagePercent > 80 ? 'text-amber-600' : 'text-blue-600'
              }`}>
                {overdraftUsagePercent > 100 ? '100%+ ⚠️' : `${overdraftUsagePercent.toFixed(1)}%`}
              </span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-slate-200 rounded-full h-4 shadow-inner">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 shadow-sm ${
                    overdraftUsagePercent > 100 ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' :
                    overdraftUsagePercent > 80 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                    overdraftUsagePercent > 50 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 
                    'bg-gradient-to-r from-blue-400 to-blue-600'
                  }`}
                  style={{ width: `${Math.min(overdraftUsagePercent, 100)}%` }}
                />
                
                {/* Marcadores na barra */}
                <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-white/50 transform -translate-x-px"></div>
                <div className="absolute top-0" style={{ left: '80%' }}>
                  <div className="w-0.5 h-4 bg-white/70"></div>
                </div>
              </div>
              
              {overdraftUsagePercent > 100 && (
                <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <div className="text-sm text-red-800 font-semibold text-center">
                    🚨 LIMITE ULTRAPASSADO - Ação Necessária!
                  </div>
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