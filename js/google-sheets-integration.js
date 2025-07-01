/* ===== INTEGRAÇÃO COM GOOGLE SHEETS ===== */
class GoogleSheetsIntegration {
    constructor() {
        this.scriptUrl = '';
        this.isConnected = false;
        this.syncInterval = null;
        this.lastSyncTime = null;
        this.isOnline = navigator.onLine;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Monitorar status da conexão
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateSyncStatus();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateSyncStatus();
        });
    }

    // Configurar URL do Google Apps Script
    setScriptUrl(url) {
        // Validar URL
        if (!this.isValidGoogleScriptUrl(url)) {
            throw new Error('URL inválida. Use uma URL do Google Apps Script válida.');
        }
        
        this.scriptUrl = url;
        localStorage.setItem('googleSheetsScriptUrl', url);
        this.isConnected = true;
        this.updateConnectionIndicator(true);
    }

    // Validar URL do Google Apps Script
    isValidGoogleScriptUrl(url) {
        const pattern = /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9-_]+\/exec$/;
        return pattern.test(url);
    }

    // Carregar configuração salva
    loadConfiguration() {
        const savedUrl = localStorage.getItem('googleSheetsScriptUrl');
        if (savedUrl) {
            this.scriptUrl = savedUrl;
            this.isConnected = true;
            this.updateConnectionIndicator(true);
        }
        
        const lastSync = localStorage.getItem('lastSyncTime');
        if (lastSync) {
            this.lastSyncTime = new Date(lastSync);
        }
    }

    // Atualizar indicador de conexão
    updateConnectionIndicator(connected) {
        const indicator = document.querySelector('.connection-indicator');
        if (indicator) {
            indicator.className = `connection-indicator ${connected ? 'connected' : 'disconnected'}`;
        }
    }

    // Mostrar feedback de ação
    showActionFeedback(message, isError = false) {
        // Remover feedback anterior se existir
        const existingFeedback = document.querySelector('.action-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        const feedback = document.createElement('div');
        feedback.className = `action-feedback ${isError ? 'error' : 'success'}`;
        feedback.innerHTML = `<i class="fas fa-${isError ? 'exclamation-triangle' : 'check-circle'}"></i> ${message}`;
        
        document.body.appendChild(feedback);
        
        // Mostrar feedback
        setTimeout(() => feedback.classList.add('show'), 100);
        
        // Remover após 4 segundos
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => feedback.remove(), 300);
        }, 4000);
    }

    // Sincronizar todos os dados com retry
    async syncAllData() {
        if (!this.isConnected || !this.scriptUrl) {
            throw new Error('Google Sheets não configurado');
        }

        if (!this.isOnline) {
            throw new Error('Sem conexão com a internet');
        }

        try {
            this.showActionFeedback('Sincronizando com Google Sheets...', false);
            
            const records = JSON.parse(localStorage.getItem('modemRecords')) || [];
            const models = JSON.parse(localStorage.getItem('modemModelsList')) || [];
            
            const payload = {
                action: 'syncAllData',
                records: records,
                models: models,
                timestamp: new Date().toISOString(),
                appVersion: '3.0.0'
            };

            const response = await this.makeRequest(payload);
            
            this.lastSyncTime = new Date();
            localStorage.setItem('lastSyncTime', this.lastSyncTime.toISOString());
            this.retryCount = 0; // Reset retry count on success
            
            this.showActionFeedback('Dados sincronizados com sucesso!', false);
            this.updateSyncStatus();
            
            // Marcar dados como sincronizados
            this.markDataAsSynced();
            
            return response;
            
        } catch (error) {
            console.error('Erro na sincronização:', error);
            
            // Retry logic
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                this.showActionFeedback(`Tentativa ${this.retryCount}/${this.maxRetries} falhou. Tentando novamente...`, true);
                await new Promise(resolve => setTimeout(resolve, 2000 * this.retryCount)); // Exponential backoff
                return this.syncAllData();
            }
            
            this.showActionFeedback('Erro na sincronização: ' + error.message, true);
            throw error;
        }
    }

    // Fazer requisição com timeout e tratamento de erro (versão simplificada para teste)
    async makeRequestSimple(payload, timeout = 30000) {
        try {
            console.log('🔄 Fazendo requisição para:', this.scriptUrl);
            console.log('📤 Payload:', payload);
            
            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            console.log('📥 Resposta recebida:', response);
            console.log('📊 Status:', response.status);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📄 Data:', data);
            return data;
            
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            console.error('📛 Tipo do erro:', error.name);
            console.error('💬 Mensagem:', error.message);
            throw error;
        }
    }

    // Fazer requisição usando no-cors mode para contornar CORS
    async makeRequestNoCors(payload, timeout = 30000) {
        try {
            console.log('🔄 Fazendo requisição NO-CORS para:', this.scriptUrl);
            console.log('📤 Payload:', payload);
            
            // Usar FormData para evitar preflight request
            const formData = new FormData();
            formData.append('data', JSON.stringify(payload));
            
            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                mode: 'no-cors', // SOLUÇÃO CORS
                body: formData
            });

            console.log('📥 Resposta recebida (no-cors):', response);
            console.log('📊 Status:', response.status);
            console.log('🆔 Type:', response.type);

            // Com no-cors, não conseguimos ler a resposta, mas podemos assumir sucesso se não houve erro
            if (response.type === 'opaque') {
                console.log('✅ Requisição enviada com sucesso (modo no-cors)');
                return {
                    success: true,
                    message: 'Requisição enviada com sucesso (modo no-cors)',
                    timestamp: new Date().toISOString()
                };
            }
            
            return {
                success: true,
                message: 'Conexão estabelecida',
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Erro na requisição no-cors:', error);
            console.error('📛 Tipo do erro:', error.name);
            console.error('💬 Mensagem:', error.message);
            throw error;
        }
    }

    // Fazer requisição com timeout e tratamento de erro
    async makeRequest(payload, timeout = 30000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Timeout na requisição. Verifique sua conexão.');
            }
            
            throw error;
        }
    }

    // Marcar dados como sincronizados
    markDataAsSynced() {
        const records = JSON.parse(localStorage.getItem('modemRecords')) || [];
        const syncedRecords = records.map(record => ({
            ...record,
            synced: true,
            syncedAt: new Date().toISOString()
        }));
        localStorage.setItem('modemRecords', JSON.stringify(syncedRecords));
    }

    // Sincronizar apenas novos registros (não sincronizados)
    async syncNewRecords(newRecords = null) {
        if (!this.isConnected || !this.scriptUrl || !this.isOnline) return;

        try {
            let recordsToSync;
            
            if (newRecords) {
                recordsToSync = newRecords;
            } else {
                // Buscar registros não sincronizados
                const allRecords = JSON.parse(localStorage.getItem('modemRecords')) || [];
                recordsToSync = allRecords.filter(record => !record.synced);
            }

            if (recordsToSync.length === 0) return;

            const payload = {
                action: 'addRecords',
                records: recordsToSync,
                timestamp: new Date().toISOString()
            };

            await this.makeRequest(payload);

            this.lastSyncTime = new Date();
            localStorage.setItem('lastSyncTime', this.lastSyncTime.toISOString());
            this.updateSyncStatus();
            
            // Marcar como sincronizados
            this.markDataAsSynced();
            
        } catch (error) {
            console.error('Erro na sincronização automática:', error);
        }
    }

    // Configurar sincronização automática com validação
    enableAutoSync(intervalMinutes = 5) {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        // Validar intervalo
        if (intervalMinutes < 1 || intervalMinutes > 1440) { // 1 min a 24h
            throw new Error('Intervalo deve ser entre 1 e 1440 minutos');
        }

        this.syncInterval = setInterval(async () => {
            try {
                await this.syncNewRecords(); // Sincronizar apenas novos registros
            } catch (error) {
                console.error('Erro na sincronização automática:', error);
            }
        }, intervalMinutes * 60 * 1000);

        localStorage.setItem('autoSyncEnabled', 'true');
        localStorage.setItem('autoSyncInterval', intervalMinutes.toString());
        
        this.showActionFeedback(`Sincronização automática ativada (${intervalMinutes} min)`, false);
    }

    // Desabilitar sincronização automática
    disableAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        localStorage.setItem('autoSyncEnabled', 'false');
        this.showActionFeedback('Sincronização automática desabilitada', false);
    }

    // Atualizar status da sincronização na UI com mais informações
    updateSyncStatus() {
        const statusElement = document.getElementById('sync-status');
        const lastSyncElement = document.getElementById('last-sync-time');
        
        if (statusElement) {
            let status = 'Desconectado';
            let className = 'status-disconnected';
            
            if (!this.isOnline) {
                status = 'Offline';
                className = 'status-disconnected';
            } else if (this.isConnected) {
                status = 'Conectado';
                className = 'status-connected';
            }
            
            statusElement.textContent = status;
            statusElement.className = className;
        }
        
        if (lastSyncElement && this.lastSyncTime) {
            const timeAgo = this.getTimeAgo(this.lastSyncTime);
            lastSyncElement.textContent = `${this.lastSyncTime.toLocaleString('pt-BR')} (${timeAgo})`;
        }
        
        this.updateConnectionIndicator(this.isConnected && this.isOnline);
    }

    // Atualizar status da conexão - método que estava faltando
    updateStatus(message, type = 'info') {
        console.log(`🔄 Status: ${message} (${type})`);
        
        // Tentar encontrar elemento de status
        const statusElements = [
            document.getElementById('connection-status'),
            document.getElementById('sync-status'),
            document.querySelector('.connection-status'),
            document.querySelector('.sync-status'),
            document.querySelector('[data-sync-status]')
        ];
        
        let statusElement = null;
        for (const element of statusElements) {
            if (element) {
                statusElement = element;
                break;
            }
        }
        
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-${type}`;
            
            // Adicionar classes visuais
            statusElement.classList.remove('status-success', 'status-error', 'status-warning', 'status-info');
            statusElement.classList.add(`status-${type}`);
        } else {
            // Se não encontrou elemento específico, usar showActionFeedback como fallback
            const isError = type === 'error';
            this.showActionFeedback(message, isError);
        }
        
        // Também atualizar o indicador de conexão baseado no tipo
        if (type === 'success') {
            this.updateConnectionIndicator(true);
        } else if (type === 'error') {
            this.updateConnectionIndicator(false);
        }
        
        // Log estruturado para debugging
        const logData = {
            timestamp: new Date().toISOString(),
            message: message,
            type: type,
            elementFound: !!statusElement
        };
        console.log('📊 Status Update:', logData);
    }

    // Calcular tempo decorrido
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`;
        if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
        if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
        return 'agora';
    }

    // Teste de conexão integrado com sistema de diagnóstico
    async testConnection() {
        const urlInput = document.getElementById('google-script-url');
        const testBtn = document.getElementById('test-connection-btn');
        
        if (!urlInput || !testBtn) {
            console.error('Elementos de UI não encontrados');
            return;
        }
        
        const url = urlInput.value.trim();
        
        if (!url) {
            this.updateStatus('❌ URL não configurada', 'error');
            // Usar sistema de diagnóstico para mostrar ajuda
            if (window.showDiagnosticResults) {
                window.showDiagnosticResults({
                    status: 'error',
                    issue: 'URL não configurada',
                    solutions: [
                        'Configure a URL do Google Apps Script nas configurações',
                        'Acesse https://script.google.com para criar o script',
                        'Siga o guia de configuração na seção de ajuda'
                    ]
                });
            }
            return;
        }
        
        // Salvar URL se válida
        if (this.isValidGoogleScriptUrl(url)) {
            this.setScriptUrl(url);
        }
        
        testBtn.disabled = true;
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testando...';
        
        try {
            // Usar o sistema de diagnóstico integrado
            if (window.diagnoseSync) {
                console.log('🔧 Usando sistema de diagnóstico integrado...');
                const result = await window.diagnoseSync();
                
                if (result.status === 'success') {
                    this.updateStatus('✅ Conectado', 'success');
                    this.isConnected = true;
                    this.updateSyncStatus();
                    
                    // Salvar último teste bem-sucedido
                    localStorage.setItem('lastSuccessfulTest', new Date().toISOString());
                    localStorage.removeItem('lastSyncError');
                    
                    // Mostrar resultado positivo
                    if (window.showDiagnosticResults) {
                        window.showDiagnosticResults(result);
                    }
                    
                    this.showActionFeedback('Conexão estabelecida com sucesso!', false);
                    
                } else {
                    this.updateStatus('❌ ' + result.issue, 'error');
                    this.isConnected = false;
                    
                    // Salvar erro para diagnóstico futuro
                    localStorage.setItem('lastSyncError', JSON.stringify({
                        error: result.issue,
                        timestamp: new Date().toISOString(),
                        url: url
                    }));
                    
                    // Mostrar resultado com diagnóstico
                    if (window.showDiagnosticResults) {
                        window.showDiagnosticResults(result);
                    }
                    
                    this.showActionFeedback('Erro na conexão: ' + result.issue, true);
                }
                
                return result;
                
            } else {
                // Fallback para teste básico se diagnóstico não estiver disponível
                console.log('⚠️ Sistema de diagnóstico não disponível, executando teste básico...');
                return await this.basicConnectionTest(url);
            }
            
        } catch (error) {
            console.error('❌ Erro durante teste de conexão:', error);
            this.updateStatus('❌ Erro: ' + error.message, 'error');
            this.isConnected = false;
            
            // Salvar erro
            localStorage.setItem('lastSyncError', JSON.stringify({
                error: error.message,
                timestamp: new Date().toISOString(),
                url: url
            }));
            
            this.showActionFeedback('Erro no teste: ' + error.message, true);
            
            // Mostrar erro no diagnóstico
            if (window.showDiagnosticResults) {
                window.showDiagnosticResults({
                    status: 'error',
                    issue: error.message,
                    solutions: [
                        'Verifique sua conexão com a internet',
                        'Certifique-se que a URL está correta',
                        'Verifique se o Google Apps Script está implantado',
                        'Execute a função setup() no Google Apps Script'
                    ]
                });
            }
            
            throw error;
            
        } finally {
            testBtn.disabled = false;
            testBtn.innerHTML = '<i class="fas fa-wifi"></i> Testar Conexão';
        }
    }
    
    // Teste básico de conexão como fallback
    async basicConnectionTest(url) {
        try {
            console.log('🔄 Executando teste básico de conexão...');
            
            const response = await fetch(url + '?test=ping&timestamp=' + Date.now(), {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json, text/plain, */*'
                }
            });
            
            console.log('📡 Resposta do servidor:', response.status, response.statusText);
            
            if (response.ok) {
                this.updateStatus('✅ Conectado', 'success');
                this.isConnected = true;
                
                const responseText = await response.text();
                console.log('📄 Conteúdo da resposta:', responseText.substring(0, 200) + '...');
                
                return { 
                    status: 'success', 
                    message: 'Conexão estabelecida com sucesso',
                    response: responseText
                };
            } else {
                const errorMsg = `Erro ${response.status}: ${response.statusText}`;
                this.updateStatus('❌ ' + errorMsg, 'error');
                this.isConnected = false;
                return { status: 'error', issue: errorMsg };
            }
            
        } catch (error) {
            console.error('❌ Erro no teste básico:', error);
            this.updateStatus('❌ Erro: ' + error.message, 'error');
            this.isConnected = false;
            
            // Analisar tipo de erro
            let issue = error.message;
            let solutions = [];
            
            if (error.message.includes('Failed to fetch')) {
                issue = 'Failed to fetch - Problema de conectividade';
                solutions = [
                    'Verifique sua conexão com a internet',
                    'Certifique-se que o Google Apps Script está implantado',
                    'Verifique se a URL está correta',
                    'Execute a função setup() no Google Apps Script'
                ];
            } else if (error.message.includes('CORS')) {
                issue = 'Erro de CORS - Problema de permissões';
                solutions = [
                    'Reimplante o Google Apps Script com permissões "Anyone with the link"',
                    'Verifique se todas as permissões foram concedidas',
                    'Execute a função setup() novamente'
                ];
            }
            
            return { status: 'error', issue: issue, solutions: solutions };
        }
    }
    
    // Teste de acessibilidade usando Image (contorna CORS)
    async testUrlAccessibility(url) {
        return new Promise((resolve) => {
            const img = new Image();
            const timeout = setTimeout(() => {
                resolve(false);
            }, 5000);
            
            img.onload = () => {
                clearTimeout(timeout);
                resolve(true);
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                resolve(false);
            };
            
            img.src = url + '?test=image&_=' + Date.now();
        });
    }
    
    // Teste com modo no-cors
    async testNoCorsRequest(url) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'action=test&timestamp=' + Date.now()
            });
            
            return {
                success: true,
                status: response.status,
                type: response.type,
                url: response.url
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                name: error.name
            };
        }
    }
    
    // Teste com CORS normal
    async testCorsRequest(url) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'action=test&timestamp=' + Date.now()
            });
            
            const responseData = {
                success: true,
                status: response.status,
                statusText: response.statusText,
                headers: {},
                body: null
            };
            
            // Capturar headers importantes
            ['access-control-allow-origin', 'content-type', 'server'].forEach(header => {
                const value = response.headers.get(header);
                if (value) responseData.headers[header] = value;
            });
            
            // Tentar ler o corpo da resposta
            try {
                responseData.body = await response.text();
            } catch (e) {
                responseData.body = '[Não foi possível ler o corpo da resposta]';
            }
            
            return responseData;
        } catch (error) {
            return {
                success: false,
                error: error.message,
                name: error.name
            };
        }
    }
    
    // Teste GET simples
    async testGetRequest(url) {
        try {
            const response = await fetch(url + '?action=test&method=GET&_=' + Date.now(), {
                method: 'GET',
                mode: 'cors'
            });
            
            return {
                success: true,
                status: response.status,
                statusText: response.statusText,
                body: await response.text()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                name: error.name
            };
        }
    }
    
    // Análise dos resultados do diagnóstico
    analyzeDiagnosticResults(results) {
        const { isAccessible, noCorsResult, corsResult, getResult, responseTime } = results;
        
        // Verificar se é erro 403
        const has403Error = [corsResult, getResult].some(result => 
            result.success && result.status === 403
        );
        
        if (has403Error) {
            return {
                type: 'ERRO_403_FORBIDDEN',
                severity: 'high',
                message: 'Google Apps Script retornando 403 (Proibido)',
                causes: [
                    'Script não implantado como Web App',
                    'Permissões configuradas incorretamente',
                    'Script precisa de nova autorização',
                    'URL da implantação pode estar desatualizada'
                ],
                solutions: [
                    '1. Vá ao Google Apps Script e reimplante como Web App',
                    '2. Certifique-se que "Quem tem acesso" está configurado como "Qualquer pessoa"',
                    '3. Execute a função setup() novamente para reautorizar',
                    '4. Copie a nova URL de implantação'
                ],
                technicalDetails: { corsResult, getResult, responseTime }
            };
        }
        
        // Verificar se é erro de CORS
        const hasCorsError = [corsResult, getResult].some(result => 
            !result.success && result.error.includes('CORS')
        );
        
        if (hasCorsError) {
            return {
                type: 'ERRO_CORS',
                severity: 'medium',
                message: 'Problema de CORS detectado',
                causes: [
                    'Headers CORS não configurados no Google Apps Script',
                    'Domínio não permitido nas configurações CORS'
                ],
                solutions: [
                    '1. Verifique o código do Google Apps Script',
                    '2. Certifique-se que headers CORS estão configurados',
                    '3. Teste com modo no-cors se apropriado'
                ],
                technicalDetails: { corsResult, getResult }
            };
        }
        
        // Verificar se conexão está ok
        if (noCorsResult.success) {
            return {
                type: 'CONEXAO_OK',
                severity: 'low',
                message: 'Conexão estabelecida com sucesso',
                causes: [],
                solutions: [],
                technicalDetails: { noCorsResult, responseTime }
            };
        }
        
        // Erro genérico
        return {
            type: 'ERRO_GENERICO',
            severity: 'high',
            message: 'Múltiplos problemas detectados',
            causes: ['Conectividade geral com Google Apps Script'],
            solutions: [
                '1. Verifique sua conexão com a internet',
                '2. Teste a URL diretamente no navegador',
                '3. Recrie a implantação do Google Apps Script'
            ],
            technicalDetails: results
        };
    }
    
    // Exibir resultados do diagnóstico
    displayDiagnosticResults(diagnosis, responseTime) {
        const statusDiv = document.getElementById('connectionStatus');
        
        let statusClass = 'error';
        let statusIcon = '❌';
        
        if (diagnosis.type === 'CONEXAO_OK') {
            statusClass = 'success';
            statusIcon = '✅';
        } else if (diagnosis.severity === 'medium') {
            statusIcon = '⚠️';
        }
        
        let html = `
            <div class="diagnostic-result ${statusClass}">
                <h4>${statusIcon} ${diagnosis.message}</h4>
                <p><strong>Tempo de resposta:</strong> ${responseTime}ms</p>
        `;
        
        if (diagnosis.causes.length > 0) {
            html += `
                <div class="diagnostic-section">
                    <strong>🔍 Possíveis Causas:</strong>
                    <ul>
                        ${diagnosis.causes.map(cause => `<li>${cause}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (diagnosis.solutions.length > 0) {
            html += `
                <div class="diagnostic-section">
                    <strong>🛠️ Soluções Recomendadas:</strong>
                    <ol>
                        ${diagnosis.solutions.map(solution => `<li>${solution}</li>`).join('')}
                    </ol>
                </div>
            `;
        }
        
        // Botão para ver detalhes técnicos
        html += `
            <div class="diagnostic-section">
                <button onclick="console.log('🔍 DETALHES TÉCNICOS:', ${JSON.stringify(diagnosis.technicalDetails, null, 2)}); alert('Detalhes técnicos foram exibidos no console do navegador (F12)');" 
                        style="background: #f0f0f0; border: 1px solid #ccc; padding: 5px 10px; cursor: pointer;">
                    📋 Ver Detalhes Técnicos no Console
                </button>
            </div>
        `;
        
        html += `</div>`;
        
        statusDiv.innerHTML = html;
        
        // Log detalhado no console
        console.log('📋 RELATÓRIO COMPLETO DE DIAGNÓSTICO:');
        console.log('='.repeat(50));
        console.log('Tipo:', diagnosis.type);
        console.log('Severidade:', diagnosis.severity);
        console.log('Mensagem:', diagnosis.message);
        console.log('Tempo de resposta:', responseTime + 'ms');
        console.log('Causas:', diagnosis.causes);
        console.log('Soluções:', diagnosis.solutions);
        console.log('Detalhes técnicos:', diagnosis.technicalDetails);
        console.log('='.repeat(50));
    }

    // Gerar relatório com mais opções
    async generateAutomaticReport(type = 'monthly', filters = {}) {
        if (!this.isConnected) {
            throw new Error('Google Sheets não conectado');
        }

        try {
            const records = JSON.parse(localStorage.getItem('modemRecords')) || [];
            
            // Aplicar filtros se especificados
            const filteredRecords = this.applyReportFilters(records, filters);
            
            const payload = {
                action: 'generateReport',
                type: type,
                records: filteredRecords,
                filters: filters,
                timestamp: new Date().toISOString(),
                totalRecords: records.length,
                filteredCount: filteredRecords.length
            };

            const result = await this.makeRequest(payload);
            
            this.showActionFeedback(`Relatório ${type} gerado com ${filteredRecords.length} registros!`, false);
            
            return result;
            
        } catch (error) {
            console.error('Erro na geração de relatório:', error);
            this.showActionFeedback('Erro ao gerar relatório: ' + error.message, true);
            throw error;
        }
    }

    // Aplicar filtros aos registros para relatório
    applyReportFilters(records, filters) {
        return records.filter(record => {
            if (filters.dateFrom && record.date < filters.dateFrom) return false;
            if (filters.dateTo && record.date > filters.dateTo) return false;
            if (filters.manufacturer && record.model.fabricante !== filters.manufacturer) return false;
            if (filters.minQuantity && record.quantity < filters.minQuantity) return false;
            return true;
        });
    }

    // Backup com compressão e validação
    async createBackup() {
        if (!this.isConnected) {
            throw new Error('Google Sheets não conectado');
        }

        try {
            const allData = {
                records: JSON.parse(localStorage.getItem('modemRecords')) || [],
                models: JSON.parse(localStorage.getItem('modemModelsList')) || [],
                settings: {
                    dailyGoal: localStorage.getItem('dailyGoal'),
                    theme: localStorage.getItem('theme'),
                    autoSyncEnabled: localStorage.getItem('autoSyncEnabled'),
                    autoSyncInterval: localStorage.getItem('autoSyncInterval')
                },
                metadata: {
                    version: '3.0.0',
                    backupDate: new Date().toISOString(),
                    totalRecords: (JSON.parse(localStorage.getItem('modemRecords')) || []).length,
                    totalModels: (JSON.parse(localStorage.getItem('modemModelsList')) || []).length
                }
            };

            const payload = {
                action: 'createBackup',
                data: allData,
                timestamp: new Date().toISOString(),
                backupType: 'manual'
            };

            const result = await this.makeRequest(payload);
            
            // Salvar referência do último backup
            localStorage.setItem('lastBackupTime', new Date().toISOString());
            
            this.showActionFeedback('Backup criado com sucesso!', false);
            
            return result;
            
        } catch (error) {
            console.error('Erro na criação de backup:', error);
            this.showActionFeedback('Erro ao criar backup: ' + error.message, true);
            throw error;
        }
    }

    // Verificar status de saúde da sincronização
    getHealthStatus() {
        const lastSync = this.lastSyncTime;
        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
        
        return {
            isConnected: this.isConnected,
            isOnline: this.isOnline,
            lastSync: lastSync,
            needsSync: !lastSync || lastSync < oneDayAgo,
            unsyncedRecords: this.getUnsyncedRecordsCount()
        };
    }

    // Contar registros não sincronizados
    getUnsyncedRecordsCount() {
        const records = JSON.parse(localStorage.getItem('modemRecords')) || [];
        return records.filter(record => !record.synced).length;
    }
}

// Instância global
const googleSheetsIntegration = new GoogleSheetsIntegration();

// Inicializar integração quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    googleSheetsIntegration.loadConfiguration();
    
    // Verificar se auto-sync está habilitado
    const autoSyncEnabled = localStorage.getItem('autoSyncEnabled') === 'true';
    const autoSyncInterval = parseInt(localStorage.getItem('autoSyncInterval')) || 5;
    
    if (autoSyncEnabled && googleSheetsIntegration.isConnected) {
        googleSheetsIntegration.enableAutoSync(autoSyncInterval);
    }
    
    // Atualizar status inicial
    googleSheetsIntegration.updateSyncStatus();
    
    // Atualizar status a cada 30 segundos
    setInterval(() => {
        googleSheetsIntegration.updateSyncStatus();
    }, 30000);
});

// Hook para sincronizar quando novos registros forem adicionados
const originalAddRecord = window.addRecord;
if (originalAddRecord) {
    window.addRecord = function() {
        const result = originalAddRecord.apply(this, arguments);
        
        // Sincronizar novo registro se conectado
        if (googleSheetsIntegration.isConnected && googleSheetsIntegration.isOnline) {
            const records = JSON.parse(localStorage.getItem('modemRecords')) || [];
            const lastRecord = records[records.length - 1];
            if (lastRecord) {
                // Marcar como não sincronizado inicialmente
                lastRecord.synced = false;
                localStorage.setItem('modemRecords', JSON.stringify(records));
                
                // Sincronizar em background
                setTimeout(() => {
                    googleSheetsIntegration.syncNewRecords([lastRecord]).catch(console.error);
                }, 1000);
            }
        }
        
        return result;
    };
}

// Disponibilizar globalmente
window.googleSheetsIntegration = googleSheetsIntegration; 