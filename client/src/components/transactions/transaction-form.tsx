import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createTransaction, updateTransaction, uploadInvoice } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileUp, Loader2, Eye, FileImage } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { InvoiceViewModal } from '../invoices/invoice-view-modal';

const transactionSchema = z.object({
  type: z.enum(['RECEITA', 'DESPESA']),
  amount: z.string().min(1, 'Valor é obrigatório'),
  date: z.date({
    required_error: "Data é obrigatória",
  }),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  notes: z.string().optional(),
  status: z.enum(['A_VENCER', 'PAGAR', 'PAGO']),
});

type TransactionFormProps = {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: any;
};

export function TransactionForm({ isOpen, onClose, transactionToEdit }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedInvoiceId, setUploadedInvoiceId] = useState<number | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Defina um tipo para as categorias
  type Category = {
    id: number;
    name: string;
  };
  
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transactionToEdit?.type || 'DESPESA',
      amount: transactionToEdit?.amount?.toString() || '',
      date: transactionToEdit?.date ? new Date(transactionToEdit.date) : new Date(),
      categoryId: transactionToEdit?.categoryId?.toString() || '',
      description: transactionToEdit?.description || '',
      notes: transactionToEdit?.notes || '',
      status: transactionToEdit?.status || 'A_VENCER',
    },
  });
  
  // Inicializar o ID da fatura se estiver editando uma transação que já possui fatura
  useEffect(() => {
    if (transactionToEdit?.invoiceId) {
      setUploadedInvoiceId(transactionToEdit.invoiceId);
    }
  }, [transactionToEdit]);
  
  // Função para lidar com o upload de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Verificar se o arquivo é uma imagem
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          title: "Formato não suportado",
          description: "Por favor, faça upload apenas de arquivos de imagem (JPG, PNG, etc). PDFs não são suportados.",
          variant: "destructive"
        });
        return;
      }
      
      setInvoiceFile(selectedFile);
      
      // Criar URL para preview
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };
  
  // Função para fazer upload da fatura
  const handleUploadInvoice = async () => {
    if (!invoiceFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para fazer upload",
        variant: "destructive"
      });
      return;
    }
    
    setUploadingInvoice(true);
    try {
      const response = await uploadInvoice(invoiceFile);
      
      if (response && response.id) {
        setUploadedInvoiceId(response.id);
        toast({
          title: "Sucesso",
          description: "Fatura carregada com sucesso",
        });
      }
    } catch (error) {
      console.error('Erro ao fazer upload da fatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da fatura. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploadingInvoice(false);
    }
  };
  
  // Função para remover a fatura
  const handleRemoveInvoice = () => {
    setInvoiceFile(null);
    setPreviewUrl(null);
    if (!transactionToEdit) {
      // Se for uma nova transação, podemos limpar o ID da fatura
      setUploadedInvoiceId(null);
    }
    
    // Limpa o campo de input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  async function onSubmit(values: z.infer<typeof transactionSchema>) {
    setIsLoading(true);
    try {
      // Certifica-se de que o amount é uma string válida (formato esperado pelo backend)
      // Certifica-se de que o amount é uma string válida
      let amountStr = typeof values.amount === 'string' 
        ? values.amount.replace(',', '.') 
        : '';

      // Verifica se categoryId está definido
      if (!values.categoryId) {
        throw new Error('Categoria é obrigatória');
      }

      // Formata a data como string ISO para garantir compatibilidade
      const isoDate = values.date.toISOString();

      const formattedValues = {
        ...values,
        amount: amountStr,
        categoryId: parseInt(values.categoryId),
        // Envia a data como string ISO
        date: isoDate,
        // Inclui o ID da fatura se houver uma associada
        invoiceId: uploadedInvoiceId || undefined,
      };

      console.log('Enviando dados para o servidor:', formattedValues);

      if (transactionToEdit) {
        await updateTransaction(transactionToEdit.id, formattedValues);
        toast({
          title: "Transação atualizada",
          description: "A transação foi atualizada com sucesso",
        });
      } else {
        await createTransaction(formattedValues);
        toast({
          title: "Transação criada",
          description: "A transação foi criada com sucesso",
        });
      }
      
      onClose();
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar a transação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{transactionToEdit ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
          <DialogDescription>
            {transactionToEdit 
              ? 'Atualize os detalhes da transação' 
              : 'Preencha os detalhes da nova transação'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="RECEITA">Receita</SelectItem>
                      <SelectItem value="DESPESA">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0,00" 
                      {...field} 
                      type="number"
                      step="0.01"
                      min="0.01"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          disabled={isLoading}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Aluguel" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A_VENCER">A Vencer</SelectItem>
                      <SelectItem value="PAGAR">Pagar</SelectItem>
                      <SelectItem value="PAGO">Pago</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Seção de Upload de Fatura */}
            <div className="border rounded-md p-4 mt-6">
              <h3 className="text-sm font-medium mb-3">Fatura Associada</h3>
              
              {uploadedInvoiceId ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fatura #{uploadedInvoiceId} vinculada</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setViewingInvoice(true)}
                        type="button"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRemoveInvoice}
                        type="button"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {previewUrl ? (
                    <div className="space-y-3">
                      <div className="border rounded-md overflow-hidden">
                        <img 
                          src={previewUrl} 
                          alt="Preview da fatura" 
                          className="w-full object-contain max-h-[200px]"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRemoveInvoice}
                          type="button"
                        >
                          Remover
                        </Button>
                        <Button 
                          onClick={handleUploadInvoice} 
                          disabled={uploadingInvoice}
                          size="sm"
                          type="button"
                        >
                          {uploadingInvoice && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                          Fazer Upload
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 border border-dashed rounded-md">
                      <div className="text-center">
                        <FileImage className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Arraste uma imagem ou clique para selecionar</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                          size="sm"
                        >
                          <FileUp className="h-4 w-4 mr-1" />
                          Selecionar Fatura
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : transactionToEdit ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    
    {/* Modal de visualização de fatura */}
    <InvoiceViewModal
      isOpen={viewingInvoice}
      onClose={() => setViewingInvoice(false)}
      invoiceId={uploadedInvoiceId}
    />
  );
}
