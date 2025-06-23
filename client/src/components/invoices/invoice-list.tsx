import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { Eye, FileText, Upload, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { InvoiceUploadModal } from './invoice-upload-modal';
import { deleteInvoice } from '@/lib/api';

export function InvoiceList() {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['/api/invoices'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteInvoice(id),
    onSuccess: () => {
      toast({
        title: "Fatura excluída",
        description: "A fatura foi excluída com sucesso",
      });
      setInvoiceToDelete(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a fatura",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const viewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
  };
  
  const handleUploadSuccess = () => {
    // Recarregar a lista de faturas
    queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    deleteMutation.mutate(invoiceToDelete.id);
  };

  return (
    <>
      <Card className="shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Faturas Processadas</CardTitle>
            <CardDescription>Gerencie suas faturas e boletos</CardDescription>
          </div>
          <Button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1"
          >
            <Upload className="h-4 w-4" />
            Nova Fatura
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>Lista de todas as suas faturas processadas.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Data de Upload</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices && invoices.length > 0 ? (
                    invoices.map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-neutral-500" />
                            {invoice.filename}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewInvoice(invoice)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Visualizar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInvoiceToDelete(invoice)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">
                        Nenhuma fatura processada encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Fatura</DialogTitle>
            <DialogDescription>
              Texto extraído do arquivo: {selectedInvoice?.filename}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96 rounded-md border p-4">
            <pre className="text-sm whitespace-pre-wrap">
              {selectedInvoice?.processedText || "Nenhum texto extraído"}
            </pre>
          </ScrollArea>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Upload de Faturas */}
      <InvoiceUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Fatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a fatura "{invoiceToDelete?.filename}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteInvoice}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
