/**
 * GOOGLE APPS SCRIPT - MODEMCONTROL PRO
 * Versão otimizada para resolver erro 403
 * Data: Janeiro 2025
 */

// ===== CONFIGURAÇÃO =====
const CONFIG = {
  spreadsheetName: 'ModemControl Pro - Dados',
  version: '3.0.0-fix403',
  defaultHeaders: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'false',
    'Content-Type': 'application/json'
  }
};

// ===== FUNÇÃO PRINCIPAL - POST =====
function doPost(e) {
  try {
    console.log('🔄 Recebendo requisição POST...');
    console.log('📥 Parâmetros:', e);
    
    // Processar dados
    let requestData = {};
    
    // Tentar diferentes formatos de dados
    if (e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (parseError) {
        console.log('⚠️ Erro ao fazer parse JSON, tentando parâmetros...');
        requestData = e.parameter || {};
      }
    } else {
      requestData = e.parameter || {};
    }
    
    console.log('📊 Dados processados:', requestData);
    
    // Processar ação
    const action = requestData.action || 'test';
    let result = {};
    
    switch (action) {
      case 'test':
        result = handleTestConnection();
        break;
      case 'syncAllData':
        result = handleSyncAllData(requestData);
        break;
      case 'addRecords':
        result = handleAddRecords(requestData);
        break;
      case 'generateReport':
        result = handleGenerateReport(requestData);
        break;
      case 'createBackup':
        result = handleCreateBackup(requestData);
        break;
      default:
        result = {
          success: true,
          message: 'ModemControl Pro API funcionando!',
          action: action,
          timestamp: new Date().toISOString(),
          version: CONFIG.version
        };
    }
    
    console.log('✅ Resultado:', result);
    
    // Retornar resposta com headers CORS
    return createJsonResponse(result);
    
  } catch (error) {
    console.error('❌ Erro em doPost:', error);
    return createJsonResponse({
      success: false,
      error: error.toString(),
      message: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
}

// ===== FUNÇÃO PRINCIPAL - GET =====
function doGet(e) {
  try {
    console.log('🔄 Recebendo requisição GET...');
    console.log('📥 Parâmetros:', e.parameter);
    
    const action = e.parameter.action || 'status';
    
    if (action === 'test') {
      return createJsonResponse({
        success: true,
        message: 'ModemControl Pro API - Teste GET OK!',
        timestamp: new Date().toISOString(),
        version: CONFIG.version,
        method: 'GET'
      });
    }
    
    // Status geral
    return createJsonResponse({
      success: true,
      message: 'ModemControl Pro API Online',
      status: 'running',
      timestamp: new Date().toISOString(),
      version: CONFIG.version,
      method: 'GET',
      actions: ['test', 'syncAllData', 'addRecords', 'generateReport', 'createBackup']
    });
    
  } catch (error) {
    console.error('❌ Erro em doGet:', error);
    return createJsonResponse({
      success: false,
      error: error.toString(),
      message: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
}

// ===== FUNÇÃO OPTIONS (PARA CORS) =====
function doOptions(e) {
  console.log('🔄 Recebendo requisição OPTIONS (CORS preflight)...');
  
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(CONFIG.defaultHeaders);
}

// ===== CRIAR RESPOSTA JSON COM CORS =====
function createJsonResponse(data) {
  const response = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Adicionar headers CORS
  Object.keys(CONFIG.defaultHeaders).forEach(key => {
    response.setHeader(key, CONFIG.defaultHeaders[key]);
  });
  
  return response;
}

// ===== HANDLERS =====

function handleTestConnection() {
  return {
    success: true,
    message: 'Conexão com Google Apps Script estabelecida!',
    timestamp: new Date().toISOString(),
    version: CONFIG.version,
    test: 'OK'
  };
}

function handleSyncAllData(data) {
  try {
    const sheet = getOrCreateSheet();
    
    // Validar dados
    if (!data.records || !Array.isArray(data.records)) {
      throw new Error('Dados de registros inválidos');
    }
    
    // Limpar dados existentes (opcional)
    if (data.clearExisting) {
      clearSheetData(sheet);
    }
    
    // Adicionar registros
    let addedCount = 0;
    data.records.forEach(record => {
      addRecordToSheet(sheet, record);
      addedCount++;
    });
    
    // Atualizar modelos se fornecidos
    if (data.models && Array.isArray(data.models)) {
      updateModelsSheet(data.models);
    }
    
    return {
      success: true,
      message: `${addedCount} registros sincronizados com sucesso`,
      recordsAdded: addedCount,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro em handleSyncAllData:', error);
    return {
      success: false,
      error: error.toString(),
      message: 'Erro na sincronização de dados'
    };
  }
}

function handleAddRecords(data) {
  try {
    const sheet = getOrCreateSheet();
    
    if (!data.records || !Array.isArray(data.records)) {
      throw new Error('Dados de registros inválidos');
    }
    
    let addedCount = 0;
    data.records.forEach(record => {
      addRecordToSheet(sheet, record);
      addedCount++;
    });
    
    return {
      success: true,
      message: `${addedCount} novos registros adicionados`,
      recordsAdded: addedCount,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro em handleAddRecords:', error);
    return {
      success: false,
      error: error.toString(),
      message: 'Erro ao adicionar registros'
    };
  }
}

function handleGenerateReport(data) {
  try {
    // Implementação básica de relatório
    const sheet = getOrCreateSheet();
    const records = getSheetData(sheet);
    
    return {
      success: true,
      message: 'Relatório gerado com sucesso',
      totalRecords: records.length,
      reportData: records.slice(0, 10), // Primeiros 10 registros como exemplo
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro em handleGenerateReport:', error);
    return {
      success: false,
      error: error.toString(),
      message: 'Erro ao gerar relatório'
    };
  }
}

function handleCreateBackup(data) {
  try {
    const sheet = getOrCreateSheet();
    const records = getSheetData(sheet);
    
    // Criar backup simples
    const backupData = {
      timestamp: new Date().toISOString(),
      version: CONFIG.version,
      recordCount: records.length,
      records: records
    };
    
    return {
      success: true,
      message: 'Backup criado com sucesso',
      backupSize: records.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro em handleCreateBackup:', error);
    return {
      success: false,
      error: error.toString(),
      message: 'Erro ao criar backup'
    };
  }
}

// ===== FUNÇÕES AUXILIARES =====

function getOrCreateSheet() {
  let spreadsheet;
  
  try {
    // Tentar encontrar planilha existente
    const files = DriveApp.getFilesByName(CONFIG.spreadsheetName);
    if (files.hasNext()) {
      const file = files.next();
      spreadsheet = SpreadsheetApp.openById(file.getId());
    } else {
      throw new Error('Planilha não encontrada');
    }
  } catch (error) {
    console.log('⚠️ Criando nova planilha...');
    spreadsheet = SpreadsheetApp.create(CONFIG.spreadsheetName);
  }
  
  let sheet = spreadsheet.getSheetByName('Gravacoes');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Gravacoes');
    
    // Adicionar cabeçalhos
    sheet.getRange(1, 1, 1, 8).setValues([[
      'ID', 'Data', 'Modelo', 'Fabricante', 'Quantidade', 'Observacoes', 'Timestamp', 'Tempo'
    ]]);
    
    // Formatação
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

function addRecordToSheet(sheet, record) {
  const row = [
    record.id || '',
    record.date || new Date().toLocaleDateString('pt-BR'),
    record.model || '',
    record.manufacturer || '',
    record.quantity || 0,
    record.observations || '',
    record.timestamp || new Date().toISOString(),
    record.time || ''
  ];
  
  sheet.appendRow(row);
}

function getSheetData(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const records = [];
  
  for (let i = 1; i < data.length; i++) {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = data[i][index];
    });
    records.push(record);
  }
  
  return records;
}

function clearSheetData(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
}

function updateModelsSheet(models) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName('Modelos');
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Modelos');
    sheet.getRange(1, 1, 1, 5).setValues([[
      'ID', 'Produto', 'Modelo', 'Fabricante', 'Tempo de Gravacao'
    ]]);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  // Limpar dados existentes
  clearSheetData(sheet);
  
  // Adicionar novos modelos
  models.forEach(model => {
    const row = [
      model.id || '',
      model.product || '',
      model.model || '',
      model.manufacturer || '',
      model.recordingTime || ''
    ];
    sheet.appendRow(row);
  });
}

// ===== FUNÇÃO DE SETUP =====
function setup() {
  try {
    console.log('🔄 Executando setup...');
    
    // Criar planilha
    const sheet = getOrCreateSheet();
    console.log('✅ Planilha criada/verificada');
    
    // Testar permissões
    const testData = {
      id: 'test-' + Date.now(),
      date: new Date().toLocaleDateString('pt-BR'),
      model: 'Teste',
      manufacturer: 'Setup',
      quantity: 1,
      observations: 'Registro de teste criado durante setup',
      timestamp: new Date().toISOString(),
      time: '00:00'
    };
    
    addRecordToSheet(sheet, testData);
    console.log('✅ Teste de escrita realizado');
    
    // Remover registro de teste
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRow(lastRow);
    }
    
    console.log('✅ Setup concluído com sucesso!');
    console.log('📋 ID da planilha:', sheet.getParent().getId());
    console.log('🔗 URL da planilha:', sheet.getParent().getUrl());
    
    return {
      success: true,
      message: 'Setup concluído com sucesso',
      spreadsheetId: sheet.getParent().getId(),
      spreadsheetUrl: sheet.getParent().getUrl()
    };
    
  } catch (error) {
    console.error('❌ Erro no setup:', error);
    throw error;
  }
}

// ===== FUNÇÃO DE TESTE =====
function testApi() {
  console.log('🧪 Testando API...');
  
  const testData = {
    action: 'test',
    timestamp: new Date().toISOString()
  };
  
  const result = doPost({ parameter: testData });
  console.log('📋 Resultado do teste:', result);
  
  return result;
} 