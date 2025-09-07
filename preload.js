const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  insertUsuario: (data) => ipcRenderer.send('insert-usuario', data),
  onUsuarioAgregado: (callback) => ipcRenderer.on('usuario-agregado', (event, data) => callback(data))
});
