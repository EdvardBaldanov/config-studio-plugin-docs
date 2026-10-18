# Справочник JavaScript API (`window.ConfigStudio`) 🛠️

Каждый плагин получает доступ к глобальному объекту `window.ConfigStudio`. Это мощный фасад, предоставляющий методы для управления интерфейсом, документом, редактором Monaco, выполнением команд на хосте и событиями.

---

## 📑 Содержание

1. [Управление интерфейсом (UI Panels)](#1-управление-интерфейсом-ui-panels)
2. [Работа с открытыми файлами и редактором](#2-работа-с-открытыми-файлами-и-редактором)
3. [Интеграция с Monaco Editor](#3-интеграция-с-monaco-editor)
4. [AST-структура документа и Quick Jump](#4-ast-структура-документа-и-quick-jump)
5. [Выполнение консольных команд и фоновые процессы](#5-выполнение-консольных-команд-и-фоновые-процессы)
6. [Уведомления и системные методы](#6-уведомления-и-системные-методы)
7. [События жизненного цикла](#7-события-жизненного-цикла)

---

## 1. Управление интерфейсом (UI Panels)

### `registerToolbarButton(buttonDef)`
Регистрирует кнопку в панели инструментов над редактором (рядом с поиском и настройками).

```javascript
window.ConfigStudio.registerToolbarButton({
  id: 'my-toolbar-btn',
  pluginId: 'my-plugin',
  label: 'Форматировать',
  title: 'Форматировать активный документ',
  icon: 'code', // Имя иконки Lucide
  visible: () => {
    // Отображать кнопку только для определенных типов файлов
    const file = window.ConfigStudio.getActiveFile();
    return file && (file.name.endsWith('.json') || file.name.endsWith('.js'));
  },
  onClick: async () => {
    const content = window.ConfigStudio.getActiveContent();
    try {
      const formatted = JSON.stringify(JSON.parse(content), null, 2);
      window.ConfigStudio.setActiveContent(formatted);
      window.ConfigStudio.showNotification('JSON успешно отформатирован!', 'success');
    } catch (e) {
      window.ConfigStudio.showNotification('Ошибка парсинга JSON: ' + e.message, 'error');
    }
  }
});
```

---

### `toggleSplitPanel(panelDef)`
Открывает или закрывает правую сплит-панель (Split Screen), расположенную рядом с кодом редактора. Идеально для Live Preview, интерактивных отладчиков или справочников.

```javascript
window.ConfigStudio.toggleSplitPanel({
  id: 'my-preview-panel',
  pluginId: 'my-plugin',
  title: 'Живой предпросмотр',
  open: true, // true - открыть, false - закрыть, или опустите для переключения (toggle)
  render: (container) => {
    // container - это реальный DOM-узел (HTMLDivElement)
    container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'p-4 text-xs font-mono text-gray-200';
    wrapper.textContent = 'Здесь отображается содержимое панели!';
    
    container.appendChild(wrapper);
  }
});
```

---

### `toggleBottomPanel(panelDef)`
Открывает или закрывает нижнюю панель (Bottom Panel). Идеально для логов, консолей и терминалов.

```javascript
window.ConfigStudio.toggleBottomPanel({
  id: 'my-bottom-log-panel',
  pluginId: 'my-plugin',
  title: 'Вывод сборщика',
  open: true,
  render: (container) => {
    container.innerHTML = '<div class="p-3 font-mono text-xs bg-black/50 text-emerald-400">Сборка завершена за 140ms.</div>';
  }
});
```

---

### `registerHeaderItem(itemDef)`
Встраивает элемент управления прямо в верхнюю навигационную панель (Header) приложения.

```javascript
window.ConfigStudio.registerHeaderItem({
  id: 'my-server-indicator',
  pluginId: 'my-plugin',
  order: 10,
  render: (container) => {
    container.innerHTML = `
      <span class="px-2 py-1 text-xs rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-medium">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        В сети
      </span>
    `;
  }
});
```

---

## 2. Работа с открытыми файлами и редактором

### `getActiveFile()`
Возвращает объект текущего открытого файла в активной вкладке или `null`.

```javascript
const file = window.ConfigStudio.getActiveFile();
if (file) {
  console.log(file.name);    // 'config.yaml'
  console.log(file.path);    // 'configs/config.yaml'
  console.log(file.content); // строка содержимого файла
  console.log(file.isDirty); // true, если есть несохраненные правки
}
```

### `getActiveContent()` / `setActiveContent(content)`
Чтение и быстрая замена содержимого файла в редакторе:

```javascript
const currentText = window.ConfigStudio.getActiveContent();
window.ConfigStudio.setActiveContent(currentText.toUpperCase());
```

### `createFile(path, content?)`
Создает новый файл в рабочей директории и обновляет дерево файлов.

```javascript
await window.ConfigStudio.createFile('index.html', '<!DOCTYPE html><html>...</html>');
```

### `openFile(path)`
Программно открывает файл по указанному относительному пути в новой вкладке.

```javascript
await window.ConfigStudio.openFile('data/settings.json');
```

---

## 3. Интеграция с Monaco Editor

### `getMonaco()`
Возвращает глобальный объект Monaco Editor API (`window.monaco`). Дает доступ к константам `CompletionItemKind`, парсерам языков, диапазонам `Range` и темам.

### `getEditor()`
Возвращает активный инстанс редактора `IStandaloneCodeEditor`.

### `registerCompletionProvider(language, provider)`
Регистрирует провайдер автодополнения (IntelliSense) для указанного языка.

```javascript
const monaco = window.ConfigStudio.getMonaco();
const kind = monaco ? monaco.languages.CompletionItemKind.Snippet : 27;

window.ConfigStudio.registerCompletionProvider('yaml', {
  triggerCharacters: [' ', ':'],
  provideCompletionItems: (model, position) => {
    return {
      suggestions: [
        {
          label: 'server-config',
          kind: kind,
          insertText: 'server:\n  host: 0.0.0.0\n  port: ${1:8080}\n  ssl: ${2:false}',
          insertTextRules: 4, // InsertAsSnippet
          documentation: 'Шаблон конфигурации HTTP сервера'
        }
      ]
    };
  }
});
```

---

## 4. AST-структура документа и Quick Jump

### `registerOutlineProvider(provider)`
Позволяет плагину научить Config Studio строить интерактивную карту структуры (AST Map) и облако Quick Jump тегов для любого кастомного языка программирования или формата данных!

```javascript
window.ConfigStudio.registerOutlineProvider({
  language: 'sql', // Язык или расширение файла
  parse: (content, filename) => {
    const nodes = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Ищем ключевые выражения CREATE TABLE или SELECT
      const match = line.match(/CREATE\s+TABLE\s+([a-zA-Z0-9_]+)/i);
      if (match) {
        nodes.push({
          id: `table-${index}`,
          name: match[1],
          kind: 'object', // 'object', 'section', 'function', 'class', etc.
          line: index + 1
        });
      }
    });

    return nodes;
  }
});
```

---

## 5. Выполнение консольных команд и фоновые процессы

> ⚠️ Требует разрешения `"terminal.exec"` в манифесте.

### `exec(request)`
Выполняет консольную команду на хост-машине и возвращает результат после завершения:

```javascript
try {
  const result = await window.ConfigStudio.exec({
    pluginId: 'my-plugin',
    command: 'git',
    args: ['status', '--short']
  });

  console.log('Код возврата:', result.exitCode);
  console.log('STDOUT:\n', result.stdout);
} catch (err) {
  window.ConfigStudio.showNotification('Ошибка команды: ' + err.message, 'error');
}
```

### `startProcess(request)` / `stopProcess(processId)`
Запускает долгоживущий фоновый процесс (локальный сервер, сборщик или watcher):

```javascript
// Запуск
const proc = await window.ConfigStudio.startProcess({
  pluginId: 'my-plugin',
  command: 'python',
  args: ['-m', 'http.server', '8085'],
  port: 8085
});

console.log('Процесс запущен с PID:', proc.pid);

// Остановка
await window.ConfigStudio.stopProcess(proc.id);
```

---

## 6. Уведомления и системные методы

### `showNotification(message, type)`
Отображает всплывающее уведомление в интерфейсе.
- `type`: `'success'` (зеленое), `'info'` (синее), `'error'` (красное).

```javascript
window.ConfigStudio.showNotification('Операция успешно завершена!', 'success');
```

### `setRemoteEndpoint(url, token?)`
Переключает Config Studio на удаленный инстанс / сервер-агент. Если передать `null`, возвращается в локальный режим.

```javascript
window.ConfigStudio.setRemoteEndpoint('http://192.168.1.100:8080', 'secret-api-token');
```

---

## 7. События жизненного цикла

### `onFileOpen(callback)`
Срабатывает при открытии файла или переключении между вкладками.

```javascript
window.ConfigStudio.onFileOpen((file) => {
  console.log('Пользователь переключился на:', file.name);
});
```

### `onFileSave(callback)`
Срабатывает в момент сохранения файла (`Ctrl+S` или кнопка сохранения).

```javascript
window.ConfigStudio.onFileSave((file) => {
  console.log('Файл сохранен на диск:', file.path);
});
```
