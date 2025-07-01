# ♿ Melhorias de Acessibilidade

## 1. Problemas Identificados
- Falta de `role` em elementos customizados
- Ausência de `aria-expanded` em dropdowns
- Cores que podem não ter contraste suficiente
- Falta de `aria-live` para atualizações dinâmicas
- Elementos interativos sem foco visível claro

## 2. Correções Sugeridas

### HTML Melhorado
```html
<!-- Melhorar sidebar -->
<aside class="sidebar" role="navigation" aria-label="Menu principal">
    <nav>
        <ul class="nav-menu" role="menubar">
            <li class="nav-item" role="none">
                <a href="#" class="nav-link" role="menuitem" aria-current="page">
                    <i class="fas fa-tachometer-alt" aria-hidden="true"></i>
                    <span>Dashboard</span>
                </a>
            </li>
        </ul>
    </nav>
</aside>

<!-- Melhorar dropdown -->
<div class="user-menu-container">
    <button class="user-menu" 
            aria-expanded="false" 
            aria-haspopup="true"
            aria-controls="user-dropdown"
            id="user-menu-button">
        <div class="user-avatar">AD</div>
        <div>Administrador</div>
        <i class="fas fa-chevron-down" aria-hidden="true"></i>
    </button>
    <div class="user-dropdown" 
         role="menu" 
         aria-labelledby="user-menu-button"
         id="user-dropdown">
        <a href="#" class="dropdown-item" role="menuitem">
            <i class="fas fa-user-circle" aria-hidden="true"></i> Perfil
        </a>
    </div>
</div>

<!-- Melhorar notificações -->
<div id="notification" 
     class="notification" 
     role="alert" 
     aria-live="polite" 
     aria-atomic="true">
</div>

<!-- Melhorar modais -->
<div class="modal" 
     role="dialog" 
     aria-labelledby="modal-title" 
     aria-describedby="modal-description"
     aria-modal="true">
    <div class="modal-content">
        <h2 id="modal-title">Confirmar Exclusão</h2>
        <p id="modal-description">Tem certeza que deseja excluir este registro?</p>
    </div>
</div>
```

### CSS para Acessibilidade
```css
/* Melhorar foco visível */
*:focus-visible {
    outline: 3px solid #4A90E2;
    outline-offset: 2px;
    border-radius: 4px;
}

/* Skip links para navegação por teclado */
.skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 10000;
    border-radius: 4px;
}

.skip-link:focus {
    top: 6px;
}

/* Texto alternativo para ícones */
.icon-text {
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

/* Melhorar contraste */
:root {
    --focus-color: #4A90E2;
    --error-color: #D32F2F;
    --success-color: #388E3C;
    --warning-color: #F57C00;
}

/* Estados hover/focus mais claros */
.nav-link:hover,
.nav-link:focus {
    background: rgba(52, 152, 219, 0.2);
    color: #fff;
    transform: translateX(5px);
}

/* Indicadores de estado */
[aria-expanded="true"] .fa-chevron-down {
    transform: rotate(180deg);
}

[aria-current="page"] {
    border-left: 4px solid var(--focus-color);
}
```

### JavaScript para Acessibilidade  
```javascript
// Gerenciar foco em modais
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    modal.style.display = 'flex';
    
    // Focar primeiro elemento
    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }
    
    // Trap focus
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            trapFocus(e, focusableElements);
        }
        if (e.key === 'Escape') {
            closeModal(modalId);
        }
    });
}

function trapFocus(e, focusableElements) {
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
        if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        }
    } else {
        if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }
}

// Anunciar mudanças dinâmicas
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Melhorar navegação por teclado
document.addEventListener('keydown', (e) => {
    // Esc fecha modais
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="flex"]');
        if (openModal) {
            closeModal(openModal.id);
        }
    }
    
    // Alt + M abre menu
    if (e.altKey && e.key === 'm') {
        e.preventDefault();
        toggleMobileMenu();
    }
});
``` 