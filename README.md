# Guía de estudio · Introducción al Desarrollo de Software

ESEN · Ciclo III/2026. Una guía web interactiva para las **12 semanas** del curso (pensamiento algorítmico, Python, Git, programación orientada a objetos y C#), basada en el programa oficial y en la bibliografía asignada (PCC, BOU, TRO, GIT), complementada con fuentes gratuitas.

## Contenido

| Página | Tema |
|---|---|
| `index.html` | Inicio: semanas, calendario de evaluaciones y proyecto, ponderación, bibliografía, progreso |
| `semanas/semana-01.html` | Pensamiento computacional, entorno y Git · Proyecto Fase 1 |
| `semanas/semana-02.html` | Variables, tipos y condicionales · Control 1 |
| `semanas/semana-03.html` | Bucles y patrones de control · Proyecto Fase 2 |
| `semanas/semana-04.html` | Funciones, ámbito, recursividad y pruebas (pytest) |
| `semanas/semana-05.html` | Listas, tuplas, búsqueda y ordenamiento · Control 2, Fase 3, repaso para el Parcial |
| `semanas/semana-06.html` | Repaso integral y Examen Parcial: mapa de las semanas 1–5, errores frecuentes, simulacro |
| `semanas/semana-07.html` | Diccionarios, conjuntos, archivos CSV/JSON y excepciones · Proyecto Fase 4 |
| `semanas/semana-08.html` | POO: clases, instancias y encapsulamiento · Control 3 |
| `semanas/semana-09.html` | Herencia, polimorfismo, composición y modularidad · Proyecto Fase 5 |
| `semanas/semana-10.html` | Transición a C# y .NET: tipado estático, compilación, `decimal` · Proyecto Fase 6 |
| `semanas/semana-11.html` | POO en C#, `List<T>`, `virtual`/`override`, guía de defensa · Control 4, Fase 7 |
| `semanas/semana-12.html` | Repaso y Examen Final: simulacro en Python y C# |

Cada semana incluye:

- **Qué puedes usar y qué no todavía**: nunca se usa algo que se enseña en una semana posterior.
- **Lecturas** con qué buscar en cada capítulo, más enlaces a fuentes libres.
- **Reading checkpoint**: un quiz que se corrige solo y explica cada respuesta.
- **Conceptos resueltos con el ciclo** pregunta → exploración → implementación → resultado → interpretación → verificación, siempre con casos de negocio (facturación, IVA, préstamos, inventario).
- **Tablas de traza** para llenar a mano, con botón para comprobar.
- **En palabras simples**: una analogía cotidiana al inicio de cada tema (recetas, cajas con etiqueta, filas de ventanillas, muñecas rusas…).
- **Ejercicios** con pista y solución desplegables; el último de cada semana es una auditoría de código.
- **Práctica intensiva**: ejercicios rápidos de “¿qué imprime / qué devuelve?” que se corrigen solos, y 3 problemas tipo examen por semana con tabla de casos de prueba y solución verificada (comisiones, tarifa eléctrica por bloques, amortización, tasa implícita por bisección, dígito verificador, mediana y percentil, intercalación de listas…).
- **Proyecto integrador**: la fase de esa semana y preguntas para practicar la defensa.
- **Lista de "puedo…"** para prepararte para los controles y el Parcial.
- **Checklist de progreso** que se guarda solo en tu navegador (`localStorage`).
- **Código ejecutable en la página**: cada bloque de Python tiene botón **Correr** (y **Editar** para modificarlo). Corre con [Pyodide](https://pyodide.org/) dentro del navegador, sin instalar nada; `input()` lee del cuadro **Entradas**, los archivos de prueba `test_*.py` se ejecutan como pytest y un bucle infinito se corta a los 8 segundos. La primera vez tarda unos segundos en cargar. Los bloques de C# no se ejecutan en el navegador: se indica que se corren en tu PC con `dotnet run`.

## Diseño

- **Liquid glass**: paneles muy transparentes con desenfoque fuerte, brillo especular y un canto de luz degradado, sobre campos de color animados con un tono propio por semana; el código se mantiene sólido para leerlo bien. Si el navegador no soporta el efecto o el sistema pide “reducir transparencia”, los paneles pasan a ser sólidos.
- Portada de cada semana en azul petróleo con la pregunta orientadora marcada con **resaltador amarillo**.
- **Código como ventana de editor**: barra con botones de ventana, nombre del archivo, etiqueta del lenguaje, botón copiar y números de línea; las salidas se muestran como terminal de vidrio.
- Tipografías: **Archivo** (títulos), **Atkinson Hyperlegible Next** (lectura, pensada para máxima legibilidad) y **JetBrains Mono** (código, sin ligaduras para que `<=` y `==` se vean tal cual).
- **Láminas SVG independientes** en `assets/img/` (33 archivos): diagramas de flujo, Git, tramos, cadenas `if`, `range`, interés compuesto, funciones, ámbito, pila de llamadas, módulos, índices, alias, Bubble/Insertion Sort, crecimiento cuadrático, diccionarios, excepciones, persistencia, clases y objetos, herencia, composición, compilación de C#, traducción Python→C#, `List<T>` y la ruta del ciclo. Se ven sobre fondo claro en ambos temas, como un apunte impreso.
- Íconos SVG en `assets/icons/`. Modo claro y oscuro, adaptado a celular, respeta "reducir movimiento".

Todo el código Python y C# de la guía se ejecutó (Python 3 y .NET 8) y se comparó con la salida que muestra la página, y las pruebas de pytest pasan.

## Publicar con GitHub Pages

1. En GitHub, abre el repositorio → **Settings** → **Pages**.
2. En **Build and deployment → Source**, elige **Deploy from a branch**.
3. Elige la rama donde está este código y la carpeta **`/ (root)`**, y pulsa **Save**.
4. Después de uno o dos minutos, la guía queda disponible en `https://<usuario>.github.io/<repositorio>/`.

El archivo `.nojekyll` hace que GitHub sirva los archivos tal cual. Documentación: [Configurar la fuente de publicación de GitHub Pages](https://docs.github.com/es/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Verla en tu computadora

Abre `index.html` en el navegador, o levanta un servidor local:

```bash
python -m http.server 8000
# y abre http://localhost:8000
```

## Aviso

Es un material de apoyo **no oficial**. Si algo no coincide, mandan el programa del curso y Moodle. La guía resume los temas de los libros de O'Reilly sin reproducir su contenido. Los valores de impuestos y planillas de los ejercicios son simplificados y solo sirven para aprender.
