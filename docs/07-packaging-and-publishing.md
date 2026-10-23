# Упаковка, Публикация и Бинарный формат .cspkg 📦

Когда ваш плагин готов, вы можете распространять его среди пользователей через официальный каталог, прямые ссылки на GitHub, ZIP-архивы или современный бинарный пакет `.cspkg`.

---

## 1. Структура репозитория на GitHub

Создайте отдельный публичный репозиторий на GitHub (например, `https://github.com/username/config-studio-my-plugin`).

```
config-studio-my-plugin/
├── .gitignore
├── README.md               # Описание, скриншоты, инструкции
├── plugin.json             # Обязательный манифест
├── main.js                 # Точка входа JavaScript
├── style.css               # Стили (если используются)
└── locales/                # Словари перевода (опционально)
    ├── ru.json
    └── en.json
```

---

## 2. Способы установки плагинов в Config Studio

1. **В 1 клик из каталога:**
   В окне «Настройки» → «Плагины» выберите нужный плагин из официального или подключенного стороннего каталога.
2. **По ссылке на GitHub:**
   Вставьте ссылку вида `https://github.com/username/config-studio-my-plugin` во вкладку «По ссылке».
3. **Установка из ZIP-архива:**
   Перетащите `.zip` архив в окно настроек. Ядро безопасно проинспектирует архив в изолированной папке, покажет экран согласия и установит плагин.
4. **Папка разработчика (Dev Mode):**
   Поместите распакованную папку в `data/plugins/<id>/` для мгновенной правки кода без перезагрузки.

---

## 3. Переносимость рабочего места: Экспорт и Импорт профиля

Config Studio поддерживает перенос окружения между рабочими компьютерами и серверами:
- Во вкладке настроек **«Профиль и Источники»** можно в 1 клик скачать файл `config-studio-profile.json`.
- Профиль содержит: список установленных плагинов, тему оформления, подключенные каталоги и правила Deep Guard.
- **100% Zero-Secret Гарантия:** Пароли и SSH-ключи никогда не попадают в файл профиля.
- При импорте профиля на новом компьютере Config Studio показывает окно предпросмотра и автоматически скачивает все недостающие плагины из каталогов.

---

## 4. 📦 Бинарный формат пакета `.cspkg` и утилита `cspkg`

Начиная с версии 1.9.5, Config Studio использует архитектуру распространения плагинов в виде **единых компактных бинарных библиотек `.cspkg`** (Config Studio Package), вдохновленную форматом **MRS (Meta Rule Set)** из проекта *Clash.Meta / Mihomo*:

### Преимущества бинарного контейнера `.cspkg`:
1. **Zero-Disk / In-Memory Execution:** Ядро считывает и отдает файлы плагина (`main.js`, `style.css`, локали) на лету прямо из `.cspkg` в память. Никакой распаковки на диск, никакого мусора из сотен временных файлов в `data/plugins/`.
2. **Мгновенный старт:** Загрузка и валидация манифеста плагина занимают меньше 0.5 миллисекунды.
3. **Целостность и безопасность:** Заголовок защищен Magic Bytes `CSPK\x01`, 32-байтным SHA-256 хешем содержимого и проверкой манифеста `plugin.json`.
4. **Экстремальная компактность:** Встроенное сжатие Deflate уменьшает размер пакета до 5–25 КБ.
5. **Zero External Dependencies:** Утилита написана исключительно на стандартной библиотеке Go без CGO.

---

### Скачивание автономного компилятора `cspkg`

Готовые исполняемые файлы компилятора доступны в [Релизах репозитория документации](https://github.com/EdvardBaldanov/config-studio-plugin-docs/releases/tag/v1.0.0):

| Платформа | Ссылка на скачивание |
| :--- | :--- |
| **Windows x64** | [`cspkg-windows-amd64.exe`](https://github.com/EdvardBaldanov/config-studio-plugin-docs/releases/download/v1.0.0/cspkg-windows-amd64.exe) |
| **Linux x64** | [`cspkg-linux-amd64`](https://github.com/EdvardBaldanov/config-studio-plugin-docs/releases/download/v1.0.0/cspkg-linux-amd64) |
| **macOS Apple Silicon (M1/M2/M3)** | [`cspkg-darwin-arm64`](https://github.com/EdvardBaldanov/config-studio-plugin-docs/releases/download/v1.0.0/cspkg-darwin-arm64) |
| **macOS Intel x64** | [`cspkg-darwin-amd64`](https://github.com/EdvardBaldanov/config-studio-plugin-docs/releases/download/v1.0.0/cspkg-darwin-amd64) |

#### Быстрая установка на Linux / macOS:
```bash
sudo curl -sSL -f https://github.com/EdvardBaldanov/config-studio-plugin-docs/releases/download/v1.0.0/cspkg-linux-amd64 -o /usr/local/bin/cspkg
sudo chmod +x /usr/local/bin/cspkg
cspkg version
```

---

### Команды CLI-утилиты `cspkg`

```bash
# 1. Упаковка папки плагина в бинарник .cspkg
cspkg pack ./my-plugin
# или с явным указанием имени выходного файла:
cspkg pack ./my-plugin -o my-plugin-1.0.0.cspkg

# 2. Инспекция манифеста, SHA-256 и списка файлов внутри .cspkg
cspkg inspect my-plugin-1.0.0.cspkg

# 3. Валидация целостности пакета (проверка SHA-256 и структуры)
cspkg validate my-plugin-1.0.0.cspkg

# 4. Распаковка содержимого .cspkg обратно в папку
cspkg unpack my-plugin-1.0.0.cspkg -o ./extracted_folder
```

---

## 5. 🤖 Автоматизация релизов через GitHub Actions

Чтобы при каждом обновлении версии плагина бинарный пакет `.cspkg` собирался и прикреплялся к GitHub Release автоматически, создайте в вашем репозитории файл `.github/workflows/release.yml`:

```yaml
name: Build and Release Plugin Package

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install cspkg packager
        run: |
          sudo curl -sSL -f https://github.com/EdvardBaldanov/config-studio-plugin-docs/releases/download/v1.0.0/cspkg-linux-amd64 -o /usr/local/bin/cspkg
          sudo chmod +x /usr/local/bin/cspkg
          cspkg version

      - name: Compile .cspkg binary package
        run: |
          PLUGIN_ID=$(jq -r '.id' plugin.json)
          PLUGIN_VERSION=$(jq -r '.version' plugin.json)
          echo "Building package for ${PLUGIN_ID} v${PLUGIN_VERSION}..."
          cspkg pack . "${PLUGIN_ID}.cspkg"
          cspkg inspect "${PLUGIN_ID}.cspkg"

      - name: Create ZIP fallback
        run: |
          PLUGIN_ID=$(jq -r '.id' plugin.json)
          zip -r "${PLUGIN_ID}.zip" . -x "*.git*" "*.github*" "*.cspkg" "*.zip"

      - name: Publish GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            *.cspkg
            *.zip
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Как выпустить новую версию плагина:
1. Обновите поле `"version"` в `plugin.json` (например, `"1.1.0"`).
2. Закоммитьте изменения и поставьте Git-тег:
   ```bash
   git add plugin.json
   git commit -m "chore: bump version to v1.1.0"
   git tag v1.1.0
   git push origin main --tags
   ```
3. GitHub Actions за 10–15 секунд скачает `cspkg`, скомпилирует `.cspkg` и опубликует официальный релиз с готовым пакетом для скачивания!

---

## 6. Добавление плагина в Официальный Каталог

Центральный каталог расширений Config Studio работает на базе **GitHub Pages** в репозитории [config-studio-plugins](https://github.com/EdvardBaldanov/config-studio-plugins).

Каталог хранит легковесный индекс `registry.json` и выступает указателем на последний релиз каждого расширения. Таким образом, плагины развиваются полностью независимо в собственных репозиториях.

### Как добавить свой плагин:
Создайте Pull Request в репозиторий [config-studio-plugins](https://github.com/EdvardBaldanov/config-studio-plugins), добавив ваш плагин в `registry.json`:

```json
{
  "id": "my-plugin",
  "name": "My Plugin Name",
  "version": "1.0.0",
  "description": "Short description of what the plugin does",
  "author": "Your Name / Organization",
  "icon": "🚀",
  "downloadUrl": "https://github.com/your-username/config-studio-my-plugin/releases/download/v1.0.0/my-plugin.cspkg",
  "homepage": "https://github.com/your-username/config-studio-my-plugin",
  "official": true,
  "locales": {
    "ru": {
      "name": "Мой плагин",
      "description": "Краткое описание на русском"
    },
    "en": {
      "name": "My Plugin Name",
      "description": "Short description in English"
    }
  },
  "tags": ["Tool", "Automation"]
}
```
