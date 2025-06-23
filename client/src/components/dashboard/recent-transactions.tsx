import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Transaction = {
  id: number;
  description: string;
  type: 'RECEITA' | 'DESPESA';
  categoryId: number;
  amount: string;
  date: string;
  status: 'A_VENCER' | 'PAGAR' | 'PAGO';
};

type Category = {
  id: number;
  name: string;
};

export function RecentTransactions() {
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/recent'],
    refetchInterval: 3000, // Atualiza a cada 3 segundos
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
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
    const category = categories.find(c => c.id === categoryId);
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

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 px-6 py-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">Últimas Transações</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Movimentações financeiras recentes</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-50">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider px-6 py-4">
                    Descrição
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Categoria
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Data
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider text-right px-6">
                    Valor
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions && transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-all duration-200">
                    <TableCell className="whitespace-nowrap text-sm font-semibold text-slate-800 px-6 py-4">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-slate-600 font-medium">
                      {getCategoryName(transaction.categoryId)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-slate-600">
                      {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell className={`whitespace-nowrap text-sm font-bold text-right px-6 ${transaction.type === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(transaction.amount, transaction.type)}
                    </TableCell>
                  </TableRow>
                ))}
                {transactions && transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-neutral-500">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-white px-4 py-3 border-t border-neutral-200">
        <div className="flex-1 flex justify-between">
          <Button asChild variant="outline">
            <Link href="/transactions">Ver todas as transações</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
