# 📊 Sistema de Controle de Modems

Sistema web moderno para controle e gravação de modems com sincronização Google Sheets.

## 🚀 Características

- **Interface Moderna**: Design responsivo com tema escuro/claro
- **Sincronização Google Sheets**: Backup automático dos dados
- **Dashboard Interativo**: Gráficos e estatísticas em tempo real
- **Sistema de Login**: Autenticação segura
- **PWA Ready**: Funciona offline como aplicativo

## 📁 Estrutura do Projeto

```
├── 📄 index.html              # Página principal
├── 📄 google-apps-script.gs   # Script Google Apps Script
├── 📄 cors-fix.gs            # Script auxiliar para CORS
├── 🎨 css/                   # Estilos CSS
│   ├── style.css             # Estilos principais
│   ├── diagnostic-styles.css # Estilos para diagnóstico
│   ├── sidebar-floating.css  # Menu lateral flutuante
│   └── center-fix.css        # Correções de centralização
├── ⚡ js/                    # Scripts JavaScript
│   ├── script.js             # Script principal
│   ├── google-sheets-integration.js # Integração Google Sheets
│   ├── debug-sync.js         # Debug de sincronização
│   └── cors-fix.js          # Correções CORS
├── 📚 docs/                  # Documentação
│   ├── README-GoogleSheets.md
│   ├── DIAGNOSTICO-SYNC.md
│   ├── accessibility-improvements.md
│   ├── advanced-features.md
│   ├── performance-improvements.md
│   ├── seo-improvements.md
│   └── IMPROVEMENT-PLAN.md
└── 🧪 tests/                # Arquivos de teste
    ├── cors-test.html
    └── teste-google-script.html
```

## 🛠️ Instalação

1. **Clone o repositório**
   ```bash
   git clone [url-do-repositorio]
   cd nova-pasta
   ```

2. **Configure o Google Apps Script**
   - Acesse [Google Apps Script](https://script.google.com)
   - Crie um novo projeto
   - Cole o conteúdo de `google-apps-script.gs`
   - Publique como Web App

3. **Configure a URL no sistema**
   - Abra `index.html`
   - Vá para a seção "Google Sheets"
   - Cole a URL do seu Web App

## 📖 Documentação

A documentação completa está disponível na pasta `docs/`:

- **[README-GoogleSheets.md](docs/README-GoogleSheets.md)**: Configuração Google Sheets
- **[DIAGNOSTICO-SYNC.md](docs/DIAGNOSTICO-SYNC.md)**: Sistema de diagnóstico
- **[accessibility-improvements.md](docs/accessibility-improvements.md)**: Melhorias de acessibilidade
- **[advanced-features.md](docs/advanced-features.md)**: Funcionalidades avançadas
- **[performance-improvements.md](docs/performance-improvements.md)**: Otimizações de performance

## 🧪 Testes

Os arquivos de teste estão na pasta `tests/`:

- `cors-test.html`: Teste de conectividade CORS
- `teste-google-script.html`: Teste Google Apps Script

## 🔧 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Google Apps Script
- **Armazenamento**: Google Sheets + LocalStorage
- **Gráficos**: Chart.js
- **Ícones**: Font Awesome

## 📊 Funcionalidades

### 📝 Gestão de Registros
- Adicionar, editar e remover registros
- Filtros avançados por data, modelo, etc.
- Exportação para PDF e Excel

### 📈 Dashboard
- Estatísticas em tempo real
- Gráficos interativos
- Calendário de atividades
- Metas e performance

### 🔄 Sincronização
- Backup automático Google Sheets
- Sistema de diagnóstico de conectividade
- Sincronização em tempo real
- Modo offline

### 🎨 Interface
- Tema escuro/claro
- Design responsivo
- Animações suaves
- Menu lateral flutuante

## 🔒 Segurança

- Sistema de login seguro
- Validação de dados
- Proteção CSRF
- Headers de segurança configurados

## 🌐 Compatibilidade

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile (iOS/Android)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adicionar nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para suporte, consulte a documentação na pasta `docs/` ou abra uma issue no repositório.

---

**Desenvolvido com ❤️ para controle eficiente de modems** 