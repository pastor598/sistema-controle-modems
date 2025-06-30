/**
 * GOOGLE APPS SCRIPT - VERSAO LIMPA SEM ERRO DE SINTAXE
 * Cole este codigo no Google Apps Script
 */

var SPREADSHEET_ID = '';

function setup() {
  try {
    var spreadsheet = SpreadsheetApp.create('ModemControl Pro - Dados');
    SPREADSHEET_ID = spreadsheet.getId();
    
    var sheet = spreadsheet.getActiveSheet();
    sheet.setName('Gravacoes');
    sheet.getRange('A1:H1').setValues([['ID', 'Data', 'Modelo', 'Fabricante', 'Quantidade', 'Observacoes', 'Timestamp', 'Tempo']]);
    sheet.getRange('A1:H1').setFontWeight('bold');
    
    Logger.log('Setup concluido! ID: ' + SPREADSHEET_ID);
    Logger.log('URL: ' + spreadsheet.getUrl());
    
    return {
      success: true,
      spreadsheetId: SPREADSHEET_ID,
      url: spreadsheet.getUrl()
    };
  } catch (error) {
    Logger.log('Erro no setup: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

function doGet(e) {
  Logger.log('GET recebido');
  
  var response = {
    success: true,
    message: 'ModemControl Pro - Google Apps Script funcionando!',
    timestamp: new Date().toISOString(),
    method: 'GET',
    version: 'CLEAN-1.0'
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  Logger.log('POST recebido');
  
  try {
    var data = null;
    var action = 'none';
    
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
        action = data.action || 'none';
        Logger.log('Dados JSON: ' + JSON.stringify(data));
      } catch (jsonError) {
        Logger.log('Erro JSON, tentando FormData...');
        if (e.parameter && e.parameter.data) {
          data = JSON.parse(e.parameter.data);
          action = data.action || 'none';
          Logger.log('Dados FormData: ' + JSON.stringify(data));
        }
      }
    }
    
    var result;
    Logger.log('Processando acao: ' + action);
    
    if (action === 'test') {
      result = {
        success: true,
        message: 'CONEXAO FUNCIONANDO! CORS RESOLVIDO!',
        timestamp: new Date().toISOString(),
        version: 'CLEAN-1.0',
        action: 'test'
      };
    } else if (action === 'syncAllData') {
      result = processSync(data.records || [], data.models || []);
    } else {
      result = {
        success: true,
        message: 'ModemControl Pro Script funcionando!',
        timestamp: new Date().toISOString(),
        receivedAction: action,
        version: 'CLEAN-1.0'
      };
    }
    
    Logger.log('Enviando resposta: ' + JSON.stringify(result));
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Erro no doPost: ' + error.toString());
    
    var errorResult = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString(),
      version: 'CLEAN-1.0'
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  Logger.log('OPTIONS (preflight) recebido');
  
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function processSync(records, models) {
  try {
    Logger.log('Iniciando sincronizacao...');
    Logger.log('Registros: ' + records.length);
    Logger.log('Modelos: ' + models.length);
    
    if (!SPREADSHEET_ID) {
      findSpreadsheet();
    }
    
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheetByName('Gravacoes');
    
    if (records.length > 0) {
      sheet.clear();
      sheet.getRange('A1:H1').setValues([['ID', 'Data', 'Modelo', 'Fabricante', 'Quantidade', 'Observacoes', 'Timestamp', 'Tempo']]);
      sheet.getRange('A1:H1').setFontWeight('bold');
      
      var data = records.map(function(record) {
        return [
          record.id || '',
          record.date || '',
          (record.model && record.model.modelo) || '',
          (record.model && record.model.fabricante) || '',
          record.quantity || 0,
          record.notes || '',
          record.timestamp || '',
          (record.model && record.model.recordTime) || ''
        ];
      });
      
      if (data.length > 0) {
        sheet.getRange(2, 1, data.length, 8).setValues(data);
      }
    }
    
    Logger.log('Sincronizacao concluida');
    
    return {
      success: true,
      message: 'Sincronizados ' + records.length + ' registros e ' + models.length + ' modelos',
      timestamp: new Date().toISOString(),
      action: 'syncAllData'
    };
    
  } catch (error) {
    Logger.log('Erro na sincronizacao: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      action: 'syncAllData'
    };
  }
}

function findSpreadsheet() {
  var files = DriveApp.getFilesByName('ModemControl Pro - Dados');
  if (files.hasNext()) {
    SPREADSHEET_ID = files.next().getId();
    Logger.log('Planilha encontrada: ' + SPREADSHEET_ID);
  } else {
    throw new Error('Planilha nao encontrada. Execute setup() primeiro.');
  }
} 