/**
 * INTEGRAÇÃO GITHUB - ModemControl Pro
 * Conecta o sistema local com GitHub e Google Sheets
 */

class GitHubIntegration {
    constructor() {
        this.githubRepo = 'pastor598/sistema-controle-modems';
        this.githubBranch = 'main';
        this.dataPath = 'data/modem-data.csv';
        this.metadataPath = 'data/metadata.json';
        this.baseUrl = `https://raw.githubusercontent.com/${this.githubRepo}/${this.githubBranch}/`;
        
        this.lastSync = localStorage.getItem('github_last_sync') || null;
        this.autoSyncInterval = null;
        
        this.init();
    }
    
    init() {
        console.log('🔧 Inicializando GitHub Integration...');
        this.updateStatus();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Botão de sincronização manual
        const syncBtn = document.getElementById('github-sync-btn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.manualSync());
        }
        
        // Botão de exportação para GitHub
        const exportBtn = document.getElementById('github-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToGitHub());
        }
        
        // Botão para trigger workflow
        const triggerBtn = document.getElementById('github-trigger-workflow-btn');
        if (triggerBtn) {
            triggerBtn.addEventListener('click', () => this.triggerWorkflow());
        }
        
        // Toggle auto-sync
        const autoSyncToggle = document.getElementById('github-auto-sync');
        if (autoSyncToggle) {
            autoSyncToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.enableAutoSync();
                } else {
                    this.disableAutoSync();
                }
            });
        }
    }
    
    /**
     * Sincronização manual com GitHub
     */
    async manualSync() {
        try {
            console.log('🔄 Iniciando sincronização manual...');
            this.showStatus('Sincronizando com GitHub...', 'info');
            
            const data = await this.fetchFromGitHub();
            
            if (data && data.records) {
                // Atualizar dados locais
                this.updateLocalData(data.records);
                
                // Trigger Google Sheets update
                await this.triggerGoogleSheetsUpdate();
                
                this.lastSync = new Date().toISOString();
                localStorage.setItem('github_last_sync', this.lastSync);
                
                this.showStatus(`✅ Sincronizado! ${data.records.length} registros`, 'success');
                this.updateStatus();
                
            } else {
                this.showStatus('⚠️ Nenhum dado encontrado no GitHub', 'warning');
            }
            
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            this.showStatus('❌ Erro na sincronização: ' + error.message, 'error');
        }
    }
    
    /**
     * Buscar dados do GitHub com retry e validação
     */
    async fetchFromGitHub(retryCount = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= retryCount; attempt++) {
            try {
                const csvUrl = this.baseUrl + this.dataPath;
                const metadataUrl = this.baseUrl + this.metadataPath;
                
                console.log(`📡 Buscando dados (tentativa ${attempt}/${retryCount}):`, csvUrl);
                
                // Buscar CSV com timeout
                const csvResponse = await this.fetchWithTimeout(csvUrl, 10000);
                
                if (!csvResponse.ok) {
                    throw new Error(`HTTP ${csvResponse.status}: ${csvResponse.statusText}`);
                }
                
                const csvText = await csvResponse.text();
                
                // Validar CSV
                if (!csvText || csvText.trim().length === 0) {
                    throw new Error('CSV vazio ou inválido');
                }
                
                // Validar estrutura do CSV
                if (window.CSVParser) {
                    const validation = window.CSVParser.validate(csvText);
                    if (!validation.valid) {
                        throw new Error(`CSV inválido: ${validation.error}`);
                    }
                    console.log(`✅ CSV válido: ${validation.rowCount} registros, ${validation.columnCount} colunas`);
                }
                
                const records = this.parseCSV(csvText);
                
                if (records.length === 0) {
                    console.warn('⚠️ Nenhum registro encontrado no CSV');
                }
                
                // Buscar metadata (opcional)
                let metadata = null;
                try {
                    const metadataResponse = await this.fetchWithTimeout(metadataUrl, 5000);
                    if (metadataResponse.ok) {
                        const metadataText = await metadataResponse.text();
                        metadata = JSON.parse(metadataText);
                        console.log('📋 Metadata carregada:', metadata);
                    }
                } catch (e) {
                    console.log('⚠️ Metadata não encontrada ou inválida');
                }
                
                return {
                    records: records,
                    metadata: metadata,
                    timestamp: new Date().toISOString(),
                    source: 'github',
                    attempt: attempt
                };
                
            } catch (error) {
                lastError = error;
                console.error(`❌ Tentativa ${attempt} falhou:`, error.message);
                
                if (attempt < retryCount) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
                    console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error('❌ Todas as tentativas falharam');
                    throw new Error(`Falha após ${retryCount} tentativas: ${lastError.message}`);
                }
            }
        }
    }

    /**
     * Fetch com timeout
     */
    async fetchWithTimeout(url, timeout = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`Timeout após ${timeout}ms`);
            }
            throw error;
        }
    }
    
    /**
     * Converter CSV para array de objetos usando parser robusto
     */
    parseCSV(csvText) {
        try {
            // Usar o parser CSV robusto se disponível
            if (window.CSVParser) {
                return window.CSVParser.parse(csvText);
            }
            
            // Fallback para parser simples
            const lines = csvText.trim().split('\n');
            if (lines.length < 2) return [];
            
            const headers = lines[0].split(',');
            const records = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                const record = {};
                
                headers.forEach((header, index) => {
                    record[header.trim()] = values[index] ? values[index].trim() : '';
                });
                
                records.push(record);
            }
            
            return records;
        } catch (error) {
            console.error('❌ Erro ao fazer parse do CSV:', error);
            return [];
        }
    }
    
    /**
     * Atualizar dados locais
     */
    updateLocalData(records) {
        try {
            // Converter para formato do sistema
            const formattedRecords = records.map((record, index) => ({
                id: record.id || index + 1,
                date: record.data || new Date().toISOString().split('T')[0],
                model: {
                    modelo: record.modelo || '',
                    fabricante: record.fabricante || ''
                },
                quantity: parseInt(record.quantidade) || 0,
                notes: record.observacoes || '',
                timestamp: record.timestamp || new Date().toISOString(),
                synced: true,
                source: 'github'
            }));
            
            // Salvar no localStorage
            localStorage.setItem('modemRecords', JSON.stringify(formattedRecords));
            
            // Atualizar interface se disponível
            if (typeof updateStats === 'function') {
                updateStats();
            }
            
            if (typeof showRecords === 'function') {
                showRecords(formattedRecords);
            }
            
            console.log('✅ Dados locais atualizados:', formattedRecords.length, 'registros');
            
        } catch (error) {
            console.error('❌ Erro ao atualizar dados locais:', error);
        }
    }
    
    /**
     * Exportar dados locais para formato GitHub
     */
    async exportToGitHub() {
        try {
            console.log('📤 Preparando exportação para GitHub...');
            
            const records = JSON.parse(localStorage.getItem('modemRecords') || '[]');
            
            if (records.length === 0) {
                this.showStatus('⚠️ Nenhum dado para exportar', 'warning');
                return;
            }
            
            // Converter para CSV
            const csvData = this.convertToCSV(records);
            
            // Criar metadata
            const metadata = {
                lastUpdate: new Date().toISOString(),
                recordCount: records.length,
                version: '1.0',
                source: 'ModemControl Pro'
            };
            
            // Mostrar dados para copy/paste manual
            this.showExportModal(csvData, metadata);
            
        } catch (error) {
            console.error('❌ Erro na exportação:', error);
            this.showStatus('❌ Erro na exportação: ' + error.message, 'error');
        }
    }
    
    /**
     * Converter dados para CSV usando parser robusto
     */
    convertToCSV(records) {
        if (records.length === 0) return '';
        
        try {
            // Converter registros para formato padronizado
            const csvData = records.map(record => ({
                id: record.id || '',
                data: record.date || '',
                modelo: (record.model && record.model.modelo) || '',
                fabricante: (record.model && record.model.fabricante) || '',
                quantidade: record.quantity || 0,
                observacoes: record.notes || '',
                timestamp: record.timestamp || ''
            }));
            
            // Usar parser CSV robusto se disponível
            if (window.CSVParser) {
                return window.CSVParser.stringify(csvData);
            }
            
            // Fallback para conversão simples
            const headers = ['id', 'data', 'modelo', 'fabricante', 'quantidade', 'observacoes', 'timestamp'];
            const allRows = [headers, ...csvData.map(record => Object.values(record))];
            
            return allRows.map(row => 
                row.map(cell => {
                    const value = String(cell);
                    if (value.includes(',') || value.includes('"')) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            ).join('\n');
            
        } catch (error) {
            console.error('❌ Erro ao converter para CSV:', error);
            return '';
        }
    }
    
    /**
     * Trigger atualização do Google Sheets
     */
    async triggerGoogleSheetsUpdate() {
        if (window.googleSheetsIntegration) {
            try {
                await window.googleSheetsIntegration.syncAllData();
                console.log('✅ Google Sheets atualizado');
            } catch (error) {
                console.error('⚠️ Erro ao atualizar Google Sheets:', error);
            }
        }
    }
    
    /**
     * Auto-sync
     */
    enableAutoSync(intervalMinutes = 30) {
        this.disableAutoSync(); // Limpar anterior
        
        this.autoSyncInterval = setInterval(() => {
            console.log('🔄 Auto-sync executando...');
            this.manualSync();
        }, intervalMinutes * 60 * 1000);
        
        console.log(`✅ Auto-sync habilitado (${intervalMinutes} min)`);
        this.showStatus(`Auto-sync habilitado (${intervalMinutes} min)`, 'info');
    }
    
    disableAutoSync() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
            this.autoSyncInterval = null;
            console.log('🔄 Auto-sync desabilitado');
        }
    }
    
    /**
     * Trigger manual do GitHub Actions workflow
     */
    async triggerWorkflow() {
        try {
            this.showStatus('🚀 Iniciando workflow do GitHub Actions...', 'info');
            this.showProgress(true, 'Disparando workflow...');
            
            // Como não podemos fazer chamadas diretas para a API do GitHub devido ao CORS,
            // vamos abrir a página do GitHub Actions para trigger manual
            const actionsUrl = `https://github.com/${this.githubRepo}/actions/workflows/export-data.yml`;
            
            // Mostrar modal com instruções
            this.showWorkflowModal(actionsUrl);
            
            this.showProgress(false);
            
        } catch (error) {
            console.error('❌ Erro ao disparar workflow:', error);
            this.showStatus('❌ Erro ao disparar workflow: ' + error.message, 'error');
            this.showProgress(false);
        }
    }

    /**
     * Mostrar modal com instruções para trigger manual
     */
    showWorkflowModal(actionsUrl) {
        const modal = document.createElement('div');
        modal.className = 'workflow-trigger-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🚀 Trigger GitHub Actions Workflow</h3>
                <p>Para executar o workflow de exportação de dados:</p>
                
                <ol class="workflow-steps">
                    <li>Clique no botão abaixo para abrir o GitHub Actions</li>
                    <li>Encontre o workflow "Export Modem Data to CSV"</li>
                    <li>Clique em "Run workflow" → "Run workflow"</li>
                    <li>Aguarde a execução (≈ 1-2 minutos)</li>
                    <li>Os dados serão atualizados automaticamente</li>
                </ol>
                
                <div class="modal-actions">
                    <a href="${actionsUrl}" target="_blank" rel="noopener" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i> Abrir GitHub Actions
                    </a>
                    <button onclick="this.closest('.workflow-trigger-modal').remove()" class="btn btn-secondary">
                        Fechar
                    </button>
                </div>
                
                <div class="workflow-info">
                    <p><strong>💡 Dica:</strong> O workflow também executa automaticamente:</p>
                    <ul>
                        <li>A cada 15 minutos</li>
                        <li>Diariamente às 9h</li>
                        <li>A cada push na branch main</li>
                    </ul>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-remover após 30 segundos
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 30000);
    }

    /**
     * Mostrar/ocultar barra de progresso
     */
    showProgress(show, text = 'Sincronizando...') {
        const progressElement = document.getElementById('sync-progress');
        const progressText = document.getElementById('sync-progress-text');
        const progressFill = document.getElementById('sync-progress-fill');
        
        if (progressElement) {
            progressElement.style.display = show ? 'block' : 'none';
        }
        
        if (progressText) {
            progressText.textContent = text;
        }
        
        if (progressFill && show) {
            // Animação de progresso
            let width = 0;
            const interval = setInterval(() => {
                width += Math.random() * 20;
                if (width > 90) {
                    clearInterval(interval);
                    width = 90;
                }
                progressFill.style.width = width + '%';
            }, 200);
            
            // Completar quando ocultar
            setTimeout(() => {
                if (!show) {
                    clearInterval(interval);
                    progressFill.style.width = '100%';
                    setTimeout(() => {
                        progressFill.style.width = '0%';
                    }, 500);
                }
            }, 100);
        }
    }

    /**
     * Atualizar status da interface
     */
    updateStatus() {
        // Atualizar status de conexão
        const connectionStatus = document.getElementById('connection-status');
        if (connectionStatus) {
            if (this.lastSync) {
                connectionStatus.textContent = 'Conectado';
                connectionStatus.className = 'status-value connected';
            } else {
                connectionStatus.textContent = 'Desconectado';
                connectionStatus.className = 'status-value disconnected';
            }
        }
        
        // Atualizar última sincronização
        const lastSyncDisplay = document.getElementById('last-sync-display');
        if (lastSyncDisplay) {
            if (this.lastSync) {
                const date = new Date(this.lastSync);
                lastSyncDisplay.textContent = date.toLocaleString('pt-BR');
            } else {
                lastSyncDisplay.textContent = 'Nunca';
            }
        }
        
        // Atualizar contagem de registros
        const recordCount = document.getElementById('sync-record-count');
        if (recordCount) {
            const records = JSON.parse(localStorage.getItem('modemRecords') || '[]');
            const syncedRecords = records.filter(r => r.synced);
            recordCount.textContent = syncedRecords.length;
        }
    }
    
    /**
     * Mostrar status temporário
     */
    showStatus(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        if (typeof showNotification === 'function') {
            showNotification(message, type === 'error');
        }
    }
    
    /**
     * Modal de exportação
     */
    showExportModal(csvData, metadata) {
        const modal = document.createElement('div');
        modal.className = 'github-export-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>📤 Exportar para GitHub</h3>
                <p>Cole estes dados nos arquivos do seu repositório GitHub:</p>
                
                <div class="export-section">
                    <h4>📄 data/modem-data.csv</h4>
                    <textarea readonly rows="10">${csvData}</textarea>
                    <button onclick="navigator.clipboard.writeText(\`${csvData.replace(/`/g, '\\`')}\`)">📋 Copiar CSV</button>
                </div>
                
                <div class="export-section">
                    <h4>📊 data/metadata.json</h4>
                    <textarea readonly rows="5">${JSON.stringify(metadata, null, 2)}</textarea>
                    <button onclick="navigator.clipboard.writeText(\`${JSON.stringify(metadata, null, 2).replace(/`/g, '\\`')}\`)">📋 Copiar Metadata</button>
                </div>
                
                <div class="modal-actions">
                    <button onclick="this.closest('.github-export-modal').remove()">Fechar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

// Inicializar quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
    window.gitHubIntegration = new GitHubIntegration();
}); 