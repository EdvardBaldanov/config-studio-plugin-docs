(function() {
  const pluginId = 'devtools-server';
  if (!window.ConfigStudio) return;

  let proc = null;
  const port = 8090;

  window.ConfigStudio.registerToolbarButton({
    id: 'devtools-server-btn',
    pluginId: pluginId,
    label: 'Dev Server',
    title: 'Toggle Local Dev Server :8090',
    icon: 'terminal',
    onClick: () => {
      window.ConfigStudio.toggleSplitPanel({
        id: 'devtools-server-panel',
        pluginId: pluginId,
        title: 'Local Server Control (:8090)',
        render: (container) => renderUI(container)
      });
    }
  });

  function renderUI(container) {
    container.innerHTML = `
      <div class="p-4 space-y-4 text-xs font-sans text-gray-200">
        <div class="p-3 rounded-2xl bg-black/30 border border-base-border flex items-center justify-between">
          <div>
            <div class="font-bold">Status: ${proc ? '<span class="text-emerald-400">Running</span>' : '<span class="text-gray-400">Stopped</span>'}</div>
            <div class="text-[11px] text-gray-400">Port: ${port}</div>
          </div>
          <button id="toggle-server-btn" class="px-3 py-1.5 rounded-xl font-semibold transition ${
            proc ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-accent text-gray-900'
          }">
            ${proc ? 'Stop Server' : 'Start Server'}
          </button>
        </div>
      </div>
    `;

    container.querySelector('#toggle-server-btn').onclick = async () => {
      if (proc) {
        await window.ConfigStudio.stopProcess(proc.id);
        proc = null;
        window.ConfigStudio.showNotification('Server stopped', 'info');
      } else {
        try {
          proc = await window.ConfigStudio.startProcess({
            pluginId: pluginId,
            command: 'python',
            args: ['-m', 'http.server', String(port)],
            port: port
          });
          window.ConfigStudio.showNotification(`Server running on port ${port}`, 'success');
        } catch (e) {
          window.ConfigStudio.showNotification(`Failed to start: ${e.message}`, 'error');
        }
      }
      renderUI(container);
    };
  }
})();
