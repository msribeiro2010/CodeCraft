import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { updateUserSettings } from '@/lib/api';
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
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const settingsSchema = z.object({
  initialBalance: z.string().min(1, 'Saldo inicial é obrigatório'),
  overdraftLimit: z.string().min(1, 'Limite de cheque especial é obrigatório'),
  notificationsEnabled: z.boolean(),
});

export function SettingsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      initialBalance: '',
      overdraftLimit: '',
      notificationsEnabled: true,
    },
  });

  // Update form values when user data is loaded
  useState(() => {
    if (userData && userData.user) {
      form.reset({
        initialBalance: userData.user.initialBalance.toString(),
        overdraftLimit: userData.user.overdraftLimit.toString(),
        notificationsEnabled: userData.user.notificationsEnabled,
      });
    }
  });

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    setIsLoading(true);
    
    try {
      await updateUserSettings({
        initialBalance: values.initialBalance,
        overdraftLimit: values.overdraftLimit,
        notificationsEnabled: values.notificationsEnabled,
      });
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso",
      });
    } catch (error) {
      console.error('Settings update error:', error);
      toast({
        title: "Erro ao salvar configurações",
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao salvar suas configurações. Por favor, tente novamente.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">Configurações do Sistema</CardTitle>
            <CardDescription className="text-slate-600 mt-1">
              Ajuste suas preferências e configurações financeiras
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {isUserLoading ? (
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="initialBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Inicial (R$)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" disabled={isLoading} />
                    </FormControl>
                    <FormDescription>
                      Define seu saldo inicial. Pode ser negativo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="overdraftLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Cheque Especial (R$)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" disabled={isLoading} />
                    </FormControl>
                    <FormDescription>
                      Valor máximo que você pode utilizar do cheque especial.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notificationsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Ativar notificações
                      </FormLabel>
                      <FormDescription>
                        Receba lembretes sobre pagamentos e transações.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar configurações'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      )}
    </Card>
  );
}
