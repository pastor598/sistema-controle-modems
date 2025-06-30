/**
 * CÓDIGO GOOGLE APPS SCRIPT PARA INTEGRAÇÃO COM MODEMCONTROL PRO
 * 
 * INSTRUÇÕES DE INSTALAÇÃO:
 * 1. Acesse script.google.com
 * 2. Crie um novo projeto
 * 3. Cole este código no editor
 * 4. Salve o projeto
 * 5. Execute a função 'setup' uma vez para criar as planilhas
 * 6. Implante como aplicativo web (Deploy > New deployment)
 * 7. Configure permissões para "Anyone with the link"
 * 8. Copie a URL do web app e use no ModemControl Pro
 */

// ID da planilha (será criada automaticamente)
let SPREADSHEET_ID = '';

// Nomes das abas
const SHEETS = {
  RECORDS: 'Gravações',
  MODELS: 'Modelos',
  DASHBOARD: 'Dashboard',
  BACKUP: 'Backup'
};

/**
 * Função de configuração inicial - Execute uma vez
 */
function setup() {
  try {
    // Criar nova planilha
    const spreadsheet = SpreadsheetApp.create('ModemControl Pro - Dados');
    SPREADSHEET_ID = spreadsheet.getId();
    
    // Configurar aba de Gravações
    const recordsSheet = spreadsheet.getActiveSheet();
    recordsSheet.setName(SHEETS.RECORDS);
    recordsSheet.getRange('A1:H1').setValues([[
      'ID', 'Data', 'Modelo', 'Fabricante', 'Quantidade', 'Observações', 'Timestamp', 'Tempo Gravação'
    ]]);
    recordsSheet.getRange('A1:H1').setFontWeight('bold');
    recordsSheet.setFrozenRows(1);
    
    // Criar aba de Modelos
    const modelsSheet = spreadsheet.insertSheet(SHEETS.MODELS);
    modelsSheet.getRange('A1:E1').setValues([[
      'ID', 'Produto', 'Modelo', 'Fabricante', 'Tempo Gravação (min)'
    ]]);
    modelsSheet.getRange('A1:E1').setFontWeight('bold');
    modelsSheet.setFrozenRows(1);
    
    // Criar aba de Dashboard
    const dashboardSheet = spreadsheet.insertSheet(SHEETS.DASHBOARD);
    setupDashboard(dashboardSheet);
    
    // Criar aba de Backup
    const backupSheet = spreadsheet.insertSheet(SHEETS.BACKUP);
    backupSheet.getRange('A1:C1').setValues([['Data', 'Tipo', 'Dados JSON']]);
    backupSheet.getRange('A1:C1').setFontWeight('bold');
    
    Logger.log('Configuração concluída! ID da planilha: ' + SPREADSHEET_ID);
    Logger.log('URL da planilha: ' + spreadsheet.getUrl());
    
    return {
      success: true,
      spreadsheetId: SPREADSHEET_ID,
      url: spreadsheet.getUrl()
    };
    
  } catch (error) {
    Logger.log('Erro na configuração: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Configurar dashboard com fórmulas e gráficos
 */
function setupDashboard(sheet) {
  // Títulos e métricas
  sheet.getRange('A1').setValue('DASHBOARD - MODEMCONTROL PRO');
  sheet.getRange('A1').setFontSize(16).setFontWeight('bold');
  
  sheet.getRange('A3').setValue('Total de Gravações:');
  sheet.getRange('B3').setFormula(`=COUNTA(${SHEETS.RECORDS}!A:A)-1`);
  
  sheet.getRange('A4').setValue('Gravações Hoje:');
  sheet.getRange('B4').setFormula(`=COUNTIF(${SHEETS.RECORDS}!B:B,TODAY())`);
  
  sheet.getRange('A5').setValue('Modelos Cadastrados:');
  sheet.getRange('B5').setFormula(`=COUNTA(${SHEETS.MODELS}!A:A)-1`);
  
  sheet.getRange('A6').setValue('Última Atualização:');
  sheet.getRange('B6').setFormula('=NOW()');
  
  // Formatação
  sheet.getRange('A3:A6').setFontWeight('bold');
  sheet.getRange('B6').setNumberFormat('dd/mm/yyyy hh:mm:ss');
  
  // Top 5 Modelos
  sheet.getRange('A8').setValue('TOP 5 MODELOS MAIS GRAVADOS');
  sheet.getRange('A8').setFontWeight('bold');
  
  sheet.getRange('A10:B14').setValues([
    ['Modelo', 'Quantidade'],
    ['=INDEX(UNIQUE(Gravações!C:C),2)', '=SUMIF(Gravações!C:C,A11,Gravações!E:E)'],
    ['=INDEX(UNIQUE(Gravações!C:C),3)', '=SUMIF(Gravações!C:C,A12,Gravações!E:E)'],
    ['=INDEX(UNIQUE(Gravações!C:C),4)', '=SUMIF(Gravações!C:C,A13,Gravações!E:E)'],
    ['=INDEX(UNIQUE(Gravações!C:C),5)', '=SUMIF(Gravações!C:C,A14,Gravações!E:E)']
  ]);
  
  sheet.getRange('A10:B10').setFontWeight('bold');
}

/**
 * Função principal para processar requisições
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    Logger.log('Ação recebida: ' + action);
    
    switch (action) {
      case 'test':
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Conexão estabelecida com sucesso!',
          timestamp: new Date().toISOString()
        })).setMimeType(ContentService.MimeType.JSON);
        
      case 'syncAllData':
        return syncAllData(data.records, data.models);
        
      case 'addRecords':
        return addRecords(data.records);
        
      case 'generateReport':
        return generateReport(data.type, data.records);
        
      case 'createBackup':
        return createBackup(data.data);
        
      default:
        throw new Error('Ação não reconhecida: ' + action);
    }
    
  } catch (error) {
    Logger.log('Erro no doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Sincronizar todos os dados
 */
function syncAllData(records, models) {
  try {
    const spreadsheet = getSpreadsheet();
    
    // Sincronizar registros
    const recordsSheet = spreadsheet.getSheetByName(SHEETS.RECORDS);
    recordsSheet.clear();
    recordsSheet.getRange('A1:H1').setValues([[
      'ID', 'Data', 'Modelo', 'Fabricante', 'Quantidade', 'Observações', 'Timestamp', 'Tempo Gravação'
    ]]);
    recordsSheet.getRange('A1:H1').setFontWeight('bold');
    
    if (records.length > 0) {
      const recordsData = records.map(record => [
        record.id,
        record.date,
        record.model.modelo,
        record.model.fabricante,
        record.quantity,
        record.notes || '',
        record.timestamp,
        record.model.recordTime || ''
      ]);
      
      recordsSheet.getRange(2, 1, recordsData.length, 8).setValues(recordsData);
    }
    
    // Sincronizar modelos
    const modelsSheet = spreadsheet.getSheetByName(SHEETS.MODELS);
    modelsSheet.clear();
    modelsSheet.getRange('A1:E1').setValues([[
      'ID', 'Produto', 'Modelo', 'Fabricante', 'Tempo Gravação (min)'
    ]]);
    modelsSheet.getRange('A1:E1').setFontWeight('bold');
    
    if (models.length > 0) {
      const modelsData = models.map(model => [
        model.id,
        model.produto,
        model.modelo,
        model.fabricante,
        model.recordTime || ''
      ]);
      
      modelsSheet.getRange(2, 1, modelsData.length, 5).setValues(modelsData);
    }
    
    // Atualizar dashboard
    const dashboardSheet = spreadsheet.getSheetByName(SHEETS.DASHBOARD);
    dashboardSheet.getRange('B6').setValue(new Date());
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: `Sincronizados ${records.length} registros e ${models.length} modelos`,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Erro na sincronização: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Adicionar novos registros
 */
function addRecords(newRecords) {
  try {
    const spreadsheet = getSpreadsheet();
    const recordsSheet = spreadsheet.getSheetByName(SHEETS.RECORDS);
    
    const recordsData = newRecords.map(record => [
      record.id,
      record.date,
      record.model.modelo,
      record.model.fabricante,
      record.quantity,
      record.notes || '',
      record.timestamp,
      record.model.recordTime || ''
    ]);
    
    const lastRow = recordsSheet.getLastRow();
    recordsSheet.getRange(lastRow + 1, 1, recordsData.length, 8).setValues(recordsData);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: `Adicionados ${newRecords.length} novos registros`,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Erro ao adicionar registros: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Gerar relatório automático
 */
function generateReport(type, records) {
  try {
    const spreadsheet = getSpreadsheet();
    const reportSheetName = `Relatório_${type}_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')}`;
    
    // Criar nova aba para o relatório
    const reportSheet = spreadsheet.insertSheet(reportSheetName);
    
    // Cabeçalho do relatório
    reportSheet.getRange('A1').setValue(`RELATÓRIO ${type.toUpperCase()}`);
    reportSheet.getRange('A1').setFontSize(14).setFontWeight('bold');
    
    reportSheet.getRange('A2').setValue('Gerado em: ' + new Date().toLocaleString('pt-BR'));
    
    // Dados do relatório
    reportSheet.getRange('A4:H4').setValues([[
      'ID', 'Data', 'Modelo', 'Fabricante', 'Quantidade', 'Observações', 'Timestamp', 'Tempo Gravação'
    ]]);
    reportSheet.getRange('A4:H4').setFontWeight('bold');
    
    if (records.length > 0) {
      const reportData = records.map(record => [
        record.id,
        record.date,
        record.model.modelo,
        record.model.fabricante,
        record.quantity,
        record.notes || '',
        record.timestamp,
        record.model.recordTime || ''
      ]);
      
      reportSheet.getRange(5, 1, reportData.length, 8).setValues(reportData);
    }
    
    // Enviar email com o relatório
    const emailSubject = `ModemControl Pro - Relatório ${type}`;
    const emailBody = `
      Relatório ${type} gerado automaticamente.
      
      Total de registros: ${records.length}
      Data de geração: ${new Date().toLocaleString('pt-BR')}
      
      Acesse a planilha: ${spreadsheet.getUrl()}
    `;
    
    GmailApp.sendEmail(Session.getActiveUser().getEmail(), emailSubject, emailBody);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: `Relatório ${type} gerado e enviado por email`,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Erro na geração de relatório: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Criar backup dos dados
 */
function createBackup(data) {
  try {
    const spreadsheet = getSpreadsheet();
    const backupSheet = spreadsheet.getSheetByName(SHEETS.BACKUP);
    
    const lastRow = backupSheet.getLastRow();
    backupSheet.getRange(lastRow + 1, 1, 1, 3).setValues([[
      new Date(),
      'Backup Automático',
      JSON.stringify(data)
    ]]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Backup criado com sucesso',
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Erro na criação de backup: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obter referência da planilha
 */
function getSpreadsheet() {
  if (!SPREADSHEET_ID) {
    // Tentar encontrar a planilha pelo nome
    const files = DriveApp.getFilesByName('ModemControl Pro - Dados');
    if (files.hasNext()) {
      const file = files.next();
      SPREADSHEET_ID = file.getId();
    } else {
      throw new Error('Planilha não encontrada. Execute a função setup() primeiro.');
    }
  }
  
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Função para configurar triggers automáticos
 */
function setupTriggers() {
  // Trigger para relatório mensal
  ScriptApp.newTrigger('generateMonthlyReport')
    .timeBased()
    .onMonthDay(1)
    .atHour(9)
    .create();
    
  // Trigger para backup semanal
  ScriptApp.newTrigger('weeklyBackup')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(10)
    .create();
}

/**
 * Função executada automaticamente todo mês
 */
function generateMonthlyReport() {
  try {
    const spreadsheet = getSpreadsheet();
    const recordsSheet = spreadsheet.getSheetByName(SHEETS.RECORDS);
    const data = recordsSheet.getDataRange().getValues();
    
    // Filtrar registros do mês anterior
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const monthlyRecords = data.slice(1).filter(row => {
      const recordDate = new Date(row[1]);
      return recordDate.getMonth() === lastMonth.getMonth() && 
             recordDate.getFullYear() === lastMonth.getFullYear();
    });
    
    generateReport('mensal', monthlyRecords);
    
  } catch (error) {
    Logger.log('Erro no relatório mensal automático: ' + error.toString());
  }
}

/**
 * Backup semanal automático
 */
function weeklyBackup() {
  try {
    const records = JSON.parse(PropertiesService.getScriptProperties().getProperty('modemRecords')) || [];
    const models = JSON.parse(PropertiesService.getScriptProperties().getProperty('modemModelsList')) || [];
    
    const backupData = {
      records: records,
      models: models,
      backupDate: new Date().toISOString()
    };
    
    createBackup(backupData);
    
  } catch (error) {
    Logger.log('Erro no backup semanal automático: ' + error.toString());
  }
} 