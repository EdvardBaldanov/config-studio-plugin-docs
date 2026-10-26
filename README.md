# Config Studio — Документация по разработке плагинов 🧩

[![Config Studio](https://img.shields.io/badge/Config--Studio-v2.0.0--beta-teal.svg)](https://github.com/EdvardBaldanov/config-studio)
[![Plugin Format](https://img.shields.io/badge/Format-.cspkg%20%7C%20ZIP-blue.svg)](docs/07-packaging-and-publishing.md)
[![Security: Zero Trust](https://img.shields.io/badge/Security-Zero%20Trust%20%7C%20Fail--Secure-rose.svg)](docs/06-terminal-and-security.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Официальное руководство, спецификации манифеста, справочник JavaScript API, типовые шаблоны и система безопасности для создания плагинов к [Config Studio](https://github.com/EdvardBaldanov/config-studio).

---

## 📚 Содержание документации

| Раздел | Описание |
| :--- | :--- |
| 🚀 [**1. Быстрый старт: Первый плагин за 5 минут**](docs/01-getting-started.md) | Минимальная структура плагина, написание кода и способы локальной установки. |
| 📄 [**2. Спецификация манифеста `plugin.json`**](docs/02-manifest-plugin-json.md) | Схема полей, зависимости SemVer (`dependencies` и `optionalDependencies`), сервисы (`providesServices`), права и локализация. |
| 🛠️ [**3. Справочник JavaScript API (`window.ConfigStudio`)**](docs/03-javascript-api.md) | Все доступные методы: файлы, Monaco Editor, контекстное меню, межплагинные RPC-сервисы (`get` / `getOptional`), хранилище секретов и `i18n`. |
| 🎨 [**4. Кастомизация интерфейса и точки расширения**](docs/04-ui-customization.md) | 1-Click Action Toolbar (Split Button), контекстное меню, постоянная нижняя панель (Bottom Dock), Split-Screen и темы CSS. |
| 🧠 [**5. Monaco Editor и Парсеры AST-структуры**](docs/05-monaco-and-outline.md) | Автодополнение (IntelliSense), сниппеты и регистрация кастомных Outline-провайдеров. |
| 🛡️ [**6. Исполнение команд на хосте и безопасность**](docs/06-terminal-and-security.md) | Модель Zero Trust (Fail-Secure), экран согласия (Consent Dialog), черный список команд и журнал аудита (Core Audit Log). |
| 📦 [**7. Упаковка, публикация и бинарный формат `.cspkg`**](docs/07-packaging-and-publishing.md) | Бинарный контейнер `.cspkg` (в стиле MRS из Mihomo), ZIP-архивы, переносимые профили и официальный каталог. |

---

## ⚡ Быстрый обзор возможностей архитектуры плагинов

Плагины работают в контролируемой песочнице браузера и взаимодействуют с защищенным системным ядром Config Studio:

```javascript
(function() {
  const pluginId = 'quick-deploy';
  if (!window.ConfigStudio) return;

  // 1. Интернационализация через встроенный движок i18n
  const { t } = window.ConfigStudio.i18n.scoped(pluginId);

  // 2. Добавление действия в контекстное меню проводника файлов
  window.ConfigStudio.registerContextMenu({
    id: 'deploy-action',
    label: t('deploy_label', 'Развернуть на серверах (Deploy)'),
    icon: 'server',
    group: 'tools',
    fileMatches: ['docker-compose*.yml', 'nginx.conf'],
    targetType: 'file',
    onClick: async (targetPath) => {
      // 3. Безопасное получение SSH-ключа из OS Keychain / Vault
      const sshKey = await window.ConfigStudio.secrets.get('fleet_ssh_key', 'shared');

      // 4. Вызов межплагинного RPC-сервиса (SSH Client)
      const ssh = window.ConfigStudio.services.get('ssh', pluginId);
      await ssh.exec('192.168.1.10', `docker compose -f ${targetPath} up -d`);

      // 5. Всплывающее уведомление
      window.ConfigStudio.showNotification(t('success', 'Конфигурация успешно применена!'), 'success');
    }
  });
})();
```

---

## 📁 Структура этого репозитория

- `docs/` — подробные руководства и спецификации (главы 1–7).
- `types/` — файл TypeScript-типизации [`config-studio.d.ts`](types/config-studio.d.ts) для автокомплита в вашей IDE (VS Code / WebStorm / Cursor).
- `template/` — готовый boilerplate-шаблон для быстрого старта нового плагина.
- `examples/` — рабочие примеры плагинов:
  - [`hello-world`](examples/hello-world) — базовый пример взаимодействия с интерфейсом и тулбаром.
  - [`custom-outline`](examples/custom-outline) — кастомный парсер AST-структуры для `.conf` файлов с кнопками Quick Jump.
  - [`devtools-server`](examples/devtools-server) — запуск локального веб-сервера с управлением из Split-Screen панели.

---

## 🛡️ Безопасность и Zero Trust

Config Studio реализует строгую модель безопасности:
- **Fail-Secure (Fail-Closed):** Любые неизвестные или кастомные разрешения классифицируются как **`Critical Risk`**.
- **Human-in-the-Loop:** Пользователь видит детальный экран согласия (`PluginConsentModal`) перед установкой любого плагина.
- **Изоляция секретов:** Пароли и SSH-ключи хранятся в OS Keychain / Credential Manager и никогда не попадают в экспортируемые профили.
- **Журнал аудита:** Все критические действия журналируются в `audit.jsonl` с фиксацией SHA-256 хешей файлов.

---

## 📦 Способы распространения и установки

1. **В 1 клик из каталога:** Через окно настроек из официального каталога [config-studio-plugins](https://github.com/EdvardBaldanov/config-studio-plugins).
2. **Бинарный пакет `.cspkg` (v1.9.5+):** Сверхбыстрый монолитный контейнер (по принципу MRS из Clash.Meta), читаемый ядром прямо в память без распаковки на диск. Собирается автономным CLI-компилятором `cspkg` ([скачать бинарники](https://github.com/EdvardBaldanov/config-studio-plugin-docs/releases/tag/v1.0.0)).
3. **Автоматизация через GitHub Actions:** Готовый workflow `.github/workflows/release.yml` для автоматической компиляции и прикрепления `.cspkg` к релизам тегов `v*`.
4. **По ссылке на GitHub:** Автоматическая безопасная инспекция и установка из репозитория.
5. **ZIP-архив:** Установка перетаскиванием (drag-and-drop) в интерфейс.
6. **Dev Mode:** Локальная папка в `data/plugins/<id>/` для мгновенной правки кода без перезагрузки.

---

## 📄 Лицензия

MIT License © 2026 [Edvard Baldanov](https://github.com/EdvardBaldanov)
