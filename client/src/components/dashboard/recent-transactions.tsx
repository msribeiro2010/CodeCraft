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
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="px-6 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium text-neutral-900">
          Últimas Transações
        </CardTitle>
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
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Descrição
                  </TableHead>
                  <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Categoria
                  </TableHead>
                  <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Data
                  </TableHead>
                  <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">
                    Valor
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions && transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="whitespace-nowrap text-sm font-medium text-neutral-900">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-neutral-500">
                      {getCategoryName(transaction.categoryId)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-neutral-500">
                      {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell className={`whitespace-nowrap text-sm font-medium text-right ${transaction.type === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
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
