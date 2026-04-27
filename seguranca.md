# Relatório de Análise de Segurança

**Projeto:** PrintPulse 3D  
**Data da Análise:** 27 de Abril de 2026  
**Analista:** Análise de Segurança  
**Versão:** 1.0

---

## 1. Autenticação e Autorização

### 1.1 Row Level Security (RLS) - CRÍTICO

| Criticidade | Arquivo | Linha |
|-------------|---------|-------|
| **ALTA** | `supabase/schema.sql` | 140-148 |

**Problema:** Todas as políticas RLS estão configuradas com `USING (true) WITH CHECK (true)`, permitindo acesso irrestrito a todas as tabelas do banco de dados. Qualquer usuário, autenticado ou não, pode realizar operações CRUD completas em todas as tabelas.

```sql
CREATE POLICY "Allow all for all" ON public.printers FOR ALL USING (true) WITH CHECK (true);
```

**Recomendação:** Substituir as políticas por verificações restritivas:

```sql
-- Exemplo para tabela de impressoras
CREATE POLICY "users_can_read_printers" ON public.printers 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "users_can_insert_printers" ON public.printers 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "users_can_update_printers" ON public.printers 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "users_can_delete_printers" ON public.printers 
  FOR DELETE USING (auth.uid() IS NOT NULL);
```

**Impacto:** Um atacante com conhecimento mínimo da API pode manipular todos os dados do sistema, incluindo transações financeiras, clientes e trabalhos de produção.

---

### 1.2 Ausência de Verificação de Sessão no Frontend - ALTA

| Criticidade | Arquivo | Linha |
|------------|---------|-------|
| **ALTA** | `src/services/api/baseQueries.ts` | 10-45 |

**Problema:** As queries são executadas sem verificar se há uma sessão de usuário ativa. O código não implementa nenhum guard ou interceptador para validar a autenticação antes de realizar requisições.

**Recomendação:** Implementar um wrapper de autenticação:

```typescript
// auth Guard
const verifyAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
};
```

No React, criar um componente `RequireAuth` para proteger rotas.

---

## 2. Dados Sensíveis

### 2.1 Exposição de Credenciais via Console - ALTA

| Criticidade | Arquivo | Linha |
|------------|---------|-------|
| **ALTA** | `src/lib/supabase.ts` | 8 |

**Problema:** Mensagens de erro contendo informações sobre configuração missing são logadas no console do navegador:

```typescript
console.error('Supabase URL ou Anon Key não configuradas no arquivo .env');
```

**Recomendação:** Remover ou substituir por logging apenas em desenvolvimento:

```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    console.error('Supabase não configurado');
  }
  //throw new Error('Configuração ausente');
}
```

---

### 2.2 Variáveis de Ambiente no Client - MÉDIA

| Criticidade | Arquivo | Linha |
|-------------|---------|-------|
| **MÉDIA** | `src/lib/supabase.ts` | 4-5 |

**Problema:** As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` são expostas no bundle JavaScript do frontend. Embora seja uma prática do Supabase ( chiave pública ), isso permite que um atacante identifique a URL do backend.

**Recomendação:** Esta é uma limitação arquitetural inherent ao Supabase Client. Asegurar que as políticas RLS estejam corretamente configuradas para mitigar riscos.

---

### 2.3 Log de Erro Sensível - MÉDIA

| Criticidade | Arquivo | Linha |
|-------------|---------|-------|
| **MÉDIA** | `src/services/api/production.ts` | 34 |

**Problema:** Erros internos são logados no console do cliente:

```typescript
console.error('Error creating job materials:', materialsError);
```

**Recomendação:** Remover logs de erro ou usar serviço de monitoramento (Sentry) com filtro de dados sensíveis.

---

## 3. Validação de Entrada

### 3.1 Filtros Executados no Lado Cliente - ALTA

| Criticidade | Arquivo | Linha |
|-------------|---------|-------|
| **ALTA** | `src/services/api/products.ts` | 26-37 |

**Problema:** Buscas por termo são executadas buscando TODOS os registros e filtrando no JavaScript:

```typescript
async search(term: string): Promise<ApiResponse<Product>> {
  const { data, error } = await baseQueries.getAll<Product>('products');
  if (error) return { data: null, error };
  const lowerTerm = term.toLowerCase();
  return {
    data: data?.filter(p => /* filtering */) || null,
    error: null
  };
}
```

**Impacto:** Todos os produtos são expostos ao cliente antes da filtragem. Um atacante pode obter todos os dados da tabela sem autenticação adequada.

**Recomendação:** Implementar busca no nível do banco usando `ilike` ou busca por vetor:

```sql
-- Supabase
.select('*').ilike('name', `%${term}%`)
```

O mesmo problema existe em:
- `transactions.ts:29-45`
- `clients.ts:25-37`
- `printers.ts:33-40`

---

### 3.2 Ausência de Sanitização de Entrada - MÉDIA

| Criticidade | Arquivo | Linha |
|-------------|---------|-------|
| **MÉDIA** | `src/services/api/baseQueries.ts` | 47-63 |

**Problema:** O payload inserido não é validado antes do envio ao banco. O Supabase SDK protege contra SQL Injection, mas não valida tipos, tamanhos ou conteúdo.

**Recomendação:** Criar schema de validação com Zod ou Yup:

```typescript
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string().min(1).max(255),
  version: z.string().max(20),
  print_time_hours: z.number().int().min(0),
  margin_percent: z.number().int().min(0).max(100)
});
```

---

## 4. Configurações de Segurança

### 4.1 Ausência de Configuração CORS - MÉDIA

| Criticidade | Arquivo |
|-------------|---------|
| **MÉDIA** | Arquivo não encontrado |

**Problema:** O projeto não possui arquivo `vite.config.ts` detalhando configurações CORS. O Vite usa configurações padrão.

**Recomendação:** Configurar CORS explicitamente no Vite:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    cors: {
      origin: process.env.VITE_ALLOWED_ORIGINS?.split(',') || ['localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  }
});
```

No Supabase, configurar em **API > Settings > API Settings**:

- `add an entry` para domínios autorizados
- **Restrict Access by API Key**: habilitar
- **Enable Table Rename Filters**: desabilitar em produção

---

### 4.2 Headers de Segurança - BAIXA

| Criticidade | Arquivo |
|-------------|---------|
| **BAIXA** | Ausente |

**Problema:** Nenhum header de segurança (CSP, HSTS, X-Frame-Options) configurado.

**Recomendação:** Adicionar no `index.html`:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co;">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
```

---

## 5. Dependências do Package.json

### 5.1 Bibliotecas com Vulnerabilidades Conhecidas - MÉDIA

| Criticidade | Biblioteca | Versão Atual | Versão Recomendada |
|-------------|------------|--------------|-------------------|
| **MÉDIA** | `jspdf` | ^4.2.1 | ^2.5.1 (última vers��o estável) |
| **BAIXA** | `canvg` | ^4.0.3 | ^4.1.1 |
| **BAIXA** | `framer-motion` | ^10.16.5 | ^11.x (verificar compatibilidade) |

**Problema:** Biblioteca `jspdf` em versão `^4.2.1` pode ter vulnerabilidades publicadas.

**Recomendação:** Executar auditoria:

```bash
npm audit
npm audit fix
```

Verificar vulnerabilidades em: https://security.snyk.io/vuln

---

### 5.2 Ausência de锁定 de Versões - BAIXA

| Criticidade | Descrição |
|-------------|----------|
| **BAIXA** | Dependencies usancarega semantic versioning (`^`) |

**Recomendação:** Migrar para `package-lock.json` ou usar `npm shrinkwrap`.

---

## 6. Práticas de Código

### 6.1 Message de Erro Generic no Login - BAIXA

| Criticidade | Arquivo | Linha |
|-------------|---------|-------|
| **BAIXA** | `src/components/Login.tsx` | 23 |

**Problema:** Boa prática observada - a mensagem de erro é genérica:

```typescript
setError(error.message === 'Invalid login credentials' ? 'Chave de acesso ou e-mail inválidos.' : error.message);
```

**Status:** ✅ Esta implementação é correta e previne enumeração de usuários.

---

### 6.2 Ausência de Rate Limiting - ALTA

| Criticidade | Problema |
|-------------|---------|
| **ALTA** | Sem limite de requisições |

**Problema:** Não há proteção contra ataques de força bruta ou DDoS.

**Recomendação:** Configurar no Supabase Dashboard:

1. **Authentication > Rate Limits**
2. Enabling limites:
   - **Signups**: 5 por IP/hora
   - **Token Refreshes**: 30 por minuto
   - **Magic Links**: 10 por IP/hora

No frontend, implementar retry with exponential backoff.

---

### 6.3 Ausência de Logs de Auditoria - MÉDIA

| Criticidade | Problema |
|-------------|---------|
| **MÉDIA** | Sem trilha de auditoria |

**Problema:** Não há registro de operações sensíveis (criar, atualizar, excluir).

**Recomendação:** Criar tabela deauditoria:

```sql
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

Criar trigger:

```sql
CREATE OR REPLACE FUNCTION audit_trigger() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_values)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 7. Acesso ao Banco de Dados

### 7.1 Políticas de Acesso irrestritas - CRÍTICO

Ver Seção 1.1.

---

### 7.2 Service Role Exposta (Possível) - ALTA

**Problema potencial:** Se o projeto usa `service_role` key no client, um atacante com acesso ao bundle pode executar operações admin.

**Recomendação:** Garantir que apenas `VITE_SUPABASE_ANON_KEY` (chave pública) seja usada no frontend. O service role deve ficar apenas no server-side ou Edge Functions.

---

## 8. Variáveis de Ambiente

### 8.1 Ausência de Arquivo .env no .gitignore - OK

| Criticidade | Arquivo |
|-------------|---------|
| **OK** | `.gitignore` ✅ |

O `.gitignore` está corretamente configurado para não expor arquivos `.env`.

---

### 8.2 Configuração de Variáveis - BAIXA

| Criticidade | Problema |
|-------------|---------|
| **BAIXA** | Variáveis sem validação em runtime |

**Recomendação:** Adicionar validation em startup:

```typescript
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missing = requiredEnvVars.filter(v => !import.meta.env[v]);
if (missing.length > 0) {
  throw new Error(`Missing env vars: ${missing.join(', ')}`);
}
```

---

## Resumo executivo

| Criticidade | Quantidade |
|-------------|-----------|
| **ALTA** | 6 vulnerabilidades |
| **MÉDIA** | 6 vulnerabilidades |
| **BAIXA** | 4 observações positivas |

### Priorização de Ações Imediatas

1. **Corrigir políticas RLS** (schema.sql:140-148) - Permite TOTAL acesso aos dados
2. **Implementar autenticação guard** - Qualquer usuário pode executar queries
3. **Mover filtros para server-side** - Evita exposição de dados completos
4. **Configurar rate limiting** - Protege contra ataques automatizados
5. **Remover console.error sensíveis** - Evita logging em produção
6. **Atualizar dependências** - Remediar vulnerabilidades conhecidas
7. **Configurar CORS e headers** - Camada adicional de proteção
8. **Implementar logs de auditoria** - Rastreabilidade de operações

---

## Referências

- [Supabase Security](https://supabase.com/docs/guides/security)
- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [Snyk Vulnerability Database](https://security.snyk.io/vuln)

---

*Este relatório deve ser revisado periodicamente e após alterações significativas na arquitetura.*