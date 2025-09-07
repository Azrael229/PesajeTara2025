document.addEventListener("DOMContentLoaded", () => {

  const brutoEl = document.getElementById("bruto");
  const taraEl = document.getElementById("tara");
  const netoEl = document.getElementById("neto");
  const fechaEl = document.getElementById("fecha");
  const horaEl = document.getElementById("hora");
  const printButton = document.getElementById("print");




  iniciarReloj(horaEl);
  function iniciarReloj(horaEl) {
    function actualizarHora() {
      const ahora = new Date();
      const horaLocal = ahora.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false  // usar formato 24h
      });
      horaEl.textContent = horaLocal;
    }

    actualizarHora();              // mostrar de inmediato
    setInterval(actualizarHora, 1000); // actualizar cada segundo
  }

  // Mostrar fecha actual
  const hoy = new Date();
  fechaEl.textContent = hoy.toISOString().split("T")[0];

  // Variables internas como string para manejar punto decimal
  let bruto = brutoEl.textContent || "0";
  let tara = "0";

  // ---- Función para limitar a 8 dígitos ----
  function limitarDigitos(str) {
    if (!str) return "0";

    // separar parte entera y decimal
    let [entero, decimal] = str.split(".");

    if (entero.length > 8) entero = entero.slice(0, 8);

    if (decimal !== undefined) {
      return entero + "." + decimal;
    } else {
      return entero;
    }
  }

  // ---- Actualizar Neto ----
  function actualizarNeto() {
    let neto = parseFloat(bruto) - parseFloat(tara);
    brutoEl.textContent = limitarDigitos(bruto);
    taraEl.textContent = limitarDigitos(tara);
    netoEl.textContent = limitarDigitos(neto.toString());
  }

  // ---- Función para agregar caracteres ----
  function agregarCaracter(c) {
    if (!c) return;

    // Retroceso
    if (c === "Backspace") {
      tara = tara.slice(0, -1) || "0";
      actualizarNeto();
      return;
    }

    // Solo permitir un punto decimal
    if (c === "." && tara.includes(".")) return;

    // Limitar 8 dígitos (sin contar punto)
    const valorSinPunto = tara.replace(".", "");
    if (valorSinPunto.length >= 8) return;

    // Concatenar
    tara = (tara === "0" && c !== ".") ? c : tara + c;
    actualizarNeto();
  }

  // ---- Entrada por teclado físico ----
  document.addEventListener("keydown", (e) => {
    if ((e.key >= "0" && e.key <= "9") || e.key === "." || e.key === "Decimal") {
      e.preventDefault();
      agregarCaracter(e.key === "Decimal" ? "." : e.key);
    } else if (e.key.toUpperCase() === "C") {
      tara = "0";
      actualizarNeto();
    } else if (e.key === "Backspace") {
      e.preventDefault();
      agregarCaracter("Backspace");
    }
  });

  // ---- Entrada por teclado virtual ----
  document.querySelectorAll(".teclado button").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      if (!key) return;

      if (key === "C") {
        tara = "0";
      } else {
        agregarCaracter(key);
      }
      actualizarNeto();
    });
  });

  // Funcion para escuchar el evento de clic en el botón de impresión y crear el objeto de valores a imprimir
  printButton.addEventListener("click", () => {
    // Obtener los valores de los campos de la interfaz
    const bruto = document.getElementById("bruto").innerText;
    const tara = document.getElementById("tara").innerText;
    const neto = document.getElementById("neto").innerText;
    const producto = document.getElementById("producto").innerText;
    const hora = document.getElementById("hora").innerText;
    const fecha = document.getElementById("fecha").innerText;

    // Crear el objeto con los valores
    const data = {
      bruto,
      tara,
      neto,
      producto,
      hora,
      fecha
    };

    // Imprimir en consola para revisar
    // console.log("Registro a guardar:", registro);

    // Guardar registro en la API
    window.pesajeAPI.guardarRegistro(data).then(respuesta => {
    // console.log("Respuesta del main:", respuesta);
    alert(respuesta);
    });
  });

  // Inicializar pantalla
  actualizarNeto();
});
