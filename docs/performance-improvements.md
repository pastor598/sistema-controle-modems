# 🚀 Melhorias de Performance

## 1. Lazy Loading de Scripts
```html
<!-- Mover scripts para antes do </body> -->
<script defer src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script defer src="js/script.js"></script>
```

## 2. Cache de Seletores DOM
```javascript
// Criar objeto para cache de elementos
const DOM = {
    cache: new Map(),
    get(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, document.querySelector(selector));
        }
        return this.cache.get(selector);
    },
    getAll(selector) {
        if (!this.cache.has(selector + '_all')) {
            this.cache.set(selector + '_all', document.querySelectorAll(selector));
        }
        return this.cache.get(selector + '_all');
    }
};
```

## 3. Debounce para Busca
```javascript
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Aplicar ao input de busca
const debouncedSearch = debounce(performSearch, 300);
```

## 4. Virtual Scrolling para Listas Grandes
```javascript
class VirtualList {
    constructor(container, itemHeight, renderItem) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.renderItem = renderItem;
        this.scrollTop = 0;
        this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
    }
    
    render(data) {
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const endIndex = Math.min(startIndex + this.visibleCount, data.length);
        
        // Renderizar apenas itens visíveis
        this.container.innerHTML = '';
        for (let i = startIndex; i < endIndex; i++) {
            this.container.appendChild(this.renderItem(data[i]));
        }
    }
}
``` 