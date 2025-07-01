/**
 * Script para testar a conexão com o Google Apps Script
 * Este arquivo resolve o problema de CORS
 */

// Função para testar a conexão com o Google Apps Script
async function testarConexao(url) {
  try {
    console.log('🔍 Testando conexão com: ' + url);
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors'
    });
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexão bem-sucedida!', data);
      
      // Atualiza o status na interface
      atualizarStatus('✅ Conectado', 'success');
      
      return data;
    } else {
      console.error('❌ Erro na resposta:', response.status, response.statusText);
      
      // Atualiza o status na interface
      atualizarStatus('❌ Erro: ' + response.status + ' ' + response.statusText, 'error');
      
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    
    // Verifica se é um erro de CORS
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      console.error('🔒 Erro de CORS detectado!');
      
      // Atualiza o status na interface com instruções específicas
      atualizarStatus('❌ Erro de CORS: Verifique se o Google Apps Script está configurado corretamente', 'error');
      
      // Exibe instruções detalhadas
      exibirInstrucoesCORS();
    } else {
      // Atualiza o status na interface
      atualizarStatus('❌ Erro: ' + error.message, 'error');
    }
    
    return null;
  }
}

// Função para enviar dados para o Google Apps Script
async function enviarDados(url, dados) {
  try {
    console.log('📤 Enviando dados:', dados);
    
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados enviados com sucesso!', data);
      
      // Atualiza o status na interface
      atualizarStatus('✅ Dados enviados com sucesso!', 'success');
      
      return data;
    } else {
      console.error('❌ Erro ao enviar dados:', response.status, response.statusText);
      
      // Atualiza o status na interface
      atualizarStatus('❌ Erro ao enviar dados: ' + response.status + ' ' + response.statusText, 'error');
      
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar dados:', error);
    
    // Atualiza o status na interface
    atualizarStatus('❌ Erro ao enviar dados: ' + error.message, 'error');
    
    return null;
  }
}

// Função para atualizar o status na interface
function atualizarStatus(mensagem, tipo) {
  const statusElement = document.getElementById('status');
  
  if (statusElement) {
    statusElement.textContent = mensagem;
    statusElement.className = 'status ' + tipo;
  }
}

// Função para exibir instruções detalhadas sobre como resolver o erro de CORS
function exibirInstrucoesCORS() {
  const instrucoesElement = document.getElementById('instrucoes');
  
  if (instrucoesElement) {
    instrucoesElement.innerHTML = `
      <div class="card error">
        <h3>🔒 Erro de CORS Detectado</h3>
        <p>O navegador bloqueou a requisição devido a uma política de segurança chamada CORS (Cross-Origin Resource Sharing).</p>
        
        <h4>Como resolver:</h4>
        <ol>
          <li>Acesse <a href="https://script.google.com" target="_blank" rel="noopener">script.google.com</a></li>
          <li>Crie um novo projeto</li>
          <li>Cole o código do arquivo <code>cors-fix.gs</code></li>
          <li>Salve o projeto (Ctrl+S)</li>
          <li>Clique em "Implantar" &gt; "Nova implantação"</li>
          <li>Selecione "Aplicativo da web"</li>
          <li>Defina "Executar como" para "Eu"</li>
          <li>Defina "Quem tem acesso" para "Qualquer pessoa"</li>
          <li>Clique em "Implantar"</li>
          <li>Copie a URL gerada e cole-a no campo acima</li>
        </ol>
      </div>
    `;
    
    instrucoesElement.style.display = 'block';
  }
}

// Função para inicializar o sistema
function inicializar() {
  // Verifica se a URL do Google Apps Script está armazenada
  const urlArmazenada = localStorage.getItem('googleAppsScriptUrl');
  
  if (urlArmazenada) {
    const urlInput = document.getElementById('scriptUrl');
    
    if (urlInput) {
      urlInput.value = urlArmazenada;
    }
  }
  
  // Adiciona o evento de clique ao botão de teste
  const botaoTestar = document.getElementById('btnTestar');
  
  if (botaoTestar) {
    botaoTestar.addEventListener('click', async () => {
      const urlInput = document.getElementById('scriptUrl');
      
      if (urlInput && urlInput.value) {
        // Armazena a URL para uso futuro
        localStorage.setItem('googleAppsScriptUrl', urlInput.value);
        
        // Testa a conexão
        await testarConexao(urlInput.value);
      } else {
        atualizarStatus('❌ Informe a URL do Google Apps Script', 'error');
      }
    });
  }
  
  // Adiciona o evento de clique ao botão de enviar
  const botaoEnviar = document.getElementById('btnEnviar');
  
  if (botaoEnviar) {
    botaoEnviar.addEventListener('click', async () => {
      const urlInput = document.getElementById('scriptUrl');
      const modeloInput = document.getElementById('modelo');
      const quantidadeInput = document.getElementById('quantidade');
      const observacoesInput = document.getElementById('observacoes');
      
      if (urlInput && urlInput.value) {
        // Armazena a URL para uso futuro
        localStorage.setItem('googleAppsScriptUrl', urlInput.value);
        
        // Prepara os dados
        const dados = {
          modelo: modeloInput ? modeloInput.value : 'Teste',
          quantidade: quantidadeInput ? parseInt(quantidadeInput.value) || 1 : 1,
          observacoes: observacoesInput ? observacoesInput.value : 'Teste de conexão'
        };
        
        // Envia os dados
        await enviarDados(urlInput.value, dados);
      } else {
        atualizarStatus('❌ Informe a URL do Google Apps Script', 'error');
      }
    });
  }
}

// Inicializa o sistema quando o documento estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
} 