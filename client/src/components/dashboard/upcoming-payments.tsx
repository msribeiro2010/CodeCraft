import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'wouter';

export function UpcomingPayments() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/transactions/upcoming'],
  });

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  const getRelativeDateText = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) {
      return 'Vence hoje!';
    }
    
    return `Vence ${formatDistance(date, today, { addSuffix: true, locale: ptBR })}`;
  };

  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-neutral-900">
          A Vencer em Breve
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : data && data.length > 0 ? (
          <div className="flow-root">
            <ul role="list" className="divide-y divide-neutral-200">
              {data.map((transaction: any) => (
                <li key={transaction.id} className="py-4 px-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className="h-8 w-8 rounded-full bg-red-600 text-white flex items-center justify-center">
                        <TrendingDown className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-neutral-500 truncate">
                        {getRelativeDateText(transaction.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="py-8 px-6 text-center">
            <p className="text-neutral-500">Não há pagamentos a vencer em breve</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4">
        <Button asChild variant="outline" className="w-full">
          <Link href="/transactions">Ver todos</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
