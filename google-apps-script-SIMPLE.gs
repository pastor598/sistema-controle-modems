// GOOGLE APPS SCRIPT - VERSÃO ULTRA SIMPLES PARA RESOLVER 401
let SPREADSHEET_ID = '';

function setup() {
  try {
    const spreadsheet = SpreadsheetApp.create('ModemControl Pro - Dados');
    SPREADSHEET_ID = spreadsheet.getId();
    
    const sheet = spreadsheet.getActiveSheet();
    sheet.setName('Gravações');
    sheet.getRange('A1:H1').setValues([['ID', 'Data', 'Modelo', 'Fabricante', 'Quantidade', 'Observações', 'Timestamp', 'Tempo']]);
    sheet.getRange('A1:H1').setFontWeight('bold');
    
    Logger.log('✅ Setup concluído! ID: ' + SPREADSHEET_ID);
    Logger.log('🔗 URL: ' + spreadsheet.getUrl());
    
    return { success: true, spreadsheetId: SPREADSHEET_ID, url: spreadsheet.getUrl() };
  } catch (error) {
    Logger.log('❌ Erro: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

function doGet(e) {
  Logger.log('📥 Requisição GET recebida');
  const output = ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'ModemControl Pro - GET funcionando!',
    timestamp: new Date().toISOString(),
    method: 'GET'
  }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function doPost(e) {
  Logger.log('📥 Requisição POST recebida');
  
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    let data = null;
    
    // Processar dados
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
        Logger.log('📄 Dados JSON: ' + JSON.stringify(data));
      } catch (jsonError) {
        if (e.parameter && e.parameter.data) {
          data = JSON.parse(e.parameter.data);
          Logger.log('📄 Dados FormData: ' + JSON.stringify(data));
        }
      }
    }
    
    let result;
    
    if (!data || !data.action) {
      result = {
        success: true,
        message: 'ModemControl Pro Script - Funcionando! (Simple Version)',
        timestamp: new Date().toISOString(),
        version: 'Simple-1.0'
      };
    } else {
      const action = data.action;
      Logger.log('🎯 Ação: ' + action);
      
      switch (action) {
        case 'test':
          result = {
            success: true,
            message: 'Conexão OK! Autorização funcionando!',
            timestamp: new Date().toISOString(),
            version: 'Simple-1.0'
          };
          break;
          
        default:
          result = {
            success: true,
            message: 'Ação ' + action + ' recebida e processada',
            timestamp: new Date().toISOString()
          };
      }
    }
    
    output.setContent(JSON.stringify(result));
    Logger.log('✅ Resposta enviada: ' + JSON.stringify(result));
    
  } catch (error) {
    Logger.log('❌ Erro no doPost: ' + error.toString());
    const errorResult = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
    output.setContent(JSON.stringify(errorResult));
  }
  
  return output;
}

function doOptions(e) {
  Logger.log('📥 Requisição OPTIONS recebida');
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.TEXT);
  return output;
} 