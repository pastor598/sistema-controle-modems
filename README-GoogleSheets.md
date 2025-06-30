# 📊 Integração ModemControl Pro com Google Sheets

## 🎯 Funcionalidades

A integração com Google Sheets oferece recursos avançados para sincronização e análise de dados:

### ✅ **Funcionalidades Principais**

- **Sincronização inteligente** - Apenas registros não sincronizados são enviados
- **Backup automático** em nuvem com metadados completos
- **Relatórios personalizados** com filtros avançados
- **Dashboard em tempo real** no Google Sheets
- **Monitoramento de saúde** da sincronização
- **Retry automático** em caso de falha de conexão

### ✅ **Recursos Avançados**

- **Validação de URL** do Google Apps Script
- **Timeout configurável** para requisições
- **Indicadores visuais** de status de conexão
- **Feedback em tempo real** das operações
- **Sincronização offline-aware** (detecta conexão)
- **Compressão de dados** para backups

## 🚀 Configuração Passo a Passo

### 1. Preparar o Google Apps Script

1. Acesse [script.google.com](https://script.google.com)
2. Clique em "**Novo projeto**"
3. Renomeie para "**ModemControl Pro Integration**"
4. Apague o código padrão e cole todo o conteúdo do arquivo `google-apps-script.gs`
5. Salve o projeto (Ctrl+S)

### 2. Configurar a Planilha

1. No Apps Script, clique em "**Executar**" ao lado da função `setup`
2. Autorize as permissões quando solicitado (pode aparecer aviso de segurança)
3. Aguarde a execução (pode demorar alguns segundos)
4. Verifique o log para confirmar que a planilha foi criada
5. **Importante**: Anote o ID da planilha que aparecerá no log

### 3. Implantar como Web App

1. No Apps Script, clique em "**Implantar**" → "**Nova implantação**"
2. Clique no ícone de engrenagem ⚙️ e selecione "**Aplicativo da Web**"
3. Configure:
   - **Descrição**: ModemControl Pro API v3.0
   - **Executar como**: Eu (seu email)
   - **Quem tem acesso**: Qualquer pessoa
4. Clique em "**Implantar**"
5. **CRÍTICO**: Copie a URL do aplicativo web (algo como `https://script.google.com/macros/s/ABC123.../exec`)

### 4. Configurar no ModemControl Pro

1. Abra o ModemControl Pro
2. Vá para **Configurações** → **Integração Google Sheets**
3. Cole a URL do web app no campo específico
4. Clique em "**Testar Conexão**" para verificar (deve mostrar tempo de resposta)
5. Configure as opções de sincronização conforme desejado

## 🔧 Configurações Disponíveis

### 🔄 Sincronização Automática

- **Intervalos**: 5, 15, 30 ou 60 minutos
- **Sincronização Inteligente**: Apenas registros novos/modificados
- **Retry Automático**: Até 3 tentativas com backoff exponencial
- **Detecção de Offline**: Pausa automaticamente quando offline

### 📊 Relatórios Personalizados

- **Filtros Avançados**: Por data, fabricante, quantidade mínima
- **Tipos**: Manual, mensal, personalizado
- **Envio por Email**: Automático para relatórios mensais
- **Estatísticas**: Total filtrado vs. total geral de registros

### 💾 Backup e Recuperação

- **Backup Manual**: Sob demanda com um clique
- **Backup Automático**: Semanal (domingos às 10h)
- **Metadados Completos**: Versão, data, estatísticas
- **Compressão JSON**: Dados otimizados para armazenamento

## 📋 Estrutura da Planilha Atualizada

### 1. **📝 Gravações**

- **Colunas**: ID, Data, Modelo, Fabricante, Quantidade, Observações, Timestamp, Tempo
- **Recursos**: Formatação automática, frozen headers, filtros

### 2. **📱 Modelos**

- **Colunas**: ID, Produto, Modelo, Fabricante, Tempo de Gravação
- **Recursos**: Lista atualizada automaticamente

### 3. **📊 Dashboard**

- **Métricas**: Total de gravações, hoje, modelos cadastrados
- **Top 5**: Modelos mais gravados (atualizado automaticamente)
- **Fórmulas**: Cálculos em tempo real
- **Última Atualização**: Timestamp de sincronização

### 4. **💾 Backup**

- **Histórico**: Todos os backups com timestamp
- **Metadados**: Versão, contadores, tipo de backup
- **Formato**: JSON estruturado para recuperação

## 🎨 Recursos Visuais

### 🚦 Indicadores de Status

- **🟢 Verde**: Conectado e online
- **🔴 Vermelho**: Desconectado ou offline
- **⚡ Animações**: Durante sincronização

### 📱 Feedback em Tempo Real

- **Toast Notifications**: Confirmações e erros
- **Tempo de Resposta**: Mostrado nos testes de conexão
- **Contadores**: Registros sincronizados vs. pendentes

### 🎯 Monitoramento de Saúde

- **Status de Conexão**: Online/offline detection
- **Última Sincronização**: Com indicação de "há X tempo"
- **Registros Pendentes**: Contador de não sincronizados

## 🔒 Segurança e Privacidade

### 🛡️ **Validações de Segurança**

- ✅ Validação rigorosa de URL do Google Script
- ✅ Timeout configurável para evitar travamentos
- ✅ Dados criptografados em trânsito (HTTPS obrigatório)
- ✅ Retry inteligente para evitar spam de requisições

### 📊 **Auditoria e Logs**

- ✅ Logs detalhados no Google Apps Script
- ✅ Timestamp de todas as operações
- ✅ Controle de versão dos dados
- ✅ Metadados de backup para rastreabilidade

## 🛠️ Solução de Problemas Avançada

### ❌ **Erro "URL Inválida"**

**Causa**: URL do Google Apps Script malformada

**Solução**:

- Verifique se a URL segue o padrão: `https://script.google.com/macros/s/[ID]/exec`
- Reimplante o web app se necessário
- Copie a URL exata da página de implantação

### ⏱️ **Timeout na Requisição**

**Causa**: Conexão lenta ou planilha muito grande

**Solução**:

- Verifique sua conexão de internet
- Reduza a frequência de sincronização automática
- Use "Sincronizar Agora" em horários de menor tráfego

### 🔄 **Sincronização Falhando**

**Causa**: Problemas temporários de rede ou Google

**Solução**:

- O sistema tentará automaticamente 3x com intervalo crescente
- Verifique o status no indicador visual
- Se persistir, teste a conexão manualmente

### 📱 **App Script com Erro de Permissão**

**Causa**: Configurações de privacidade do Google

**Solução**:

1. No Apps Script, vá em "Executar" → "Revisar permissões"
2. Avance nas telas de segurança (pode aparecer "App não verificado")
3. Clique em "Avançado" → "Ir para [nome do projeto] (não seguro)"
4. Autorize todas as permissões solicitadas

## 📈 Novos Recursos v3.0

### 🧠 **Inteligência de Sincronização**

- **Sync Diferencial**: Apenas dados modificados
- **Queue Offline**: Dados ficam em fila quando offline
- **Health Check**: Monitoramento contínuo da conexão

### 🎨 **Melhorias Visuais**

- **Gradientes**: Interface mais moderna para configurações
- **Animações**: Feedback visual durante operações
- **Responsividade**: Melhor experiência em dispositivos móveis

### ⚡ **Performance**

- **Timeout Inteligente**: 30s para sync, 10s para testes
- **Retry Exponencial**: Intervalos crescentes entre tentativas
- **Compressão**: Dados otimizados para transferência

## 📞 Suporte Técnico

### 🔍 **Diagnóstico Automático**

- Use "Testar Conexão" para verificar latência
- Verifique o console do navegador (F12) para erros detalhados
- Monitore os logs do Google Apps Script

### 📧 **Informações Úteis para Suporte**

- Versão do navegador e sistema operacional
- URL do Google Apps Script (sem expor credenciais)
- Logs de erro específicos
- Tamanho aproximado da base de dados

### 🆘 **Recuperação de Emergência**

1. **Backup dos Dados**: Exporte via Excel antes de grandes mudanças
2. **Recriar Integração**: Execute `setup()` novamente se necessário
3. **Limpeza**: Remova dados duplicados usando filtros do Google Sheets

---

## 🎯 **Dicas Pro**

💡 **Para melhor performance**: Configure sync automático para 15-30 min em vez de 5 min

💡 **Para relatórios**: Use filtros do Google Sheets para análises avançadas

💡 **Para backup**: Configure backup automático e teste a recuperação periodicamente

💡 **Para colaboração**: Compartilhe apenas a planilha, mantenha o Apps Script privado

---

**⚠️ Importante**: Mantenha sempre uma cópia de segurança local dos dados importantes. A integração é um complemento, não um substituto para boas práticas de backup.