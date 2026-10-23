# Кастомизация интерфейса и стили (UI Panels & Slots) 🎨

Плагины Config Studio могут бесшовно встраивать кастомные интерфейсы в приложение, поддерживая темную и светлую тему, акцентные цвета и дизайн-систему редактора.

---

## 📐 Архитектура слотов расширения UI

Config Studio предоставляет **7 официальных слотов интеграции**:

```
+-----------------------------------------------------------------------------------+
| [Header] Logo   Tabs...   (Header Items)            [Поиск] [⚙️] [Секреты] [Профиль] |
+-----------------------------------------------------------------------------------+
| [Toolbar]  [ ▶ Run: build | ▾ ] (Action Toolbar)  |  Quick Jump: [Tag 1] [Tag 2] ...  |
+-------------+-------------------------------------+-------------------------------+
| File Tree   | Monaco Code Editor                  | (Split Panel)                 |
|             |                                     |                               |
| [Right-     |                                     | Live Preview /                |
| Click       |                                     | Графические формы /           |
| Context     |                                     | Документация                  |
| Menu]       +-------------------------------------+                               |
|             | [ 🔍 Проблемы (N) ] [ 📋 Аудит ] [ 🐳 Док Плагинов... ] (Bottom Dock)|
+-------------+-------------------------------------+-------------------------------+
```

---

## 1. Панель действий: 1-Click Action Toolbar

Слот быстрого запуска задач над редактором. Реализует концепцию **Split Action Button**:
- Левая часть `[ ▶ Run: build ]` запускает действие по умолчанию в **1 клик** или по горячей клавише `F5`.
- Правая часть `[ ▾ ]` открывает выпадающее меню с переключением целей (`build`, `test`, `deploy`).

### Декларативная регистрация в `plugin.json`:
```json
"actionToolbar": {
  "primaryAction": "build",
  "targets": [
    { "id": "build", "label": "build (Default)" },
    { "id": "test", "label": "test" },
    { "id": "clean", "label": "clean" }
  ],
  "hotkey": "F5"
}
```

> 🎯 **Принцип Zero-Clutter:** Кнопки тулбара отображаются строго для файлов, указанных в `fileMatches` (например, `Makefile` или `docker-compose.yml`). Для остальных файлов тулбар автоматически скрывается, оставляя чистое пространство для работы с текстом.

---

## 2. Контекстное меню проводника файлов (Context Menu Provider)

Слот расширения контекстного меню по правому клику мыши на файлах, папках или пустой области проводника:

```javascript
window.ConfigStudio.registerContextMenu({
  id: 'git-blame',
  label: 'История изменений (Git Blame)',
  icon: 'git-commit',
  group: 'tools', // 'open' | 'clipboard' | 'tools' | 'edit' | 'danger'
  order: 20,
  fileMatches: ['.yaml', '.json', '.conf'],
  targetType: 'file', // 'file' | 'folder' | 'empty' | 'any'
  onClick: async (path) => {
    // Вызов команды или открытие панели...
  }
});
```

### Поддерживаемые группы пунктов:
- `open` — действия открытия и навигации.
- `clipboard` — операции буфера обмена (копирование пути, содержимого).
- `tools` — утилиты и действия плагинов (линтеры, деплой, превью).
- `edit` — модификация структуры файлов (переименование, форматирование).
- `danger` — удаление и опасные действия (выделяются красным цветом).

---

## 3. Постоянная нижняя полоса (Bottom Dock Strip)

Нижняя панель под Monaco Editor с поддержкой вкладок, плавного drag-ресайза высоты мышью и кнопки разворачивания во весь экран:

```javascript
window.ConfigStudio.toggleBottomPanel({
  id: 'server-logs',
  pluginId: 'my-plugin',
  title: 'Логи контейнеров',
  open: true,
  render: (container) => {
    container.innerHTML = `
      <div class="h-full bg-black/60 font-mono text-xs p-3 overflow-y-auto text-emerald-400">
        <div>[INFO] Application started on :8080</div>
      </div>
    `;
  }
});
```
- Пользователь может сворачивать и разворачивать панель в 1 клик или шорткатом `Ctrl+~` / `Ctrl+J`.
- В настройках доступен выбор поведения `dockMode`: `auto` (скрывать, когда нет активных плагинов), `always` или `hidden`.

---

## 4. Сплит-панель (Split Screen Panel)

Монтируется справа от редактора кода. Идеально для:
- Живого предпросмотра веб-страниц (HTML, PHP, Markdown, SVG).
- Интерактивных визуализаторов и графических форм.

```javascript
window.ConfigStudio.toggleSplitPanel({
  id: 'web-preview',
  pluginId: 'web-devkit',
  title: 'Предпросмотр страницы',
  open: true,
  render: (container) => {
    container.innerHTML = '<iframe src="http://localhost:8085" class="w-full h-full border-none"></iframe>';
  }
});
```

---

## 5. Элемент шапки (Header Item)

Компактные виджеты в верхней навигационной строке:
```javascript
window.ConfigStudio.registerHeaderItem({
  id: 'fleet-status',
  pluginId: 'remote-agent',
  order: 5,
  render: (container) => {
    container.innerHTML = `
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Fleet: 12 Nodes
      </div>
    `;
  }
});
```

---

## 6. Языковые пакеты интерфейса (UI Language Packs)

Плагин может переводить весь интерфейс Config Studio на новый язык:

```json
"localization": {
  "code": "es",
  "name": "Español",
  "flag": "🇪🇸",
  "translations": {
    "settings": "Configuración",
    "save": "Guardar",
    "files": "Archivos"
  }
}
```

---

## 7. Панель настроек плагина (Plugin Settings & Preferences)

Начиная с **v1.9.6**, плагины могут предоставлять настройки для пользователей во вкладке настроек редактора **«Настройки плагинов»**.

Доступно два способа настройки:

### Вариант А: Декларативная схема в `plugin.json` (Автоматическая генерация формы)
Если плагину требуется лишь набор переключателей, текстовых полей или выпадающих списков, объявите секцию `settings` в манифесте:

```json
{
  "settings": [
    {
      "id": "autoReload",
      "label": "Автоматическая перезагрузка",
      "description": "Мягкий reload сервиса при сохранении файла",
      "type": "boolean",
      "default": true
    },
    {
      "id": "port",
      "label": "Порт локального сервера",
      "type": "number",
      "default": 8085
    },
    {
      "id": "themeMode",
      "label": "Стиль отчёта",
      "type": "select",
      "default": "compact",
      "options": [
        { "label": "Компактный", "value": "compact" },
        { "label": "Детальный", "value": "detailed" }
      ]
    }
  ]
}
```
*Настройки автоматически сохраняются в `data/plugin-settings/<plugin-id>.json` и переносятся с профилем пользователя.*

### Вариант Б: Кастомный UI рендерер через JS API
Для сложного интерактивного интерфейса настроек зарегистрируйте рендерер:

```javascript
window.ConfigStudio.registerPluginSettings('my-plugin', (container) => {
  container.innerHTML = `
    <div class="space-y-4">
      <h3 class="text-sm font-semibold">Кастомные параметры</h3>
      <button id="btn-sync" class="px-3 py-1.5 rounded bg-accent text-white">Синхронизировать</button>
    </div>
  `;
});
```

Чтение и запись сохраненных настроек из JS:
```javascript
const settings = await window.ConfigStudio.getPluginSettings('my-plugin');
await window.ConfigStudio.savePluginSettings('my-plugin', { autoReload: false });
```

---

## 🎨 Переменные CSS и Tailwind CSS

Приложение полностью совместимо со стандартными классами **Tailwind CSS**. Дополнительно доступны глобальные CSS-переменные:

```css
var(--bg-base)            /* Основной фон окна */
var(--bg-base-surface)    /* Фон карточек и модальных окон */
var(--border-base)        /* Цвет разделителей и границ */
var(--accent-color)       /* Акцентный цвет кнопок (выбирается в настройках) */
var(--text-primary)       /* Основной текст */
var(--text-secondary)     /* Второстепенный текст и подсказки */
```
