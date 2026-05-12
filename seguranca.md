# Relatório de Análise de Segurança

**Projeto:** PrintPulse 3D  
**Data da Análise:** 27 de Abril de 2026 (v1.0) | **12 de Maio de 2026 (v2.0)**  
**Analista:** Análise de Segurança  
**Versão:** 2.0

---

## RESUMO EXECUTIVO

| Severidade | v1.0 | v2.0 (Atual) |
|------------|------|---------------|
| 🔴 CRÍTICA | 0 | 6 |
| 🟠 ALTA | 6 | 5 |
| 🟡 MÉDIA | 6 | 4 |
| 🟢 BAIXA | 4 | 3 |

**Total de vulnerabilidades identificadas: 18**

---

## 🚨 VULNERABILIDADES CRÍTICAS (NOVO - v2.0)

### C1. Políticas RLS Permissivas no schema.sql
| Severidade | Arquivo | Linha |
|------------|---------|-------|
| **CRÍTICA** | `supabase/schema.sql` | 140-148 |

**Problema:** Todas as políticas RLS estão configuradas com `USING (true) WITH CHECK (true)`, permitindo acesso irrestrito.

```sql
CREATE POLICY "Allow all for all" ON public.printers FOR ALL USING (true) WITH CHECK (true);
```

**Ação:** Remover ou adicionar aviso de NÃO executar em produção. A migração `20260509_adicionar_user_id_e_rls.sql` já corrige este problema.

---

### C2. IDOR - updateMaterial sem filtro user_id
| Severidade | Arquivo | Linha |
|------------|---------|-------|
| **CRÍTICA** | `src/services/api/products.ts` | 116-124 |

**Problema:** Qualquer usuário pode atualizar materiais de produtos de OUTROS usuários.

```typescript
async updateMaterial(id: string, material: Partial<ProductMaterial>) {
  const { data, error } = await supabase
    .from('product_materials')
    .update(material)
    .eq('id', id)  // ⚠️ Não filtra por user_id!
    .select()
    .single();
}
```

**Correção:**
```typescript
async updateMaterial(id: string, material: Partial<ProductMaterial>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: createError('Não autenticado') };
  
  return supabase
    .from('product_materials')
    .update(material)
    .eq('id', id)
    .eq('user_id', user.id)  // ✓ Adicionar filtro
    .select()
    .single();
}
```

---

### C3. IDOR - deleteMaterial sem filtro user_id
| Severidade | Arquivo | Linha |
|------------|---------|-------|
| **CRÍTICA** | `src/services/api/products.ts` | 127 |

**Problema:** Qualquer usuário pode deletar materiais de produtos de OUTROS usuários.

```typescript
async deleteMaterial(id: string) {
  return supabase.from('product_materials').delete().eq('id', id);  // ⚠️ Sem filtro
}
```

**Correção:**
```typescript
async deleteMaterial(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: createError('Não autenticado') };
  
  return supabase
    .from('product_materials')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);  // ✓ Filtrar por usuário
}
```

---

### C4. getMaterialsByJob sem verificação de propriedade
| Severidade | Arquivo | Linha |
|------------|---------|-------|
| **CRÍTICA** | `src/services/api/production.ts` | 98-104 |

**Problema:** Um usuário pode visualizar materiais de jobs de produção de OUTROS usuários.

**Correção:** Adicionar verificação de propriedade do job antes de retornar materiais.

---

### C5. addMaterial sem validação
| Severidade | Arquivo | Linha |
|------------|---------|-------|
| **CRÍTICA** | `src/services/api/production.ts` | 107-113 |

**Problema:** Um usuário pode adicionar materiais a jobs de OUTROS usuários.

**Correção:** Verificar se o job pertence ao usuário antes de adicionar material.

---

### C6. SECURITY DEFINER no Trigger
| Severidade | Arquivo | Linha |
|------------|---------|-------|
| **CRÍTICA** | `supabase/migrations/20260509_adicionar_user_id_e_rls.sql` | 66-72 |

**Problema:** A função `handle_new_user()` usa `SECURITY DEFINER`, executando com privilégios de superusuário.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;  -- ⚠️ Perigoso!
```

**Correção:**
```sql
$$ LANGUAGE plpgsql SECURITY INVOKER;  -- ✓ SECURITY INVOKER (padrão seguro)
```

---

## 🟠 VULNERABILIDADES ALTAS

### A1. LocalStorage com dados sensíveis (NOVO)
| Severidade | Arquivo | Linha |
|------------|---------|-------|
| **ALTA** | `src/contexts/SettingsContext.tsx` | 30-48, 68-73 |

**Problema:** Email e role do usuário armazenados sem criptografia no localStorage.

```typescript
const savedUser = localStorage.getItem('printpulse_user');
// Armazena: { email: '...', role: 'Operador', ... }
```

**Correção:** Não armazenar dados sensíveis no localStorage. Buscar do backend quando necessário.

---

### A2. Filtros executados no frontend
| Severidade | Arquivo | Linha |
|------------|---------|-------|
| **ALTA** | `src/services/api/products.ts` | 26-37 |
| **ALTA** | `src/services/api/transactions.ts` | 29-45 |
| **ALTA** | `src/services/api/clients.ts` | 25-37 |

**Problema:** Busca TODOS os registros e filtra no JavaScript, expondo dados desnecessários.

**Correção:** Implementar busca server-side:
```typescript
const { data } = await supabase
  .from('products')
  .select('*')
  .ilike('name', `%${term}%`)
  .eq('user_id', user.id);
```

---

### A3. Sem Rate Limiting
| Severidade | Problema |
|------------|----------|
| **ALTA** | Sem limite de requisições |

**Correção:** Configurar no Supabase Dashboard > Authentication > Rate Limits:
- Signups: 5 por IP/hora
- Token Refreshes: 30 por minuto
- Magic Links: 10 por IP/hora

---

### A4. Console.log de debug em produção (NOVO)
| Severidade | Arquivo | Ocorrências |
|------------|---------|-------------|
| **ALTA** | `src/views/ProducaoView.tsx` | 6 |

**Problema:** Mensagens de debug expõem IDs e dados internos.

```typescript
console.log('UseEffect: selectedProductId=', selectedProductId, 'quantity=', quantity);
```

**Correção:** Remover antes do deploy ou usar flag de desenvolvimento:
```typescript
if (import.meta.env.DEV) console.log('debug', data);
```

---

### A5. Uso excessivo de `any` (NOVO)
| Severidade | Ocorrências |
|------------|-------------|
| **ALTA** | 207 |

**Problema:** Elimina verificação de tipos, permitindo erros runtime e vulnerabilidades.

**Correção:** Definir interfaces tipadas para todas as estruturas de dados.

---

## 🟡 VULNERABILIDADES MÉDIAS

### M1. Falta de validação de inputs em formulários
| Severidade | Arquivos |
|------------|----------|
| **MÉDIA** | Todos os views com formulários |

**Correção:** Adicionar sanitização:
```typescript
const sanitizeInput = (value: string): string => {
  return value.replace(/[<>'"]/g, '').slice(0, 255);
};
```

---

### M2. Headers de segurança ausentes
| Severidade | Problema |
|------------|----------|
| **MÉDIA** | Sem CSP, HSTS |

**Correção:** Adicionar no `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self' https://*.supabase.co;">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
```

---

### M3. Console de erro expõe configuração
| Severidade | Arquivo | Linha |
|------------|---------|-------|
| **MÉDIA** | `src/lib/supabase.ts` | 8 |

**Correção:** Já documentado na v1.0, aguardando implementação.

---

### M4. getStats em clients.ts retorna dados errados (NOVO)
| Severidade | Arquivo | Linha |
|------------|---------|-------|
| **MÉDIA** | `src/services/api/clients.ts` | 45-54 |

**Problema:** Retorna `active = total` e `inactive = 0` sempre.

---

## 🟢 VULNERABILIDADES BAIXAS

### B1. Retorno silencioso sem autenticação
| Severidade | Arquivo | Linha |
|------------|---------|-------|
| **BAIXA** | `src/services/api/baseQueries.ts` | 10-16 |

**Correção:** Retornar erro explícito em vez de array vazio.

---

### B2. Dependências potencialmente desatualizadas
| Severidade | Problema |
|------------|----------|
| **BAIXA** | Sem npm audit |

**Correção:** Executar `npm audit` periodicamente.

---

### B3. Falta de CORS configurado
| Severidade | Problema |
|------------|----------|
| **BAIXA** | Vite usa configurações padrão |

---

## ✅ JÁ CORRIGIDO

| Item | Status | Data |
|------|--------|------|
| `.env` no .gitignore | ✅ Corrigido | 12/05/2026 |
| RLS nas tabelas principais | ✅ Migração aplicada | 12/05/2026 |

---

## 📋 CHECKLIST DE CORREÇÃO

### Fase 1 - Imediato (Hoje)
- [ ] Corrigir `SECURITY DEFINER` → `SECURITY INVOKER` no trigger
- [ ] Adicionar filtro `user_id` em `updateMaterial` e `deleteMaterial` em products.ts
- [ ] Adicionar filtro `user_id` em todas operações de `production_job_materials`
- [ ] Adicionar verificação de propriedade em `getMaterialsByJob` e `addMaterial`

### Fase 2 - Urgente (Esta semana)
- [ ] Remover dados sensíveis do localStorage (email, role)
- [ ] Implementar filtros server-side nas funções de busca
- [ ] Configurar Rate Limiting no Supabase
- [ ] Remover todos console.log de debug
- [ ] Corrigir schema.sql (remover políticas "Allow all")

### Fase 3 - Importante (Este mês)
- [ ] Substituir `any` por interfaces tipadas (207 ocorrências)
- [ ] Adicionar validação de inputs (Zod/DOMPurify)
- [ ] Adicionar headers de segurança no index.html
- [ ] Corrigir getStats em clients.ts

---

## COMPARATIVO v1.0 vs v2.0

| Categoria | v1.0 | v2.0 | Mudança |
|-----------|------|------|---------|
| CRÍTICA | 0 | 6 | +6 (novas auditorias) |
| ALTA | 6 | 5 | -1 (transferiu para CRÍTICA) |
| MÉDIA | 6 | 4 | -2 |
| BAIXA | 4 | 3 | -1 |

---

## Referências

- [Supabase Security](https://supabase.com/docs/guides/security)
- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [OWASP Top 10 2024](https://owasp.org/Top10/pt-br/)
- [Snyk Vulnerability Database](https://security.snyk.io/vuln)

---

*Este relatório deve ser revisado periodicamente e após alterações significativas na arquitetura.*

**Última atualização:** 12 de Maio de 2026 - v2.0
