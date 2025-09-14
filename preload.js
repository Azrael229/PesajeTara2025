const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("pesajeAPI", {
  guardarRegistro: (data) => ipcRenderer.invoke("guardar-registro", data),

  // Escucha el estado del puerto serial (LED)
  onSerialStatus: (callback) => {
    ipcRenderer.on("serial-status", (event, status) => {
      callback(status);
    });
  }
});

contextBridge.exposeInMainWorld("electronAPI", {
  // Escucha datos del puerto serial
  onSerialData: (callback) => {
    ipcRenderer.on("serial-data", (event, data) => {
      callback(data);
    });
  }
});
