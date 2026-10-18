/**
 * Config Studio Plugin Starter Template
 * Documentation: https://github.com/EdvardBaldanov/config-studio-plugin-docs
 */
(function() {
  const pluginId = 'my-awesome-plugin';

  if (!window.ConfigStudio) {
    console.warn(`[${pluginId}] ConfigStudio API not available.`);
    return;
  }

  // 1. Add Toolbar Action Button
  window.ConfigStudio.registerToolbarButton({
    id: `${pluginId}-btn`,
    pluginId: pluginId,
    label: 'Action',
    title: 'Click to trigger custom action',
    icon: 'sparkles',
    visible: () => true,
    onClick: () => {
      const file = window.ConfigStudio.getActiveFile();
      window.ConfigStudio.showNotification(
        `Action executed! Active file: ${file ? file.name : 'none'}`,
        'success'
      );
    }
  });

  // 2. Add Split-Screen Panel
  window.ConfigStudio.toggleSplitPanel({
    id: `${pluginId}-panel`,
    pluginId: pluginId,
    title: 'My Custom Panel',
    open: false,
    render: (container) => {
      container.innerHTML = `
        <div class="p-4 text-xs space-y-3 font-sans text-gray-200">
          <h4 class="font-bold text-sm text-accent">Hello from Plugin!</h4>
          <p class="text-gray-400">This is a custom split-panel rendered by your plugin.</p>
          <button id="${pluginId}-test-btn" class="px-3 py-1.5 rounded-xl bg-accent text-gray-900 font-semibold hover:opacity-90 transition">
            Test Click
          </button>
        </div>
      `;
      container.querySelector(`#${pluginId}-test-btn`).onclick = () => {
        alert('Button inside custom panel clicked!');
      };
    }
  });

  console.log(`[${pluginId}] Plugin loaded successfully.`);
})();
