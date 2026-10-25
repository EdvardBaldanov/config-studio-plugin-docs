/**
 * TypeScript Definitions for Config Studio Plugin SDK
 * Config Studio v1.9.0+
 *
 * Use in your plugin development for autocompletion and type checking:
 * /// <reference path="./types/config-studio.d.ts" />
 */

export type PermissionType =
  | 'fs.read'
  | 'fs.write'
  | 'shell.exec'
  | 'terminal.exec'
  | 'remote.exec'
  | 'network'
  | 'network.bind'
  | 'secrets'
  | 'secrets.access'
  | 'contextmenu'
  | 'toolbar'
  | 'ui.panels'
  | `ui.${string}`
  | `service:${string}`
  | '*';

export interface PluginSettingField {
  id: string;
  label: string;
  description?: string;
  type: 'boolean' | 'string' | 'number' | 'select';
  default?: any;
  options?: Array<{ label: string; value: any }>;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  icon?: string;
  entry: string;
  css?: string;
  permissions?: (PermissionType | string)[];
  fileMatches?: string[];
  dependencies?: Record<string, string>;
  providesServices?: string[];
  settings?: PluginSettingField[];
  locales?: Record<string, Record<string, string>>;
  localization?: {
    code: string;
    name: string;
    flag?: string;
    translations: Record<string, string>;
  };
  actionToolbar?: {
    primaryAction?: string;
    targets?: Array<{ id: string; label: string; command?: string }>;
    hotkey?: string;
  };
  minAppVersion?: string;
}

export interface OpenFile {
  name: string;
  path: string;
  content: string;
  ext?: string;
  isDirty?: boolean;
}

export interface ToolbarButtonDef {
  id: string;
  pluginId: string;
  label: string;
  title?: string;
  icon?: string; // Lucide icon name, e.g. 'globe', 'play', 'terminal', 'server'
  visible?: () => boolean;
  onClick: () => void | Promise<void>;
}

export interface ContextMenuItemDef {
  id: string;
  label: string;
  icon?: string; // Lucide icon name
  group?: 'open' | 'clipboard' | 'tools' | 'edit' | 'danger';
  order?: number;
  shortcut?: string;
  fileMatches?: string[]; // e.g. ['.yaml', '.json']
  targetType?: 'file' | 'folder' | 'empty' | 'any';
  onClick: (targetPath?: string, isDir?: boolean) => void | Promise<void>;
  isVisible?: (targetPath?: string, isDir?: boolean) => boolean;
  isEnabled?: (targetPath?: string, isDir?: boolean) => boolean;
}

export interface SplitPanelDef {
  id: string;
  pluginId: string;
  title: string;
  open: boolean;
  render: (container: HTMLElement) => void;
}

export interface BottomPanelDef {
  id: string;
  pluginId: string;
  title: string;
  open: boolean;
  render: (container: HTMLElement) => void;
}

export interface HeaderItemDef {
  id: string;
  pluginId: string;
  order?: number;
  render: (container: HTMLElement) => void;
}

export interface OutlineNode {
  id: string;
  name: string;
  kind: 'object' | 'list' | 'string' | 'number' | 'boolean' | 'section' | 'function' | 'class';
  line: number;
  column?: number;
  children?: OutlineNode[];
}

export interface OutlineProvider {
  language: string; // e.g. 'html', 'php', 'rust', 'go', 'nginx'
  parse: (content: string, filename: string) => OutlineNode[];
}

export interface ExecRequest {
  pluginId: string;
  command: string;
  args?: string[];
  cwd?: string;
}

export interface ExecResponse {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  requiresConfirm?: boolean;
  warning?: string;
  error?: string;
}

export interface ProcessInfo {
  id: string;
  pluginId: string;
  command: string;
  args: string[];
  pid: number;
  port?: number;
  startedAt: string;
  status: 'running' | 'stopped' | 'failed';
}

export interface StartProcessRequest {
  pluginId: string;
  command: string;
  args?: string[];
  cwd?: string;
  port?: number;
}

export interface InterPluginServicesAPI {
  /**
   * Register an inter-plugin service provider.
   * Requires plugin to declare service name in manifest `providesServices`.
   */
  register(serviceName: string, implementation: any, providerPluginId: string): void;

  /**
   * Access a service provided by another plugin.
   * Requires plugin to declare dependency in `dependencies` and permission `service:<name>`.
   */
  get<T = any>(serviceName: string, consumerPluginId?: string): T;

  /**
   * List all registered active service names.
   */
  list(): string[];
}

export interface SecretsAPI {
  /**
   * Retrieve a secret value by key from the secure OS Keychain / Vault.
   * Requires 'secrets' or 'secrets.access' permission.
   */
  get(key: string, scope?: 'shared' | 'plugin'): Promise<string | null>;

  /**
   * List names of shared fleet secrets available for plugins.
   */
  listShared(): Promise<string[]>;
}

export interface I18nAPI {
  /**
   * Translate a key using current application locale with optional parameters.
   */
  t(key: string, fallback?: string, params?: Record<string, any>): string;

  /**
   * Create a scoped translator helper for a specific plugin.
   */
  scoped(pluginId: string): {
    t: (key: string, fallback?: string, params?: Record<string, any>) => string;
  };

  /**
   * Get current active language code ('ru', 'en', etc.).
   */
  getLanguage(): string;

  /**
   * Subscribe to language change events.
   */
  onLanguageChange(callback: (lang: string) => void): () => void;
}

export interface ConfigStudioAPI {
  // UI Panels & Customization
  registerToolbarButton(btn: ToolbarButtonDef): void;
  registerContextMenu(item: ContextMenuItemDef): void;
  registerSplitPanel(panel: SplitPanelDef): void;
  toggleSplitPanel(panelDef: Partial<SplitPanelDef> & { id: string }): void;
  registerBottomPanel(panel: BottomPanelDef): void;
  toggleBottomPanel(panelDef: Partial<BottomPanelDef> & { id: string }): void;
  registerHeaderItem(item: HeaderItemDef): void;

  // Editor & Document Access
  getActiveFile(): OpenFile | null;
  getActiveContent(): string;
  setActiveContent(content: string): void;
  openFile(path: string): Promise<void>;
  createFile(path: string, content?: string): Promise<void>;
  refreshFiles(): Promise<void>;

  // Monaco Editor & Language Extensions
  getMonaco(): any;
  getEditor(): any;
  registerCompletionProvider(language: string, provider: any): any;
  registerOutlineProvider(provider: OutlineProvider): void;

  // Host Commands & Background Processes
  exec(req: ExecRequest): Promise<ExecResponse>;
  startProcess(req: StartProcessRequest): Promise<ProcessInfo>;
  stopProcess(processId: string): Promise<void>;

  // Inter-Plugin RPC & Services
  services: InterPluginServicesAPI;

  // Secure OS Keychain & Secrets
  secrets: SecretsAPI;

  // Localization & Translations
  i18n: I18nAPI;

  // Plugin Settings & Configuration
  registerPluginSettings(pluginId: string, renderer: (container: HTMLElement) => void): void;
  getPluginSettings(pluginId: string): Promise<Record<string, any>>;
  savePluginSettings(pluginId: string, settings: Record<string, any>): Promise<void>;

  // UI & Design System
  ui: {
    toast(message: string, type?: 'info' | 'success' | 'error' | 'warning', title?: string): void;
  };

  // System & Helpers
  showNotification(message: string, type?: 'info' | 'success' | 'error'): void;
  setRemoteEndpoint(url: string | null, token?: string): void;
  onFileOpen(callback: (file: OpenFile) => void): void;
  onFileSave(callback: (file: OpenFile) => void): void;
}

declare global {
  interface Window {
    ConfigStudio?: ConfigStudioAPI;
  }
}
