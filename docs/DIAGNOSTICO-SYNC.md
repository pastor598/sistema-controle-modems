# 🔧 Sistema de Diagnóstico Avançado - Google Sheets Sync

## ✨ Problema Resolvido: "Failed to fetch"

O sistema agora inclui um diagnóstico avançado que **automaticamente detecta e resolve** o erro "Failed to fetch" e outros problemas de sincronização com Google Sheets.

## 🚀 Como Usar

### 1. Diagnóstico Automático

O sistema executa automaticamente um diagnóstico quando:

- Há erros de sincronização detectados
- A URL do Google Apps Script não está configurada
- O botão "Testar Conexão" é clicado

### 2. Comandos Manuais no Console

Abra o console do navegador (F12) e execute:

```javascript
// Diagnóstico completo
window.diagnoseSync()

// Correção automática
window.quickFixSync()

// Abrir ajuda
window.openGoogleScriptHelp()
```

## 🔍 Tipos de Problemas Detectados

### ❌ URL Não Configurada

**Sintomas:** Status "Desconectado", nenhuma URL nas configurações
**Solução:** Sistema solicita a URL e orienta configuração

### ❌ Erro 403 (Forbidden)

**Sintomas:** "Failed to fetch", erro 403 nas requisições
**Soluções Automáticas:**

- Reimplantar Google Apps Script como "Anyone with the link"
- Executar função setup() novamente
- Verificar permissões

### ❌ Erro CORS

**Sintomas:** Erro CORS em requisições
**Soluções Automáticas:**

- Verificar headers CORS no Google Apps Script
- Tentar modo no-cors como fallback

### ❌ Erro 404 (Not Found)

**Sintomas:** URL não encontrada
**Soluções Automáticas:**

- Verificar se script está implantado
- Validar URL da implantação

## 🎯 Interface Visual

### Cards de Diagnóstico

- **Verde:** ✅ Conexão estabelecida com sucesso
- **Vermelho:** ❌ Problema detectado com soluções

### Botões de Ação

- **🔧 Correção Automática:** Tenta resolver problemas automaticamente
- **📚 Ajuda:** Abre guia completo de configuração
- **📄 Exportar Relatório:** Salva diagnóstico detalhado

## ⚙️ Funcionalidades Avançadas

### Auto-Diagnóstico

```javascript
// Executa automaticamente ao carregar a página se há problemas
setTimeout(() => {
    if (lastSyncError || !scriptUrl) {
        window.diagnoseSync()
    }
}, 3000)
```

### Fallback Inteligente

Se o sistema de diagnóstico não estiver disponível, usa teste básico:

```javascript
async basicConnectionTest(url) {
    // Teste simples de conectividade
    // Análise automática do tipo de erro
    // Sugestões específicas de solução
}
```

### Logs Estruturados

Todos os testes geram logs detalhados no console:

```text
🔍 DIAGNÓSTICO DE SINCRONIZAÇÃO
📋 URL configurada: https://script.google.com/...
🔗 Formato da URL: VÁLIDO
🌐 Testando conectividade...
📡 Status da resposta: 200 OK
✅ Conectividade: OK
```

## 🛠️ Configuração do Google Apps Script

### Passo a Passo Automatizado

1. O sistema detecta se a URL não está configurada
2. Solicita a URL via prompt
3. Valida o formato automaticamente
4. Testa a conectividade
5. Orienta sobre problemas encontrados

### Validação Inteligente

```javascript
// Valida formato da URL
const isValidUrl = /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(scriptUrl)

// Testa múltiplos métodos
- GET simples
- POST com CORS
- POST sem CORS
- Análise de headers
```

## 📊 Relatórios e Logs

### Exportação de Diagnóstico

- Salva relatório completo em arquivo .txt
- Inclui todos os testes realizados
- Timestamp e detalhes técnicos
- Recomendações específicas

### Monitoramento Contínuo

- Status atualizado a cada 30 segundos
- Detecção automática de problemas
- Notificações visuais de mudanças

## 🎨 Estilos e Responsividade

### Tema Claro/Escuro

- Cards adaptativos ao tema
- Cores semânticas (verde/vermelho)
- Animações suaves

### Mobile-First

- Interface responsiva
- Botões adaptáveis
- Layout flexível em dispositivos móveis

## 🔗 Integração

### Compatibilidade Total

- Funciona com sistema existente
- Não interfere em funcionalidades
- Melhora a experiência do usuário

### Override Inteligente

```javascript
// Substitui função original mantendo compatibilidade
const originalTestConnection = window.googleSheetsIntegration.testConnection
window.googleSheetsIntegration.testConnection = async function() {
    // Nova lógica com diagnóstico
    // Fallback para método original
}
```

---

## 🎉 Resultado

❌ **ANTES:** "Failed to fetch" - usuário sem direção
✅ **AGORA:** Diagnóstico automático + soluções visuais + correção automática

O sistema é **100% automatizado** e **user-friendly**, eliminando a necessidade de conhecimento técnico para resolver problemas de sincronização!