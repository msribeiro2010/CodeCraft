import { Layout } from '@/components/layout/layout';
import { SettingsForm } from '@/components/settings/settings-form';

export default function Settings() {
  return (
    <Layout>
      {/* Header moderno com gradiente */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 px-8 py-12">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold text-white mb-2 font-display">Configurações</h1>
            <p className="text-emerald-100 text-lg">Personalize sua experiência financeira</p>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full"></div>
          
          {/* Ícone decorativo */}
          <div className="absolute top-6 right-8 opacity-20">
            <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <SettingsForm />
    </Layout>
  );
}
