# Proyecto Halloween p5.js - Detección Facial

Proyecto interactivo de Halloween que utiliza detección facial con MediaPipe y sistema de partículas en p5.js.

## Características

- Detección facial en tiempo real con MediaPipe
- Efectos de partículas Halloween desde la boca
- Texto 3D que rota con interacción del mouse
- Efectos de sonido terroríficos
- Canvas responsivo

## Demo en Vivo

[Ver proyecto en vivo](https://dimecris.github.io/halloween)

## Tecnologías

- p5.js 2.0.5
- MediaPipe Tasks Vision
- p5.sound
- HTML5 Canvas & WebGL

## 📁 Estructura del Proyecto

```
p5-Halloween/
├── sketch.js           # Sketch principal de p5.js
├── particulas.js       # Clase del sistema de partículas
├── index.html          # Estructura HTML
├── style.css           # Estilos del canvas
├── fonts/              # Fuentes Halloween
├── music/              # Archivos de audio
└── .gitignore          # Archivos excluidos del repositorio
```

## Controles

- **Abrir la boca** → Aparecen partículas Halloween
- **Movimiento del mouse** → Rota el texto 3D
- **Barra espaciadora** → Simular boca abierta (modo fallback)

## � Funcionamiento

1. **Carga inicial**: Se configura la cámara y MediaPipe
2. **Detección facial**: Análisis en tiempo real de landmarks faciales
3. **Detección de boca abierta**: Umbral configurable para activar efectos
4. **Partículas Halloween**: Sistema dinámico con colores temáticos
5. **Texto 3D interactivo**: Rotación basada en posición del mouse

## Instalación y Uso

1. Clonar el repositorio
2. Abrir `index.html` en un navegador moderno
3. Permitir acceso a la cámara cuando se solicite
4. ¡Abrir la boca para ver los efectos Halloween!

## Proyecto Académico

Desarrollado como parte del trabajo de la asignatura de Multimedia del Grado en Multimedia de la UOC. 
Enfoque en programación creativa con p5.js y tecnologías web modernas.

### Objetivos del Proyecto
- Implementar detección facial en tiempo real
- Crear efectos visuales interactivos
- Integrar audio y visuales de forma coherente
- Aplicar principios de diseño de interfaz responsiva

## Licencia

Licencia MIT - Libre uso para fines educativos

---

**Desarrollado en Halloween 2025** 