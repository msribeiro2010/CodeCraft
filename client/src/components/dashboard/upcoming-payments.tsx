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

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    return date.getTime() === today.getTime();
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-0 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl font-bold">A Vencer em Breve</CardTitle>
            <p className="text-purple-100 text-sm mt-1">Próximos vencimentos</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : data && Array.isArray(data) && data.length > 0 ? (
          <div className="p-4 space-y-4">
            {data.map((transaction: any) => (
              <div 
                key={transaction.id} 
                className={`p-4 rounded-xl transition-all duration-300 ${
                  isToday(transaction.date) 
                    ? 'bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-300 shadow-lg animate-pulse' 
                    : 'bg-white hover:shadow-md border border-purple-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-xl shadow-sm ${
                      isToday(transaction.date)
                        ? 'bg-gradient-to-br from-red-500 to-red-600 animate-bounce shadow-lg shadow-red-300'
                        : 'bg-gradient-to-br from-amber-400 to-orange-500'
                    }`}>
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base font-semibold truncate ${
                      isToday(transaction.date) 
                        ? 'text-red-800 font-bold' 
                        : 'text-slate-800'
                    }`}>
                      {transaction.description}
                    </p>
                    <p className={`text-sm truncate ${
                      isToday(transaction.date)
                        ? 'text-red-600 font-semibold animate-pulse'
                        : 'text-slate-600'
                    }`}>
                      {getRelativeDateText(transaction.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      isToday(transaction.date)
                        ? 'text-red-700 text-xl animate-pulse'
                        : 'text-red-600 text-lg'
                    }`}>
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
