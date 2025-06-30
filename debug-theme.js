// Script de debug para verificar o modo escuro
console.log('=== DEBUG MODO ESCURO ===');

// Verificar se o DOM está carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado');
    
    // Verificar se o botão existe
    const themeToggle = document.getElementById('theme-toggle');
    console.log('Botão theme-toggle encontrado:', !!themeToggle);
    
    if (themeToggle) {
        console.log('Botão theme-toggle:', themeToggle);
        
        // Verificar tema atual
        const currentTheme = localStorage.getItem('theme') || 'light';
        console.log('Tema atual no localStorage:', currentTheme);
        
        const htmlTheme = document.documentElement.getAttribute('data-theme');
        console.log('Tema atual no HTML:', htmlTheme);
        
        // Adicionar listener de debug
        themeToggle.addEventListener('click', function() {
            console.log('Botão clicado!');
            
            setTimeout(() => {
                const newTheme = localStorage.getItem('theme');
                const newHtmlTheme = document.documentElement.getAttribute('data-theme');
                console.log('Novo tema no localStorage:', newTheme);
                console.log('Novo tema no HTML:', newHtmlTheme);
                
                // Verificar estilos aplicados
                const bodyStyles = window.getComputedStyle(document.body);
                console.log('Cor de fundo do body:', bodyStyles.backgroundColor);
                console.log('Cor do texto do body:', bodyStyles.color);
            }, 100);
        });
    }
    
    // Verificar se as variáveis CSS estão sendo aplicadas
    const rootStyles = window.getComputedStyle(document.documentElement);
    console.log('Variáveis CSS:');
    console.log('--bg-primary:', rootStyles.getPropertyValue('--bg-primary'));
    console.log('--text-primary:', rootStyles.getPropertyValue('--text-primary'));
    console.log('--card-bg:', rootStyles.getPropertyValue('--card-bg'));
});

// Função para testar manualmente
window.testThemeToggle = function() {
    console.log('Testando toggle manual...');
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    console.log('Tema alterado para:', newTheme);
    return newTheme;
};

console.log('Script de debug carregado. Use testThemeToggle() para testar manualmente.'); 