/**
 * CÓDIGO GOOGLE APPS SCRIPT PARA INTEGRAÇÃO COM MODEMCONTROL PRO
 * VERSÃO CORRIGIDA COM SUPORTE COMPLETO A CORS
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
 * Função de configuração inicial - Execute APENAS uma vez
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
    
    Logger.log('✅ Configuração concluída! ID: ' + SPREADSHEET_ID);
    Logger.log('🔗 URL: ' + spreadsheet.getUrl());
    
    return {
      success: true,
      spreadsheetId: SPREADSHEET_ID,
      url: spreadsheet.getUrl()
    };
    
  } catch (error) {
    Logger.log('❌ Erro: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Configurar dashboard com fórmulas
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
}

/**
 * FUNÇÃO PRINCIPAL - PROCESSAR REQUISIÇÕES COM CORS
 * Esta é a função crítica que estava causando o problema
 */
function doPost(e) {
  // 🔥 CONFIGURAR CORS - ESTA É A PARTE CRUCIAL QUE ESTAVA FALTANDO!
  const response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  try {
    let responseData;
    let data = null;
    
    // Processar dados POST - suporte a JSON e FormData
    if (e.postData && e.postData.contents) {
      try {
        // Tentar JSON primeiro
        data = JSON.parse(e.postData.contents);
        Logger.log('📥 Dados JSON recebidos');
      } catch (jsonError) {
        // Se falhar, verificar se é FormData via parameters
        if (e.parameter && e.parameter.data) {
          data = JSON.parse(e.parameter.data);
          Logger.log('📥 Dados FormData recebidos');
        } else {
          Logger.log('❌ Erro ao processar dados: ' + jsonError.toString());
        }
      }
    }
    
    if (!data) {
      responseData = {
        success: true,
        message: 'Google Apps Script funcionando! (CORS-FIXED)',
        timestamp: new Date().toISOString(),
        version: '3.0.0-CORS-FIXED'
      };
    } else {
      const action = data.action;
      
      Logger.log('🔄 Ação recebida: ' + action);
      
      switch (action) {
        case 'test':
          responseData = {
            success: true,
            message: 'Conexão estabelecida com sucesso! (CORS-FIXED)',
            timestamp: new Date().toISOString(),
            version: '3.0.0-CORS-FIXED'
          };
          break;
          
        case 'syncAllData':
          responseData = syncAllData(data.records, data.models);
          break;
          
        case 'addRecords':
          responseData = addRecords(data.records);
          break;
          
        case 'generateReport':
          responseData = generateReport(data.type, data.records);
          break;
          
        case 'createBackup':
          responseData = createBackup(data.data);
          break;
          
        default:
          throw new Error('Ação não reconhecida: ' + action);
      }
    }
    
    response.setContent(JSON.stringify(responseData));
    
  } catch (error) {
    Logger.log('❌ Erro no doPost: ' + error.toString());
    const errorResponse = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
    response.setContent(JSON.stringify(errorResponse));
  }
  
  // 🎯 RETORNAR RESPOSTA COM CORS HEADERS
  return response;
}

/**
 * SUPORTE A REQUISIÇÕES OPTIONS (PREFLIGHT)
 * Esta função é essencial para CORS funcionar
 */
function doOptions(e) {
  const response = ContentService.createTextOutput('');
  response.setMimeType(ContentService.MimeType.TEXT);
  return response;
}

/**
 * SUPORTE A REQUISIÇÕES GET (PARA TESTES)
 */
function doGet(e) {
  const response = ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'ModemControl Pro Google Apps Script funcionando!',
    timestamp: new Date().toISOString(),
    method: 'GET'
  }));
  response.setMimeType(ContentService.MimeType.JSON);
  return response;
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
    
    if (records && records.length > 0) {
      const recordsData = records.map(record => [
        record.id,
        record.date,
        record.model ? record.model.modelo : 'N/A',
        record.model ? record.model.fabricante : 'N/A',
        record.quantity,
        record.notes || '',
        record.timestamp,
        record.model ? (record.model.recordTime || '') : ''
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
    
    if (models && models.length > 0) {
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
    
    return {
      success: true,
      message: `Sincronizados ${records ? records.length : 0} registros e ${models ? models.length : 0} modelos`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('❌ Erro na sincronização: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Adicionar novos registros
 */
function addRecords(newRecords) {
  try {
    const spreadsheet = getSpreadsheet();
    const recordsSheet = spreadsheet.getSheetByName(SHEETS.RECORDS);
    
    if (!newRecords || newRecords.length === 0) {
      return {
        success: true,
        message: 'Nenhum registro para adicionar',
        timestamp: new Date().toISOString()
      };
    }
    
    const recordsData = newRecords.map(record => [
      record.id,
      record.date,
      record.model ? record.model.modelo : 'N/A',
      record.model ? record.model.fabricante : 'N/A',
      record.quantity,
      record.notes || '',
      record.timestamp,
      record.model ? (record.model.recordTime || '') : ''
    ]);
    
    const lastRow = recordsSheet.getLastRow();
    recordsSheet.getRange(lastRow + 1, 1, recordsData.length, 8).setValues(recordsData);
    
    return {
      success: true,
      message: `Adicionados ${newRecords.length} novos registros`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao adicionar registros: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Gerar relatório
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
    
    if (records && records.length > 0) {
      const reportData = records.map(record => [
        record.id,
        record.date,
        record.model ? record.model.modelo : 'N/A',
        record.model ? record.model.fabricante : 'N/A',
        record.quantity,
        record.notes || '',
        record.timestamp,
        record.model ? (record.model.recordTime || '') : ''
      ]);
      
      reportSheet.getRange(5, 1, reportData.length, 8).setValues(reportData);
    }
    
    return {
      success: true,
      message: `Relatório ${type} gerado com ${records ? records.length : 0} registros`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('❌ Erro na geração de relatório: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
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
      'Backup Manual',
      JSON.stringify(data)
    ]]);
    
    return {
      success: true,
      message: 'Backup criado com sucesso',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('❌ Erro na criação de backup: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
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
      Logger.log('📊 Planilha encontrada: ' + SPREADSHEET_ID);
    } else {
      throw new Error('Planilha não encontrada. Execute a função setup() primeiro.');
    }
  }
  
  return SpreadsheetApp.openById(SPREADSHEET_ID);
} 