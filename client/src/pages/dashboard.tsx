import { Layout } from '@/components/layout/layout';
import { 
  BalanceCard, 
  IncomeCard, 
  ExpenseCard, 
  OverdraftCard 
} from '@/components/dashboard/balance-card';
import { FinancialChart } from '@/components/dashboard/financial-chart';
import { UpcomingPayments } from '@/components/dashboard/upcoming-payments';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { OverdraftAlert } from '@/components/dashboard/overdraft-alert';

export default function Dashboard() {
  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Dashboard</h1>
      
      <div className="space-y-8">
        {/* Painel de Alerta de Limite */}
        <OverdraftAlert />

        {/* Card Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BalanceCard />
          <IncomeCard />
          <ExpenseCard />
          <OverdraftCard />
        </div>

        {/* Charts & Transaction Sections */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FinancialChart />
          <UpcomingPayments />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions />
      </div>
    </Layout>
  );
}
