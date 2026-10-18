(function() {
  const pluginId = 'hello-world';
  if (!window.ConfigStudio) return;

  window.ConfigStudio.registerToolbarButton({
    id: 'hello-world-btn',
    pluginId: pluginId,
    label: 'Hello!',
    title: 'Click to greet the user',
    icon: 'smile',
    onClick: () => {
      const file = window.ConfigStudio.getActiveFile();
      window.ConfigStudio.showNotification(
        `Hello from Config Studio Plugin! File: ${file ? file.name : 'none'}`,
        'success'
      );
    }
  });

  console.log('[HelloWorld] Plugin initialized.');
})();
