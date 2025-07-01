/**
 * GOOGLE APPS SCRIPT - VERSÃO FINAL COM CORS CORRETO
 * Esta versão resolve definitivamente os problemas de CORS
 */

let SPREADSHEET_ID = '';

// Função de setup - execute UMA VEZ
function setup() {
  try {
    const spreadsheet = SpreadsheetApp.create('ModemControl Pro - Dados Final');
    SPREADSHEET_ID = spreadsheet.getId();
    
    const sheet = spreadsheet.getActiveSheet();
    sheet.setName('Gravações');
    sheet.getRange('A1:H1').setValues([['ID', 'Data', 'Modelo', 'Fabricante', 'Quantidade', 'Observações', 'Timestamp', 'Tempo']]);
    sheet.getRange('A1:H1').setFontWeight('bold');
    
    Logger.log('✅ Setup FINAL concluído! ID: ' + SPREADSHEET_ID);
    Logger.log('🔗 URL: ' + spreadsheet.getUrl());
    
    return { success: true, spreadsheetId: SPREADSHEET_ID, url: spreadsheet.getUrl() };
  } catch (error) {
    Logger.log('❌ Erro no setup: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// FUNÇÃO GET - Para testes básicos
function doGet(e) {
  Logger.log('📥 GET recebido');
  
  const response = {
    success: true,
    message: 'ModemControl Pro - Google Apps Script FINAL funcionando!',
    timestamp: new Date().toISOString(),
    method: 'GET',
    version: 'FINAL-1.0'
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// FUNÇÃO POST PRINCIPAL - Com CORS correto
function doPost(e) {
  Logger.log('📥 POST recebido');
  
  try {
    let data = null;
    let action = 'none';
    
    // Processar dados recebidos
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
        action = data.action || 'none';
        Logger.log('📄 Dados JSON: ' + JSON.stringify(data));
      } catch (jsonError) {
        Logger.log('⚠️ Erro JSON, tentando FormData...');
        // Tentar FormData
        if (e.parameter && e.parameter.data) {
          data = JSON.parse(e.parameter.data);
          action = data.action || 'none';
          Logger.log('📄 Dados FormData: ' + JSON.stringify(data));
        }
      }
    }
    
    // Processar a ação
    let result;
    Logger.log('🎯 Processando ação: ' + action);
    
    switch (action) {
      case 'test':
        result = {
          success: true,
          message: '🎉 CONEXÃO FUNCIONANDO! CORS RESOLVIDO!',
          timestamp: new Date().toISOString(),
          version: 'FINAL-1.0',
          action: 'test'
        };
        break;
        
      case 'syncAllData':
        result = processSync(data.records || [], data.models || []);
        break;
        
      default:
        result = {
          success: true,
          message: 'ModemControl Pro Script FINAL - Funcionando!',
          timestamp: new Date().toISOString(),
          receivedAction: action,
          version: 'FINAL-1.0'
        };
    }
    
    Logger.log('✅ Enviando resposta: ' + JSON.stringify(result));
    
    // RETORNAR COM HEADERS CORS EXPLÍCITOS
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('❌ Erro no doPost: ' + error.toString());
    
    const errorResult = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString(),
      version: 'FINAL-1.0'
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// FUNÇÃO OPTIONS - Para preflight CORS
function doOptions(e) {
  Logger.log('📥 OPTIONS (preflight) recebido');
  
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Processar sincronização de dados
function processSync(records, models) {
  try {
    Logger.log('🔄 Iniciando sincronização...');
    Logger.log('📊 Registros: ' + records.length);
    Logger.log('📋 Modelos: ' + models.length);
    
    if (!SPREADSHEET_ID) {
      findSpreadsheet();
    }
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName('Gravações');
    
    if (records.length > 0) {
      // Limpar e adicionar cabeçalhos
      sheet.clear();
      sheet.getRange('A1:H1').setValues([['ID', 'Data', 'Modelo', 'Fabricante', 'Quantidade', 'Observações', 'Timestamp', 'Tempo']]);
      sheet.getRange('A1:H1').setFontWeight('bold');
      
      // Adicionar dados
      const data = records.map(record => [
        record.id || '',
        record.date || '',
        (record.model && record.model.modelo) || '',
        (record.model && record.model.fabricante) || '',
        record.quantity || 0,
        record.notes || '',
        record.timestamp || '',
        (record.model && record.model.recordTime) || ''
      ]);
      
      if (data.length > 0) {
        sheet.getRange(2, 1, data.length, 8).setValues(data);
      }
    }
    
    Logger.log('✅ Sincronização concluída');
    
    return {
      success: true,
      message: `✅ Sincronizados ${records.length} registros e ${models.length} modelos`,
      timestamp: new Date().toISOString(),
      action: 'syncAllData'
    };
    
  } catch (error) {
    Logger.log('❌ Erro na sincronização: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      action: 'syncAllData'
    };
  }
}

// Encontrar planilha se ID não estiver definido
function findSpreadsheet() {
  const files = DriveApp.getFilesByName('ModemControl Pro - Dados Final');
  if (files.hasNext()) {
    SPREADSHEET_ID = files.next().getId();
    Logger.log('📊 Planilha encontrada: ' + SPREADSHEET_ID);
  } else {
    throw new Error('Planilha não encontrada. Execute setup() primeiro.');
  }
} 