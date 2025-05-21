import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { createWorker } from 'tesseract.js';

interface InvoiceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
}

export function InvoiceUploadModal({ isOpen, onClose, onSuccess }: InvoiceUploadModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [barcode, setBarcode] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      
      setFile(selectedFile);
      
      // Criar URL para preview
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      
      // Reset barcode
      setBarcode('');
    }
  };

  const handleScanBarcode = async () => {
    if (!previewUrl) return;
    
    setIsScanning(true);
    try {
      // Inicializa Tesseract Worker para OCR
      const worker = await createWorker('por');
      
      // Reconhecer texto da imagem
      const { data: { text } } = await worker.recognize(previewUrl);
      
      // Tenta encontrar um código de barras de boleto (linha digitável)
      const barcodeRegex = /(\d{5}[.]\d{5}\s\d{5}[.]\d{6}\s\d{5}[.]\d{6}\s\d{1}\s\d{14})|(\d{47})/g;
      const matches = text.match(barcodeRegex);
      
      if (matches && matches.length > 0) {
        // Remove caracteres não numéricos
        const cleanBarcode = matches[0].replace(/[^0-9]/g, '');
        setBarcode(cleanBarcode);
        
        toast({
          title: 'Código de barras detectado!',
          description: `${cleanBarcode.substring(0, 10)}...${cleanBarcode.substring(cleanBarcode.length - 10)}`,
        });
      } else {
        toast({
          title: 'Nenhum código de barras detectado',
          description: 'Tente outra imagem ou insira o código manualmente.',
          variant: 'destructive',
        });
      }
      
      await worker.terminate();
    } catch (error) {
      console.error('Erro ao escanear código de barras:', error);
      toast({
        title: 'Erro ao processar imagem',
        description: 'Não foi possível ler o código de barras.',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async () => {
    if (!file && !barcode) {
      toast({
        title: 'Dados incompletos',
        description: 'Por favor, faça upload de uma fatura ou insira o código de barras.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Cria um FormData para enviar o arquivo e o código de barras
      const formData = new FormData();
      
      // Importante: o nome do campo aqui deve corresponder ao que o backend espera
      if (file) {
        formData.append('file', file);
      }
      if (barcode) {
        formData.append('barcode', barcode);
      }
      
      // Envia para a API usando fetch diretamente para ter mais controle
      const response = await fetch('/api/invoices/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Erro no servidor: ${response.status}`);
      }
      
      const data = await response.json();
      
      toast({
        title: 'Fatura processada com sucesso!',
        description: 'Os dados da fatura foram processados.',
      });
      
      // Limpa o formulário
      setFile(null);
      setPreviewUrl(null);
      setBarcode('');
      
      // Callback de sucesso
      if (onSuccess) {
        onSuccess(data);
      }
      
      // Fecha o modal
      onClose();
    } catch (error) {
      console.error('Erro ao processar fatura:', error);
      toast({
        title: 'Erro ao processar fatura',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao processar sua fatura. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload de Fatura</DialogTitle>
          <DialogDescription>
            Faça upload de uma imagem da fatura para processar o código de barras ou insira manualmente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="invoice-file">Imagem da Fatura</Label>
            <Input
              id="invoice-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isLoading}
            />
          </div>
          
          {previewUrl && (
            <div className="grid grid-cols-1 gap-2">
              <Label>Preview</Label>
              <div className="border rounded-md overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Preview da fatura" 
                  className="w-full h-auto max-h-[200px] object-contain"
                />
              </div>
              <Button 
                onClick={handleScanBarcode} 
                disabled={isScanning || isLoading}
                variant="outline"
                className="mt-2"
              >
                {isScanning ? 'Escaneando...' : 'Escanear Código de Barras'}
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="barcode">Código de Barras</Label>
            <Input
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Insira ou escaneie o código de barras da fatura"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Processando...' : 'Processar Fatura'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}