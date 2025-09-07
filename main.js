import { app, BrowserWindow, ipcMain } from 'electron';  
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

// Para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('BD.db');

// Escuchar evento para crear ventana
function createWindow() {
  let win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: false,
          contextIsolation: true,      
        }
  });
  win.loadFile('index.html');
}
app.whenReady().then(createWindow);




// Escuchar evento para insertar usuario
ipcMain.on('insert-usuario', (event, data) => {
  const insert  = db.prepare(`
    INSERT INTO usuarios (nombre_user, rol_user, password_user) 
    VALUES (?, ?, ?)
  `);
  insert.run(data.nombre, data.rol, data.password);

  // Enviar confirmación al renderer
  event.sender.send('usuario-agregado', data);
});