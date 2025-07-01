/**
 * GOOGLE APPS SCRIPT - INTEGRAÇÃO COM GITHUB
 * Lê dados automaticamente do repositório GitHub
 */

let SPREADSHEET_ID = '';
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/pastor598/sistema-controle-modems/main/data/';
const CSV_URL = GITHUB_BASE_URL + 'modem-data.csv';
const METADATA_URL = GITHUB_BASE_URL + 'metadata.json';

// Função de setup - execute UMA VEZ
function setup() {
  try {
    const spreadsheet = SpreadsheetApp.create('ModemControl Pro - GitHub Integration');
    SPREADSHEET_ID = spreadsheet.getId();
    
    const sheet = spreadsheet.getActiveSheet();
    sheet.setName('Dados GitHub');
    
    Logger.log('✅ Setup GitHub Integration concluído! ID: ' + SPREADSHEET_ID);
    Logger.log('🔗 URL: ' + spreadsheet.getUrl());
    
    // Executar primeira importação
    importFromGitHub();
    
    return { success: true, spreadsheetId: SPREADSHEET_ID, url: spreadsheet.getUrl() };
  } catch (error) {
    Logger.log('❌ Erro no setup: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// FUNÇÃO PRINCIPAL - Importar dados do GitHub
function importFromGitHub() {
  try {
    Logger.log('🔄 Importando dados do GitHub...');
    Logger.log('📋 URL CSV: ' + CSV_URL);
    
    if (!SPREADSHEET_ID) {
      findSpreadsheet();
    }
    
    // Buscar dados CSV do GitHub
    const csvResponse = UrlFetchApp.fetch(CSV_URL);
    const csvText = csvResponse.getContentText();
    
    if (!csvText) {
      throw new Error('CSV vazio ou não encontrado');
    }
    
    // Buscar metadata (opcional)
    let metadata = null;
    try {
      const metadataResponse = UrlFetchApp.fetch(METADATA_URL);
      metadata = JSON.parse(metadataResponse.getContentText());
      Logger.log('📊 Metadata: ' + JSON.stringify(metadata));
    } catch (e) {
      Logger.log('⚠️ Metadata não encontrada, continuando...');
    }
    
    // Processar CSV
    const csvData = Utilities.parseCsv(csvText);
    
    if (csvData.length === 0) {
      throw new Error('CSV não contém dados');
    }
    
    // Abrir planilha
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName('Dados GitHub');
    
    // Limpar dados antigos
    sheet.clear();
    
    // Inserir dados
    for (let i = 0; i < csvData.length; i++) {
      sheet.getRange(i + 1, 1, 1, csvData[i].length).setValues([csvData[i]]);
    }
    
    // Formatar cabeçalhos
    if (csvData.length > 0) {
      const headerRange = sheet.getRange(1, 1, 1, csvData[0].length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4CAF50');
      headerRange.setFontColor('white');
    }
    
    // Adicionar informações de atualização
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 2, 1).setValue('Última Atualização:');
    sheet.getRange(lastRow + 2, 2).setValue(new Date());
    
    if (metadata) {
      sheet.getRange(lastRow + 3, 1).setValue('Registros GitHub:');
      sheet.getRange(lastRow + 3, 2).setValue(metadata.recordCount || 'N/A');
      
      sheet.getRange(lastRow + 4, 1).setValue('Versão:');
      sheet.getRange(lastRow + 4, 2).setValue(metadata.version || 'N/A');
    }
    
    Logger.log('✅ Importação concluída!');
    Logger.log(`📊 ${csvData.length} linhas importadas`);
    
    return {
      success: true,
      message: `Dados importados: ${csvData.length} linhas`,
      timestamp: new Date().toISOString(),
      metadata: metadata
    };
    
  } catch (error) {
    Logger.log('❌ Erro na importação: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

// Configurar triggers automáticos para GitHub
function setupGitHubTriggers() {
  try {
    Logger.log('🔧 Configurando triggers para GitHub...');
    
    // Remover triggers existentes
    deleteAllTriggers();
    
    // Trigger 1: Importação a cada 30 minutos
    ScriptApp.newTrigger('importFromGitHub')
      .timeBased()
      .everyMinutes(30)
      .create();
    
    // Trigger 2: Importação diária às 8h
    ScriptApp.newTrigger('importFromGitHub')
      .timeBased()
      .everyDays(1)
      .atHour(8)
      .create();
    
    Logger.log('✅ Triggers GitHub configurados!');
    Logger.log('📅 Importação: a cada 30 minutos');
    Logger.log('📅 Importação diária: 8h');
    
    return { success: true, message: 'Triggers GitHub configurados!' };
    
  } catch (error) {
    Logger.log('❌ Erro ao configurar triggers: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// Função para testar conectividade com GitHub
function testGitHubConnection() {
  try {
    Logger.log('🔍 Testando conexão com GitHub...');
    
    // Testar CSV
    const csvResponse = UrlFetchApp.fetch(CSV_URL);
    const csvStatus = csvResponse.getResponseCode();
    Logger.log('📄 CSV Status: ' + csvStatus);
    
    // Testar Metadata
    let metadataStatus = 'N/A';
    try {
      const metadataResponse = UrlFetchApp.fetch(METADATA_URL);
      metadataStatus = metadataResponse.getResponseCode();
    } catch (e) {
      metadataStatus = 'Não encontrado';
    }
    Logger.log('📊 Metadata Status: ' + metadataStatus);
    
    const result = {
      success: csvStatus === 200,
      csvStatus: csvStatus,
      metadataStatus: metadataStatus,
      csvUrl: CSV_URL,
      metadataUrl: METADATA_URL,
      timestamp: new Date().toISOString()
    };
    
    Logger.log('✅ Teste concluído: ' + JSON.stringify(result));
    return result;
    
  } catch (error) {
    Logger.log('❌ Erro no teste: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

// Funções auxiliares
function findSpreadsheet() {
  const files = DriveApp.getFilesByName('ModemControl Pro - GitHub Integration');
  if (files.hasNext()) {
    SPREADSHEET_ID = files.next().getId();
    Logger.log('📊 Planilha encontrada: ' + SPREADSHEET_ID);
  } else {
    throw new Error('Planilha não encontrada. Execute setup() primeiro.');
  }
}

function deleteAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  Logger.log('🗑️ ' + triggers.length + ' triggers removidos');
}

// Função para importação manual via webhook
function doGet(e) {
  Logger.log('📥 GET recebido - Importação manual');
  
  const result = importFromGitHub();
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Função para receber webhooks do GitHub
function doPost(e) {
  Logger.log('📥 POST recebido - Webhook GitHub');
  
  try {
    // Processar webhook do GitHub (opcional)
    let webhookData = null;
    if (e.postData && e.postData.contents) {
      webhookData = JSON.parse(e.postData.contents);
      Logger.log('🔗 Webhook: ' + JSON.stringify(webhookData));
    }
    
    // Executar importação
    const result = importFromGitHub();
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('❌ Erro no webhook: ' + error.toString());
    
    const errorResult = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
} 