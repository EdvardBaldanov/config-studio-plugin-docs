# Config Studio / Config Editor — Документация по разработке плагинов 🧩

[![Config Editor](https://img.shields.io/badge/Config--Studio-v1.1.0-teal)](https://github.com/EdvardBaldanov/config-studio)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Официальное руководство, спецификации манифеста, справочник JavaScript API и готовые шаблоны для создания плагинов к [Config Editor](https://github.com/EdvardBaldanov/config-studio).

---

## 📚 Содержание документации

| Раздел | Описание |
| :--- | :--- |
| 🚀 [**1. Быстрый старт: Первый плагин за 5 минут**](docs/01-getting-started.md) | Минимальная структура плагина, написание кода и способы локальной установки. |
| 📄 [**2. Спецификация манифеста `plugin.json`**](docs/02-manifest-plugin-json.md) | Полная схема полей манифеста, валидация и система разрешений (`permissions`). |
| 🛠️ [**3. Справочник JavaScript API (`window.ConfigStudio`)**](docs/03-javascript-api.md) | Все доступные методы: управление файлами, Monaco Editor, панели, уведомления. |
| 🎨 [**4. Кастомизация интерфейса и стили (UI Panels & CSS)**](docs/04-ui-customization.md) | Split-Screen, Toolbar, Header, Bottom Panels, темы оформления и переменные CSS. |
| 🧠 [**5. Monaco Editor и Парсеры AST-структуры**](docs/05-monaco-and-outline.md) | Автодополнение (IntelliSense), сниппеты и регистрация кастомных Outline-провайдеров. |
| 🛡️ [**6. Исполнение команд на хосте и безопасность**](docs/06-terminal-and-security.md) | Запуск системных утилит (`exec`), фоновые процессы, черный список и подтверждения. |
| 📦 [**7. Упаковка, публикация и подача в каталог**](docs/07-packaging-and-publishing.md) | Создание ZIP-архивов, публикация на GitHub и добавление в официальный каталог (1-клик). |

---

## ⚡ Быстрый обзор возможностей плагина

Плагины Config Studio работают непосредственно в среде браузера и получают контролируемый доступ к системному ядру:

```javascript
(function() {
  const pluginId = 'my-tool';
  if (!window.ConfigStudio) return;

  // 1. Добавление кнопки в панель инструментов
  window.ConfigStudio.registerToolbarButton({
    id: 'my-action-btn',
    pluginId: pluginId,
    label: 'Собрать',
    title: 'Запустить сборку проекта',
    icon: 'play',
    onClick: async () => {
      // 2. Исполнение команды на хосте
      const res = await window.ConfigStudio.exec({
        pluginId: pluginId,
        command: 'npm',
        args: ['run', 'build']
      });

      // 3. Всплывающее уведомление
      window.ConfigStudio.showNotification(
        res.exitCode === 0 ? 'Сборка успешна!' : 'Ошибка сборки',
        res.exitCode === 0 ? 'success' : 'error'
      );
    }
  });
})();
```

---

## 📁 Структура этого репозитория

- `docs/` — пошаговые руководства и спецификации (главы 1–7).
- `types/` — файл TypeScript-типизации [`config-studio.d.ts`](types/config-studio.d.ts) для подсказок в вашей IDE (VS Code / WebStorm).
- `template/` — чистый готовый boilerplate-шаблон для быстрого старта нового плагина.
- `examples/` — рабочие примеры плагинов:
  - [`hello-world`](examples/hello-world) — базовый пример взаимодействия с интерфейсом.
  - [`custom-outline`](examples/custom-outline) — кастомный парсер AST-структуры для `.conf` файлов с кнопками Quick Jump.
  - [`devtools-server`](examples/devtools-server) — запуск локального веб-сервера с управлением из Split-Screen панели.

---

## 📦 Способы установки плагинов в Config Studio

1. **В 1 клик из каталога**:
   В окне «Настройки» (⚙️) → «Плагины» выберите нужный официальный плагин и нажмите «Установить».
2. **По ссылке на GitHub репозиторий**:
   Вставьте ссылку вида `https://github.com/username/my-plugin` во вкладку «По ссылке (URL / GitHub)».
3. **Загрузка .ZIP архива**:
   Перетащите `.zip` архив с плагином в окно настроек.
4. **Прямое копирование (для разработки)**:
   Поместите папку плагина в `data/plugins/<id>/` рядом с исполняемым файлом Config Studio.

---

## 🌟 Официальные плагины для примера

- 🌐 [config-studio-web-devkit](https://github.com/EdvardBaldanov/config-studio-web-devkit) — живой предпросмотр HTML/PHP, веб-сервер :8085 и сниппеты Monaco.
- 🖥️ [config-studio-remote-agent](https://github.com/EdvardBaldanov/config-studio-remote-agent) — переключение серверов в шапке редактора для мультисерверного управления.

---

## 📄 Лицензия

MIT License © 2026 [Edvard Baldanov](https://github.com/EdvardBaldanov)
