# Script de Limpeza para Projetos de Desenvolvimento
# Baseado nas melhores práticas de limpeza de projetos

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "    LIMPEZA DE PROJETO DE DESENVOLVIMENTO" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Função para calcular tamanho
function Get-FolderSize {
    param($Path)
    if (Test-Path $Path) {
        $size = (Get-ChildItem $Path -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        return [math]::Round($size/1MB, 2)
    }
    return 0
}

# Função para limpar com segurança
function Remove-SafeFiles {
    param($Pattern, $Description)
    
    Write-Host "Procurando $Description..." -ForegroundColor Yellow
    $files = Get-ChildItem -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -match $Pattern -and !$_.PSIsContainer }
    
    if ($files.Count -gt 0) {
        $totalSize = ($files | Measure-Object -Property Length -Sum).Sum
        $sizeMB = [math]::Round($totalSize/1MB, 2)
        
        Write-Host "  Encontrados: $($files.Count) arquivos ($sizeMB MB)" -ForegroundColor Red
        
        foreach ($file in $files) {
            Write-Host "    - $($file.Name)" -ForegroundColor Gray
        }
        
        $response = Read-Host "  Excluir estes arquivos? (S/N)"
        if ($response -eq 'S' -or $response -eq 's') {
            $files | Remove-Item -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Arquivos removidos! Liberado: $sizeMB MB" -ForegroundColor Green
            return $sizeMB
        }
        else {
            Write-Host "  Arquivos mantidos." -ForegroundColor Gray
        }
    }
    else {
        Write-Host "  ✓ Nenhum arquivo encontrado." -ForegroundColor Green
    }
    Write-Host ""
    return 0
}

# Verificar se estamos em um projeto git
if (Test-Path ".git") {
    Write-Host "📁 Projeto Git detectado!" -ForegroundColor Green
    Write-Host ""
}

$totalSaved = 0

# 1. Arquivos temporários comuns
$totalSaved += Remove-SafeFiles '\.(tmp|temp|bak|backup|old)$' "arquivos temporários"

# 2. Arquivos de sistema
$totalSaved += Remove-SafeFiles '^(Thumbs\.db|\.DS_Store|desktop\.ini)$' "arquivos de sistema"

# 3. Logs
$totalSaved += Remove-SafeFiles '\.(log|logs)$' "arquivos de log"

# 4. Cache de editores
$totalSaved += Remove-SafeFiles '\.(swp|swo|~)$' "arquivos de cache de editores"

# 5. Arquivos de compilação JavaScript/CSS (se houver)
$totalSaved += Remove-SafeFiles '\.(min\.js|min\.css)\.map$' "source maps de arquivos minificados"

# Limpeza específica do Git
if (Test-Path ".git") {
    Write-Host "🔧 Limpeza do repositório Git..." -ForegroundColor Yellow
    
    # Verificar objetos soltos
    $looseObjects = Get-ChildItem ".git\objects" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Directory.Name -match '^[0-9a-f]{2}$' }
    if ($looseObjects.Count -gt 50) {
        Write-Host "  Encontrados $($looseObjects.Count) objetos soltos no Git" -ForegroundColor Red
        $response = Read-Host "  Executar git gc para otimizar? (S/N)"
        if ($response -eq 'S' -or $response -eq 's') {
            Write-Host "  Executando git gc..." -ForegroundColor Cyan
            git gc --prune=now --aggressive
            Write-Host "  ✓ Repositório otimizado!" -ForegroundColor Green
        }
    }
    else {
        Write-Host "  ✓ Repositório já está otimizado." -ForegroundColor Green
    }
    Write-Host ""
}

# Verificar pastas vazias
Write-Host "📂 Procurando pastas vazias..." -ForegroundColor Yellow
$emptyDirs = Get-ChildItem -Recurse -Directory -Force -ErrorAction SilentlyContinue | 
    Where-Object { (Get-ChildItem $_.FullName -Force -ErrorAction SilentlyContinue).Count -eq 0 -and $_.Name -ne ".git" }

if ($emptyDirs.Count -gt 0) {
    Write-Host "  Encontradas $($emptyDirs.Count) pastas vazias:" -ForegroundColor Red
    foreach ($dir in $emptyDirs) {
        Write-Host "    - $($dir.FullName)" -ForegroundColor Gray
    }
    
    $response = Read-Host "  Remover pastas vazias? (S/N)"
    if ($response -eq 'S' -or $response -eq 's') {
        $emptyDirs | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        Write-Host "  ✓ Pastas vazias removidas!" -ForegroundColor Green
    }
}
else {
    Write-Host "  ✓ Nenhuma pasta vazia encontrada." -ForegroundColor Green
}
Write-Host ""

# Relatório final
Write-Host "======================================" -ForegroundColor Green
Write-Host "    LIMPEZA CONCLUÍDA!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

if ($totalSaved -gt 0) {
    Write-Host "💾 Espaço liberado: $totalSaved MB" -ForegroundColor Cyan
}
else {
    Write-Host "✨ Projeto já estava limpo!" -ForegroundColor Cyan
}

# Mostrar tamanho atual do projeto
$currentSize = Get-FolderSize "."
Write-Host "📊 Tamanho atual do projeto: $currentSize MB" -ForegroundColor Cyan

Write-Host ""
Write-Host "💡 Dicas para manter o projeto limpo:" -ForegroundColor Yellow
Write-Host "   • Execute este script mensalmente"
Write-Host "   • Use .gitignore para arquivos temporários"
Write-Host "   • Faça commits regulares"
Write-Host "   • Evite arquivos grandes no repositório"
Write-Host ""

Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 