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
    <Card className="shadow">
      <CardHeader>
        <CardTitle>Configurações</CardTitle>
        <CardDescription>
          Ajuste suas preferências e configurações financeiras
        </CardDescription>
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
