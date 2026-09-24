/* Guía de estudio — interacción compartida.
   Todo el progreso se guarda solo en este navegador (localStorage).
   Si el navegador bloquea el almacenamiento, la guía funciona igual pero no recuerda nada. */
(function () {
  "use strict";

  var CLAVE = "ids-guia-v1";

  function leer() {
    try {
      var crudo = window.localStorage.getItem(CLAVE);
      var datos = crudo ? JSON.parse(crudo) : {};
      datos.checks = datos.checks || {};
      datos.quiz = datos.quiz || {};
      datos.semanas = datos.semanas || {};
      return datos;
    } catch (e) {
      return { checks: {}, quiz: {}, semanas: {} };
    }
  }

  function guardar(datos) {
    try { window.localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (e) { /* sin almacenamiento */ }
  }

  var estado = leer();
  var semana = document.body.getAttribute("data-semana"); // "s1", "s2"... o null en el índice

  /* ---------- Tema claro / oscuro ---------- */
  function aplicarTema(t) {
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
  }
  try { aplicarTema(window.localStorage.getItem(CLAVE + "-tema")); } catch (e) { /* nada */ }
  document.querySelectorAll(".theme-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var actual = document.documentElement.getAttribute("data-theme");
      var oscuroSistema = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      var esOscuro = actual ? actual === "dark" : oscuroSistema;
      var nuevo = esOscuro ? "light" : "dark";
      aplicarTema(nuevo);
      try { window.localStorage.setItem(CLAVE + "-tema", nuevo); } catch (e) { /* nada */ }
    });
  });

  /* ---------- Checklist de progreso ---------- */
  var checks = Array.prototype.slice.call(document.querySelectorAll("input[type=checkbox][data-track]"));

  function actualizarProgreso() {
    var total = checks.length;
    var hechos = checks.filter(function (c) { return c.checked; }).length;
    var pct = total ? Math.round((hechos / total) * 100) : 0;
    document.querySelectorAll("[data-progreso-pagina]").forEach(function (el) {
      var barra = el.querySelector(".progress-bar > span");
      var etiqueta = el.querySelector(".progress-label");
      if (barra) barra.style.width = pct + "%";
      if (etiqueta) etiqueta.textContent = hechos + " de " + total + " actividades marcadas (" + pct + " %)";
    });
    if (semana) {
      var previo = estado.semanas[semana] || {};
      previo.hechos = hechos;
      previo.total = total;
      estado.semanas[semana] = previo;
      guardar(estado);
    }
  }

  checks.forEach(function (c) {
    var id = c.getAttribute("data-track");
    c.checked = !!estado.checks[id];
    c.addEventListener("change", function () {
      if (c.checked) estado.checks[id] = true;
      else delete estado.checks[id];
      guardar(estado);
      actualizarProgreso();
    });
  });
  if (checks.length) actualizarProgreso();

  /* ---------- Quiz (reading checkpoint) ---------- */
  function barajar(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // El resumen de la semana suma todas las preguntas de todos los quizzes de la página.
  function resumenQuizSemana() {
    if (!semana) return;
    var todas = document.querySelectorAll(".quiz .qq");
    var ok = 0;
    todas.forEach(function (q) {
      var r = estado.quiz[q.getAttribute("data-q")];
      if (r && r.ok) ok++;
    });
    var previo = estado.semanas[semana] || {};
    previo.quizOk = ok;
    previo.quizTotal = todas.length;
    estado.semanas[semana] = previo;
    guardar(estado);
  }

  document.querySelectorAll(".quiz").forEach(function (quiz) {
    var preguntas = Array.prototype.slice.call(quiz.querySelectorAll(".qq"));
    var marcador = quiz.querySelector("[data-score]");

    function puntuar() {
      var ok = 0, resp = 0;
      preguntas.forEach(function (q) {
        var r = estado.quiz[q.getAttribute("data-q")];
        if (r) { resp++; if (r.ok) ok++; }
      });
      if (marcador) {
        marcador.textContent = resp === 0
          ? "Aún no respondes ninguna pregunta (" + preguntas.length + " en total)."
          : "Llevas " + ok + " de " + resp + " correctas (" + preguntas.length + " preguntas en total).";
      }
      resumenQuizSemana();
    }

    function mostrar(q, elegido) {
      q.classList.add("respondida");
      q.querySelectorAll(".quiz-opt").forEach(function (b) {
        b.disabled = true;
        if (b.hasAttribute("data-ok")) b.classList.add("correcta");
        else if (b.getAttribute("data-i") === String(elegido)) b.classList.add("incorrecta");
      });
    }

    preguntas.forEach(function (q, n) {
      var id = q.getAttribute("data-q");
      var cont = q.querySelector(".quiz-opts");
      var opciones = Array.prototype.slice.call(cont.querySelectorAll(".quiz-opt"));
      opciones.forEach(function (b, i) { b.setAttribute("data-i", i); b.type = "button"; });
      barajar(opciones).forEach(function (b) { cont.appendChild(b); });

      var primero = q.querySelector("p");
      if (primero && !primero.querySelector(".num")) {
        var s = document.createElement("span");
        s.className = "num";
        s.textContent = (n + 1) + ".";
        primero.insertBefore(s, primero.firstChild);
      }

      var guardada = estado.quiz[id];
      if (guardada) mostrar(q, guardada.i);

      opciones.forEach(function (b) {
        b.addEventListener("click", function () {
          if (q.classList.contains("respondida")) return;
          var i = Number(b.getAttribute("data-i"));
          estado.quiz[id] = { i: i, ok: b.hasAttribute("data-ok") };
          guardar(estado);
          mostrar(q, i);
          puntuar();
        });
      });
    });

    var reiniciar = quiz.querySelector("[data-reset]");
    if (reiniciar) {
      reiniciar.addEventListener("click", function () {
        preguntas.forEach(function (q) {
          delete estado.quiz[q.getAttribute("data-q")];
          q.classList.remove("respondida");
          var cont = q.querySelector(".quiz-opts");
          var opciones = Array.prototype.slice.call(cont.querySelectorAll(".quiz-opt"));
          opciones.forEach(function (b) { b.disabled = false; b.classList.remove("correcta", "incorrecta"); });
          barajar(opciones).forEach(function (b) { cont.appendChild(b); });
        });
        guardar(estado);
        puntuar();
      });
    }
    puntuar();
  });

  /* ---------- Tablas de traza ---------- */
  function normalizar(v) {
    return String(v).trim().toLowerCase()
      .replace(/^["'](.*)["']$/, "$1")
      .replace(/\s+/g, " ")
      .replace(/\s*,\s*/g, ", ");
  }
  function coincide(escrito, esperado) {
    var e = normalizar(escrito);
    if (e === "") return false;
    return esperado.split("|").some(function (alt) {
      var a = normalizar(alt);
      if (e === a) return true;
      var ne = Number(e.replace(",", ".")), na = Number(a);
      return a !== "" && !isNaN(ne) && !isNaN(na) && Math.abs(ne - na) < 1e-9;
    });
  }

  document.querySelectorAll(".traza").forEach(function (tz) {
    var entradas = Array.prototype.slice.call(tz.querySelectorAll("input[data-a]"));
    var res = tz.querySelector(".resultado");
    entradas.forEach(function (inp) {
      inp.setAttribute("autocomplete", "off");
      inp.setAttribute("spellcheck", "false");
      inp.addEventListener("input", function () { inp.classList.remove("bien", "mal"); });
    });
    var bComprobar = tz.querySelector("[data-comprobar]");
    var bSolucion = tz.querySelector("[data-solucion]");
    var bLimpiar = tz.querySelector("[data-limpiar]");
    if (bComprobar) bComprobar.addEventListener("click", function () {
      var bien = 0;
      entradas.forEach(function (inp) {
        var ok = coincide(inp.value, inp.getAttribute("data-a"));
        inp.classList.toggle("bien", ok);
        inp.classList.toggle("mal", !ok);
        if (ok) bien++;
      });
      if (res) res.textContent = bien === entradas.length
        ? "¡Traza completa y correcta! " + bien + "/" + entradas.length
        : bien + " de " + entradas.length + " celdas correctas. Revisa las marcadas en rojo.";
    });
    if (bSolucion) bSolucion.addEventListener("click", function () {
      entradas.forEach(function (inp) {
        inp.value = inp.getAttribute("data-a").split("|")[0];
        inp.classList.remove("mal");
        inp.classList.add("bien");
      });
      if (res) res.textContent = "Solución mostrada. Intenta explicar cada celda en voz alta.";
    });
    if (bLimpiar) bLimpiar.addEventListener("click", function () {
      entradas.forEach(function (inp) { inp.value = ""; inp.classList.remove("bien", "mal"); });
      if (res) res.textContent = "";
    });
  });

  /* ---------- Botón copiar en bloques de código ---------- */
  document.querySelectorAll("pre > code").forEach(function (code) {
    var pre = code.parentElement;
    if (pre.classList.contains("salida")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "copy-btn";
    b.textContent = "Copiar";
    b.addEventListener("click", function () {
      var texto = code.innerText;
      function listo() { b.textContent = "Copiado"; setTimeout(function () { b.textContent = "Copiar"; }, 1400); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(listo, function () { b.textContent = "Selecciona y copia"; });
      } else {
        b.textContent = "Selecciona y copia";
      }
    });
    pre.appendChild(b);
  });

  /* ---------- Índice lateral: sección activa ---------- */
  var enlacesToc = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  if (enlacesToc.length && "IntersectionObserver" in window) {
    var mapa = {};
    enlacesToc.forEach(function (a) { mapa[a.getAttribute("href").slice(1)] = a; });
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting && mapa[en.target.id]) {
          enlacesToc.forEach(function (a) { a.classList.remove("active"); });
          mapa[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-70px 0px -70% 0px" });
    Object.keys(mapa).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) obs.observe(sec);
    });
  }

  /* ---------- Borrar progreso ---------- */
  document.querySelectorAll("[data-borrar-progreso]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!window.confirm("¿Borrar todas las casillas y respuestas guardadas en este navegador?")) return;
      try { window.localStorage.removeItem(CLAVE); } catch (e) { /* nada */ }
      window.location.reload();
    });
  });

  /* ---------- Página de inicio: progreso por semana ---------- */
  document.querySelectorAll("[data-progreso-semana]").forEach(function (el) {
    var s = estado.semanas[el.getAttribute("data-progreso-semana")];
    var barra = el.querySelector(".progress-bar > span");
    var etiqueta = el.querySelector(".progress-label");
    if (!s || !s.total) {
      if (etiqueta) etiqueta.textContent = "Sin empezar";
      return;
    }
    var pct = Math.round((s.hechos / s.total) * 100);
    if (barra) barra.style.width = pct + "%";
    var txt = s.hechos + "/" + s.total + " actividades";
    if (s.quizTotal) txt += " · quiz " + (s.quizOk || 0) + "/" + s.quizTotal;
    if (etiqueta) etiqueta.textContent = txt;
  });
})();
