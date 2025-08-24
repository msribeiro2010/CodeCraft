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
      {/* Header moderno com gradiente */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-12">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold text-white mb-2 font-display">Dashboard Financeiro</h1>
            <p className="text-blue-100 text-lg">Monitore suas finanças de forma inteligente</p>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full"></div>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Painel de Alerta de Limite */}
        <OverdraftAlert />

        {/* Card Grid com novo design */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <BalanceCard />
          <IncomeCard />
          <ExpenseCard />
          <OverdraftCard />
        </div>

        {/* Charts & Transaction Sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <FinancialChart />
          <UpcomingPayments />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions />
      </div>
    </Layout>
  );
}
