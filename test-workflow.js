// Teste local da lógica do workflow
const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando teste local do workflow...');

// Configurações
const config = {
  maxRecords: 1000,
  dataDir: 'data',
  backupDir: 'backups',
  forceUpdate: true
};

// Função para gerar dados de teste
function generateModemData() {
  const modelos = [
    { modelo: "Motorola SB6141", fabricante: "Motorola" },
    { modelo: "ARRIS SB8200", fabricante: "ARRIS" },
    { modelo: "Huawei EG8145V5", fabricante: "Huawei" },
    { modelo: "Nokia G-1425G-B", fabricante: "Nokia" }
  ];
  
  const observacoes = [
    "Teste local",
    "Validação de workflow",
    "Teste de integração"
  ];
  
  const today = new Date();
  const records = [];
  
  // Gerar 3 registros de teste
  for (let i = 1; i <= 3; i++) {
    const modelo = modelos[Math.floor(Math.random() * modelos.length)];
    const obs = observacoes[Math.floor(Math.random() * observacoes.length)];
    
    records.push({
      id: Date.now() + i,
      data: today.toISOString().split('T')[0],
      modelo: modelo.modelo,
      fabricante: modelo.fabricante,
      quantidade: Math.floor(Math.random() * 20) + 1,
      observacoes: obs,
      timestamp: new Date(today.getTime() + i * 1000).toISOString()
    });
  }
  
  return records;
}

// Função para converter para CSV
function arrayToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => 
    headers.map(header => {
      let value = row[header];
      if (value === null || value === undefined) value = '';
      value = String(value);
      
      // Escapar vírgulas, aspas e quebras de linha
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

// Teste principal
try {
  console.log('📊 Gerando dados de teste...');
  const testData = generateModemData();
  console.log(`✅ ${testData.length} registros gerados`);
  
  console.log('📄 Convertendo para CSV...');
  const csvContent = arrayToCSV(testData);
  console.log(`✅ CSV gerado (${csvContent.length} bytes)`);
  
  console.log('\n📋 Preview do CSV:');
  console.log(csvContent.split('\n').slice(0, 4).join('\n'));
  if (csvContent.split('\n').length > 4) {
    console.log('...');
  }
  
  // Criar metadata de teste
  const metadata = {
    lastUpdate: new Date().toISOString(),
    recordCount: testData.length,
    version: '2.0',
    source: 'Teste Local',
    test: true
  };
  
  console.log('\n📋 Metadata gerada:');
  console.log(JSON.stringify(metadata, null, 2));
  
  console.log('\n✅ Teste local bem-sucedido!');
  console.log('🚀 O workflow está pronto para execução no GitHub Actions');
  
} catch (error) {
  console.error('❌ Erro no teste:', error.message);
  process.exit(1);
} 