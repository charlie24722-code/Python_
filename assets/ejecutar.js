/* Ejecutar código Python dentro de la página.
   Usa Pyodide (Python compilado a WebAssembly) dentro de un Web Worker: el código corre aparte de la página,
   así un bucle infinito no la congela; si tarda demasiado, el worker se detiene y se crea uno nuevo.
   - input() lee del cuadro "Entradas" (una línea por cada input).
   - Los archivos marcados como módulo en la página (data-module) se pueden importar.
   - Los archivos test_*.py se ejecutan como pruebas: cada función test_ se llama y se informa si pasó o falló. */
(function () {
  "use strict";

  var PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  var LIMITE_MS = 8000;

  var CODIGO_WORKER = [
    'try { self.importScripts("' + PYODIDE + 'pyodide.js"); } catch (e) { /* se informa al ejecutar */ }',
    'var py = null;',
    'var PRELUDIO = ' + JSON.stringify([
      "import builtins, sys, traceback",
      "_input_original = builtins.input",
      "def __correr(codigo, nombre, entradas, es_prueba, modulos):",
      "    for m in modulos:",
      "        sys.modules.pop(m, None)",
      "    cola = list(entradas)",
      "    def _input(prompt=''):",
      "        print(prompt, end='')",
      "        if not cola:",
      "            print()",
      "            raise EOFError('input() no tiene más entradas: escríbelas en el cuadro \"Entradas\", una por línea.')",
      "        valor = cola.pop(0)",
      "        print(valor)",
      "        return valor",
      "    builtins.input = _input",
      "    ns = {'__name__': '__main__' if not es_prueba else nombre[:-3]}",
      "    try:",
      "        exec(compile(codigo, nombre, 'exec'), ns)",
      "        if es_prueba:",
      "            pruebas = [(k, v) for k, v in ns.items() if k.startswith('test_') and callable(v)]",
      "            ok = 0",
      "            for k, f in pruebas:",
      "                try:",
      "                    f()",
      "                    ok += 1",
      "                    print('PASÓ   ', k)",
      "                except AssertionError as e:",
      "                    print('FALLÓ  ', k, '→ AssertionError', e if str(e) else '')",
      "                except Exception as e:",
      "                    print('ERROR  ', k, '→', type(e).__name__ + ':', e)",
      "            print()",
      "            print(f'{ok} de {len(pruebas)} pruebas pasaron')",
      "    except SystemExit:",
      "        pass",
      "    except BaseException as e:",
      "        tb = traceback.TracebackException.from_exception(e)",
      "        tb.stack = traceback.StackSummary.from_list([f for f in tb.stack if f.filename != '<exec>'])",
      "        sys.stderr.write(''.join(tb.format()))",
      "    finally:",
      "        builtins.input = _input_original",
      "",
      "PYTEST_SHIM = '''",
      "class approx:",
      "    def __init__(self, esperado, rel=1e-6, abs=1e-12):",
      "        self.esperado, self.rel, self.abs_ = esperado, rel, abs",
      "    def __eq__(self, otro):",
      "        return abs(otro - self.esperado) <= max(self.rel * abs(self.esperado), self.abs_)",
      "    def __repr__(self):",
      "        return f'{self.esperado} ± {max(self.rel * abs(self.esperado), self.abs_):.1e}'",
      "class raises:",
      "    def __init__(self, tipo, match=None):",
      "        self.tipo = tipo",
      "    def __enter__(self):",
      "        return self",
      "    def __exit__(self, t, v, tb):",
      "        if t is None:",
      "            raise AssertionError(f'se esperaba {self.tipo.__name__}')",
      "        return issubclass(t, self.tipo)",
      "'''"
    ].join("\n")) + ';',
    'async function preparar() {',
    '  if (typeof loadPyodide === "undefined") self.importScripts("' + PYODIDE + 'pyodide.js");',
    '  if (!py) { py = await loadPyodide({ indexURL: "' + PYODIDE + '" }); py.runPython(PRELUDIO);',
    '    py.FS.writeFile("/home/pyodide/pytest.py", py.globals.get("PYTEST_SHIM")); }',
    '  return py;',
    '}',
    'self.onmessage = async function (e) {',
    '  var d = e.data;',
    '  try {',
    '    var p = await preparar();',
    '    self.postMessage({ id: d.id, tipo: "listo" });',
    '    p.setStdout({ batched: function (s) { self.postMessage({ id: d.id, tipo: "out", texto: s + "\\n" }); } });',
    '    p.setStderr({ batched: function (s) { self.postMessage({ id: d.id, tipo: "err", texto: s + "\\n" }); } });',
    '    var modulos = [];',
    '    Object.keys(d.archivos).forEach(function (n) { p.FS.writeFile("/home/pyodide/" + n, d.archivos[n]); modulos.push(n.replace(/\\.py$/, "")); });',
    '    var correr = p.globals.get("__correr");',
    '    correr(d.codigo, d.nombre, p.toPy(d.entradas), d.esPrueba, p.toPy(modulos));',
    '    correr.destroy();',
    '    self.postMessage({ id: d.id, tipo: "fin" });',
    '  } catch (err) {',
    '    if (!py) { self.postMessage({ id: d.id, tipo: "err", texto: "No se pudo descargar Python en el navegador. Revisa tu conexión y pulsa Ejecutar de nuevo.\\n(" + String(err).slice(0, 160) + ")\\n" }); self.postMessage({ id: d.id, tipo: "reiniciar" }); return; }',
    '    self.postMessage({ id: d.id, tipo: "err", texto: String(err) + "\\n" });',
    '    self.postMessage({ id: d.id, tipo: "fin" });',
    '  }',
    '};'
  ].join("\n");

  var worker = null;
  var cargado = false;
  var siguienteId = 0;
  var pendientes = {};

  function crearWorker() {
    var url = URL.createObjectURL(new Blob([CODIGO_WORKER], { type: "text/javascript" }));
    worker = new Worker(url);
    cargado = false;
    worker.onmessage = function (e) {
      var d = e.data, p = pendientes[d.id];
      if (!p) return;
      if (d.tipo === "listo") { cargado = true; p.listo(); }
      else if (d.tipo === "out" || d.tipo === "err") p.escribir(d.texto, d.tipo === "err");
      else if (d.tipo === "fin") { delete pendientes[d.id]; p.fin(); }
      else if (d.tipo === "reiniciar") { worker.terminate(); worker = null; cargado = false; delete pendientes[d.id]; p.fin(); }
    };
    worker.onerror = function (e) {
      if (worker) { worker.terminate(); worker = null; cargado = false; }
      Object.keys(pendientes).forEach(function (id) {
        pendientes[id].escribir("No se pudo cargar Python en el navegador (" + (e.message || "error de red") + "). Revisa tu conexión y pulsa Ejecutar de nuevo.\n", true);
        pendientes[id].fin();
        delete pendientes[id];
      });
    };
  }

  function ejecutar(datos, h) {
    if (!worker) crearWorker();
    var id = ++siguienteId, temporizador = null, terminado = false;
    pendientes[id] = {
      listo: function () {
        h.listo();
        temporizador = setTimeout(function () {
          if (terminado) return;
          worker.terminate(); worker = null; cargado = false;
          delete pendientes[id];
          h.escribir("\n⏹ Detenido después de " + LIMITE_MS / 1000 + " s. ¿Hay un bucle infinito? Revisa que algo dentro del bucle acerque la condición a ser falsa.\n", true);
          terminado = true; h.fin();
        }, LIMITE_MS);
      },
      escribir: h.escribir,
      fin: function () { terminado = true; clearTimeout(temporizador); h.fin(); }
    };
    datos.id = id;
    worker.postMessage(datos);
  }

  /* ---------- Interfaz ---------- */
  function textoDe(pre) {
    var ta = pre.parentElement.querySelector("textarea.editor");
    if (ta && !ta.hidden) return ta.value;
    return pre.getAttribute("data-original");
  }

  function modulosDeLaPagina(excepto) {
    var archivos = {};
    document.querySelectorAll("pre[data-module][data-file]").forEach(function (pre) {
      if (pre === excepto) return;
      archivos[pre.getAttribute("data-file")] = textoDe(pre);
    });
    return archivos;
  }

  function boton(clase, texto, titulo) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = clase;
    b.innerHTML = texto;
    if (titulo) b.title = titulo;
    return b;
  }

  function prepararVentana(ventana) {
    var pre = ventana.querySelector(":scope > pre");
    var code = pre && pre.querySelector("code");
    if (!code || !code.classList.contains("language-python") || ventana.closest(".qq")) return;
    var barra = ventana.querySelector(".ventana-barra");
    var original = code.textContent.replace(/\n+$/, "");
    pre.setAttribute("data-original", original);
    var nombre = pre.getAttribute("data-file") || "ejemplo.py";
    var usaInput = /\binput\s*\(/.test(original);

    var bEditar = boton("btn-mini btn-editar", "Editar", "Modificar el código y volver a ejecutarlo");
    var bCorrer = boton("btn-mini btn-correr", "<span aria-hidden=\"true\">▶</span> Ejecutar", "Ejecutar este código en tu navegador");
    var copiar = barra.querySelector(".copy-btn");
    barra.insertBefore(bEditar, copiar);
    barra.insertBefore(bCorrer, copiar);

    var editor = document.createElement("textarea");
    editor.className = "editor";
    editor.hidden = true;
    editor.spellcheck = false;
    editor.setAttribute("aria-label", "Editor de " + nombre);
    editor.value = original;
    ventana.appendChild(editor);
    editor.addEventListener("keydown", function (e) {
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        var i = editor.selectionStart;
        editor.setRangeText("    ", i, editor.selectionEnd, "end");
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault(); bCorrer.click();
      }
    });
    function ajustar() { editor.style.height = "auto"; editor.style.height = (editor.scrollHeight + 4) + "px"; }
    editor.addEventListener("input", ajustar);

    bEditar.addEventListener("click", function () {
      var editando = editor.hidden;
      editor.hidden = !editando;
      pre.hidden = editando;
      bEditar.textContent = editando ? "Restaurar" : "Editar";
      if (editando) { ajustar(); editor.focus(); }
      else editor.value = original;
    });

    var panelEntradas = null;
    if (usaInput) {
      panelEntradas = document.createElement("div");
      panelEntradas.className = "entradas";
      var stdin = pre.getAttribute("data-stdin");
      panelEntradas.innerHTML = '<label>Entradas para <code>input()</code> <span>una por línea, en orden</span></label><textarea spellcheck="false" rows="3"></textarea>';
      panelEntradas.querySelector("textarea").value = stdin ? stdin.replace(/\\n/g, "\n").replace(/\n$/, "") : "";
      ventana.parentNode.insertBefore(panelEntradas, ventana.nextSibling);
    }

    var salida = null;
    bCorrer.addEventListener("click", function () {
      if (bCorrer.disabled) return;
      if (!salida) {
        salida = document.createElement("div");
        salida.className = "ventana terminal ejecucion";
        salida.innerHTML = '<div class="ventana-barra"><span class="ventana-archivo">Ejecución en tu navegador</span><span class="estado"></span></div><pre><code></code></pre>';
        var despues = panelEntradas || ventana;
        despues.parentNode.insertBefore(salida, despues.nextSibling);
      }
      var out = salida.querySelector("code"), estado = salida.querySelector(".estado");
      out.textContent = "";
      salida.classList.remove("con-error");
      bCorrer.disabled = true;
      estado.textContent = cargado ? "ejecutando…" : "preparando Python (la primera vez tarda unos segundos)…";
      var inicio = 0;
      var entradas = panelEntradas ? panelEntradas.querySelector("textarea").value.split("\n").filter(function (l, i, a) { return i < a.length - 1 || l !== ""; }) : [];
      ejecutar({
        codigo: textoDe(pre),
        nombre: nombre,
        entradas: entradas,
        esPrueba: /^test_.*\.py$/.test(nombre),
        archivos: modulosDeLaPagina(pre.hasAttribute("data-module") ? null : pre)
      }, {
        listo: function () { inicio = performance.now(); estado.textContent = "ejecutando…"; },
        escribir: function (texto, esError) {
          if (esError) {
            var s = document.createElement("span");
            s.className = "err";
            s.textContent = texto;
            out.appendChild(s);
            salida.classList.add("con-error");
          } else out.appendChild(document.createTextNode(texto));
        },
        fin: function () {
          bCorrer.disabled = false;
          if (!out.textContent) out.textContent = "(el programa no imprimió nada)";
          estado.textContent = salida.classList.contains("con-error") ? "terminó con error" : "listo · " + Math.max(1, Math.round(performance.now() - inicio)) + " ms";
        }
      });
    });
  }

  function iniciar() {
    document.querySelectorAll(".ventana:not(.terminal) > pre > code.language-csharp").forEach(function (code) {
      var barra = code.closest(".ventana").querySelector(".ventana-barra");
      if (!barra || barra.querySelector(".ventana-nota")) return;
      var nota = document.createElement("span");
      nota.className = "ventana-nota";
      nota.textContent = "se ejecuta en tu PC con dotnet run";
      barra.insertBefore(nota, barra.querySelector(".ventana-lang"));
    });
    if (!window.Worker || !window.Blob) return;
    document.querySelectorAll(".ventana:not(.terminal)").forEach(prepararVentana);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
