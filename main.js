import { app, BrowserWindow, ipcMain } from 'electron';  
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";


// Para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('BD.db');

let mainWindow;

// Escuchar evento para crear ventana
function createWindow() {
  mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: false,
          contextIsolation: true,      
        }
  });
  mainWindow.loadFile('index.html');
}

// Cuando el renderer invoque guardarRegistro, se maneja aquí
ipcMain.handle("guardar-registro", (event, data) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO pesajes 
      (peso_bruto, peso_tara, peso_neto, producto, peso_hora, peso_fecha) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.bruto,
      data.tara,
      data.neto,
      data.producto,
      data.hora,
      data.fecha
    );

    // Mensaje con icono de check ✅ para éxito
    return "✅ Registro guardado correctamente en Base de datos"; 
  } catch (error) {
    // Mensaje con icono de cruz ❌ para error
    return "❌ Error: no se pudo guardar el registro en la Base de datos";
  }
});



const port = new SerialPort({
  path: "COM3",   // ⚠️ cámbialo por tu puerto real
  baudRate: 9600, // ⚠️ ajusta según tu báscula
});

  // Parser con delimitador CRLF
  const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

  parser.on("data", (line) => {
    const raw = line.toString().trim();

    // Extraer el número exacto respetando decimales y signo
    let formatted = raw.match(/[-+]?[0-9]+(?:\.[0-9]+)?/g)?.join("") || "0.00";

    // Eliminar ceros sobrantes a la izquierda (manteniendo cero antes del punto)
    formatted = formatted.replace(/^(-?)0+(?=\d)/, "$1");

    // Imprimir en consola (para pruebas)
    // console.log(formatted);

    // Enviar al renderer para actualizar UI / guardar en BD
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("serial-data", { raw, value: formatted });

      // avisar que llegaron datos (para LED)
      mainWindow.webContents.send("serial-status", "activo");
    }
    

  });

  port.on("error", (err) => {
    console.error("Error en el puerto serial:", err);
  });


  

app.whenReady().then(createWindow);




app.on("before-quit", () => {
  if (port?.isOpen) port.close();
});