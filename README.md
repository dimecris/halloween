# Proyecto Halloween p5.js - Detección Facial Interactiva

Proyecto interactivo de Halloween desarrollado para la asignatura de Multimedia del Grado en Multimedia de la UOC. Combina detección facial en tiempo real con MediaPipe, efectos de partículas dinámicas y elementos visuales 3D para crear una experiencia inmersiva.

## Descripción del Proyecto

Esta aplicación web utiliza la cámara del dispositivo para detectar expresiones faciales y generar efectos visuales en tiempo real. El proyecto se centra en la detección de apertura de boca y gestos de soplo para activar sistemas de partículas con temática Halloween.

## Demo en Vivo

[Ver proyecto en vivo](https://dimecris.github.io/halloween/)

## Funcionalidades Implementadas

### Detección Facial
- Análisis facial en tiempo real usando MediaPipe Face Landmarker
- Detección de apertura de mandíbula (jawOpen) con umbrales configurables
- Cálculo de coordenadas exactas del centro de la boca

### Sistema de Partículas
- Generación dinámica de partículas desde la posición detectada de la boca
- Física realista con gravedad, colisiones y acumulación
- Partículas se apilan unas sobre otras en la parte inferior del canvas
- Efectos de transparencia y desvanecimiento progresivo
- Colores temáticos Halloween (naranjas, púrpuras, rojos oscuros)

### Elementos Visuales
- Texto 3D "ABRE LA BOCA" con rotación interactiva
- Imágenes decorativas (telarañas, murciélagos) con efectos de rotación
- Background dinámico que cambia según el estado de la boca
- Canvas responsivo que se adapta al tamaño de la ventana
- Efectos de espejo en el video para interacción natural

### Audio Interactivo
- Sonidos ambientales que se activan con la apertura de boca
- Control automático de reproducción y parada según interacción
- Integración con p5.sound para manejo de audio

## Tecnologías Utilizadas

- **p5.js 2.0.5** - Framework principal para gráficos y animación
- **MediaPipe Tasks Vision** - Detección facial y análisis de expresiones
- **p5.sound** - Sistema de audio interactivo
- **WebGL** - Renderizado 3D para texto y efectos visuales
- **HTML5 Canvas** - Superficie de dibujo para elementos 2D

## Estructura del Código

```
p5-Halloween/
├── sketch.js               # Sketch principal con setup() y draw()
├── particulas.js           # Clase Particle para sistema de partículas
├── index.html             # Estructura HTML y carga de librerías
├── style.css              # Estilos para canvas responsivo
├── fonts/                 # Fuentes tipográficas Halloween
├── img/                   # Imágenes decorativas (telarañas, murciélagos)
├── music/                 # Archivos de audio ambientales

```

## Patrones de Programación Aplicados

### Canvas Responsivo
El canvas se adapta automáticamente al tamaño de la ventana usando `windowWidth` y `windowHeight`, manteniendo la proporción del video y centrado los elementos gráficos.

### Sistema de Coordenadas WEBGL
Utiliza el sistema de coordenadas centrado de WEBGL donde (0,0) está en el centro del canvas, facilitando el posicionamiento de elementos y rotaciones.

### Gestión de Estados
Control del estado de la aplicación basado en:
- Disponibilidad de MediaPipe
- Estado de la cámara
- Detección de gestos faciales
- Ciclo de vida de partículas

### Optimización de Performance
- Límite máximo de partículas simultáneas
- Uso de `lerp()` para transiciones suaves
- Gestión eficiente de memoria en el sistema de partículas

## Controles de Interacción

- **Apertura de boca** - Genera partículas Halloween desde la posición detectada


## Configuración y Ejecución

### Requisitos
- Navegador moderno con soporte WebGL
- Cámara web funcional
- Conexión a internet (para CDN de librerías)

### Instalación
1. Clonar o descargar el repositorio
2. Abrir `index.html` en un navegador web
3. Conceder permisos de acceso a la cámara
4. Esperar la carga de MediaPipe (indicador en pantalla)

### Uso
1. Posicionarse frente a la cámara
2. Abrir la boca para activar efectos de partículas

## Consideraciones Técnicas

### Detección Facial
- Utiliza 468 landmarks faciales de MediaPipe
- Landmarks específicos para boca: 13, 14, 61, 291
- Umbrales configurables para diferentes sensibilidades
- Manejo de errores cuando no se detecta rostro

### Sistema de Partículas
- Clase `Particle` con propiedades físicas individuales
- Detección de colisiones entre partículas para apilamiento
- Aplicación de gravedad, fricción y rebotes
- Control de opacidad con `lerp()` para transiciones naturales

### Paleta de Colores
Definición de colores temáticos en constante `COLORS`:
- Orange: [255, 140, 0]
- Purple: [139, 0, 139]
- Dark Red: [139, 0, 0]
- Green: [50, 205, 50]
- White: [255, 255, 255]


## Posibles Mejoras Futuras

- Implementación de más gestos faciales (sonrisa, parpadeo)
- Sistema de niveles con diferentes efectos Halloween
- Grabación y exportación de interacciones
- Modo multijugador con múltiples rostros

## Licencia

Proyecto desarrollado con fines educativos bajo licencia MIT.

---

**Proyecto UOC - Grado en Multimedia**  
**Curso 2025-2026** 