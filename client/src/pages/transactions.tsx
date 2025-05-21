import { Layout } from '@/components/layout/layout';
import { TransactionList } from '@/components/transactions/transaction-list';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Transactions() {
  const { data: balanceData, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['/api/dashboard/balance'],
  });

  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Transações</h1>
      
      <Card className="shadow mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Saldo Atual</CardTitle>
            {isLoadingBalance ? (
              <Skeleton className="h-8 w-32 mt-2" />
            ) : balanceData ? (
              <div className="mt-2 text-3xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(parseFloat(balanceData.balance))}
              </div>
            ) : (
              <div className="mt-2 text-lg text-muted-foreground">Carregando saldo...</div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="mb-1">
              <span className="font-medium">Saldo Inicial:</span> {balanceData && new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(parseFloat(balanceData.initialBalance))}
            </div>
            <div>
              <span className="font-medium">Limite de Overdraft:</span> {balanceData && new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(parseFloat(balanceData.overdraftLimit))}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <TransactionList />
    </Layout>
  );
}
