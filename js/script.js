/* ===== VERIFICAÇÕES DE COMPATIBILIDADE ===== */
(function() {
    'use strict';
    
    // Verificar suporte a localStorage
    function supportsLocalStorage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }
    
    // Fallback para localStorage se não suportado
    if (!supportsLocalStorage()) {
        window.localStorage = {
            getItem: function(key) {
                return this[key] || null;
            },
            setItem: function(key, value) {
                this[key] = value;
            },
            removeItem: function(key) {
                delete this[key];
            }
        };
    }
    
    // Verificar suporte a CSS Grid
    function supportsGrid() {
        if (typeof CSS !== 'undefined' && CSS.supports) {
            return CSS.supports('display', 'grid');
        }
        // Fallback para navegadores sem CSS.supports
        return false;
    }
    
    // Adicionar classe para navegadores sem suporte a grid
    if (!supportsGrid()) {
        document.documentElement.classList.add('no-grid-support');
    }
    
    // Verificar suporte a backdrop-filter
    function supportsBackdropFilter() {
        if (typeof CSS !== 'undefined' && CSS.supports) {
            return CSS.supports('backdrop-filter', 'blur(1px)') || 
                   CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
        }
        // Fallback para navegadores sem CSS.supports
        return false;
    }
    
    // Adicionar classe para navegadores sem suporte a backdrop-filter
    if (!supportsBackdropFilter()) {
        document.documentElement.classList.add('no-backdrop-filter');
    }
    
    // Detectar Safari
    function isSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }
    
    if (isSafari()) {
        document.documentElement.classList.add('safari-browser');
    }
    
    // Detectar IE
    function isIE() {
        return /MSIE|Trident/.test(navigator.userAgent);
    }
    
    if (isIE()) {
        document.documentElement.classList.add('ie-browser');
    }
    
})();

/* ===== MODO ESCURO ===== */
(function() {
    'use strict';
    
    // Aplicar tema imediatamente (antes do DOMContentLoaded)
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Função para aplicar o tema
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
    }
    
    // Função para atualizar o ícone do tema
    function updateThemeIcon(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
        const icon = themeToggle.querySelector('i');
        if (!icon) return;
        
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
    
    // Função para alternar o tema
    function toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    }
    
    // Aguardar DOM carregar para adicionar event listeners
    document.addEventListener('DOMContentLoaded', function() {
        const themeToggle = document.getElementById('theme-toggle');
        
        if (themeToggle) {
            // Configurar ícone inicial
            updateThemeIcon(savedTheme);
            
            // Adicionar event listener
            themeToggle.addEventListener('click', toggleTheme);
        }
    });
    
})();

/* ===== SISTEMA DE LOGIN ===== */
// Usuários do sistema (em produção isso viria de um banco de dados)
const systemUsers = [
    {
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        role: 'admin',
        avatar: 'AD'
    },
    {
        username: 'operador',
        password: 'op123',
        name: 'Operador',
        role: 'operator',
        avatar: 'OP'
    }
];

let currentUser = null;

// Verificar se há usuário logado ao carregar a página
function checkLoginStatus() {
    // FORÇAR SEMPRE MOSTRAR A APLICAÇÃO PRINCIPAL (SEM LOGIN)
    showMainApp();
    return true;
    
    /* CÓDIGO ORIGINAL DESABILITADO
    const savedUser = localStorage.getItem('currentUser');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedUser && rememberMe) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
        updateUserDisplay();
        return true;
    }
    
    // Se não há usuário salvo ou não marcou "lembrar", mostrar login
    showLoginScreen();
    return false;
    */
}

// Mostrar tela de login
function showLoginScreen() {
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    
    if (loginScreen) {
        loginScreen.classList.remove('hidden');
        loginScreen.style.display = 'flex';
        loginScreen.style.position = 'fixed';
        loginScreen.style.top = '0';
        loginScreen.style.left = '0';
        loginScreen.style.right = '0';
        loginScreen.style.bottom = '0';
        loginScreen.style.width = '100vw';
        loginScreen.style.height = '100vh';
        loginScreen.style.zIndex = '9999';
        // Garantir que o scroll esteja no topo
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';
    }
    if (mainApp) {
        mainApp.classList.add('hidden');
        mainApp.style.display = 'none';
    }
}

// Mostrar aplicação principal
function showMainApp() {
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    
    // Esconder tela de login
    if (loginScreen) {
        loginScreen.classList.add('hidden');
        loginScreen.style.display = 'none';
    }
    
    // Mostrar aplicação principal
    if (mainApp) {
        mainApp.classList.remove('hidden');
        mainApp.style.display = 'block';
        document.body.style.overflow = 'auto';
    }
    
    console.log('Aplicação principal exibida com sucesso!');
}

// Atualizar exibição do usuário no header
function updateUserDisplay() {
    if (!currentUser) return;
    
    const userAvatar = document.querySelector('.user-avatar');
    const userNameDisplay = document.querySelector('.user-menu div:nth-child(2)');
    
    if (userAvatar) userAvatar.textContent = currentUser.avatar;
    if (userNameDisplay) userNameDisplay.textContent = currentUser.name;
}

// Função de login
function performLogin(username, password, rememberMe) {
    const user = systemUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        
        // Salvar no localStorage se "lembrar de mim" estiver marcado
        if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('rememberMe');
        }
        
        showMainApp();
        updateUserDisplay();
        showNotification(`Bem-vindo, ${user.name}!`);
        
        // Inicializar a aplicação após o login
        setTimeout(() => {
            initializeNavigation();
            initializeUserMenu();
            initializeBasicFunctionality();
            initApp();
            
            // Garantir que o dropdown do usuário funcione
            setupUserDropdownAfterLogin();
        }, 100);
        
        return true;
    }
    
    return false;
}

// Função de logout
function performLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    
    showLoginScreen();
    showNotification('Você saiu do sistema com sucesso.');
    
    // Limpar formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.reset();
}

// Configurar dropdown do usuário após login
function setupUserDropdownAfterLogin() {
    // Aguardar um pouco para garantir que os elementos estejam no DOM
    setTimeout(() => {
        const userMenuButton = document.querySelector('.user-menu');
        const userDropdown = document.querySelector('.user-dropdown');
        
        console.log('Configurando dropdown do usuário...', {
            userMenuButton: !!userMenuButton,
            userDropdown: !!userDropdown
        });
        
        if (userMenuButton && userDropdown) {
            // Remover listeners anteriores se existirem
            userMenuButton.replaceWith(userMenuButton.cloneNode(true));
            
            // Pegar a nova referência após o clone
            const newUserMenuButton = document.querySelector('.user-menu');
            
            newUserMenuButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                console.log('Dropdown clicado!');
                
                const isActive = userDropdown.classList.contains('active');
                
                if (isActive) {
                    userDropdown.classList.remove('active');
                    newUserMenuButton.setAttribute('aria-expanded', 'false');
                } else {
                    userDropdown.classList.add('active');
                    newUserMenuButton.setAttribute('aria-expanded', 'true');
                }
            });
            
            // Fechar dropdown ao clicar fora
            document.addEventListener('click', (event) => {
                if (!newUserMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
                    userDropdown.classList.remove('active');
                    newUserMenuButton.setAttribute('aria-expanded', 'false');
                }
            });
            
            console.log('Dropdown configurado com sucesso!');
        } else {
            console.log('Elementos do dropdown não encontrados');
        }
    }, 500);
}

// Inicializar sistema de login
function initializeLoginSystem() {
    const loginForm = document.getElementById('login-form');
    const togglePassword = document.getElementById('toggle-password');
    const forgotPassword = document.getElementById('forgot-password');
    
    // Event listener para o formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            if (!username || !password) {
                showNotification('Por favor, preencha todos os campos!', true);
                return;
            }
            
            const loginBtn = document.getElementById('login-btn');
            const originalText = loginBtn.innerHTML;
            
            // Mostrar loading
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            loginBtn.disabled = true;
            
            // Simular delay de autenticação
            setTimeout(() => {
                const success = performLogin(username, password, rememberMe);
                
                if (!success) {
                    showNotification('Usuário ou senha incorretos!', true);
                }
                
                // Restaurar botão
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }, 1000);
        });
    }
    
    // Toggle para mostrar/ocultar senha
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const icon = togglePassword.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Link "Esqueceu sua senha?"
    if (forgotPassword) {
        forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Funcionalidade de recuperação de senha será implementada em breve.', false);
        });
    }
}

// Aguardar DOM carregar para inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando ModemControl Pro...');
    
    // SEMPRE MOSTRAR A APLICAÇÃO PRINCIPAL (SEM LOGIN)
    showMainApp();
    
    // Inicializar todas as funcionalidades
    initializeNavigation();
    initializeUserMenu();
    initializeBasicFunctionality();
    initApp();
    
    console.log('ModemControl Pro inicializado com sucesso!');
});

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const headerTitle = document.querySelector('.header-title');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.id.split('-')[1];
            navigateTo(`view-${viewName}`, link, headerTitle);
        });
    });
    
    // Iniciar na view do dashboard
    navigateTo('view-dashboard');
}

function navigateTo(viewId, linkElement = null, headerTitle = null) {
    // Esconder todas as views
    const pageViews = document.querySelectorAll('.page-view');
    pageViews.forEach(view => view.classList.remove('active-view'));
    
    // Remover a classe 'active' de todos os links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));

    // Mostrar a view selecionada
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active-view');
    }

    // Atualizar o link ativo
    if (linkElement) {
        linkElement.classList.add('active');
    } else {
        const targetLink = document.getElementById(`nav-${viewId.split('-')[1]}`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }

    // Atualizar o título do cabeçalho
    if (headerTitle && linkElement) {
        const titleText = linkElement.querySelector('span').textContent;
        headerTitle.textContent = titleText;
    }
}

function initializeUserMenu() {
    const userMenuButton = document.querySelector('.user-menu');
    const userDropdown = document.querySelector('.user-dropdown');

    if (userMenuButton && userDropdown) {
        userMenuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
            userDropdown.classList.toggle('active');
            userMenuButton.setAttribute('aria-expanded', !isExpanded);
        });

        document.addEventListener('click', (event) => {
            if (!userMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
                userDropdown.classList.remove('active');
                userMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

function initializeBasicFunctionality() {
    // Menu toggle para responsividade
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
    // Botões do header
    const notificationsBtn = document.getElementById('notifications-btn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', function() {
            navigateTo('view-alerts');
        });
    }
    
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            navigateTo('view-settings');
        });
    }
    
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performLogout();
            const userDropdown = document.querySelector('.user-dropdown');
            if (userDropdown) userDropdown.classList.remove('active');
        });
    }
    
    // Tabs do dashboard
    const dashboardTabs = document.querySelectorAll('#view-dashboard .tab');
    const dashboardTabContents = document.querySelectorAll('#view-dashboard .tab-content');
    
    if (dashboardTabs && dashboardTabContents) {
        dashboardTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Desativar todas as abas e conteúdos
                dashboardTabs.forEach(t => t.classList.remove('active'));
                dashboardTabContents.forEach(c => c.classList.remove('active'));
                // Ativar a aba clicada
                tab.classList.add('active');
                const tabId = tab.getAttribute('data-tab');
                const tabContent = document.getElementById(`tab-${tabId}`);
                if (tabContent) tabContent.classList.add('active');
            });
        });
    }
}

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.innerHTML = `
        <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
        <div>${message}</div>
    `;
    notification.className = 'notification';
    
    if (isError) {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
// Dados da aplicação
let records = JSON.parse(localStorage.getItem('modemRecords')) || [];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = currentDate.toISOString().split('T')[0];
let recordToDelete = null;
let currentFilter = 'all';
let currentSort = 'name';
let filteredRecords = [];
let dailyGoal = 50; // Valor padrão

// Modelos de modems (carregados do localStorage ou padrão)
let modemModels = [];
const defaultModemModels = [
    { id: 81, produto: "ONU Huawei EG8145V5", modelo: "Huawei EG8145V5", fabricante: "Huawei", recordTime: 5 },
    { id: 769, produto: "ONU Huawei EG8145V5 - V2", modelo: "Huawei EG8145V5-V2", fabricante: "Huawei", recordTime: 5 },
    { id: 733, produto: "ONU Huawei EG8145X6-10", modelo: "EG8145X6-10", fabricante: "Huawei", recordTime: 7 },
    { id: 202, produto: "ONU Huawei EG8145X6", modelo: "EG8145X6", fabricante: "Huawei", recordTime: 7 },
    { id: 732, produto: "Roteador Huawei AX3S", modelo: "PSDN-AX30", fabricante: "Huawei", recordTime: 4 },
    { id: 88, produto: "Roteador Huawei K562 - HW", modelo: "AX300Mbs Dual-Band Edge", fabricante: "Huawei", recordTime: 4 },
    { id: 242, produto: "ONT Huawei EG8010H - Bridge", modelo: "EG8010H Bridge", fabricante: "Huawei", recordTime: 3 },
    { id: 119, produto: "Roteador Nokia Beacon 1.1", modelo: "Beacon 1.1", fabricante: "Nokia", recordTime: 6 },
    { id: 148, produto: "ONU Nokia G-1425G-B", modelo: "G-1425G-B", fabricante: "Nokia", recordTime: 8 },
    { id: 651, produto: "ONU Nokia G-1425G-A", modelo: "G-1425G-A", fabricante: "Nokia", recordTime: 8 },
    { id: 253, produto: "Roteador Huawei WA8021V5", modelo: "WA8021V5", fabricante: "Huawei", recordTime: 4 }
];

function loadModelsFromStorage() {
    const storedModels = localStorage.getItem('modemModelsList');
    if (storedModels && JSON.parse(storedModels).length > 0) {
        modemModels = JSON.parse(storedModels);
    } else {
        modemModels = defaultModemModels;
        localStorage.setItem('modemModelsList', JSON.stringify(modemModels));
    }
}

// Elementos DOM
const dateInput = document.getElementById('date');
const quantityInput = document.getElementById('quantity');
const modelSelect = document.getElementById('model');
const notesInput = document.getElementById('notes');
const addButton = document.getElementById('add-btn');
const searchModelInput = document.getElementById('search-model');
const searchButton = document.getElementById('search-btn');
const recordsList = document.getElementById('records-list');
const calendarEl = document.querySelector('.calendar');
const currentMonthEl = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const todayBtn = document.getElementById('today');
const notification = document.getElementById('notification');
const totalCountEl = document.getElementById('total-count');
const totalRecordsEl = document.getElementById('total-records');
const modelCountEl = document.getElementById('model-count-stat');
const modelCountStat = document.getElementById('model-count-stat');
const todayCountEl = document.getElementById('today-count');
const confirmationModal = document.getElementById('confirmation-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-models');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const progressPercent = document.getElementById('progress-percent');
const dailyProgress = document.getElementById('daily-progress');
const manufacturerChartEl = document.getElementById('manufacturer-chart');
const performanceChartEl = document.getElementById('performance-chart');
const chartRange = document.getElementById('chart-range');
const exportPdfBtn = document.getElementById('export-pdf');
const exportExcelBtn = document.getElementById('export-excel');
const clearRecordsBtn = document.getElementById('clear-records');
const filteredCountEl = document.getElementById('filtered-count');
const globalSearch = document.getElementById('global-search');
const filterDate = document.getElementById('filter-date');
const filterModel = document.getElementById('filter-model');
const filterManufacturer = document.getElementById('filter-manufacturer');
const filterQuantity = document.getElementById('filter-quantity');
const resetFiltersBtn = document.getElementById('reset-filters');
const addTaskBtn = document.getElementById('add-task');
const taskModal = document.getElementById('task-modal');
const closeTaskBtn = document.getElementById('close-task');
const cancelTaskBtn = document.getElementById('cancel-task');
const saveTaskBtn = document.getElementById('save-task');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskDue = document.getElementById('task-due');
const taskPriority = document.getElementById('task-priority');
const taskAssignee = document.getElementById('task-assignee');
const headerTitle = document.querySelector('.header-title');
const navLinks = document.querySelectorAll('.nav-link');
const pageViews = document.querySelectorAll('.page-view');

// Elementos da View de Modelos
const addModelBtn = document.getElementById('add-model-btn');
const newModelProductInput = document.getElementById('new-model-product');
const newModelNameInput = document.getElementById('new-model-name');
const newModelManufacturerInput = document.getElementById('new-model-manufacturer');
const newModelTimeInput = document.getElementById('new-model-time');
const modelsListContainer = document.getElementById('models-list-container');
const editModelModal = document.getElementById('edit-model-modal');
const editModelProductInput = document.getElementById('edit-model-product');
const editModelNameInput = document.getElementById('edit-model-name');
const editModelManufacturerInput = document.getElementById('edit-model-manufacturer');
const editModelTimeInput = document.getElementById('edit-model-time');
const cancelEditModelBtn = document.getElementById('cancel-edit-model');
const confirmEditModelBtn = document.getElementById('confirm-edit-model');
const dailyGoalInput = document.getElementById('daily-goal-input');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const clearAllDataBtn = document.getElementById('clear-all-data-btn');
const userMenu = document.querySelector('.user-menu');
const userDropdown = document.querySelector('.user-dropdown');
const logoutBtn = document.getElementById('logout-btn');
const notificationsBtn = document.getElementById('notifications-btn');
const settingsBtn = document.getElementById('settings-btn');
const recordsListReports = document.getElementById('records-list-reports');
const dashboardTabs = document.querySelectorAll('#view-dashboard .tab');
const dashboardTabContents = document.querySelectorAll('#view-dashboard .tab-content');
const planningModelSelect = document.getElementById('planning-model-select');
const planningResult = document.getElementById('planning-result');

let modelToEditId = null;
let manufacturerChartInstance = null;
let performanceChartInstance = null;

// Funções
function populateFilterModelDropdown() {
    if (!filterModel) return;
    filterModel.innerHTML = '<option value="">Todos os modelos</option>';

    const sortedModels = [...modemModels].sort((a, b) => a.produto.localeCompare(b.produto));

    sortedModels.forEach(model => {
        const filterOption = document.createElement('option');
        filterOption.value = model.id;
        filterOption.textContent = model.produto;
        filterModel.appendChild(filterOption);
    });
}

function showNotification(message, isError = false) {
    notification.innerHTML = `
        <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
        <div>${message}</div>
    `;
    notification.className = 'notification';
    
    if (isError) {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function populateModelList(searchTerm = '') {
    if (!modelSelect) return;
    modelSelect.innerHTML = '';
    
    let filteredModels = [...modemModels];
    
    // Aplicar filtro por fabricante
    if (currentFilter !== 'all') {
        filteredModels = filteredModels.filter(model => 
            model.fabricante === currentFilter
        );
    }
    
    // Aplicar filtro de pesquisa
    if (searchTerm) {
        filteredModels = filteredModels.filter(model => 
            model.modelo.toLowerCase().includes(searchTerm.toLowerCase()) || 
            model.fabricante.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // Aplicar ordenação
    filteredModels.sort((a, b) => {
        if (currentSort === 'name') {
            return a.modelo.localeCompare(b.modelo);
        } else {
            return a.fabricante.localeCompare(b.fabricante) || 
                   a.modelo.localeCompare(b.modelo);
        }
    });
    
    if (filteredModels.length === 0) {
        modelSelect.innerHTML = '<option>Nenhum modelo encontrado</option>';
if (modelCountEl) modelCountEl.textContent = '0';
        return;
    }
    
    filteredModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = `${model.fabricante} - ${model.modelo}`;
        modelSelect.appendChild(option);
    });
    
if (modelCountEl) modelCountEl.textContent = `${filteredModels.length}`;
}

function addRecord() {
    const date = dateInput.value;
    const quantity = parseInt(quantityInput.value);
    const modelId = parseInt(modelSelect.value);
    const notes = notesInput.value.trim();
    
    if (!date) {
        showNotification('Por favor, selecione uma data!', true);
        return;
    }
    
    if (isNaN(quantity) || quantity < 1) {
        showNotification('Por favor, informe uma quantidade válida!', true);
        return;
    }
    
    if (isNaN(modelId)) {
        showNotification('Por favor, selecione um modelo de modem!', true);
        return;
    }
    
    const model = modemModels.find(m => m.id === modelId);
    
    if (!model) {
        showNotification('Modelo de modem não encontrado!', true);
        return;
    }
    
    const newRecord = {
        id: Date.now().toString(),
        date,
        quantity,
        modelId,
        model,
        notes,
        timestamp: new Date().toISOString()
    };
    
    records.push(newRecord);
    localStorage.setItem('modemRecords', JSON.stringify(records));
    
    // Reset form
    quantityInput.value = '1';
    notesInput.value = '';
    
    showNotification('Gravação registrada com sucesso!');
    updateCalendar();
    applyFilters();
    updateStats();
    updateManufacturerChart();
    updatePerformanceChart();
}

function promptDeleteRecord(id) {
if (!confirmationModal) {
        console.error('Modal de confirmação não encontrado!');
        return;
    }
    recordToDelete = id;
    confirmationModal.style.display = 'flex';
}

function deleteRecord() {
    if (!recordToDelete) return;
    
    records = records.filter(record => record.id !== recordToDelete);
    localStorage.setItem('modemRecords', JSON.stringify(records));
    
    showNotification('Registro removido!');
    applyFilters();
    updateCalendar();
    updateStats();
    updateManufacturerChart();
    updatePerformanceChart();
    
    confirmationModal.style.display = 'none';
    recordToDelete = null;
}

function updateStats() {
if (totalCountEl) totalCountEl.textContent = records.length;
    if (totalRecordsEl) totalRecordsEl.textContent = records.length;
    if (modelCountStat) modelCountStat.textContent = modemModels.length;
    
    // Contar gravações de hoje
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(record => record.date === today);
    const todayQuantity = todayRecords.reduce((sum, record) => sum + record.quantity, 0);
if (todayCountEl) todayCountEl.textContent = todayQuantity;
    
    // Atualizar barra de progresso
    const progress = Math.min((todayQuantity / dailyGoal) * 100, 100);
    if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
    if (dailyProgress) dailyProgress.style.width = `${progress}%`;

    // Atualizar texto da meta na UI
    const dailyGoalLabel = document.querySelector('.progress-header span:first-child');
    if (dailyGoalLabel) {
        dailyGoalLabel.textContent = `Meta: ${dailyGoal}`;
    }
}

function showRecords(recordsToShow, targetListElement) {
    if (!targetListElement) return;

    const listId = targetListElement.id;
    const countElement = listId === 'records-list' 
        ? null // O dashboard não tem contador individual
        : document.getElementById('filtered-count');

    if (recordsToShow.length === 0) {
        targetListElement.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma gravação encontrada.</p>
            </div>
        `;
        if (countElement) countElement.textContent = '0';
        return;
    }
    
    targetListElement.innerHTML = '';
    if (countElement) countElement.textContent = recordsToShow.length;
    
    recordsToShow.forEach(record => {
        const recordEl = document.createElement('div');
        recordEl.className = 'modem-item';
        recordEl.innerHTML = `
            <div class="modem-info">
                <div class="modem-model"><i class="fas fa-microchip"></i> ${record.model.fabricante} - ${record.model.modelo}</div>
                <div class="modem-details">
                    <span><i class="fas fa-calendar"></i> ${formatDate(record.date)}</span>
                    <span><i class="fas fa-layer-group"></i> Quantidade: ${record.quantity}</span>
                    <span class="fabricante-badge">${record.model.fabricante}</span>
                </div>
                ${record.notes ? `<div class="notes" style="margin-top: 8px; color: #95a5a6; font-size: 0.9rem;"><i class="fas fa-comment-alt"></i> ${record.notes}</div>` : ''}
            </div>
            <div class="actions">
                <button class="btn-delete" data-id="${record.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        targetListElement.appendChild(recordEl);
    });
// Adicionar event listeners para os botões de deletar
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = button.getAttribute('data-id');
            promptDeleteRecord(id);
        });
    });
}

function applyFilters() {
    filteredRecords = [...records];
    
    // Filtro por data
    if (filterDate.value) {
        filteredRecords = filteredRecords.filter(record => record.date === filterDate.value);
    }
    
    // Filtro por modelo
    if (filterModel.value) {
        filteredRecords = filteredRecords.filter(record => record.modelId == filterModel.value);
    }
    
    // Filtro por fabricante
    if (filterManufacturer.value) {
        filteredRecords = filteredRecords.filter(record => record.model.fabricante === filterManufacturer.value);
    }
    
    // Filtro por quantidade mínima
    if (filterQuantity.value) {
        const minQuantity = parseInt(filterQuantity.value);
        filteredRecords = filteredRecords.filter(record => record.quantity >= minQuantity);
    }
    
    // Filtro global
    const searchTerm = globalSearch.value.toLowerCase();
    if (searchTerm) {
        filteredRecords = filteredRecords.filter(record => 
            record.model.modelo.toLowerCase().includes(searchTerm) ||
            record.model.fabricante.toLowerCase().includes(searchTerm) ||
            (record.notes && record.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    showRecords(filteredRecords, recordsListReports);
}

function resetFilters() {
if (filterDate) filterDate.value = '';
    if (filterModel) filterModel.value = '';
    if (filterManufacturer) filterManufacturer.value = '';
    if (filterQuantity) filterQuantity.value = '';
    if (globalSearch) globalSearch.value = '';
    applyFilters();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateCalendar() {
    // Obter o primeiro dia do mês e o número de dias no mês
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const today = new Date().toISOString().split('T')[0];
    
    // Atualizar o cabeçalho do calendário
    currentMonthEl.textContent = firstDay.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
    }).replace(/^\w/, c => c.toUpperCase());
    
    // Limpar calendário (apenas os dias, mantendo cabeçalhos)
    while (calendarEl.children.length > 7) {
        calendarEl.removeChild(calendarEl.lastChild);
    }
    
    // Adicionar dias vazios para o primeiro dia da semana
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        emptyDay.innerHTML = '<div class="day-number"></div>';
        calendarEl.appendChild(emptyDay);
    }
    
    // Adicionar os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayRecords = records.filter(record => record.date === dateStr);
        const isToday = dateStr === today;
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        if (dateStr === selectedDate) dayEl.classList.add('active');
        if (dayRecords.length > 0) dayEl.classList.add('has-records');
        if (isToday) dayEl.classList.add('today');
        
        dayEl.innerHTML = `
            <div class="day-number">${day}${isToday ? ' <span style="font-size:0.7em;">(Hoje)</span>' : ''}</div>
            ${dayRecords.length > 0 ? `<div class="day-records">${dayRecords.length} gravação${dayRecords.length !== 1 ? 'ões' : ''}</div>` : ''}
        `;
        
        dayEl.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('active'));
            dayEl.classList.add('active');
            selectedDate = dateStr;
            filterDate.value = dateStr;
            applyFilters();
        });
        
        calendarEl.appendChild(dayEl);
    }
}

function updateManufacturerChart() {
// Verificar se o elemento existe
    if (!manufacturerChartEl) {
        console.warn('Element manufacturer-chart not found');
        return;
    }
    
    // Calcular distribuição por fabricante
    const distribution = {};
    records.forEach(record => {
        const model = modemModels.find(m => m.id == record.model);
        if(model) {
            const manufacturer = model.fabricante;
            if (!distribution[manufacturer]) {
                distribution[manufacturer] = 0;
            }
            distribution[manufacturer] += record.quantity;
        }
    });
    
    // Preparar dados para o gráfico
    const labels = Object.keys(distribution);
    const series = Object.values(distribution);
    
// Se não há dados, mostrar gráfico vazio
    if (labels.length === 0) {
        labels.push('Nenhum dado');
        series.push(1);
    }
    // Configurar o gráfico de pizza
    const options = {
        series: series,
        chart: {
            type: 'donut',
            height: '100%'
        },
        labels: labels,
        colors: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'],
        legend: {
            position: 'bottom'
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: '100%'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }],
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            color: '#ecf0f1'
                        }
                    }
                }
            }
        }
    };
    
    // Renderizar o gráfico
if (manufacturerChartInstance) {
        manufacturerChartInstance.destroy();
    }
    
    // Verificar se ApexCharts está disponível
    if (typeof ApexCharts === 'undefined') {
        console.error('ApexCharts não está carregado');
        return;
    }
    
    manufacturerChartInstance = new ApexCharts(manufacturerChartEl, options);
    manufacturerChartInstance.render();
}

function updatePerformanceChart() {
    // Verificar se o elemento existe
    if (!performanceChartEl) {
        console.warn('Element performance-chart not found');
        return;
    }
    
    const range = parseInt(chartRange?.value || 7);
    const today = new Date();
    const labels = [];
    const data = [];
    
    for (let i = range - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayRecords = records.filter(record => record.date === dateStr);
        const totalQuantity = dayRecords.reduce((sum, record) => sum + record.quantity, 0);
        
        labels.push(formatDate(dateStr));
        data.push(totalQuantity);
    }
    
    // Configurar o gráfico de desempenho
    const options = {
        series: [{
            name: "Gravações",
            data: data
        }],
        chart: {
            height: '100%',
            type: 'area',
            toolbar: {
                show: true
            }
        },
        colors: ['#3498db'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        xaxis: {
            categories: labels,
            labels: {
                style: {
                    colors: '#bdc3c7'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#bdc3c7'
                }
            }
        },
        grid: {
            borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        tooltip: {
            theme: 'dark'
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3,
                stops: [0, 90, 100]
            }
        }
    };
    
    // Renderizar o gráfico
if (performanceChartInstance) {
        performanceChartInstance.destroy();
    }
    
    // Verificar se ApexCharts está disponível
    if (typeof ApexCharts === 'undefined') {
        console.error('ApexCharts não está carregado');
        return;
    }
    
    performanceChartInstance = new ApexCharts(performanceChartEl, options);
    performanceChartInstance.render();
}

function exportToPDF() {
    if (filteredRecords.length === 0) {
        showNotification('Nenhum registro para exportar!', true);
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Relatório de Gravações de Modems', 105, 15, null, null, 'center');
    
    // Data de emissão
    doc.setFontSize(10);
    doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 22, null, null, 'center');
    
    // Tabela
    const tableData = [
        ['Data', 'Modelo', 'Fabricante', 'Quantidade', 'Observações']
    ];
    
    filteredRecords.forEach(record => {
        tableData.push([
            formatDate(record.date),
            record.model.modelo,
            record.model.fabricante,
            record.quantity.toString(),
            record.notes || ''
        ]);
    });
    
    // Adicionar tabela
    doc.autoTable({
head: [tableData[0]],
        body: tableData.slice(1),
        startY: 30,
        theme: 'grid',
        headStyles: { 
            fillColor: [52, 152, 219],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: { 
            fontSize: 8,
            cellPadding: 3
        },
        margin: { top: 30 }
    });
    
    // Salvar PDF
    doc.save(`relatorio_gravações_${new Date().toISOString().slice(0, 10)}.pdf`);
    showNotification('Relatório exportado em PDF!');
}

function exportToExcel() {
    if (filteredRecords.length === 0) {
        showNotification('Nenhum registro para exportar!', true);
        return;
    }
    
    // Preparar dados para a planilha
    const data = [
        ['Data', 'Modelo', 'Fabricante', 'Quantidade', 'Observações']
    ];
    
    filteredRecords.forEach(record => {
        data.push([
            formatDate(record.date),
            record.model.modelo,
            record.model.fabricante,
            record.quantity,
            record.notes || ''
        ]);
    });
    
    // Criar planilha
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gravações");
    
    // Salvar arquivo
    XLSX.writeFile(wb, `relatorio_gravações_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showNotification('Relatório exportado em Excel!');
}

function clearAllRecords() {
    if (confirm('Tem certeza que deseja apagar TODOS os registros?\nEsta ação não pode ser desfeita.')) {
        records = [];
        localStorage.setItem('modemRecords', JSON.stringify(records));
        applyFilters();
        updateStats();
        updateManufacturerChart();
        updatePerformanceChart();
        showNotification('Todos os registros foram removidos!');
    }
}

function openTaskModal() {
    // Definir data padrão para amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
if (taskDue) taskDue.value = tomorrow.toISOString().split('T')[0];
    
    if (taskModal) {
        taskModal.classList.add('show');
        taskModal.style.display = 'flex';
    }
}

function saveTask() {
    if (!taskTitle || !taskTitle.value.trim()) {
        showNotification('Por favor, informe um título para a tarefa!', true);
        return;
    }
    
    // Aqui você salvaria a tarefa no sistema
    showNotification('Tarefa salva com sucesso!');
if (taskModal) {
        taskModal.classList.remove('show');
        taskModal.style.display = 'none';
    }
    
    // Resetar formulário
    if (taskTitle) taskTitle.value = '';
    if (taskDescription) taskDescription.value = '';
    
    // Definir data padrão para amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
taskDue.value = tomorrow.toISOString().split('T')[0];
    
    taskPriority.value = 'medium';
    taskAssignee.value = 'user1';
}

function navigateTo(viewId) {
    // Esconder todas as views
    pageViews.forEach(view => view.classList.remove('active-view'));
    
    // Remover a classe 'active' de todos os links
    navLinks.forEach(link => link.classList.remove('active'));

    // Mostrar a view selecionada
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active-view');
    }

    // Atualizar o link ativo
    const targetLink = document.getElementById(`nav-${viewId.split('-')[1]}`);
    if (targetLink) {
        targetLink.classList.add('active');
    }

    // Atualizar o título do cabeçalho
    if (targetLink) {
        const titleText = targetLink.querySelector('span').textContent;
        headerTitle.textContent = `${titleText}`;
    }
}

function renderModelsList() {
    modelsListContainer.innerHTML = '';
    if (modemModels.length === 0) {
        modelsListContainer.innerHTML = `<div class="empty-state"><p>Nenhum modelo cadastrado.</p></div>`;
        return;
    }

    modemModels.forEach(model => {
        const modelEl = document.createElement('div');
        modelEl.className = 'modem-item';
        modelEl.innerHTML = `
            <div class="modem-info">
                <div class="modem-model"><i class="fas fa-microchip"></i> ${model.produto}</div>
                <div class="modem-details">
                    <span><i class="fas fa-network-wired"></i> Modelo: ${model.modelo}</span>
                    <span><i class="fas fa-clock"></i> Tempo: ${model.recordTime || 'N/A'} min</span>
                    <span class="fabricante-badge">${model.fabricante}</span>
                </div>
            </div>
            <div class="actions">
<button class="btn-secondary" style="padding: 8px 15px; font-size: 0.9rem;" onclick="openEditModal(${model.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteModel(${model.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        modelsListContainer.appendChild(modelEl);
    });
}

function addModel() {
    const produto = newModelProductInput.value.trim();
    const modelo = newModelNameInput.value.trim();
    const fabricante = newModelManufacturerInput.value;
    const recordTime = parseInt(newModelTimeInput.value);

    if (!produto || !modelo || !recordTime || recordTime <= 0) {
        showNotification('Preencha todos os campos, incluindo um tempo de gravação válido!', true);
        return;
    }

    const newModel = {
        id: Date.now(), // ID simples baseado no timestamp
        produto: produto,
        modelo: modelo,
        fabricante: fabricante,
        recordTime: recordTime
    };

    modemModels.push(newModel);
    localStorage.setItem('modemModelsList', JSON.stringify(modemModels));
    
    // Limpar formulário
    newModelProductInput.value = '';
    newModelNameInput.value = '';
    newModelTimeInput.value = '';

    // Atualizar as listas
    renderModelsList();
    populateModelList(); // Atualiza o dropdown na página principal
    populateFilterModelDropdown();
    populatePlanningDropdown();
    updateStats(); // Atualiza o card de contagem de modelos

    showNotification('Novo modelo adicionado com sucesso!');
}

function deleteModel(id) {
    // Adicionar confirmação
    if (confirm(`Tem certeza que deseja excluir o modelo?`)) {
        modemModels = modemModels.filter(model => model.id !== id);
        localStorage.setItem('modemModelsList', JSON.stringify(modemModels));
        
        renderModelsList();
        populateModelList();
        populateFilterModelDropdown();
        populatePlanningDropdown();
        updateStats();

        showNotification('Modelo excluído com sucesso!');
    }
}

function openEditModal(id) {
    modelToEditId = id;
    const model = modemModels.find(m => m.id === id);
    if (!model) return;

    editModelProductInput.value = model.produto;
    editModelNameInput.value = model.modelo;
    editModelManufacturerInput.value = model.fabricante;
    editModelTimeInput.value = model.recordTime || '';

    editModelModal.style.display = 'flex';
}

function saveModelChanges() {
    if (!modelToEditId) return;

    const produto = editModelProductInput.value.trim();
    const modelo = editModelNameInput.value.trim();
    const fabricante = editModelManufacturerInput.value;
    const recordTime = parseInt(editModelTimeInput.value);

    if (!produto || !modelo) {
        showNotification('Os campos não podem estar vazios!', true);
        return;
    }

    const modelIndex = modemModels.findIndex(m => m.id === modelToEditId);
    if (modelIndex > -1) {
        modemModels[modelIndex] = { ...modemModels[modelIndex], produto, modelo, fabricante, recordTime };
        localStorage.setItem('modemModelsList', JSON.stringify(modemModels));

        renderModelsList();
        populateModelList();
        populateFilterModelDropdown();
        populatePlanningDropdown();
        showNotification('Modelo atualizado com sucesso!');
    }

    editModelModal.style.display = 'none';
    modelToEditId = null;
}

function saveSettings() {
    const newGoal = parseInt(dailyGoalInput.value);
    if (newGoal && newGoal > 0) {
        dailyGoal = newGoal;
        localStorage.setItem('dailyGoal', dailyGoal);
        showNotification('Configurações salvas com sucesso!');
        updateStats(); // Atualiza a UI com a nova meta
    } else {
        showNotification('Por favor, insira um valor válido para a meta.', true);
    }
}

function clearAllData() {
    if (confirm('TEM CERTEZA? Esta ação apagará TODOS os registros e modelos customizados.')) {
        if (confirm('CONFIRMAÇÃO FINAL: Todos os dados serão perdidos. Deseja continuar?')) {
            localStorage.removeItem('modemRecords');
            localStorage.removeItem('modemModelsList');
            localStorage.removeItem('dailyGoal');
            
            // Recarregar a aplicação para o estado inicial
            location.reload();
        }
    }
}

function populatePlanningDropdown() {
if (!planningModelSelect) return;
    planningModelSelect.innerHTML = '<option value="">-- Escolha um modelo --</option>';
    const sortedModels = [...modemModels].sort((a, b) => a.produto.localeCompare(b.produto));
    sortedModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.produto;
        planningModelSelect.appendChild(option);
    });
}

function calculateDailyPotential() {
    const modelId = parseInt(planningModelSelect.value);
    if (!modelId) {
        planningResult.innerHTML = `
            <i class="fas fa-hourglass-start"></i>
            <p>Selecione um modelo para ver o potencial de gravação diário.</p>
        `;
        return;
    }

    const model = modemModels.find(m => m.id === modelId);
    if (!model || !model.recordTime || model.recordTime <= 0) {
        planningResult.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>O tempo de gravação para este modelo não foi definido. Edite o modelo para adicionar.</p>
        `;
        return;
    }

    const workingMinutes = 8 * 60; // 8 horas de trabalho
    const potential = Math.floor(workingMinutes / model.recordTime);

    planningResult.innerHTML = `
        <div class="stat-value" style="font-size: 2rem; margin-bottom: 10px;">${potential}</div>
        <p>unidades de <strong>${model.modelo}</strong> podem ser gravadas hoje (jornada de 8h).</p>
    `;
}

// Inicialização
function initApp() {
    // Carregar configurações
    dailyGoal = parseInt(localStorage.getItem('dailyGoal')) || 50;
    dailyGoalInput.value = dailyGoal;

    // Carregar modelos do storage
    loadModelsFromStorage();

    // Preencher lista de modelos
    populateModelList();
    populateFilterModelDropdown();
    populatePlanningDropdown();
    
    // Renderizar tabela de modelos na view de modelos
    renderModelsList();

    // Configurar data atual
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];
    selectedDate = dateInput.value;
    
    // Atualizar calendário
    updateCalendar();
    
    // Aplicar filtros e mostrar registros
    applyFilters();
    
    // Atualizar estatísticas
    updateStats();
    
    // Atualizar gráficos
    updateManufacturerChart();
    updatePerformanceChart();

    // Configurar navegação
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.id.split('-')[1];
            navigateTo(`view-${viewName}`);
        });
    });

    // Iniciar na view do dashboard
    navigateTo('view-dashboard');
}

// Event Listeners
if (addButton) addButton.addEventListener('click', addRecord);
if (addModelBtn) addModelBtn.addEventListener('click', addModel);

if (searchButton) searchButton.addEventListener('click', () => {
    populateModelList(searchModelInput.value);
});

if (searchModelInput) searchModelInput.addEventListener('input', () => {
    populateModelList(searchModelInput.value);
});

if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateCalendar();
});

if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateCalendar();
});

if (todayBtn) todayBtn.addEventListener('click', () => {
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    updateCalendar();
    dateInput.value = today.toISOString().split('T')[0];
    selectedDate = dateInput.value;
    applyFilters();
});

if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => {
    confirmationModal.style.display = 'none';
    recordToDelete = null;
});

if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', deleteRecord);

// Fechar modal ao clicar fora dele
window.addEventListener('click', (e) => {
    if (confirmationModal && e.target === confirmationModal) {
        confirmationModal.style.display = 'none';
        recordToDelete = null;
    }
    if (taskModal && e.target === taskModal) {
        taskModal.classList.remove('show');
        taskModal.style.display = 'none';
    }
    if (editModelModal && e.target === editModelModal) {
        editModelModal.style.display = 'none';
        modelToEditId = null;
    }
    // Fechar dropdown do usuário
    if (userMenu && userDropdown && !userMenu.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('active');
    }
});

// Filtros por fabricante
if (filterButtons) filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remover classe ativa de todos
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Adicionar classe ativa ao botão clicado
        button.classList.add('active');
        // Atualizar filtro
        currentFilter = button.getAttribute('data-filter');
        // Repopular lista
        populateModelList(searchModelInput.value);
    });
});

// Ordenação
if (sortSelect) sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    populateModelList(searchModelInput.value);
});

// Menu toggle
if (menuToggle) menuToggle.addEventListener('click', () => {
    if (sidebar) sidebar.classList.toggle('active');
});

// Atualizar gráfico quando mudar o intervalo
if (chartRange) chartRange.addEventListener('change', updatePerformanceChart);

// Exportação de dados
if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportToPDF);
if (exportExcelBtn) exportExcelBtn.addEventListener('click', exportToExcel);

// Limpar registros
if (clearRecordsBtn) clearRecordsBtn.addEventListener('click', clearAllRecords);

// Filtros
if (filterDate) filterDate.addEventListener('change', applyFilters);
if (filterModel) filterModel.addEventListener('change', applyFilters);
if (filterManufacturer) filterManufacturer.addEventListener('change', applyFilters);
if (filterQuantity) filterQuantity.addEventListener('input', applyFilters);
if (globalSearch) globalSearch.addEventListener('input', applyFilters);
if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);

// Tarefas
if (addTaskBtn) addTaskBtn.addEventListener('click', openTaskModal);
if (closeTaskBtn) closeTaskBtn.addEventListener('click', () => {
    if (taskModal) {
        taskModal.classList.remove('show');
        taskModal.style.display = 'none';
    }
});
if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', () => {
    if (taskModal) {
        taskModal.classList.remove('show');
        taskModal.style.display = 'none';
    }
});
if (saveTaskBtn) saveTaskBtn.addEventListener('click', saveTask);

// Configurar arrastar e soltar para kanban
const kanbanItems = document.querySelectorAll('.kanban-item');
const kanbanColumns = document.querySelectorAll('.kanban-column');

if (kanbanItems && kanbanColumns) {
    kanbanItems.forEach(item => {
        item.setAttribute('draggable', true);
        item.addEventListener('dragstart', () => {
            item.classList.add('dragging');
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
    });
    kanbanColumns.forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault();
            const draggingItem = document.querySelector('.dragging');
            column.querySelector('.kanban-items').appendChild(draggingItem);
        });
    });
}

if (confirmEditModelBtn) confirmEditModelBtn.addEventListener('click', saveModelChanges);
if (cancelEditModelBtn) cancelEditModelBtn.addEventListener('click', () => {
    if (editModelModal) editModelModal.style.display = 'none';
    modelToEditId = null;
});

if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);
if (clearAllDataBtn) clearAllDataBtn.addEventListener('click', clearAllData);

// --- Controles do Cabeçalho ---
if (userMenu) userMenu.addEventListener('click', () => {
    if (userDropdown) userDropdown.classList.toggle('active');
});

if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showNotification('Você saiu do sistema (simulação).');
    if (userDropdown) userDropdown.classList.remove('active');
});

if (notificationsBtn) notificationsBtn.addEventListener('click', () => navigateTo('view-alerts'));
if (settingsBtn) settingsBtn.addEventListener('click', () => navigateTo('view-settings'));

// --- Abas do Dashboard ---
if (dashboardTabs && dashboardTabContents) dashboardTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Desativar todas as abas e conteúdos
        dashboardTabs.forEach(t => t.classList.remove('active'));
        dashboardTabContents.forEach(c => c.classList.remove('active'));
        // Ativar a aba clicada
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        const tabContent = document.getElementById(`tab-${tabId}`);
        if (tabContent) tabContent.classList.add('active');
    });
});

if (planningModelSelect) planningModelSelect.addEventListener('change', calculateDailyPotential);

// ===== EVENT LISTENERS PARA GOOGLE SHEETS INTEGRATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Elementos da integração Google Sheets
    const googleScriptUrlInput = document.getElementById('google-script-url');
    const testConnectionBtn = document.getElementById('test-connection-btn');
    const syncNowBtn = document.getElementById('sync-now-btn');
    const setupAutoSyncBtn = document.getElementById('setup-auto-sync-btn');
    const autoSyncIntervalSelect = document.getElementById('auto-sync-interval');
    const autoBackupCheckbox = document.getElementById('auto-backup-enabled');
    const createBackupBtn = document.getElementById('create-backup-btn');
    const generateReportBtn = document.getElementById('generate-report-btn');

    // Carregar URL salva
    if (googleScriptUrlInput) {
        const savedUrl = localStorage.getItem('googleSheetsScriptUrl');
        if (savedUrl) {
            googleScriptUrlInput.value = savedUrl;
        }

        // Salvar URL quando alterada
        googleScriptUrlInput.addEventListener('change', function() {
            if (window.googleSheetsIntegration) {
                window.googleSheetsIntegration.setScriptUrl(this.value);
                window.googleSheetsIntegration.updateSyncStatus();
            }
        });
    }

    // Testar conexão
    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', async function() {
            try {
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testando...';
                
                if (window.googleSheetsIntegration) {
                    await window.googleSheetsIntegration.testConnection();
                    showNotification('Conexão estabelecida com sucesso!', false);
                }
            } catch (error) {
                showNotification('Erro na conexão: ' + error.message, true);
            } finally {
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-wifi"></i> Testar Conexão';
            }
        });
    }

    // Sincronizar agora
    if (syncNowBtn) {
        syncNowBtn.addEventListener('click', async function() {
            try {
                this.disabled = true;
                this.classList.add('syncing');
                this.innerHTML = '<i class="fas fa-sync fa-spin"></i> Sincronizando...';
                
                if (window.googleSheetsIntegration) {
                    await window.googleSheetsIntegration.syncAllData();
                }
            } catch (error) {
                showNotification('Erro na sincronização: ' + error.message, true);
            } finally {
                this.disabled = false;
                this.classList.remove('syncing');
                this.innerHTML = '<i class="fas fa-sync"></i> Sincronizar Agora';
            }
        });
    }

    // Configurar auto-sync
    if (setupAutoSyncBtn) {
        setupAutoSyncBtn.addEventListener('click', function() {
            if (window.googleSheetsIntegration) {
                const interval = parseInt(autoSyncIntervalSelect.value) || 5;
                const isEnabled = localStorage.getItem('autoSyncEnabled') === 'true';
                
                if (isEnabled) {
                    window.googleSheetsIntegration.disableAutoSync();
                    this.innerHTML = '<i class="fas fa-clock"></i> Ativar Auto-Sync';
                    showNotification('Sincronização automática desabilitada', false);
                } else {
                    window.googleSheetsIntegration.enableAutoSync(interval);
                    this.innerHTML = '<i class="fas fa-clock"></i> Desativar Auto-Sync';
                    showNotification(`Sincronização automática ativada (${interval} min)`, false);
                }
            }
        });
    }

    // Atualizar botão de auto-sync baseado no estado atual
    if (setupAutoSyncBtn) {
        const isEnabled = localStorage.getItem('autoSyncEnabled') === 'true';
        setupAutoSyncBtn.innerHTML = isEnabled ? 
            '<i class="fas fa-clock"></i> Desativar Auto-Sync' : 
            '<i class="fas fa-clock"></i> Ativar Auto-Sync';
    }

    // Carregar configurações de auto-sync
    if (autoSyncIntervalSelect) {
        const savedInterval = localStorage.getItem('autoSyncInterval') || '5';
        autoSyncIntervalSelect.value = savedInterval;
    }

    if (autoBackupCheckbox) {
        const backupEnabled = localStorage.getItem('autoBackupEnabled') === 'true';
        autoBackupCheckbox.checked = backupEnabled;
        
        autoBackupCheckbox.addEventListener('change', function() {
            localStorage.setItem('autoBackupEnabled', this.checked.toString());
            showNotification(
                this.checked ? 'Backup automático ativado' : 'Backup automático desativado', 
                false
            );
        });
    }

    // Criar backup manual
    if (createBackupBtn) {
        createBackupBtn.addEventListener('click', async function() {
            try {
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
                
                if (window.googleSheetsIntegration) {
                    await window.googleSheetsIntegration.createBackup();
                }
            } catch (error) {
                showNotification('Erro ao criar backup: ' + error.message, true);
            } finally {
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-shield-alt"></i> Criar Backup Manual';
            }
        });
    }

    // Gerar relatório
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', async function() {
            try {
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
                
                if (window.googleSheetsIntegration) {
                    await window.googleSheetsIntegration.generateAutomaticReport('manual');
                }
            } catch (error) {
                showNotification('Erro ao gerar relatório: ' + error.message, true);
            } finally {
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-chart-line"></i> Gerar Relatório';
            }
        });
    }
});

// Hook para sincronizar automaticamente quando novos registros forem adicionados
// Hook para sincronização automática com Google Sheets será configurado via google-sheets-integration.js

// Inicializar integração GitHub quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Inicializar GitHub Integration se disponível
    if (typeof GitHubIntegration !== 'undefined') {
        window.githubIntegration = new GitHubIntegration();
        console.log('🔗 GitHub Integration inicializada');
        
        // Mostrar seção GitHub nas configurações
        const githubSection = document.getElementById('github-integration-section');
        if (githubSection) {
            githubSection.style.display = 'block';
        }
    }
});

// Inicializar a aplicação
initApp();
