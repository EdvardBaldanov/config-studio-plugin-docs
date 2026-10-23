# Справочник JavaScript API (`window.ConfigStudio`) 🛠️

Каждый плагин получает доступ к глобальному объекту `window.ConfigStudio`. Это мощный фасад, предоставляющий методы для управления интерфейсом, Monaco Editor, файлами, терминалом, межплагинными сервисами, хранилищем секретов и локализацией.

---

## 📑 Содержание

1. [Точки расширения UI (Панели, Тулбар, Меню)](#1-точки-расширения-ui)
2. [Контекстное меню проводника файлов](#2-контекстное-меню-проводника-файлов)
3. [Шина межплагинных сервисов (RPC / Proxy Bridge)](#3-шина-межплагинных-сервисов-rpc--proxy-bridge)
4. [Безопасное хранилище секретов (OS Keychain / Vault)](#4-безопасное-хранилище-секретов-os-keychain--vault)
5. [Встроенная мультиязычность и переводы (`i18n`)](#5-встроенная-мультиязычность-и-переводы-i18n)
6. [Работа с открытыми файлами и редактором](#6-работа-с-открытыми-файлами-и-редактором)
7. [Интеграция с Monaco Editor и AST-картой](#7-интеграция-с-monaco-editor-и-ast-картой)
8. [Выполнение системных команд на хосте](#8-выполнение-системных-команд-на-хосте)
9. [События жизненного цикла и уведомления](#9-события-жизненного-цикла-и-уведомления)

---

## 1. Точки расширения UI

### `registerToolbarButton(buttonDef)`
Регистрирует кнопку в верхней панели инструментов над редактором:

```javascript
window.ConfigStudio.registerToolbarButton({
  id: 'my-build-btn',
  pluginId: 'my-plugin',
  label: 'Собрать',
  title: 'Запустить сборку проекта (F5)',
  icon: 'play', // Lucide icon
  visible: () => {
    const file = window.ConfigStudio.getActiveFile();
    return file && file.name.endsWith('.yaml');
  },
  onClick: async () => {
    window.ConfigStudio.showNotification('Сборка запущена...', 'info');
  }
});
```

### `toggleSplitPanel(panelDef)`
Открывает или закрывает правую сплит-панель (Split Screen) рядом с Monaco Editor (для Live Preview, графических форм, документации):

```javascript
window.ConfigStudio.toggleSplitPanel({
  id: 'my-preview',
  pluginId: 'my-plugin',
  title: 'Живой предпросмотр',
  open: true,
  render: (container) => {
    container.innerHTML = '<div class="p-4 text-xs text-teal-300">Превью активно!</div>';
  }
});
```

### `toggleBottomPanel(panelDef)`
Открывает или закрывает нижнюю панель (Bottom Dock) под Monaco Editor (для логов, терминалов, результатов сборки):

```javascript
window.ConfigStudio.toggleBottomPanel({
  id: 'build-logs',
  pluginId: 'my-plugin',
  title: 'Логи сборки',
  open: true,
  render: (container) => {
    container.innerHTML = '<div class="p-3 bg-black/60 font-mono text-xs text-emerald-400">Готово!</div>';
  }
});
```

### `registerHeaderItem(itemDef)`
Встраивает компактный бейдж, кнопку или селектор прямо в верхнюю панель навигации (Header):

```javascript
window.ConfigStudio.registerHeaderItem({
  id: 'env-indicator',
  pluginId: 'my-plugin',
  order: 10,
  render: (container) => {
    container.innerHTML = `
      <span class="px-2 py-0.5 text-xs rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
        STAGING
      </span>
    `;
  }
});
```

---

## 2. Контекстное меню проводника файлов

### `registerContextMenu(itemDef)`
> ⚠️ Требует разрешения `"contextmenu"` в манифесте.

Позволяет плагину добавлять собственные пункты в меню по правому клику мыши на файлы, папки или пустую область дерева файлов:

```javascript
window.ConfigStudio.registerContextMenu({
  id: 'duplicate-config',
  label: 'Создать резервную копию (.bak)',
  icon: 'copy', // Lucide icon name
  group: 'tools', // 'open' | 'clipboard' | 'tools' | 'edit' | 'danger'
  order: 10,
  shortcut: 'Ctrl+Shift+B',
  fileMatches: ['.yaml', '.yml', '.conf', '.env'],
  targetType: 'file', // 'file' | 'folder' | 'empty' | 'any'
  onClick: async (targetPath, isDir) => {
    if (!targetPath) return;
    try {
      const content = window.ConfigStudio.getActiveContent();
      await window.ConfigStudio.createFile(`${targetPath}.bak`, content);
      window.ConfigStudio.showNotification(`Резервная копия создана: ${targetPath}.bak`, 'success');
      await window.ConfigStudio.refreshFiles();
    } catch (e) {
      window.ConfigStudio.showNotification(`Ошибка создания копии: ${e.message}`, 'error');
    }
  },
  isVisible: (targetPath) => targetPath !== undefined,
  isEnabled: (targetPath) => true
});
```

---

## 3. Шина межплагинных сервисов (RPC / Proxy Bridge)

Config Studio включает высокопроизводительную и безопасную шину для прямого взаимодействия между плагинами.

### Для провайдера: `services.register(name, implementation, providerId)`
Объявите имя сервиса в `providesServices` в `plugin.json` и зарегистрируйте его API:

```javascript
// Плагин "ssh-client"
window.ConfigStudio.services.register('ssh', {
  exec: async (host, cmd) => {
    console.log(`[SSH Service] Executing on ${host}: ${cmd}`);
    // Выполнение команды через backend SSH...
    return { exitCode: 0, stdout: 'ok' };
  },
  upload: async (host, localPath, remotePath) => {
    // Передача файла по SFTP...
    return true;
  }
}, 'ssh-client');
```

### Для потребителя: `services.get(name, consumerId)`
Объявите зависимость в `dependencies` и разрешение `service:<name>` в `plugin.json`:

```javascript
// Плагин "quick-deploy"
const ssh = window.ConfigStudio.services.get('ssh', 'quick-deploy');

const result = await ssh.exec('192.168.1.10', 'docker compose pull');
window.ConfigStudio.showNotification('Сервер обновлен!', 'success');
```

> 🔒 **Защита ядра:** Ядро автоматически блокирует доступ к сервису, если вызывающий плагин не запросил разрешение `service:<name>` в своем манифесте или не указал плагин-провайдер в зависимостях.

---

## 4. Безопасное хранилище секретов (OS Keychain / Vault)

> ⚠️ Требует разрешения `"secrets"` или `"secrets.access"` в манифесте.

Позволяет плагинам безопасно считывать токены, пароли баз данных и приватные SSH-ключи, хранящиеся в системном Keychain ОС или зашифрованном AES-256-GCM Vault:

```javascript
// 1. Получение списка общих секретов флота серверов
const sharedKeys = await window.ConfigStudio.secrets.listShared();
console.log('Доступные ключи:', sharedKeys); // ['fleet_ssh_key', 'ci_token']

// 2. Считывание значения защищенного секрета
const sshKey = await window.ConfigStudio.secrets.get('fleet_ssh_key', 'shared');
if (sshKey) {
  // Используем ключ для авторизации...
}
```

> 🛡️ **100% Zero-Secret гарантия:** Секреты никогда не попадают в экспортируемые профили настроек (`config-studio-profile.json`) и защищены авторизацией администратора.

---

## 5. Встроенная мультиязычность и переводы (`i18n`)

Плагины могут использовать встроенный движок локализации Config Studio для автоматического перевода интерфейса на язык пользователя:

```javascript
const pluginId = 'my-tool';

// Создаем скоуп-переводчик для своего плагина
const { t } = window.ConfigStudio.i18n.scoped(pluginId);

// Использование переводов с запасным вариантом (fallback)
const buttonLabel = t('run_deploy', 'Запустить деплой');
const statusText = t('deploy_success', 'Деплой на {count} серверов завершен!', { count: 5 });

// Получение текущего языка приложения ('ru', 'en', 'de' и т.д.)
const currentLang = window.ConfigStudio.i18n.getLanguage();

// Подписка на реактивную смену языка без перезагрузки
window.ConfigStudio.i18n.onLanguageChange((newLang) => {
  console.log('Язык интерфейса изменен на:', newLang);
  updateUI();
});
```

---

## 6. Работа с открытыми файлами и редактором

### `getActiveFile()`
Возвращает объект активного файла: `{ name, path, content, isDirty }` или `null`.

### `getActiveContent()` / `setActiveContent(content)`
Чтение и синхронная замена содержимого активного редактора:
```javascript
const text = window.ConfigStudio.getActiveContent();
window.ConfigStudio.setActiveContent(text.trim());
```

### `createFile(path, content?)`
Создает файл на диске в рабочей директории проекта:
```javascript
await window.ConfigStudio.createFile('docker-compose.prod.yml', 'version: "3.8"...');
```

### `openFile(path)`
Открывает файл по относительному пути в новой вкладке редактора:
```javascript
await window.ConfigStudio.openFile('configs/nginx.conf');
```

### `refreshFiles()`
Принудительно обновляет дерево проводника файлов на клиенте.

---

## 7. Интеграция с Monaco Editor и AST-картой

### `getMonaco()` / `getEditor()`
Возвращает оригинальные объекты `monaco` и инстанс Monaco Editor для тонкой настройки (курсоры, выделения, маркеры).

### `registerCompletionProvider(language, provider)`
Регистрирует подсказки IntelliSense и сниппеты для указанного языка:

```javascript
const monaco = window.ConfigStudio.getMonaco();
const kind = monaco ? monaco.languages.CompletionItemKind.Snippet : 27;

window.ConfigStudio.registerCompletionProvider('yaml', {
  triggerCharacters: [' '],
  provideCompletionItems: (model, position) => ({
    suggestions: [
      {
        label: 'docker-service',
        kind: kind,
        insertText: '${1:service_name}:\n  image: ${2:nginx:alpine}\n  ports:\n    - "${3:80}:${3:80}"',
        insertTextRules: 4,
        documentation: 'Сниппет сервиса Docker Compose'
      }
    ]
  })
});
```

### `registerOutlineProvider(provider)`
Регистрирует парсер структуры документа для построения AST-карты и Quick Jump тегов:

```javascript
window.ConfigStudio.registerOutlineProvider({
  language: 'nginx',
  parse: (content, filename) => {
    const nodes = [];
    content.split('\n').forEach((line, idx) => {
      const match = line.match(/^\s*(server|location)\s*(.*)\{/);
      if (match) {
        nodes.push({
          id: `block-${idx}`,
          name: `${match[1]} ${match[2]}`.trim(),
          kind: 'section',
          line: idx + 1
        });
      }
    });
    return nodes;
  }
});
```

---

## 8. Выполнение системных команд на хосте

> ⚠️ Требует разрешения `"shell.exec"` или `"terminal.exec"`.

### `exec(request)`
Запуск системной команды на хосте с получением кода возврата и stdout/stderr:

```javascript
try {
  const result = await window.ConfigStudio.exec({
    pluginId: 'my-plugin',
    command: 'docker',
    args: ['compose', 'up', '-d'],
    cwd: './deploy'
  });

  if (result.exitCode === 0) {
    window.ConfigStudio.showNotification('Контейнеры запущены!', 'success');
  } else {
    window.ConfigStudio.showNotification(`Ошибка: ${result.stderr}`, 'error');
  }
} catch (e) {
  console.error('Команда заблокирована или отклонена:', e.message);
}
```

### `startProcess(request)` / `stopProcess(processId)`
Управление фоновыми демонами и серверами разработки:

```javascript
const proc = await window.ConfigStudio.startProcess({
  pluginId: 'my-plugin',
  command: 'python',
  args: ['-m', 'http.server', '8085'],
  port: 8085
});

// Завершение процесса
await window.ConfigStudio.stopProcess(proc.id);
```

---

## 9. События жизненного цикла и уведомления

### `showNotification(message, type)`
Показывает всплывающее уведомление в правом верхнем углу:
- `type`: `'success'` (зеленое), `'info'` (бирюзовое/синее), `'error'` (красное).

### `onFileOpen(callback)`
Срабатывает при переключении вкладки или открытии нового файла.

### `onFileSave(callback)`
Срабатывает при успешном сохранении файла на диск (`Ctrl+S` или кнопка сохранения).
