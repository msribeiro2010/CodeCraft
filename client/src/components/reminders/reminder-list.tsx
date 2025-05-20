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
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, BellRing, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReminderForm } from './reminder-form';
import { queryClient } from '@/lib/queryClient';

export function ReminderList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: reminders, isLoading: isLoadingReminders } = useQuery({
    queryKey: ['/api/reminders'],
  });
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['/api/transactions'],
  });
  
  const isLoading = isLoadingReminders || isLoadingTransactions;

  const getTransactionDetails = (transactionId: number) => {
    if (!transactions) return { description: 'Carregando...', amount: '0' };
    const transaction = transactions.find((t: any) => t.id === transactionId);
    return transaction 
      ? { description: transaction.description, amount: transaction.amount, type: transaction.type } 
      : { description: 'Transação não encontrada', amount: '0', type: 'DESPESA' };
  };

  const formatCurrency = (value: string | number, type: 'RECEITA' | 'DESPESA') => {
    const prefix = type === 'RECEITA' ? '+ ' : '- ';
    return prefix + new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  const markAsSent = async (reminderId: number) => {
    try {
      await apiRequest('PATCH', `/api/reminders/${reminderId}/mark-sent`);
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      toast({
        title: "Lembrete atualizado",
        description: "O lembrete foi marcado como enviado",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o lembrete",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="shadow">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
          <CardTitle>Lembretes</CardTitle>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Novo Lembrete
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>Lista de todos os seus lembretes configurados.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transação</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data do Lembrete</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders && reminders.length > 0 ? (
                    reminders.map((reminder: any) => {
                      const transaction = getTransactionDetails(reminder.transactionId);
                      return (
                        <TableRow key={reminder.id}>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>
                            {formatCurrency(transaction.amount, transaction.type)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(reminder.reminderDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            {reminder.sent ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Enviado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                Pendente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!reminder.sent && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsSent(reminder.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Marcar como Enviado
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <BellRing className="h-8 w-8 text-neutral-400" />
                          <p className="text-neutral-500">Nenhum lembrete configurado</p>
                          <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)}>
                            Criar lembrete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ReminderForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </>
  );
}
