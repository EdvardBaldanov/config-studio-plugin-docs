# Кастомизация интерфейса и стили (UI Panels & CSS) 🎨

Плагины Config Studio могут бесшовно встраивать кастомные интерфейсы в приложение, поддерживая темную и светлую тему, акцентные цвета и дизайн-систему редактора.

---

## 🎨 Переменные CSS и цветовая палитра

В приложении настроена динамическая система CSS-переменных, которая меняется при выборе темы или пользовательской палитры в настройках:

```css
/* Основные переменные темы Config Studio */
var(--bg-base)            /* Основной фон приложения */
var(--bg-base-surface)    /* Фон карточек, модальных окон и боковых панелей */
var(--border-base)        /* Цвет рамок и разделителей */
var(--accent-color)       /* Акцентный цвет (задается пользователем, по умолчанию #00d2b4) */
var(--accent-hover)       /* Акцентный цвет при наведении */
var(--text-primary)       /* Основной цвет текста */
var(--text-secondary)     /* Вторичный цвет текста (подписи, даты, подсказки) */
```

### Поддержка Tailwind CSS
В приложении подключен Tailwind CSS, поэтому в коде плагина при создании DOM-элементов можно использовать стандартные классы Tailwind:
```javascript
const panel = document.createElement('div');
panel.className = 'flex flex-col h-full bg-base-surface border-l border-base-border text-xs text-gray-300';
```

---

## 📐 Размещение компонентов

Config Studio предлагает **4 точки расширения UI**:

```
+-------------------------------------------------------------------------+
| [Header] Logo   Tabs...   (Header Items)      [Search] [⚙️] [User]      |
+-------------------------------------------------------------------------+
| [Toolbar]  (Toolbar Buttons)  |  Quick Jump Tags: [Tag 1] [Tag 2] ...   |
+-------------+-----------------------------------+-----------------------+
| File Tree   | Monaco Code Editor                | (Split Panel)         |
|             |                                   |                       |
|             |                                   | Live Preview /        |
|             |                                   | Custom Tool /         |
|             |                                   | Documentation         |
|             +-----------------------------------+                       |
|             | (Bottom Panel) Logs / Output      |                       |
+-------------+-----------------------------------+-----------------------+
```

---

## 1. Сплит-панель (Split Panel)

Сплит-панель монтируется справа от редактора. Это идеальное место для:
- Живого предпросмотра веб-страниц (HTML, Markdown, SVG).
- Интерактивных визуализаторов схем и диаграмм.
- Графических форм для заполнения конфигов.

```javascript
window.ConfigStudio.toggleSplitPanel({
  id: 'my-preview',
  pluginId: 'my-plugin',
  title: 'SVG Previewer',
  open: true,
  render: (container) => {
    container.innerHTML = '';
    
    // Создаем контейнер предпросмотра
    const preview = document.createElement('div');
    preview.className = 'h-full flex items-center justify-center p-4 overflow-auto';
    
    const file = window.ConfigStudio.getActiveFile();
    if (file && file.name.endsWith('.svg')) {
      preview.innerHTML = file.content;
    } else {
      preview.innerHTML = '<span class="text-gray-500">Откройте .svg файл для просмотра</span>';
    }
    
    container.appendChild(preview);
  }
});
```

---

## 2. Элемент шапки (Header Item)

В шапку можно встраивать компактные селекторы, переключатели режимов, бейджи состояния серверов или таймеры:

```javascript
window.ConfigStudio.registerHeaderItem({
  id: 'env-badge',
  pluginId: 'my-plugin',
  order: 5, // Порядок следования в шапке
  render: (container) => {
    container.innerHTML = `
      <div class="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold">
        PROD
      </div>
    `;
  }
});
```

---

## 3. Нижняя панель (Bottom Panel)

Нижняя панель располагается под окном Monaco Editor и занимает всю ширину редактора. Подходит для консолей, вывода сборки и результатов тестов.

```javascript
window.ConfigStudio.toggleBottomPanel({
  id: 'build-terminal',
  pluginId: 'my-plugin',
  title: 'Terminal Output',
  open: true,
  render: (container) => {
    container.innerHTML = `
      <div class="h-32 bg-black/60 font-mono text-xs p-3 overflow-y-auto text-emerald-400 space-y-1">
        <div>$ npm run build</div>
        <div class="text-gray-400">> build success in 320ms</div>
      </div>
    `;
  }
});
```

---

## 4. Кастомные модальные окна

Плагин может создавать собственные модальные окна, используя стандартную фиксированную подложку:

```javascript
function showCustomModal(title, message) {
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in';

  backdrop.innerHTML = `
    <div class="w-full max-w-md bg-base-surface border border-base-border rounded-3xl p-6 shadow-2xl space-y-4">
      <h3 class="text-base font-bold text-white">${title}</h3>
      <p class="text-xs text-gray-300 leading-relaxed">${message}</p>
      <div class="flex justify-end space-x-2 pt-2">
        <button id="close-modal-btn" class="px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-gray-900 hover:opacity-90 transition">
          Понятно
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  backdrop.querySelector('#close-modal-btn').onclick = () => backdrop.remove();
}
```
