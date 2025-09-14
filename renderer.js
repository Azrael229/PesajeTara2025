document.addEventListener("DOMContentLoaded", () => {

  const brutoEl = document.getElementById("bruto");
  const taraEl = document.getElementById("tara");
  const netoEl = document.getElementById("neto");
  const fechaEl = document.getElementById("fecha");
  const horaEl = document.getElementById("hora");
  const printButton = document.getElementById("print");
  const ledCOM = document.getElementById("led-com");

  iniciarReloj(horaEl);

  function iniciarReloj(horaEl) {
    function actualizarHora() {
      const ahora = new Date();
      horaEl.textContent = ahora.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
    }
    actualizarHora();
    setInterval(actualizarHora, 1000);
  }

  const hoy = new Date();
  fechaEl.textContent = hoy.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });


  // Variables internas
  let bruto = brutoEl.textContent || "0";
  let tara = "0";
  let decimalCount = 2; // por defecto 2 decimales, se actualizará según báscula

  // ---- Actualizar Neto ----
  function actualizarNeto() {
    const neto = parseFloat(bruto) - parseFloat(tara);
    brutoEl.textContent = parseFloat(bruto).toFixed(decimalCount);
    taraEl.textContent = parseFloat(tara).toFixed(decimalCount);
    netoEl.textContent = neto.toFixed(decimalCount);
  }

  // ---- Función para agregar caracteres (tara) ----
  function agregarCaracter(c) {
    if (!c) return;

    if (c === "Backspace") {
      tara = tara.slice(0, -1) || "0";
      actualizarNeto();
      return;
    }

    if (c === "." && tara.includes(".")) return;

    // Limitar decimales según decimalCount
    if (tara.includes(".")) {
      const decimales = tara.split(".")[1];
      if (decimales.length >= decimalCount) return;
    }

    const valorSinPunto = tara.replace(".", "");
    if (valorSinPunto.length >= 8) return;

    tara = (tara === "0" && c !== ".") ? c : tara + c;
    actualizarNeto();
  }

  // Entrada por teclado físico
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

  // Entrada por teclado virtual
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

  // Guardar registro
  printButton.addEventListener("click", () => {
    const data = {
      bruto,
      tara,
      neto: (parseFloat(bruto) - parseFloat(tara)).toFixed(decimalCount),
      producto: document.getElementById("producto").innerText,
      hora: horaEl.textContent,
      fecha: fechaEl.textContent
    };

    window.pesajeAPI.guardarRegistro(data).then(respuesta => {
      mostrarToast(respuesta, respuesta.startsWith("❌") ? "error" : "success");
    });
  });

  function mostrarToast(mensaje, tipo) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.classList.add("toast", tipo === "error" ? "toast-error" : "toast-success");
    toast.innerText = mensaje;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => container.removeChild(toast), 300);
    }, 3000);
  }

  // ---- Listener puerto serial ----
  let inactivityTimer = null;

  window.electronAPI.onSerialData((data) => {
    bruto = data.value; // actualizar variable interna
    // actualizar número de decimales según el dato recibido
    const partes = bruto.split(".");
    decimalCount = partes[1] ? partes[1].length : 0;

    actualizarNeto(); // recalcular neto
  });

  // LED COM
  window.pesajeAPI.onSerialStatus((status) => {
    if (status === "activo") {
      ledCOM.classList.add("on");
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        ledCOM.classList.remove("on"); // apagar LED si no hay datos
      }, 1000);
    }
  });

  // Inicializar pantalla
  actualizarNeto();
});
