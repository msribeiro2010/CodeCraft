import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadInvoice } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { FileUp, File, CheckCircle, AlertCircle } from 'lucide-react';

export function InvoiceUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedText, setProcessedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
        setError('Tipo de arquivo não suportado. Por favor, use JPG, PNG ou PDF.');
        setSelectedFile(null);
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. O tamanho máximo é 5MB.');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      setProcessedText(null);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const result = await uploadInvoice(selectedFile);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setProcessedText(result.processedText);
      
      toast({
        title: "Fatura processada com sucesso",
        description: "O texto da fatura foi extraído e está pronto para ser utilizado.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      setError('Erro ao processar a fatura. Por favor, tente novamente.');
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar a fatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setProcessedText(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle>Upload de Fatura</CardTitle>
        <CardDescription>
          Faça upload de uma fatura em PDF ou imagem para extrair informações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${selectedFile ? 'border-primary bg-primary/5' : 'border-neutral-300 hover:border-primary'}
              ${isUploading ? 'opacity-50 pointer-events-none' : ''}
              ${error ? 'border-red-500 bg-red-50' : ''}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <Input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            
            <div className="flex flex-col items-center gap-2">
              {selectedFile ? (
                <>
                  <File className="h-10 w-10 text-primary" />
                  <p className="text-sm font-medium text-neutral-900">{selectedFile.name}</p>
                  <p className="text-xs text-neutral-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : error ? (
                <>
                  <AlertCircle className="h-10 w-10 text-red-500" />
                  <p className="text-sm font-medium text-red-700">{error}</p>
                  <p className="text-xs text-neutral-700">Clique para selecionar outro arquivo</p>
                </>
              ) : (
                <>
                  <FileUp className="h-10 w-10 text-neutral-400" />
                  <p className="text-sm font-medium text-neutral-900">
                    Arraste e solte ou clique para selecionar
                  </p>
                  <p className="text-xs text-neutral-500">
                    Formatos suportados: JPG, PNG, PDF (máximo 5MB)
                  </p>
                </>
              )}
            </div>
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Processando...</span>
                <span className="text-neutral-700">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {processedText && (
            <div className="rounded-lg border p-4 bg-neutral-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-neutral-900">Texto Extraído</h3>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <pre className="text-sm text-neutral-700 whitespace-pre-wrap">
                  {processedText}
                </pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={resetForm}
          disabled={isUploading || (!selectedFile && !processedText && !error)}
        >
          Limpar
        </Button>
        <Button 
          onClick={uploadFile}
          disabled={isUploading || !selectedFile || !!error || !!processedText}
        >
          {isUploading ? 'Processando...' : 'Processar Fatura'}
        </Button>
      </CardFooter>
    </Card>
  );
}
