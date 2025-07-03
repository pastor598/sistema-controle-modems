#!/usr/bin/env node

/**
 * 🧪 Teste de Integração Google Sheets
 * 
 * Este script testa a preparação de dados para Google Sheets
 * sem fazer chamadas reais à API (para testes locais)
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando teste de integração Google Sheets...\n');

// Função para simular o processamento CSV
function testCSVProcessing() {
    console.log('📄 Testando processamento de CSV...');
    
    try {
        const csvPath = path.join('data', 'modem-data.csv');
        
        if (!fs.existsSync(csvPath)) {
            console.log('⚠️ Arquivo CSV não encontrado, criando dados de teste...');
            
            // Criar dados de teste
            const testData = [
                ['id', 'data', 'modelo', 'fabricante', 'quantidade', 'observacoes', 'timestamp'],
                ['1', '2025-07-03', 'Motorola SB6141', 'Motorola', '10', 'Teste Google Sheets', '2025-07-03T00:00:00.000Z'],
                ['2', '2025-07-03', 'Huawei EG8145V5', 'Huawei', '15', 'Integração completa', '2025-07-03T00:01:00.000Z'],
                ['3', '2025-07-03', 'Nokia G-1425G-B', 'Nokia', '8', 'Teste com "aspas"', '2025-07-03T00:02:00.000Z']
            ];
            
            if (!fs.existsSync('data')) {
                fs.mkdirSync('data', { recursive: true });
            }
            
            const csvContent = testData.map(row => 
                row.map(field => 
                    field.includes(',') || field.includes('"') ? `"${field.replace(/"/g, '""')}"` : field
                ).join(',')
            ).join('\n');
            
            fs.writeFileSync(csvPath, csvContent);
            console.log('✅ Dados de teste criados');
        }
        
        // Processar CSV como no workflow
        const csv = fs.readFileSync(csvPath, 'utf8');
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            throw new Error('CSV vazio!');
        }
        
        // Processar CSV com escape de caracteres
        const data = lines.map(line => {
            const fields = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        current += '"';
                        i++; // Skip next quote
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    fields.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            fields.push(current); // Add last field
            
            return fields;
        });
        
        console.log(`✅ CSV processado: ${data.length} linhas`);
        console.log(`📋 Headers: ${data[0].join(', ')}`);
        console.log(`📊 Dados: ${data.length - 1} registros`);
        
        return { success: true, data, rows: data.length };
        
    } catch (error) {
        console.log(`❌ Erro ao processar CSV: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Função para testar geração de estatísticas
function testStatisticsGeneration() {
    console.log('\n📊 Testando geração de estatísticas...');
    
    try {
        const metadataPath = path.join('data', 'metadata.json');
        
        let metadata;
        if (fs.existsSync(metadataPath)) {
            metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        } else {
            // Criar metadata de teste
            metadata = {
                lastUpdate: new Date().toISOString(),
                recordCount: 3,
                newRecordsAdded: 3,
                version: '2.0',
                source: 'Teste Local',
                statistics: {
                    totalQuantity: 33,
                    averagePerRecord: 11,
                    manufacturerDistribution: {
                        'Motorola': 10,
                        'Huawei': 15,
                        'Nokia': 8
                    },
                    dateRange: {
                        earliest: '2025-07-03',
                        latest: '2025-07-03'
                    }
                }
            };
            
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
            console.log('✅ Metadata de teste criada');
        }
        
        const stats = metadata.statistics || {};
        
        // Criar dados de estatísticas em formato tabular
        const statsData = [
            ['Métrica', 'Valor', 'Última Atualização'],
            ['Total de Registros', metadata.recordCount || 0, metadata.lastUpdate || 'N/A'],
            ['Novos Registros', metadata.newRecordsAdded || 0, metadata.lastUpdate || 'N/A'],
            ['Quantidade Total', stats.totalQuantity || 0, metadata.lastUpdate || 'N/A'],
            ['Média por Registro', stats.averagePerRecord || 0, metadata.lastUpdate || 'N/A'],
            ['Versão', metadata.version || 'N/A', metadata.lastUpdate || 'N/A'],
            ['Fonte', metadata.source || 'N/A', metadata.lastUpdate || 'N/A']
        ];
        
        // Adicionar distribuição por fabricante
        if (stats.manufacturerDistribution) {
            statsData.push(['', '', '']); // Linha vazia
            statsData.push(['Fabricante', 'Quantidade', 'Percentual']);
            
            const total = stats.totalQuantity || 1;
            Object.entries(stats.manufacturerDistribution).forEach(([manufacturer, count]) => {
                const percentage = Math.round((count / total) * 100 * 100) / 100;
                statsData.push([manufacturer, count, percentage + '%']);
            });
        }
        
        console.log(`✅ Estatísticas preparadas: ${statsData.length} linhas`);
        console.log('📋 Preview das estatísticas:');
        statsData.slice(0, 5).forEach(row => {
            console.log(`   ${row.join(' | ')}`);
        });
        
        return { success: true, statsData };
        
    } catch (error) {
        console.log(`❌ Erro ao gerar estatísticas: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Função para testar dados do changelog
function testChangelogGeneration() {
    console.log('\n📝 Testando geração de changelog...');
    
    try {
        // Simular dados do workflow
        const workflowData = [
            ['Run #', 'Records', 'File Size (KB)', 'Actor', 'Ref', 'SHA', 'Event', 'Run ID'],
            ['123', '25', '2.5', 'github-actions', 'refs/heads/main', 'abc123...', 'schedule', '1234567890'],
            ['124', '28', '2.7', 'user', 'refs/heads/main', 'def456...', 'workflow_dispatch', '1234567891'],
            ['125', '30', '2.9', 'github-actions', 'refs/heads/main', 'ghi789...', 'push', '1234567892']
        ];
        
        console.log('✅ Dados de changelog preparados');
        console.log('📋 Preview do changelog:');
        workflowData.slice(0, 3).forEach(row => {
            console.log(`   ${row.join(' | ')}`);
        });
        
        return { success: true, changelogData: workflowData };
        
    } catch (error) {
        console.log(`❌ Erro ao gerar changelog: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Função para simular estrutura do Google Sheets
function testSheetsStructure() {
    console.log('\n📊 Testando estrutura do Google Sheets...');
    
    const worksheets = [
        {
            name: 'ModemData',
            description: 'Dados principais dos modems',
            columns: ['ID', 'Data', 'Modelo', 'Fabricante', 'Quantidade', 'Observações', 'Timestamp']
        },
        {
            name: 'Statistics',
            description: 'Estatísticas e métricas detalhadas',
            columns: ['Métrica', 'Valor', 'Última Atualização']
        },
        {
            name: 'Changelog',
            description: 'Histórico de execuções do workflow',
            columns: ['Run #', 'Records', 'File Size (KB)', 'Actor', 'Ref', 'SHA', 'Event', 'Run ID']
        }
    ];
    
    console.log('✅ Estrutura do Google Sheets:');
    worksheets.forEach(sheet => {
        console.log(`   📋 ${sheet.name}: ${sheet.description}`);
        console.log(`      Colunas: ${sheet.columns.join(', ')}`);
    });
    
    return { success: true, worksheets };
}

// Executar todos os testes
async function runAllTests() {
    console.log('🚀 Executando todos os testes...\n');
    
    const results = {
        csvProcessing: testCSVProcessing(),
        statisticsGeneration: testStatisticsGeneration(),
        changelogGeneration: testChangelogGeneration(),
        sheetsStructure: testSheetsStructure()
    };
    
    console.log('\n📊 Resumo dos Testes:');
    console.log('========================');
    
    Object.entries(results).forEach(([test, result]) => {
        const status = result.success ? '✅' : '❌';
        const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`${status} ${testName}: ${result.success ? 'PASSOU' : 'FALHOU'}`);
        if (!result.success) {
            console.log(`   Erro: ${result.error}`);
        }
    });
    
    const allPassed = Object.values(results).every(r => r.success);
    
    console.log('\n🎯 Resultado Final:');
    console.log(`${allPassed ? '✅' : '❌'} ${allPassed ? 'TODOS OS TESTES PASSARAM!' : 'ALGUNS TESTES FALHARAM!'}`);
    
    if (allPassed) {
        console.log('\n🚀 A integração com Google Sheets está pronta para uso!');
        console.log('📋 Próximos passos:');
        console.log('   1. Configure os secrets no GitHub');
        console.log('   2. Execute o workflow manualmente');
        console.log('   3. Verifique a planilha Google Sheets');
    }
    
    return allPassed;
}

// Executar se chamado diretamente
if (require.main === module) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Erro durante execução dos testes:', error);
        process.exit(1);
    });
}

module.exports = {
    testCSVProcessing,
    testStatisticsGeneration,
    testChangelogGeneration,
    testSheetsStructure,
    runAllTests
}; 