import { Layout } from '@/components/layout/layout';
import { TransactionList } from '@/components/transactions/transaction-list';

export default function Transactions() {
  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Transações</h1>
      <TransactionList />
    </Layout>
  );
}
