import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, Trash2, Eye, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionForm } from './transaction-form';
import { InvoiceViewModal } from '../invoices/invoice-view-modal';
import { deleteTransaction, updateTransactionStatus } from '@/lib/api';

export function TransactionList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<any>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<any[]>({
    queryKey: ['/api/transactions'],
  });

  // Debug: verificar dados recebidos
  if (transactions.length > 0) {
    const trans7 = transactions.find((t: any) => t.id === 7);
    if (trans7) {
      console.log('🔍 [TRANSACTION-LIST] Transação 7 recebida:', trans7);
    }
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'A_VENCER' | 'PAGO' }) => {
      console.log('Executando mutation para ID:', id, 'Status:', status);
      return updateTransactionStatus(id, status);
    },
    onSuccess: (data) => {
      console.log('Mutation success:', data);
      toast({
        title: "Status atualizado",
        description: "O status da transação foi alterado com sucesso",
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da transação",
        variant: "destructive",
      });
    },
  });
  
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });
  
  const { data: balanceData, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['/api/dashboard/balance'],
  });
  
  const isLoading = isLoadingTransactions || isLoadingCategories || isLoadingBalance;

  const formatCurrency = (value: string | number, type: 'RECEITA' | 'DESPESA') => {
    const numValue = Number(value);
    const absValue = Math.abs(numValue);
    
    // Se o valor já é negativo, mantém o sinal original
    if (numValue < 0) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numValue);
    }
    
    // Caso contrário, aplica o prefixo baseado no tipo
    const prefix = type === 'RECEITA' ? '+ ' : '- ';
    return prefix + new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(absValue);
  };

  const getCategoryName = (categoryId: number) => {
    if (!categories) return '';
    const category = categories.find((c: any) => c.id === categoryId);
    return category ? category.name : '';
  };

  const getInstallmentBadge = (transaction: any) => {
    if (!transaction.isRecurring || !transaction.currentInstallment || !transaction.totalInstallments) {
      return null;
    }

    const progress = (transaction.currentInstallment / transaction.totalInstallments) * 100;

    return (
      <div className="flex items-center gap-2 mt-1">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <Repeat className="h-3 w-3" />
          Parcela {transaction.currentInstallment}/{transaction.totalInstallments}
        </Badge>
        <div className="flex-1 min-w-[80px] max-w-[120px]">
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    );
  };

  const getStatusBadge = (status: string, transactionId: number) => {
    const handleStatusClick = (currentStatus: string) => {
      console.log('🔥 CLIQUE DETECTADO! Status:', currentStatus, 'ID:', transactionId);
      const newStatus = currentStatus === 'PAGO' ? 'A_VENCER' : 'PAGO';
      console.log('🔄 Mudando para:', newStatus);
      statusMutation.mutate({ id: transactionId, status: newStatus });
    };

    const badgeClass = "cursor-pointer hover:opacity-80 transition-opacity select-none";

    switch (status) {
      case 'PAGO':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ${badgeClass}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🎯 Badge PAGO clicado!');
              handleStatusClick(status);
            }}
            title="Clique para marcar como A Vencer"
          >
            Pago
          </span>
        );
      case 'A_VENCER':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ${badgeClass}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🎯 Badge A_VENCER clicado!');
              handleStatusClick(status);
            }}
            title="Clique para marcar como Pago"
          >
            A Vencer
          </span>
        );
      // Mantendo o caso 'PAGAR' para compatibilidade com dados existentes
      case 'PAGAR':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ${badgeClass}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🎯 Badge PAGAR clicado!');
              handleStatusClick('A_VENCER');
            }}
            title="Clique para marcar como Pago"
          >
            A Vencer
          </span>
        );
      default:
        return null;
    }
  };

  const handleEditTransaction = (transaction: any) => {
    // Garantir que a data seja tratada corretamente convertendo para objeto Date
    const transactionToEdit = {
      ...transaction,
      date: new Date(transaction.date)
    };
    
    setTransactionToEdit(transactionToEdit);
    setIsFormOpen(true);
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    try {
      await deleteTransaction(transactionToDelete.id);
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso",
      });
      setTransactionToDelete(null);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a transação",
        variant: "destructive",
      });
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setTransactionToEdit(null);
  };

  return (
    <>
      <Card className="shadow">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
          <CardTitle>Transações</CardTitle>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Nova Transação
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>Lista de todas as suas transações.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions && transactions.length > 0 ? (
                    transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{transaction.description}</span>
                            {getInstallmentBadge(transaction)}
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryName(transaction.categoryId)}</TableCell>
                        <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell className="cursor-default">{getStatusBadge(transaction.status, transaction.id)}</TableCell>
                        <TableCell className={
                          Number(transaction.amount) < 0
                            ? 'text-red-600 font-semibold'
                            : transaction.type === 'RECEITA'
                              ? 'text-green-600'
                              : 'text-red-600'
                        }>
                          {formatCurrency(transaction.amount, transaction.type)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {transaction.invoiceId && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedInvoiceId(transaction.invoiceId);
                                  setIsInvoiceModalOpen(true);
                                }}
                                title="Visualizar Fatura"
                              >
                                <Eye className="h-4 w-4 text-blue-500" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditTransaction(transaction)}
                              title="Editar Transação"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setTransactionToDelete(transaction)}
                              title="Excluir Transação"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        Nenhuma transação encontrada. Clique em 'Nova Transação' para adicionar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={closeForm} 
        transactionToEdit={transactionToEdit} 
      />

      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para visualização de faturas */}
      <InvoiceViewModal 
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoiceId(null);
        }}
        invoiceId={selectedInvoiceId}
      />
    </>
  );
}
