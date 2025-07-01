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
     * Buscar dados do GitHub
     */
    async fetchFromGitHub() {
        try {
            const csvUrl = this.baseUrl + this.dataPath;
            const metadataUrl = this.baseUrl + this.metadataPath;
            
            console.log('📡 Buscando dados:', csvUrl);
            
            // Buscar CSV
            const csvResponse = await fetch(csvUrl);
            if (!csvResponse.ok) {
                throw new Error(`Erro HTTP: ${csvResponse.status}`);
            }
            
            const csvText = await csvResponse.text();
            const records = this.parseCSV(csvText);
            
            // Buscar metadata (opcional)
            let metadata = null;
            try {
                const metadataResponse = await fetch(metadataUrl);
                if (metadataResponse.ok) {
                    metadata = await metadataResponse.json();
                }
            } catch (e) {
                console.log('⚠️ Metadata não encontrada');
            }
            
            return {
                records: records,
                metadata: metadata,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Erro ao buscar do GitHub:', error);
            throw error;
        }
    }
    
    /**
     * Converter CSV para array de objetos
     */
    parseCSV(csvText) {
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
     * Converter dados para CSV
     */
    convertToCSV(records) {
        if (records.length === 0) return '';
        
        // Headers
        const headers = ['id', 'data', 'modelo', 'fabricante', 'quantidade', 'observacoes', 'timestamp'];
        
        // Converter registros
        const rows = records.map(record => [
            record.id || '',
            record.date || '',
            (record.model && record.model.modelo) || '',
            (record.model && record.model.fabricante) || '',
            record.quantity || 0,
            record.notes || '',
            record.timestamp || ''
        ]);
        
        // Combinar headers e rows
        const allRows = [headers, ...rows];
        
        // Converter para CSV
        return allRows.map(row => 
            row.map(cell => {
                const value = String(cell);
                if (value.includes(',') || value.includes('"')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        ).join('\n');
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
     * Atualizar status da interface
     */
    updateStatus() {
        const statusElement = document.getElementById('github-status');
        if (statusElement) {
            const lastSyncText = this.lastSync 
                ? `Última sincronização: ${new Date(this.lastSync).toLocaleString()}`
                : 'Nunca sincronizado';
            
            statusElement.innerHTML = `
                <div class="github-status">
                    <span class="status-indicator ${this.lastSync ? 'connected' : 'disconnected'}"></span>
                    <span>${lastSyncText}</span>
                </div>
            `;
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