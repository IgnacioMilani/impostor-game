# 🕵️‍♂️ El Impostor - Juego de Mesa Digital

¡Bienvenido a **El Impostor**! Una adaptación digital y súper vitaminada del clásico juego de mesa de roles ocultos y engaño. Ideal para jugar con amigos y familiares en la misma habitación usando un solo dispositivo.

🎮 **[¡Juega ahora directamente desde tu navegador!](https://paolo7s.github.io/impostor-game/)**

---

## 🎲 ¿En qué consiste el juego?

El objetivo del juego es descubrir quién es el impostor... ¡O evitar ser descubierto si tú eres el impostor!

1. Se selecciona una categoría de palabras (ej: Animales, Comida, Países).
2. El dispositivo se va pasando de mano en mano entre todos los jugadores.
3. La mayoría de los jugadores (los "Inocentes") verán la **misma palabra secreta**.
4. Una minoría (los "Impostores") verán un mensaje indicando que son el impostor.
5. Una vez que todos han visto su rol, los jugadores toman turnos para decir **una sola palabra** relacionada con la palabra secreta.
6. Al final de la ronda, todos debaten y votan por quién creen que es el impostor. Si adivinan, ¡ganan los inocentes! Si el impostor sobrevive o logra adivinar la palabra secreta, ¡gana el impostor!

---

## 🔥 Modos de Juego Únicos

Este juego lleva la experiencia un paso más allá introduciendo variantes para complicar la mente de los jugadores:

*   **🟢 Clásico:** 1 palabra secreta. La categoría es visible para todos.
*   **🙈 A Ciegas:** ¡La categoría no se muestra a nadie! El impostor estará totalmente perdido, pero los inocentes también tendrán cuidado de no ser muy obvios.
*   **🎲 Doble Palabra:** Los inocentes reciben 2 palabras (la común y una falsa totalmente aleatoria de la misma categoría). Tendrán que descubrir en pleno debate cuál es la real.
*   **🤪 Despistado:** Todos reciben la palabra, pero a **un inocente al azar** le tocará una palabra **muy parecida pero distinta** (ej: si a todos les toca *Argentina*, al despistado le tocará *Uruguay*). ¡Caos total en el debate!

---

## 🛠️ Detalles Técnicos y Construcción

Este proyecto fue desarrollado bajo los estándares más modernos de desarrollo web y móvil. Su arquitectura prioriza el diseño, la rapidez y el bajo consumo de recursos (ideal para no agotar la batería del móvil en reuniones largas).

### Tecnologías Utilizadas
*   **Vite:** Herramienta de construcción ultra rápida.
*   **React:** Librería principal para la interfaz y el manejo de estados reactivos.
*   **CSS Puro:** Sistema de diseño con variables CSS (`index.css`), usando estilo neomorfismo/Glassmorphism con animaciones suaves y una paleta moderna en "Dark Mode".
*   **Capacitor:** Envuelve la aplicación web para compilarla nativamente hacia Android.
*   **GitHub Actions:** Pipeline CI/CD que compila automáticamente el código y genera archivos `.apk` en la nube.

### Almacenamiento Local (Persistencia)
El juego utiliza un Custom Hook (`useStickyState`) apoyado en el `localStorage` del navegador para recordar automáticamente tus preferencias. Cuando abres el juego por segunda vez, recuerda exactamente qué categorías tenías seleccionadas y cuántos jugadores eran, eliminando la fricción de reconfigurar todo.

### Estructura de Archivos Principal
*   `src/App.jsx`: Corazón de la lógica, manejo de roles, turnos y pantallas (setup, pasando teléfono, revelando rol).
*   `src/categories.js`: Base de datos de palabras. Incluye una innovadora estructura de **Sub-grupos Semánticos** (`CATEGORIES_CLUSTERED`) que permite al algoritmo del modo "Despistado" encontrar palabras geográficamente o conceptualmente cercanas.
*   `src/index.css`: Todo el diseño visual, cuadrículas flexibles (`auto-fit`) y variables de color.

---

## 🚀 Instalación y Despliegue

La aplicación se distribuye en dos formatos gracias al sistema dual configurado:

### 1. Versión Web (PWA)
Aloja los archivos compilados en **GitHub Pages**. Permite jugar desde cualquier dispositivo al instante.
👉 **[Jugar Ahora](https://paolo7s.github.io/impostor-game/)**

### 2. Versión Nativa (Android APK)
Gracias a GitHub Actions y Capacitor, en cada actualización de código se compila automáticamente una versión oficial para Android.
👉 **[Descargar APK Oficial](https://github.com/paolo7s/impostor-game/releases/latest)**

---
*Desarrollado con mucha pasión para engañar a tus amigos.*
