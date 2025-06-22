import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);



## Problema Identificado

O erro `Failed to load url /src/main.tsx` indica que o Vite não está conseguindo encontrar o arquivo `main.tsx` no caminho correto. Isso geralmente acontece quando há problemas na configuração do Vite ou no caminho dos arquivos.

## Soluções

### 1. Verificar se o arquivo main.tsx existe e tem o conteúdo correto

O arquivo deve estar em `/Users/marceloribeiro/Desktop/MESA-ICLOUD/PROJETOS_EM_ANDAMENTO/CodeCraft/client/src/main.tsx` e ter o conteúdo:
```typescript
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```
