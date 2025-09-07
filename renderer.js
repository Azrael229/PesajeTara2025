document.addEventListener("DOMContentLoaded", () => {
  const brutoEl = document.getElementById("bruto");
  const taraEl = document.getElementById("tara");
  const netoEl = document.getElementById("neto");
  const fechaEl = document.getElementById("fecha");

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

  // Inicializar pantalla
  actualizarNeto();
});
