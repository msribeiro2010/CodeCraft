import { useState, useRef, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { CalendarIcon, FileUp, Loader2, Eye, FileImage, DollarSign, Tag, FileText, Calendar as CalendarIcon2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { InvoiceViewModal } from '../invoices/invoice-view-modal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
  // Campos de recorrência
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(['PARCELAS', 'MENSAL', 'ANUAL']).optional(),
  totalInstallments: z.string().optional(),
  currentInstallment: z.string().optional(),
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
  
  const { data: categories = [], refetch: refetchCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    retry: 3,
    retryDelay: 1000,
  });



  // Revalidar categorias quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      refetchCategories();
    }
  }, [isOpen, refetchCategories]);

  // Definindo valores padrão para o formulário
  const defaultValues = {
    type: 'DESPESA',
    amount: '',
    date: new Date(),
    categoryId: '',
    description: '',
    notes: '',
    status: 'A_VENCER' as const,
    isRecurring: false,
    recurrenceType: undefined,
    totalInstallments: undefined,
    currentInstallment: undefined,
  };

  // Inicializa o formulário com resolver e valores padrão
  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transactionToEdit ? {
      type: transactionToEdit.type,
      amount: transactionToEdit.amount?.toString(),
      date: new Date(transactionToEdit.date),
      categoryId: transactionToEdit.categoryId?.toString(),
      description: transactionToEdit.description,
      notes: transactionToEdit.notes || '',
      status: transactionToEdit.status,
      isRecurring: transactionToEdit.isRecurring || false,
      recurrenceType: transactionToEdit.recurrenceType,
      totalInstallments: transactionToEdit.totalInstallments?.toString(),
      currentInstallment: transactionToEdit.currentInstallment?.toString(),
    } : defaultValues,
  });

  // Observa os valores de isRecurring e recurrenceType para exibir campos condicionalmente
  const isRecurring = useWatch({
    control: form.control,
    name: 'isRecurring',
  });

  const recurrenceType = useWatch({
    control: form.control,
    name: 'recurrenceType',
  });
  
  // Atualiza o formulário quando transactionToEdit muda
  useEffect(() => {
    if (transactionToEdit) {
      form.reset({
        type: transactionToEdit.type,
        amount: transactionToEdit.amount?.toString(),
        date: new Date(transactionToEdit.date),
        categoryId: transactionToEdit.categoryId?.toString(),
        description: transactionToEdit.description,
        notes: transactionToEdit.notes || '',
        status: transactionToEdit.status,
        isRecurring: transactionToEdit.isRecurring || false,
        recurrenceType: transactionToEdit.recurrenceType,
        totalInstallments: transactionToEdit.totalInstallments?.toString(),
        currentInstallment: transactionToEdit.currentInstallment?.toString(),
      });
    } else {
      form.reset(defaultValues);
    }
  }, [transactionToEdit, form]);
  
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
      
      // Verificar se o arquivo é uma imagem ou PDF
      if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
        toast({
          title: "Formato não suportado",
          description: "Por favor, faça upload apenas de arquivos de imagem (JPG, PNG, etc) ou PDF.",
          variant: "destructive"
        });
        return;
      }
      
      setInvoiceFile(selectedFile);
      
      // Criar URL para preview (apenas para imagens)
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        // Para PDF, mostramos um ícone ou texto indicando que é um PDF
        setPreviewUrl(null);
      }
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
        // Inclui o ID da fatura se houver uma associada (apenas se foi anexada nesta transação)
        invoiceId: uploadedInvoiceId || (transactionToEdit?.invoiceId || undefined),
        // Campos de recorrência
        isRecurring: values.isRecurring || false,
        recurrenceType: values.isRecurring ? values.recurrenceType : undefined,
        totalInstallments: values.recurrenceType === 'PARCELAS' && values.totalInstallments
          ? parseInt(values.totalInstallments)
          : undefined,
        // Parcela atual (se fornecida)
        currentInstallment: values.currentInstallment
          ? parseInt(values.currentInstallment)
          : transactionToEdit?.currentInstallment,
        // Preserva o grupo de recorrência ao editar
        recurringGroupId: transactionToEdit?.recurringGroupId,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {transactionToEdit ? 'Editar Transação' : 'Nova Transação'}
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                {transactionToEdit 
                  ? 'Atualize os detalhes da transação' 
                  : 'Preencha os detalhes da nova transação'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Tag className="h-4 w-4" />
                      Tipo
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RECEITA">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Receita
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="DESPESA">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              Despesa
                            </Badge>
                          </div>
                        </SelectItem>
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
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <DollarSign className="h-4 w-4" />
                      Valor (R$)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="0,00" 
                          {...field} 
                          type="number"
                          step="0.01"
                          min="0.01"
                          disabled={isLoading}
                          className="h-11 pl-8"
                        />
                        <DollarSign className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <CalendarIcon className="h-4 w-4" />
                      Data
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full h-11 pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
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
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Tag className="h-4 w-4" />
                      Categoria
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem 
                              key={category.id} 
                              value={category.id.toString()}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full" />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-categories" disabled>
                            Carregando categorias...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4" />
                    Descrição
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Aluguel, Supermercado, Salário..." 
                      {...field} 
                      disabled={isLoading}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Badge className="h-4 w-4" />
                      Status
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A_VENCER">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              A Vencer
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="PAGO">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Pago
                            </Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col justify-end">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                        <FileText className="h-4 w-4" />
                        Observações
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações adicionais (opcional)" 
                          {...field} 
                          disabled={isLoading}
                          className="min-h-[44px] resize-none"
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Seção de Recorrência */}
            <Card className="border-2 border-gray-200 bg-gradient-to-br from-blue-50/30 to-purple-50/30">
              <CardContent className="p-6 space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <CalendarIcon2 className="h-5 w-5" />
                  Configuração de Recorrência
                </h3>

                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-semibold">
                          Despesa Recorrente
                        </FormLabel>
                        <FormDescription>
                          Marque esta opção se esta despesa se repete ao longo do tempo
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {isRecurring && (
                  <div className="space-y-4 animate-in fade-in-50 duration-200">
                    <FormField
                      control={form.control}
                      name="recurrenceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                            <CalendarIcon2 className="h-4 w-4" />
                            Tipo de Recorrência
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white">
                                <SelectValue placeholder="Selecione o tipo de recorrência" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PARCELAS">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Parcelado
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    (ex: 3x, 12x)
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value="MENSAL">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    Mensal
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    (todo mês)
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value="ANUAL">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    Anual
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    (todo ano)
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Escolha como esta despesa se repete
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {recurrenceType === 'PARCELAS' && (
                      <>
                        <FormField
                          control={form.control}
                          name="totalInstallments"
                          render={({ field }) => (
                            <FormItem className="animate-in fade-in-50 duration-200">
                              <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                                <FileText className="h-4 w-4" />
                                Número Total de Parcelas
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: 45"
                                  {...field}
                                  type="number"
                                  min="2"
                                  max="120"
                                  disabled={isLoading}
                                  className="h-11 bg-white"
                                />
                              </FormControl>
                              <FormDescription>
                                Quantas parcelas no total (ex: acordo judicial em 45x)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {transactionToEdit && (
                          <FormField
                            control={form.control}
                            name="currentInstallment"
                            render={({ field }) => (
                              <FormItem className="animate-in fade-in-50 duration-200">
                                <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                                  <FileText className="h-4 w-4" />
                                  Parcela Atual
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: 3"
                                    {...field}
                                    type="number"
                                    min="1"
                                    max="120"
                                    disabled={isLoading}
                                    className="h-11 bg-white"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Qual é esta parcela? (ex: se é a 3ª parcela, digite 3)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seção de Upload de Fatura */}
            <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
              <CardContent className="p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <FileText className="h-5 w-5" />
                  Fatura Associada
                </h3>
                
                {uploadedInvoiceId ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <FileImage className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">Fatura #{uploadedInvoiceId} vinculada</span>
                          <p className="text-xs text-gray-500">Arquivo anexado com sucesso</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setViewingInvoice(true)}
                          type="button"
                          className="h-8 px-3"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRemoveInvoice}
                          type="button"
                          className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {invoiceFile ? (
                      <div className="space-y-4">
                        {previewUrl ? (
                          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                            <img 
                              src={previewUrl} 
                              alt="Preview da fatura" 
                              className="w-full object-contain max-h-[200px]"
                            />
                          </div>
                        ) : (
                          <div className="border-2 border-gray-200 rounded-lg p-6 bg-white">
                            <div className="text-center">
                              <div className="p-3 bg-blue-50 rounded-lg inline-block mb-3">
                                <FileImage className="h-8 w-8 text-blue-600" />
                              </div>
                              <p className="text-sm font-medium text-gray-900">Arquivo PDF selecionado</p>
                              <p className="text-xs text-gray-500 mt-1">{invoiceFile.name}</p>
                              <p className="text-xs text-gray-400">{(invoiceFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleRemoveInvoice}
                            type="button"
                            className="h-9 px-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Remover
                          </Button>
                          <Button 
                            onClick={handleUploadInvoice} 
                            disabled={uploadingInvoice}
                            size="sm"
                            type="button"
                            className="h-9 px-4"
                          >
                            {uploadingInvoice && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Fazer Upload
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 transition-colors hover:border-gray-400 hover:bg-gray-50 bg-white">
                        <div className="text-center">
                          <div className="p-3 bg-gray-50 rounded-lg inline-block mb-4">
                            <FileImage className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Arraste uma imagem, PDF ou clique para selecionar</p>
                          <p className="text-xs text-gray-500 mb-4">PDF, PNG, JPG até 10MB</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*, application/pdf"
                            onChange={handleFileChange}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                            size="sm"
                            className="h-9 px-4"
                          >
                            <FileUp className="h-4 w-4 mr-2" />
                            Selecionar Fatura
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <DialogFooter className="gap-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
                className="h-11 px-6 font-medium"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-11 px-6 font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {transactionToEdit ? 'Atualizar' : 'Criar'} Transação
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      {viewingInvoice && (
        <InvoiceViewModal
          isOpen={viewingInvoice}
          onClose={() => setViewingInvoice(false)}
          invoiceId={uploadedInvoiceId}
        />
      )}
    </Dialog>
  );
}
