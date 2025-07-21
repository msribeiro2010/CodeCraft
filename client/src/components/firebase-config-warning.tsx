import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function FirebaseConfigWarning() {
  return (
    <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Configuração do Firebase Necessária</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          Para usar a autenticação com Google, você precisa configurar o Firebase:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Crie um projeto no <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
          <li>Ative a autenticação com Google</li>
          <li>Copie as credenciais do projeto</li>
          <li>Configure as variáveis de ambiente no arquivo <code className="bg-yellow-100 px-1 rounded">.env</code>:</li>
        </ol>
        <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs overflow-x-auto">
{`VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_PROJECT_ID=seu-project-id
VITE_FIREBASE_APP_ID=seu-app-id`}
        </pre>
        <p className="mt-2 text-sm">
          Após configurar, reinicie o servidor de desenvolvimento.
        </p>
      </AlertDescription>
    </Alert>
  );
}