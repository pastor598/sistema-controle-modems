#!/usr/bin/env node

/**
 * 🧪 Script de Teste - Verificar e Gerar Dados GitHub
 * 
 * Este script verifica se os dados estão disponíveis no GitHub
 * e gera dados de teste localmente se necessário
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs dos dados no GitHub
const DATA_URL = 'https://raw.githubusercontent.com/pastor598/sistema-controle-modems/main/data/modem-data.csv';
const METADATA_URL = 'https://raw.githubusercontent.com/pastor598/sistema-controle-modems/main/data/metadata.json';

console.log('🧪 Testando integração GitHub...\n');

// Função para fazer requisição HTTP
function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Função para gerar dados de teste
function generateTestData() {
    console.log('📊 Gerando dados de teste...');
    
    const modelos = [
        { modelo: "Motorola SB6141", fabricante: "Motorola" },
        { modelo: "ARRIS SB8200", fabricante: "ARRIS" },
        { modelo: "Huawei EG8145V5", fabricante: "Huawei" },
        { modelo: "Nokia G-1425G-B", fabricante: "Nokia" },
        { modelo: "TP-Link Archer C80", fabricante: "TP-Link" }
    ];
    
    const observacoes = [
        "Teste local",
        "Dados de demonstração",
        "Gravação padrão",
        "Teste de integração"
    ];
    
    const records = [];
    const today = new Date();
    
    // Gerar 10 registros de teste
    for (let i = 1; i <= 10; i++) {
        const modelo = modelos[Math.floor(Math.random() * modelos.length)];
        const obs = observacoes[Math.floor(Math.random() * observacoes.length)];
        
        records.push({
            id: Date.now() + i,
            data: today.toISOString().split('T')[0],
            modelo: modelo.modelo,
            fabricante: modelo.fabricante,
            quantidade: Math.floor(Math.random() * 15) + 1,
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

// Função principal de teste
async function testGitHubIntegration() {
    console.log('🔍 Verificando dados no GitHub...\n');
    
    // Testar CSV
    try {
        console.log('📄 Testando CSV...');
        const csvData = await fetchData(DATA_URL);
        
        if (csvData.trim()) {
            console.log('✅ CSV encontrado no GitHub!');
            console.log(`📊 Tamanho: ${Math.round(csvData.length / 1024 * 100) / 100} KB`);
            
            // Verificar estrutura do CSV
            const lines = csvData.trim().split('\n');
            console.log(`📋 Linhas: ${lines.length} (${lines.length - 1} registros)`);
            
            if (lines.length > 0) {
                console.log(`📑 Headers: ${lines[0]}`);
            }
        } else {
            throw new Error('CSV está vazio');
        }
    } catch (error) {
        console.log('❌ Erro ao acessar CSV:', error.message);
        console.log('🔧 Possíveis causas:');
        console.log('   • GitHub Actions ainda não executou');
        console.log('   • Repositório não está público');
        console.log('   • Arquivo ainda não foi criado');
        
        // Gerar dados de teste localmente
        console.log('\n📊 Gerando dados de teste localmente...');
        
        try {
            const testData = generateTestData();
            const csvContent = arrayToCSV(testData);
            
            // Criar diretório se não existir
            if (!fs.existsSync('data')) {
                fs.mkdirSync('data', { recursive: true });
            }
            
            // Salvar CSV local
            fs.writeFileSync('data/modem-data-local.csv', csvContent);
            console.log('✅ Dados de teste salvos em: data/modem-data-local.csv');
            
            // Criar metadata local
            const metadata = {
                lastUpdate: new Date().toISOString(),
                recordCount: testData.length,
                newRecordsAdded: testData.length,
                version: '1.0-test',
                source: 'Teste Local',
                statistics: {
                    totalQuantity: testData.reduce((sum, record) => sum + parseInt(record.quantidade), 0),
                    averagePerRecord: Math.round(testData.reduce((sum, record) => sum + parseInt(record.quantidade), 0) / testData.length * 100) / 100
                }
            };
            
            fs.writeFileSync('data/metadata-local.json', JSON.stringify(metadata, null, 2));
            console.log('✅ Metadata de teste salva em: data/metadata-local.json');
            
        } catch (localError) {
            console.log('❌ Erro ao gerar dados locais:', localError.message);
        }
    }
    
    // Testar Metadata
    try {
        console.log('\n📋 Testando Metadata...');
        const metadataData = await fetchData(METADATA_URL);
        
        if (metadataData.trim()) {
            const metadata = JSON.parse(metadataData);
            console.log('✅ Metadata encontrada no GitHub!');
            console.log(`📊 Registros: ${metadata.recordCount}`);
            console.log(`⏰ Última atualização: ${new Date(metadata.lastUpdate).toLocaleString('pt-BR')}`);
            console.log(`🔧 Versão: ${metadata.version}`);
        } else {
            throw new Error('Metadata está vazia');
        }
    } catch (error) {
        console.log('⚠️ Aviso - Metadata não encontrada:', error.message);
        console.log('   (Não é crítico, CSV pode funcionar sozinho)');
    }
    
    console.log('\n🎯 Resumo do Teste:');
    console.log('===================');
    
    // Verificar arquivos locais
    const localCSV = fs.existsSync('data/modem-data-local.csv');
    const localMetadata = fs.existsSync('data/metadata-local.json');
    
    if (localCSV) {
        console.log('✅ Dados de teste locais disponíveis');
        console.log('🔗 Para testar localmente, modifique as URLs no HTML:');
        console.log('   DATA_URL = "data/modem-data-local.csv"');
        console.log('   METADATA_URL = "data/metadata-local.json"');
    }
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Abra teste-github-integration.html no navegador');
    console.log('2. Verifique o console do navegador para logs detalhados');
    console.log('3. Se houver erros, use os dados locais gerados');
    console.log('4. Aguarde o GitHub Actions executar para dados reais');
    
    console.log('\n🔗 Links úteis:');
    console.log(`📄 CSV: ${DATA_URL}`);
    console.log(`📋 Metadata: ${METADATA_URL}`);
    console.log('⚙️ GitHub Actions: https://github.com/pastor598/sistema-controle-modems/actions');
}

// Executar teste
testGitHubIntegration().catch(error => {
    console.error('❌ Erro durante teste:', error);
    process.exit(1);
}); 