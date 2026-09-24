# Guía de estudio · Introducción al Desarrollo de Software

ESEN · Ciclo III/2026. Una guía web interactiva para las **semanas 1 a 5** del curso (pensamiento algorítmico, Python y Git), basada en el programa oficial y en la bibliografía asignada (PCC, BOU, GIT), complementada con fuentes gratuitas.

## Contenido

| Página | Tema |
|---|---|
| `index.html` | Inicio: semanas, calendario de evaluaciones y proyecto, ponderación, bibliografía, progreso |
| `semanas/semana-01.html` | Pensamiento computacional, entorno y Git · Proyecto Fase 1 |
| `semanas/semana-02.html` | Variables, tipos y condicionales · Control 1 |
| `semanas/semana-03.html` | Bucles y patrones de control · Proyecto Fase 2 |
| `semanas/semana-04.html` | Funciones, ámbito, recursividad y pruebas (pytest) |
| `semanas/semana-05.html` | Listas, tuplas, búsqueda y ordenamiento · Control 2, Fase 3, repaso para el Parcial |

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

## Diseño

- **Liquid glass**: paneles translúcidos con desenfoque y brillo en el borde sobre un campo de color suave; el código se mantiene sólido para leerlo bien. Si el navegador no soporta el efecto o el sistema pide “reducir transparencia”, los paneles pasan a ser sólidos.
- Portada de cada semana en azul petróleo con la pregunta orientadora marcada con **resaltador amarillo**.
- Tipografías: **Archivo** (títulos), **Atkinson Hyperlegible Next** (lectura, pensada para máxima legibilidad) y **JetBrains Mono** (código, sin ligaduras para que `<=` y `==` se vean tal cual).
- **Láminas SVG independientes** en `assets/img/` (21 archivos): diagramas de flujo, Git, tramos, cadenas `if`, `range`, interés compuesto, funciones, ámbito, pila de llamadas, módulos, índices, alias, Bubble/Insertion Sort, crecimiento cuadrático y la ruta del ciclo. Se ven sobre fondo claro en ambos temas, como un apunte impreso.
- Íconos SVG en `assets/icons/`. Modo claro y oscuro, adaptado a celular, respeta "reducir movimiento".

Todo el código Python de la guía se ejecutó y se comparó con la salida que muestra la página, y las pruebas de pytest pasan.

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
