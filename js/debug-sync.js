// Debug System for Google Sheets Sync Issues
console.log('🔧 Loading Sync Debug System...');

// Quick diagnostic function
window.diagnoseSync = async function() {
    console.group('🔍 DIAGNÓSTICO DE SINCRONIZAÇÃO');
    
    try {
        // 1. Check basic configuration
        const scriptUrl = localStorage.getItem('googleSheetsScriptUrl');
        console.log('📋 URL configurada:', scriptUrl || 'NÃO CONFIGURADA');
        
        if (!scriptUrl) {
            console.error('❌ PROBLEMA: URL do Google Apps Script não configurada');
            console.log('💡 SOLUÇÃO: Configure a URL nas Configurações > Integração Google Sheets');
            return { status: 'error', issue: 'URL não configurada' };
        }
        
        // 2. Validate URL format
        const isValidUrl = /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(scriptUrl);
        console.log('🔗 Formato da URL:', isValidUrl ? 'VÁLIDO' : 'INVÁLIDO');
        
        if (!isValidUrl) {
            console.error('❌ PROBLEMA: Formato de URL inválido');
            console.log('💡 SOLUÇÃO: Use uma URL no formato: https://script.google.com/macros/s/SEU_ID/exec');
            return { status: 'error', issue: 'URL inválida' };
        }
        
        // 3. Test connectivity
        console.log('🌐 Testando conectividade...');
        const response = await fetch(scriptUrl + '?test=ping', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json, text/plain, */*'
            }
        });
        
        console.log('📡 Status da resposta:', response.status, response.statusText);
        
        if (response.status === 403) {
            console.error('❌ PROBLEMA: Erro 403 - Acesso negado');
            console.log('💡 SOLUÇÃO: Reimplante o Google Apps Script com permissões corretas');
            return { status: 'error', issue: '403 Forbidden' };
        }
        
        if (response.status === 404) {
            console.error('❌ PROBLEMA: Erro 404 - Script não encontrado');
            console.log('💡 SOLUÇÃO: Verifique se a URL está correta e o script está implantado');
            return { status: 'error', issue: '404 Not Found' };
        }
        
        if (response.ok) {
            console.log('✅ Conectividade: OK');
            const responseText = await response.text();
            console.log('📄 Resposta do servidor:', responseText.substring(0, 200) + '...');
            
            return { 
                status: 'success', 
                message: 'Conexão estabelecida com sucesso',
                response: responseText
            };
        }
        
    } catch (error) {
        console.error('❌ ERRO:', error.message);
        
        if (error.message.includes('Failed to fetch')) {
            console.log('💡 SOLUÇÕES POSSÍVEIS:');
            console.log('   1. Verifique sua conexão com a internet');
            console.log('   2. Certifique-se que o Google Apps Script está implantado');
            console.log('   3. Verifique se a URL está correta');
            console.log('   4. Execute a função setup() no Google Apps Script');
            return { status: 'error', issue: 'Failed to fetch', solutions: [
                'Verificar conexão com internet',
                'Reimplantar Google Apps Script',
                'Verificar URL',
                'Executar função setup()'
            ]};
        }
        
        if (error.message.includes('CORS')) {
            console.log('💡 PROBLEMA DE CORS:');
            console.log('   1. O Google Apps Script deve ser implantado como "Anyone with the link"');
            console.log('   2. Verifique se todas as permissões foram concedidas');
            return { status: 'error', issue: 'CORS error', solutions: [
                'Reimplantar com permissões "Anyone with the link"',
                'Conceder todas as permissões solicitadas'
            ]};
        }
        
        return { status: 'error', issue: error.message };
    }
    
    console.groupEnd();
};

// Quick fix function
window.quickFixSync = async function() {
    console.log('🔧 Executando correção rápida...');
    
    const scriptUrl = localStorage.getItem('googleSheetsScriptUrl');
    
    if (!scriptUrl) {
        const newUrl = prompt(
            'URL do Google Apps Script não configurada.\n\n' +
            'Cole aqui a URL do seu Google Apps Script:'
        );
        
        if (newUrl && newUrl.includes('script.google.com')) {
            localStorage.setItem('googleSheetsScriptUrl', newUrl);
            console.log('✅ URL configurada!');
            
            // Update integration if available
            if (window.googleSheetsIntegration) {
                window.googleSheetsIntegration.setScriptUrl(newUrl);
                window.googleSheetsIntegration.updateSyncStatus();
            }
            
            // Test connection
            return await window.diagnoseSync();
        } else {
            console.log('❌ URL inválida ou cancelada');
            return { status: 'cancelled' };
        }
    }
    
    // Try to fix common issues
    try {
        // Reset sync settings
        localStorage.setItem('autoSyncEnabled', 'false');
        localStorage.setItem('autoSyncInterval', '5');
        
        // Clear error flags
        localStorage.removeItem('lastSyncError');
        
        // Test connection
        const result = await window.diagnoseSync();
        
        if (result.status === 'success') {
            console.log('✅ Correção concluída com sucesso!');
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Erro durante correção:', error);
        return { status: 'error', issue: error.message };
    }
};

// Display diagnostic results in UI
window.showDiagnosticResults = function(result) {
    const statusDiv = document.getElementById('connectionStatus') || 
                     document.querySelector('#sync-status')?.parentElement;
    
    if (!statusDiv) {
        console.log('📋 Elemento de status não encontrado na UI');
        return;
    }
    
    let html = '';
    let className = '';
    
    if (result.status === 'success') {
        className = 'diagnostic-success';
        html = `
            <div class="${className}">
                <h4>✅ Conexão Estabelecida</h4>
                <p>${result.message}</p>
                <small>Teste realizado em ${new Date().toLocaleString()}</small>
            </div>
        `;
    } else if (result.status === 'error') {
        className = 'diagnostic-error';
        html = `
            <div class="${className}">
                <h4>❌ Problema Detectado</h4>
                <p><strong>Erro:</strong> ${result.issue}</p>
        `;
        
        if (result.solutions) {
            html += `
                <div style="margin-top: 10px;">
                    <strong>💡 Soluções:</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        ${result.solutions.map(solution => `<li>${solution}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        html += `
                <div style="margin-top: 15px;">
                    <button onclick="window.quickFixSync().then(r => window.showDiagnosticResults(r))" 
                            style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                        🔧 Correção Automática
                    </button>
                    <button onclick="window.openGoogleScriptHelp()" 
                            style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        📚 Ajuda
                    </button>
                </div>
                <small>Diagnóstico realizado em ${new Date().toLocaleString()}</small>
            </div>
        `;
    }
    
    statusDiv.innerHTML = html;
    
    // Add CSS for styling if not exists
    if (!document.getElementById('diagnostic-styles')) {
        const style = document.createElement('style');
        style.id = 'diagnostic-styles';
        style.textContent = `
            .diagnostic-success {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 15px;
                border-radius: 5px;
                margin: 10px 0;
            }
            .diagnostic-error {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
                padding: 15px;
                border-radius: 5px;
                margin: 10px 0;
            }
            .diagnostic-success h4, .diagnostic-error h4 {
                margin: 0 0 10px 0;
                font-size: 1.1em;
            }
        `;
        document.head.appendChild(style);
    }
};

// Help function
window.openGoogleScriptHelp = function() {
    const helpContent = `
COMO CONFIGURAR O GOOGLE APPS SCRIPT:

1. Acesse: https://script.google.com
2. Clique em "Novo projeto"
3. Cole o código dos arquivos .gs fornecidos
4. Execute a função setup() uma vez (clique em ▶️)
5. Autorize todas as permissões solicitadas
6. Vá em "Implantar" > "Nova implantação"
7. Escolha tipo: "Aplicativo da web"
8. Configure "Quem tem acesso": "Qualquer pessoa"
9. Clique em "Implantar"
10. Copie a URL gerada e cole nas configurações

PROBLEMAS COMUNS:
- Erro 403: Reimplante com permissões "Qualquer pessoa"
- Erro 404: Verifique se a URL está correta
- Failed to fetch: Verifique conexão e URL

Precisa de ajuda? Execute: window.diagnoseSync()
    `;
    
    alert(helpContent);
};

// Auto-run diagnostic on page load if there are sync issues
document.addEventListener('DOMContentLoaded', () => {
    // Check if there are recent sync errors
    const lastSyncError = localStorage.getItem('lastSyncError');
    const scriptUrl = localStorage.getItem('googleSheetsScriptUrl');
    
    if (lastSyncError || !scriptUrl) {
        console.log('🔍 Problemas de sincronização detectados, executando diagnóstico em 3 segundos...');
        setTimeout(async () => {
            const result = await window.diagnoseSync();
            window.showDiagnosticResults(result);
        }, 3000);
    }
});

// Override the test connection function to use diagnostic
if (window.googleSheetsIntegration) {
    const originalTestConnection = window.googleSheetsIntegration.testConnection;
    const integrationInstance = window.googleSheetsIntegration;
    
    window.googleSheetsIntegration.testConnection = async function() {
        try {
            const result = await window.diagnoseSync();
            window.showDiagnosticResults(result);
            
            if (result.status === 'success') {
                integrationInstance.updateStatus('✅ Conectado', 'success');
                return result;
            } else {
                integrationInstance.updateStatus('❌ ' + result.issue, 'error');
                throw new Error(result.issue);
            }
        } catch (error) {
            integrationInstance.updateStatus('❌ Erro: ' + error.message, 'error');
            throw error;
        }
    };
}

console.log('✅ Sistema de Debug carregado!');
console.log('💡 Comandos disponíveis:');
console.log('   - window.diagnoseSync(): Diagnóstico completo');
console.log('   - window.quickFixSync(): Correção automática');
console.log('   - window.openGoogleScriptHelp(): Ajuda'); 