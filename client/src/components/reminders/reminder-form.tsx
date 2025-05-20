import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { queryClient } from '@/lib/queryClient';

const reminderSchema = z.object({
  transactionId: z.string().min(1, 'Transação é obrigatória'),
  reminderDate: z.date({
    required_error: "Data do lembrete é obrigatória",
  }),
});

type ReminderFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ReminderForm({ isOpen, onClose }: ReminderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions'],
  });

  const form = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      transactionId: '',
      reminderDate: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof reminderSchema>) {
    setIsLoading(true);
    try {
      const formattedValues = {
        ...values,
        transactionId: parseInt(values.transactionId),
      };

      await apiRequest('POST', '/api/reminders', formattedValues);
      
      toast({
        title: "Lembrete criado",
        description: "O lembrete foi criado com sucesso",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      onClose();
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o lembrete",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Filter transactions to only show those that are 'A_VENCER'
  const upcomingTransactions = transactions?.filter(
    (transaction: any) => transaction.status === 'A_VENCER'
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Lembrete</DialogTitle>
          <DialogDescription>
            Crie um lembrete para uma transação pendente
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transação</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma transação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {upcomingTransactions.length > 0 ? (
                        upcomingTransactions.map((transaction: any) => (
                          <SelectItem 
                            key={transaction.id} 
                            value={transaction.id.toString()}
                          >
                            {transaction.description} - R$ {Number(transaction.amount).toFixed(2)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-transactions" disabled>
                          Nenhuma transação a vencer disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Apenas transações com status "A Vencer" são mostradas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reminderDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do Lembrete</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          disabled={isLoading}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    O lembrete será enviado nesta data
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || upcomingTransactions.length === 0}>
                {isLoading ? 'Salvando...' : 'Criar Lembrete'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
