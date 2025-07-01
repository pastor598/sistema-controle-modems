// Função executada quando o script recebe uma solicitação GET
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      message: "Conexão bem-sucedida!",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}

// Função executada quando o script recebe uma solicitação POST
function doPost(e) {
  try {
    // Obtém o ID da planilha das propriedades do script
    var spreadsheetId = PropertiesService.getScriptProperties().getProperty('spreadsheetId');
    
    // Se não houver ID configurado, cria uma nova planilha
    if (!spreadsheetId) {
      var ss = SpreadsheetApp.create("Registros de Modems");
      var sheet = ss.getSheets()[0];
      sheet.setName("Registros");
      sheet.appendRow(["Data", "Modelo", "Quantidade", "Observações", "Timestamp"]);
      
      // Formata os cabeçalhos
      var headerRange = sheet.getRange(1, 1, 1, 5);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#4CAF50");
      headerRange.setFontColor("white");
      
      // Salva o ID da planilha nas propriedades do script
      spreadsheetId = ss.getId();
      PropertiesService.getScriptProperties().setProperty('spreadsheetId', spreadsheetId);
      
      console.log("Nova planilha criada com ID: " + spreadsheetId);
    }
    
    // Abre a planilha existente
    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sheet = ss.getSheetByName("Registros");
    
    // Processa os dados recebidos
    var dados = {};
    if (e.postData && e.postData.contents) {
      dados = JSON.parse(e.postData.contents);
    }
    
    // Adiciona uma nova linha com os dados recebidos
    var timestamp = new Date();
    var dataFormatada = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    
    sheet.appendRow([
      dataFormatada,
      dados.modelo || "Não especificado",
      dados.quantidade || 0,
      dados.observacoes || "",
      timestamp
    ]);
    
    // Retorna uma resposta de sucesso
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Dados salvos com sucesso!",
        timestamp: dataFormatada
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
      
  } catch (error) {
    // Em caso de erro, retorna uma mensagem detalhada
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: "Erro: " + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

// Função para lidar com solicitações OPTIONS (necessário para CORS)
function doOptions() {
  return ContentService
    .createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
} 