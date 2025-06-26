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
const modelCountEl = document.getElementById('model-count');
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

// Funções
function populateFilterModelDropdown() {
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
        modelCountEl.textContent = 'Total: 0 modelos';
        return;
    }
    
    filteredModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = `${model.fabricante} - ${model.modelo}`;
        modelSelect.appendChild(option);
    });
    
    modelCountEl.textContent = `Total: ${filteredModels.length} modelos`;
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
    totalCountEl.textContent = records.length;
    totalRecordsEl.textContent = records.length;
    modelCountStat.textContent = modemModels.length;
    
    // Contar gravações de hoje
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(record => record.date === today);
    const todayQuantity = todayRecords.reduce((sum, record) => sum + record.quantity, 0);
    todayCountEl.textContent = todayQuantity;
    
    // Atualizar barra de progresso
    const progress = Math.min((todayQuantity / dailyGoal) * 100, 100);
    progressPercent.textContent = `${Math.round(progress)}%`;
    dailyProgress.style.width = `${progress}%`;

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
    filterDate.value = '';
    filterModel.value = '';
    filterManufacturer.value = '';
    filterQuantity.value = '';
    globalSearch.value = '';
    applyFilters();
    modelToEditId = null;
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
    // Calcular distribuição por fabricante
    const distribution = {};
    records.forEach(record => {
        const manufacturer = record.model.fabricante;
        if (!distribution[manufacturer]) {
            distribution[manufacturer] = 0;
        }
        distribution[manufacturer] += record.quantity;
    });
    
    // Preparar dados para o gráfico
    const labels = Object.keys(distribution);
    const series = Object.values(distribution);
    
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
    if (window.manufacturerChart) {
        window.manufacturerChart.destroy();
    }
    
    window.manufacturerChart = new ApexCharts(manufacturerChartEl, options);
    window.manufacturerChart.render();
}

function updatePerformanceChart() {
    const range = parseInt(chartRange.value);
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
    if (window.performanceChart) {
        window.performanceChart.destroy();
    }
    
    window.performanceChart = new ApexCharts(performanceChartEl, options);
    window.performanceChart.render();
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
    taskDue.value = tomorrow.toISOString().split('T')[0];
    
    taskModal.style.display = 'flex';
}

function saveTask() {
    if (!taskTitle.value.trim()) {
        showNotification('Por favor, informe um título para a tarefa!', true);
        return;
    }
    
    // Aqui você salvaria a tarefa no sistema
    showNotification('Tarefa salva com sucesso!');
    taskModal.style.display = 'none';
    
    // Resetar formulário
    taskTitle.value = '';
    taskDescription.value = '';
    
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
    if (e.target === confirmationModal) {
        confirmationModal.style.display = 'none';
        recordToDelete = null;
    }
    if (e.target === taskModal) {
        taskModal.style.display = 'none';
    }
    if (e.target === editModelModal) {
        editModelModal.style.display = 'none';
        modelToEditId = null;
    }
    // Fechar dropdown do usuário
    if (userMenu && userDropdown && !userMenu.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('show');
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
if (closeTaskBtn) closeTaskBtn.addEventListener('click', () => taskModal.style.display = 'none');
if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', () => taskModal.style.display = 'none');
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
    if (userDropdown) userDropdown.classList.toggle('show');
});

if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showNotification('Você saiu do sistema (simulação).');
    if (userDropdown) userDropdown.classList.remove('show');
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

// Inicializar a aplicação
initApp(); 