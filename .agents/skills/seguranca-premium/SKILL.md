---
name: seguranca-premium
description: Especialista em segurança para aplicações web SaaS. Use quando o usuário solicitar auditoria de segurança, correção de vulnerabilidades, implementação de autenticação/autorização, ou proteção de dados sensíveis em projetos React/TypeScript com Supabase.
---

# Segurança Premium - Specialist Skill

## Quando usar esta skill
- Implementação ou revisão de autenticação (Supabase Auth, OAuth, MFA).
- Auditoria de segurança do código (XSS, CSRF, SQL Injection, etc.).
- Configuração de Row Level Security (RLS) no Supabase.
- Proteção de dados sensíveis e variáveis de ambiente.
- Implementação de autorização baseada em roles/permissions.
- Análise de vulnerabilidades em APIs e Frontend.
- Verificação de compliance (LGPD/GDPR).

## Fluxo de Trabalho (Workflow)

### 1. Análise de Ameaças
```
- Identificar dados sensíveis no projeto
- Mapear pontos de entrada (API, UI, Webhooks)
- Listar permissões atuais e propostas
- Documentar riscos encontrados
```

### 2. Auditoria de Código
```
- [ ] Verificar sanitização de inputs do usuário
- [ ] Validar consultas SQL (Supabase queries)
- [ ] Checar exposição de dados sensíveis no frontend
- [ ] Analisar políticas RLS nas tabelas
- [ ] Verificar proteção contra XSS/CSRF
- [ ] Validar gerenciamento de sessões/tokens
```

### 3. Plano de Implementação
```
Prioridade Alta:
  - [ ] Autenticação via Supabase Auth (RLS ativado)
  - [ ] Variáveis de ambiente no .env (nunca no código)
  - [ ] Sanitização de inputs em formulários
  - [ ] Validação de permissões em API routes

Prioridade Média:
  - [ ] Rate limiting em APIs críticas
  - [ ] Headers de segurança (CSP, HSTS, etc.)
  - [ ] Log de auditoria (quem acessou o quê)
  - [ ] Criptografia de dados sensíveis em repouso

Prioridade Baixa:
  - [ ] MFA para usuários administrativos
  - [ ] Testes de penetração automatizados
  - [ ] Backup automático com criptografia
```

### 4. Validação
```
- Testar todos os fluxos de autenticação
- Verificar que RLS bloqueia acessos indevidos
- Confirmar que .env não está no repositório
- Validar sanitização com dados maliciosos
```

## Instruções de Implementação

### Supabase RLS (Row Level Security)
```sql
-- Exemplo: Policy para usuário ver apenas seus dados
CREATE POLICY "Usuários veem apenas seus dados"
ON sua_tabela
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verificar se RLS está ativo
SELECT tablename, rowlevel security
FROM pg_tables
WHERE schemaname = 'public';
```

### Variáveis de Ambiente
```typescript
// ✅ CORRETO - usar import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const apiKey = import.meta.env.VITE_API_KEY;

// ❌ ERRADO - nunca hardcodar
const supabaseUrl = "https://xyz.supabase.co";
const apiKey = "eyJhbGciOiJIUzI1NiIs...";
```

### Sanitização de Inputs
```typescript
import DOMPurify from 'dompurify';

// Sanitizar HTML antes de renderizar
const sanitizedHTML = DOMPurify.sanitize(userInput);

// Validar tipos com Zod
import { z } from 'zod';
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().positive()
});
```

### Headers de Segurança (Vite)
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
  }
});
```

## Checklist de Segurança

### Autenticação
- [ ] Supabase Auth configurado corretamente
- [ ] Senhas com requisitos mínimos (8+ caracteres)
- [ ] Tokens JWT com expiração adequada
- [ ] Logout limpa todos os tokens

### Autorização
- [ ] RLS ativo em todas as tabelas
- [ ] Policies testadas para cada role
- [ ] Verificação de permissões no frontend E backend
- [ ] Admin routes protegidas

### Dados
- [ ] Inputs sanitizados antes de salvar
- [ ] Dados sensíveis não expostos no console
- [ ] .env com permissões restritivas
- [ ] Backups criptografados

### API
- [ ] Rate limiting implementado
- [ ] Validação de tipos em todas as requisições
- [ ] CORS configurado corretamente
- [ ] Logs de auditoria ativos

## Recursos
- [SOP CORE](../../../directives/SOP_CORE.md)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [OWASP Top 10](https://owasp.org/Top10/pt-br/)

---

## Aprendizados (Learnings)
- 12/05/2026: Skill criada para o projeto PrintPulse 3D.
- 12/05/2026: .env adicionado ao .gitignore para proteger chaves API.
- 12/05/2026: Variáveis VITE são seguras para frontend (chaves anon).
