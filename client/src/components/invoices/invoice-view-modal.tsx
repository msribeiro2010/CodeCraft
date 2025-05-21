import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, FileText } from 'lucide-react';

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number | null;
}

export function InvoiceViewModal({ isOpen, onClose, invoiceId }: InvoiceViewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    async function fetchInvoice() {
      if (!invoiceId || !isOpen) return;
      
      setIsLoading(true);
      try {
        const invoiceData = await apiRequest(
          `/api/invoices/${invoiceId}`,
          { method: 'GET' },
          'returnNull'
        );
        setInvoice(invoiceData);
      } catch (error) {
        console.error('Erro ao carregar fatura:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvoice();
  }, [invoiceId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Visualizar Fatura</DialogTitle>
          <DialogDescription>
            Detalhes da fatura anexada à transação
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : invoice ? (
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Data de upload:</p>
                <p>{new Date(invoice.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              
              {invoice.processedText && (
                <div className="mb-4">
                  <p className="text-sm font-medium">Texto extraído:</p>
                  <div className="mt-1 p-2 bg-muted rounded-md text-sm">
                    <pre className="whitespace-pre-wrap">{invoice.processedText}</pre>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Imagem da fatura:</p>
                {invoice.fileContent ? (
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={`data:image/jpeg;base64,${invoice.fileContent}`} 
                      alt="Fatura" 
                      className="w-full object-contain max-h-[400px]"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 bg-muted rounded-md">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <p className="ml-2 text-sm text-muted-foreground">Imagem não disponível</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>Fechar</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-60">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Fatura não encontrada</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}