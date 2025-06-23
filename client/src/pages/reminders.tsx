import { Layout } from '@/components/layout/layout';
import { ReminderList } from '@/components/reminders/reminder-list';

export default function Reminders() {
  return (
    <Layout>
      {/* Header moderno com gradiente */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-pink-700 to-purple-800 px-8 py-12">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold text-white mb-2">Lembretes</h1>
            <p className="text-rose-100 text-lg">Mantenha-se em dia com seus compromissos financeiros</p>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full"></div>
          
          {/* Ícone decorativo */}
          <div className="absolute top-6 right-8 opacity-20">
            <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5zM12 17a9 9 0 100-18 9 9 0 000 18zm0-9v4l3 3" />
            </svg>
          </div>
        </div>
      </div>
      
      <ReminderList />
    </Layout>
  );
}
