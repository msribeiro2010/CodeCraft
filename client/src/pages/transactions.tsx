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
      {/* Header moderno */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 px-8 py-12">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Transações</h1>
              <p className="text-purple-100 text-lg">Controle suas receitas e despesas</p>
            </div>
            
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="lg" className="bg-red-600 hover:bg-red-700 shadow-lg">
                  <Trash2 className="h-5 w-5 mr-2" />
                  Limpar Todas
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl">Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription className="text-base">
                    Esta ação irá excluir TODAS as suas transações, faturas e lembretes permanentemente. 
                    Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => clearAllMutation.mutate()}
                    disabled={clearAllMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 rounded-xl"
                  >
                    {clearAllMutation.isPending ? "Excluindo..." : "Sim, excluir tudo"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full"></div>
        </div>
      </div>
      
      {/* Card de saldo modernizado */}
      <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-xl rounded-2xl overflow-hidden mb-8">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Saldo Atual</CardTitle>
                {isLoadingBalance ? (
                  <Skeleton className="h-10 w-40 mt-2 rounded-lg" />
                ) : balanceData ? (
                  <div className={`mt-2 text-3xl font-bold ${parseFloat(balanceData.balance) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(parseFloat(balanceData.balance))}
                  </div>
                ) : (
                  <div className="mt-2 text-lg text-slate-500">Carregando saldo...</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-600 mb-1">Limite de Overdraft</p>
              <p className="text-lg font-bold text-blue-600">
                {balanceData && new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(parseFloat(balanceData.overdraftLimit))}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <TransactionList />
    </Layout>
  );
}
