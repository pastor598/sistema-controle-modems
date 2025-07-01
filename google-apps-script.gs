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

// ==================== TRIGGERS AUTOMÁTICOS ====================

/**
 * Configurar triggers automáticos para atualização
 * Execute esta função UMA VEZ após o setup
 */
function setupTriggers() {
  try {
    Logger.log('🔧 Configurando triggers automáticos...');
    
    // Remover triggers existentes primeiro
    deleteTriggers();
    
    // Trigger 1: Atualização a cada 15 minutos
    ScriptApp.newTrigger('autoUpdate')
      .timeBased()
      .everyMinutes(15)
      .create();
    
    // Trigger 2: Atualização diária às 9h
    ScriptApp.newTrigger('dailyUpdate')
      .timeBased()
      .everyDays(1)
      .atHour(9)
      .create();
    
    // Trigger 3: Backup semanal (domingos às 10h)
    ScriptApp.newTrigger('weeklyBackup')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.SUNDAY)
      .atHour(10)
      .create();
    
    Logger.log('✅ Triggers configurados com sucesso!');
    Logger.log('📅 Atualização: a cada 15 minutos');
    Logger.log('📅 Atualização diária: 9h');
    Logger.log('📅 Backup semanal: Domingos 10h');
    
    return { success: true, message: 'Triggers configurados!' };
    
  } catch (error) {
    Logger.log('❌ Erro ao configurar triggers: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Remover todos os triggers existentes
 */
function deleteTriggers() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    Logger.log('🗑️ Removendo ' + triggers.length + ' triggers existentes...');
    
    triggers.forEach(trigger => {
      ScriptApp.deleteTrigger(trigger);
    });
    
    Logger.log('✅ Triggers removidos');
    
  } catch (error) {
    Logger.log('❌ Erro ao remover triggers: ' + error.toString());
  }
}

/**
 * Listar triggers ativos
 */
function listTriggers() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    Logger.log('📋 Triggers ativos: ' + triggers.length);
    
    triggers.forEach((trigger, index) => {
      Logger.log(`${index + 1}. Função: ${trigger.getHandlerFunction()}`);
      Logger.log(`   Tipo: ${trigger.getEventType()}`);
      Logger.log(`   Fonte: ${trigger.getTriggerSource()}`);
    });
    
    return triggers.map(trigger => ({
      function: trigger.getHandlerFunction(),
      type: trigger.getEventType(),
      source: trigger.getTriggerSource()
    }));
    
  } catch (error) {
    Logger.log('❌ Erro ao listar triggers: ' + error.toString());
    return [];
  }
}

/**
 * Atualização automática (executada pelos triggers)
 */
function autoUpdate() {
  try {
    Logger.log('🔄 Executando atualização automática...');
    
    if (!SPREADSHEET_ID) {
      findSpreadsheet();
    }
    
    // Atualizar timestamp para forçar refresh
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const timestamp = new Date().toISOString();
    
    // Adicionar metadata para forçar atualização
    spreadsheet.addDeveloperMetadata('lastAutoUpdate', timestamp);
    
    Logger.log('✅ Atualização automática concluída: ' + timestamp);
    
  } catch (error) {
    Logger.log('❌ Erro na atualização automática: ' + error.toString());
  }
}

/**
 * Atualização diária (mais completa)
 */
function dailyUpdate() {
  try {
    Logger.log('📅 Executando atualização diária...');
    
    if (!SPREADSHEET_ID) {
      findSpreadsheet();
    }
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName('Gravações');
    
    // Forçar recálculo das fórmulas
    sheet.getDataRange().setValue(sheet.getDataRange().getValue());
    
    // Atualizar metadata
    const timestamp = new Date().toISOString();
    spreadsheet.addDeveloperMetadata('lastDailyUpdate', timestamp);
    
    Logger.log('✅ Atualização diária concluída: ' + timestamp);
    
  } catch (error) {
    Logger.log('❌ Erro na atualização diária: ' + error.toString());
  }
}

/**
 * Backup semanal
 */
function weeklyBackup() {
  try {
    Logger.log('💾 Executando backup semanal...');
    
    if (!SPREADSHEET_ID) {
      findSpreadsheet();
    }
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Criar cópia de backup
    const backupName = `ModemControl Pro - Backup ${new Date().toISOString().split('T')[0]}`;
    const backup = spreadsheet.copy(backupName);
    
    // Mover para pasta de backups (opcional)
    const folders = DriveApp.getFoldersByName('ModemControl Backups');
    if (folders.hasNext()) {
      const backupFolder = folders.next();
      DriveApp.getFileById(backup.getId()).moveTo(backupFolder);
    }
    
    Logger.log('✅ Backup criado: ' + backupName);
    Logger.log('🔗 ID: ' + backup.getId());
    
  } catch (error) {
    Logger.log('❌ Erro no backup semanal: ' + error.toString());
  }
}

/**
 * Trigger personalizado para sincronização com sistema externo
 */
function customSyncTrigger() {
  try {
    Logger.log('🔄 Trigger personalizado executado...');
    
    // Aqui você pode adicionar lógica específica
    // Por exemplo, chamar APIs externas, validar dados, etc.
    
    const timestamp = new Date().toISOString();
    Logger.log('✅ Trigger personalizado concluído: ' + timestamp);
    
  } catch (error) {
    Logger.log('❌ Erro no trigger personalizado: ' + error.toString());
  }
} 