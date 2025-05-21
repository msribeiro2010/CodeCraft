import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { PlusCircle, Pencil, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionForm } from './transaction-form';
import { InvoiceViewModal } from '../invoices/invoice-view-modal';
import { deleteTransaction } from '@/lib/api';

export function TransactionList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<any>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<any[]>({
    queryKey: ['/api/transactions'],
  });
  
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });
  
  const isLoading = isLoadingTransactions || isLoadingCategories;

  const formatCurrency = (value: string | number, type: 'RECEITA' | 'DESPESA') => {
    const prefix = type === 'RECEITA' ? '+ ' : '- ';
    return prefix + new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  const getCategoryName = (categoryId: number) => {
    if (!categories) return '';
    const category = categories.find((c: any) => c.id === categoryId);
    return category ? category.name : '';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAGO':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Pago</Badge>;
      case 'A_VENCER':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">A Vencer</Badge>;
      case 'PAGAR':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Pagar</Badge>;
      default:
        return null;
    }
  };

  const handleEditTransaction = (transaction: any) => {
    setTransactionToEdit(transaction);
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
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell>{getCategoryName(transaction.categoryId)}</TableCell>
                        <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className={transaction.type === 'RECEITA' ? 'text-green-600' : 'text-red-600'}>
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
