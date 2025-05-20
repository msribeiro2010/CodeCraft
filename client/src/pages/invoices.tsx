import { Layout } from '@/components/layout/layout';
import { InvoiceUpload } from '@/components/invoices/invoice-upload';
import { InvoiceList } from '@/components/invoices/invoice-list';

export default function Invoices() {
  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Faturas</h1>
      
      <div className="space-y-8">
        <InvoiceUpload />
        <InvoiceList />
      </div>
    </Layout>
  );
}
