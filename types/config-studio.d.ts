/**
 * TypeScript Definitions for Config Studio Plugin SDK
 * Use in your plugin development for autocompletion and type checking:
 * /// <reference path="./types/config-studio.d.ts" />
 */

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
  language: string; // e.g. 'html', 'php', 'rust', 'go'
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

export interface ConfigStudioAPI {
  // UI Panels & Customization
  registerToolbarButton(btn: ToolbarButtonDef): void;
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
