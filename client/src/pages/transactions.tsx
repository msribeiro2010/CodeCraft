import { Layout } from '@/components/layout/layout';
import { TransactionList } from '@/components/transactions/transaction-list';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { deleteAllTransactions } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function Transactions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: balanceData, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['/api/dashboard/balance'],
  });

  const clearAllMutation = useMutation({
    mutationFn: deleteAllTransactions,
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Todas as transações foram excluídas com sucesso",
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir transações",
        variant: "destructive",
      });
    },
  });

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Transações</h1>
        
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Todas
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá excluir TODAS as suas transações, faturas e lembretes permanentemente. 
                Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => clearAllMutation.mutate()}
                disabled={clearAllMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {clearAllMutation.isPending ? "Excluindo..." : "Sim, excluir tudo"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
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
