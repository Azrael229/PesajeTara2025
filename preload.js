const { contextBridge, ipcRenderer } = require('electron');



contextBridge.exposeInMainWorld("pesajeAPI", {
  guardarRegistro: (data) => ipcRenderer.invoke("guardar-registro", data)
});


contextBridge.exposeInMainWorld("electronAPI", {
  // Escucha datos del puerto serial
  onSerialData: (callback) => {
    ipcRenderer.on("serial-data", (event, data) => {
      callback(data);
    });
  }
});