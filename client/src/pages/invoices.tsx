import { Layout } from '@/components/layout/layout';
import { InvoiceUpload } from '@/components/invoices/invoice-upload';
import { InvoiceList } from '@/components/invoices/invoice-list';

export default function Invoices() {
  return (
    <Layout>
      {/* Header moderno com gradiente */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800 px-8 py-12">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold text-white mb-2 font-display">Gerenciar Faturas</h1>
            <p className="text-cyan-100 text-lg">Processe e organize suas faturas com OCR inteligente</p>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full"></div>
          
          {/* Ícone decorativo */}
          <div className="absolute top-6 right-8 opacity-20">
            <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        <InvoiceUpload />
        <InvoiceList />
      </div>
    </Layout>
  );
}
