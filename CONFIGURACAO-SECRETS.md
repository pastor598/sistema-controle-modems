# 🔐 Configuração de Secrets - GitHub Actions

## 📋 Secrets Necessários

Para que o workflow funcione completamente, você precisa configurar os seguintes secrets no seu repositório GitHub:

### 🔑 Secrets Obrigatórios

1. **`GITHUB_TOKEN`** ✅ (Já configurado automaticamente)
   - **Descrição**: Token para operações Git
   - **Valor**: Configurado automaticamente pelo GitHub
   - **Uso**: Commit e push automático

### 📊 Secrets para Google Sheets (Opcionais)

2. **`GOOGLE_SHEET_ID`**
   - **Descrição**: ID da planilha Google Sheets
   - **Como obter**: Na URL da planilha entre `/spreadsheets/d/` e `/edit`
   - **Exemplo**: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

3. **`GSHEET_CLIENT_EMAIL`**
   - **Descrição**: Email da conta de serviço Google
   - **Como obter**: No arquivo JSON da conta de serviço
   - **Exemplo**: `meu-projeto@meu-projeto.iam.gserviceaccount.com`

4. **`GSHEET_PRIVATE_KEY`**
   - **Descrição**: Chave privada da conta de serviço
   - **Como obter**: No arquivo JSON da conta de serviço (campo `private_key`)
   - **Formato**: Incluir `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`

---

## 🛠️ Como Configurar

### 1. Acessar Configurações do Repositório

1. Vá para seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**

### 2. Adicionar Secrets

Para cada secret necessário:

1. Clique em **New repository secret**
2. Digite o **Name** (nome do secret)
3. Cole o **Value** (valor do secret)
4. Clique em **Add secret**

---

## 📊 Configuração Google Sheets (Opcional)

### Passo 1: Criar Conta de Serviço

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Sheets API**:
   - Vá para **APIs & Services** → **Library**
   - Procure por "Google Sheets API"
   - Clique em **Enable**

### Passo 2: Criar Credenciais

1. Vá para **APIs & Services** → **Credentials**
2. Clique em **Create Credentials** → **Service Account**
3. Preencha os dados:
   - **Service account name**: `modem-control-sync`
   - **Description**: `Conta para sincronização ModemControl Pro`
4. Clique em **Create and Continue**
5. Pule as permissões (opcional)
6. Clique em **Done**

### Passo 3: Gerar Chave JSON

1. Na lista de contas de serviço, clique na conta criada
2. Vá para a aba **Keys**
3. Clique em **Add Key** → **Create new key**
4. Selecione **JSON** e clique em **Create**
5. Baixe o arquivo JSON

### Passo 4: Extrair Informações

Do arquivo JSON baixado, extraia:

```json
{
  "client_email": "COPIE_ESTE_VALOR",
  "private_key": "COPIE_ESTE_VALOR_COMPLETO"
}
```

### Passo 5: Compartilhar Planilha

1. Abra sua planilha Google Sheets
2. Clique em **Share** (Compartilhar)
3. Adicione o email da conta de serviço (`client_email`)
4. Dê permissão de **Editor**
5. Copie o ID da planilha da URL

---

## 🧪 Testando a Configuração

### Teste Manual do Workflow

1. Vá para **Actions** no seu repositório
2. Clique no workflow **"📊 Export Modem Data to CSV & Google Sheets"**
3. Clique em **Run workflow**
4. Configure as opções:
   - **Force update**: `true` (para teste)
   - **Export to Google Sheets**: `true` (se configurado)
5. Clique em **Run workflow**

### Verificar Logs

1. Clique na execução do workflow
2. Clique no job **"🚀 Export & Sync Data"**
3. Verifique os logs de cada step
4. Procure por mensagens de sucesso: ✅

### Verificar Resultados

1. **Arquivo CSV**: Verifique se `data/modem-data.csv` foi atualizado
2. **Metadata**: Verifique se `data/metadata.json` contém dados atualizados
3. **Google Sheets**: Verifique se a planilha foi atualizada (se configurado)

---

## 🔧 Troubleshooting

### Problemas Comuns

#### ❌ "Error: Resource not accessible by integration"
- **Causa**: Permissões insuficientes do GITHUB_TOKEN
- **Solução**: Verificar se o repositório permite Actions

#### ❌ "Google Sheets API error"
- **Causa**: Credenciais incorretas ou API não habilitada
- **Solução**: 
  1. Verificar se a API está habilitada
  2. Conferir os secrets `GSHEET_CLIENT_EMAIL` e `GSHEET_PRIVATE_KEY`
  3. Verificar se a planilha foi compartilhada

#### ❌ "Spreadsheet not found"
- **Causa**: ID da planilha incorreto
- **Solução**: Verificar o secret `GOOGLE_SHEET_ID`

#### ❌ "Permission denied"
- **Causa**: Conta de serviço sem acesso à planilha
- **Solução**: Compartilhar a planilha com o email da conta de serviço

### Logs Detalhados

Para debug, procure por estas mensagens nos logs:

```json
{"timestamp":"2025-07-02T20:45:00.000Z","level":"INFO","message":"Iniciando exportação de dados"}
{"timestamp":"2025-07-02T20:45:01.000Z","level":"INFO","message":"Novos dados gerados","data":{"count":5}}
{"timestamp":"2025-07-02T20:45:02.000Z","level":"SUCCESS","message":"Exportação concluída"}
```

---

## 📋 Checklist de Configuração

- [ ] **GITHUB_TOKEN** ✅ (Automático)
- [ ] **GOOGLE_SHEET_ID** (Opcional)
- [ ] **GSHEET_CLIENT_EMAIL** (Opcional)
- [ ] **GSHEET_PRIVATE_KEY** (Opcional)
- [ ] Google Sheets API habilitada
- [ ] Conta de serviço criada
- [ ] Planilha compartilhada
- [ ] Teste manual executado
- [ ] Logs verificados
- [ ] Resultados confirmados

---

## 🚀 Próximos Passos

Após configurar os secrets:

1. **Teste o workflow manualmente**
2. **Verifique a sincronização automática**
3. **Configure notificações** (opcional)
4. **Monitore os logs** regularmente
5. **Ajuste a frequência** se necessário

---

*Para mais informações, consulte a [documentação do GitHub Actions](https://docs.github.com/en/actions) e [Google Sheets API](https://developers.google.com/sheets/api).* 