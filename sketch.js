// p5.js Halloween Project - Main sketch
// Proyecto creado para la asignatura de Multimedia

let capture;
let isRunning = true;

//video
let aspectRatio, newVideoWidth, newVideoHeight;

let sonido;

// Sistema de partículas Halloween
let particles = [];
let maxParticles = 100;

// MediaPipe variables
let faceLandmarker;
let isMediaPipeReady = false;
let lastVideoTime = -1;
let jawOpen = false;
let jawOpenThreshold = 0.05; // Umbral para detectar boca abierta
let jawOpenValue = 0;

// Texto 3D variables
let blockFont;
let blockText;
let h1 = "ABRE LA BOCA";
let blockTextSize = 130;
let rotX, rotY;

// Paleta de colores Halloween que hemos seleccionado
// Utilizamos colores oscuros característicos de Halloween
const COLORS = {
  ORANGE: [255, 140, 0],      // Naranja calabaza
  BLACK: [20, 20, 20],        // Negro profundo
  PURPLE: [75, 0, 130],       // Púrpura oscuro
  DARK_RED: [139, 0, 0],      // Rojo sangre
  WHITE: [255, 255, 255],     // Blanco fantasma
  GREEN: [50, 205, 50],       // Verde fantasma
  UI_START: [34, 139, 34],    // Verde botón comenzar
  UI_STOP: [255, 69, 0],      // Rojo-naranja botón parar
};


// setup() function - Initialization, runs once at start
async function setup() {
  // Canvas que se adapta al tamaño de la ventana
  createCanvas(windowWidth, windowHeight, WEBGL);
  // Inicializamos MediaPipe con fallback a simulación por teclado
  await initializeMediaPipe();
  blockFont = await loadFont("fonts/Scary-Halloween-Font.ttf");
  defaultFont = await loadFont("fonts/TiltWarp-Regular-VariableFont_XROT,YROT.ttf");
  try {
    sonido = await loadSound("music/halloween-ghost.mp3");
    console.log('[audio] loaded successfully');
  } catch (e) {
    console.warn('[audio] failed to load', e);
  }
  textAlign(CENTER, CENTER);
  textSize(blockTextSize);
    
  blockText = blockFont.textToModel(h1, 0, 0, {
    extrude: 100,
    sampleFactor: 0.25,
  });

  textFont(defaultFont);
  // Configuramos la captura de video desde la cámara del usuario
  capture = createCapture({
    video: {
      width: 1280,
      height: 720,
      facingMode: 'user'
    },
    audio: false,
    flipped: true,
  }, function() {
    console.log('Cámara iniciada');
  });
  // Ocultamos el elemento HTML de video para mostrarlo en canvas
  capture.hide();
  // Rotación inicial del texto 3D
  rotX = 0;
  rotY = 0;
}

// initializeMediaPipe() function - Cargar y configurar MediaPipe Face Landmarker
// Implementamos manejo de errores para fallback si no está disponible
async function initializeMediaPipe() {
  try {
    console.log('Inicializando MediaPipe para nuestro proyecto Halloween...');
    const tv = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3');
    const filesetResolver = await tv.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    faceLandmarker = await tv.FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: 
          `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1
    });
    
    isMediaPipeReady = true;
    console.log('MediaPipe Face Landmarker configurado correctamente');
  } catch (error) {
    console.error('MediaPipe no disponible:', error);
    isMediaPipeReady = false;
  }
}

// draw() function - Main animation loop, runs continuously
function draw() {
  // Dibujamos el video si está ejecutándose
  if (capture && isRunning && capture.elt && capture.elt.readyState >= 2) {
    
    // Detectamos si MediaPipe está listo para procesar
    isMediaPipeReady && detectFaceAndJaw();
    
    let videoWidth = capture.width;
    let videoHeight = capture.height;
    
    if (videoWidth > 0 && videoHeight > 0) {
      aspectRatio = videoWidth / videoHeight;
      newVideoWidth = 800;
      newVideoHeight = newVideoWidth / aspectRatio;
      
      // Cambiamos el background según el estado de la boca
      if (jawOpen) {
        background(...COLORS.GREEN)
        if (!sonido.isPlaying()) {
              sonido.play(); // Usar play() en lugar de loop()
              sonido.loop(); // Usar play() en lugar de loop()
        } 
      } else {
        background(...COLORS.ORANGE)
        sonido.stop();
      }
      
      imageMode(CENTER);
      image(capture, 0, 0, newVideoWidth, newVideoHeight);
      
      // Aplicamos un overlay semitransparente para el efecto Halloween
      push();
      noStroke();
      fill(...COLORS.BLACK, 100);
      plane(newVideoWidth, newVideoHeight);
      pop();
      
      displayJawStatus();
      
      // Creamos partículas Halloween cuando la boca está abierta
      if (jawOpen && frameCount % 3 === 0) { // Crear partículas cada 3 frames
        createHalloweenParticles(0, -50); // Centro del video
      }
    }
  } else if (!isRunning) {
    background(...COLORS.BLACK);
    fill(...COLORS.WHITE);
    textAlign(CENTER, CENTER);
    textSize(48);
    text('CÁMARA PAUSADA', 0, 0);
  } else {
    background(...COLORS.BLACK);
    fill(...COLORS.WHITE);
    textAlign(CENTER, CENTER);
    textSize(32);
    text('CARGANDO CÁMARA...', 0, 0);
  }

  clearDepth();

  // Actualizamos y dibujamos las partículas
  updateParticles();
  drawParticles();

  // Interacciones del mouse para rotar el texto 3D
  rotY = map(jawOpenValue, 0, 0.9, 0, PI * 0.25); 
  rotX = map(jawOpenValue, 0, 0.9, 0, PI * 0.15);

  // Dibujamos el texto 3D Halloween
  if (blockText) {
    push();
    translate(0, newVideoHeight/2 + 100);
    rotateX(rotX);  
    rotateY(rotY);

    // Cambiamos el color del texto según el estado de la boca
    jawOpen ? fill(...COLORS.GREEN) : fill(...COLORS.WHITE);
    model(blockText);
    //console.log(jawOpenValue);
    pop();
  }
}

function detectFaceAndJaw() {
  if (!isMediaPipeReady || !faceLandmarker || !capture.elt) return;
  
  const video = capture.elt;
  const nowInMs = performance.now();
  
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const detectionResults = faceLandmarker.detectForVideo(video, nowInMs);
      
    if (detectionResults.faceBlendshapes && detectionResults.faceBlendshapes.length > 0) {
        const blendshapes = detectionResults.faceBlendshapes[0].categories;
        
        for (let i = 0; i < blendshapes.length; i++) {
          if (blendshapes[i].categoryName === 'jawOpen') {
            jawOpenValue = blendshapes[i].score;
            jawOpen = jawOpenValue > jawOpenThreshold;
            break;
          }
        }
    }
    
  }
}

function displayJawStatus() {
  push();
  translate(0, -newVideoHeight/2 +50);
  
  if (isMediaPipeReady) {
    if (jawOpen) {
      fill(...COLORS.GREEN);
      textSize(40);
      text('¡BOCA ABIERTA!', 0, 0);
      
    } else {
      fill(...COLORS.ORANGE);
      textSize(30);
      text('Abre la boca para Halloween', 0, 0);
    }
  } 
  pop();
}


function toggleCamera() {
  isRunning = !isRunning;
  
  if (isRunning) {
    button.html('Parar');
    button.class('camera-button stop');
    button.style('background-color', `rgb(${COLORS.UI_STOP.join(',')})`);
  } else {
    button.html('Comenzar');
    button.class('camera-button start');
    button.style('background-color', `rgb(${COLORS.UI_START.join(',')})`);
  }
}
// FUNCIÓN PARA CREAR PARTÍCULAS HALLOWEEN
function createHalloweenParticles(mouthX, mouthY) {
  if (particles.length < maxParticles) {
    // Usamos coordenadas exactas de la boca con pequeña variación aleatoria
    let x = mouthX + random(-20, 20); 
    let y = mouthY + random(-10, 10);
    
    // Seleccionamos colores Halloween que hemos definido
    let color = random(Object.values(COLORS));
    
    // Tamaño basado en apertura de boca
    let particleSize = map(jawOpenValue, 0, 1, 5, 55) ;
  
    
    // Vida útil más larga cuando la boca está más abierta
    let lifespan = map(jawOpenValue, 0, 1, 40, 100);
    
    let type = random(['spark', 'brush']);
    let particle = new Particle(x, y, particleSize, color, lifespan, type);
    
    // Propiedades para control de opacidad
    particle.alpha = 255;
    particle.maxLife = lifespan; // Guardar vida inicial para cálculos
    
    particles.push(particle);
  }
}

// FUNCIÓN PARA ACTUALIZAR PARTÍCULAS - Transición más suave
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    
    // Control de opacidad basado en estado de la boca
    if (!jawOpen) {
      // Boca cerrada: desvanecimiento gradual (valor más bajo para transición lenta)
      particles[i].alpha = lerp(particles[i].alpha, 0, 0.03); // Cambiar de 0.08 a 0.03
      particles[i].life -= 1; // Muerte más lenta (cambiar de 3 a 1)
      
      // Efecto adicional: las partículas se mueven más lento
      particles[i].vx *= 0.98; // Más gradual (cambiar de 0.95 a 0.98)
      particles[i].vy *= 0.98;
      
    } else {
      // Boca abierta: opacidad completa pero transición más suave
      particles[i].alpha = lerp(particles[i].alpha, 255, 0.08); // Cambiar de 0.15 a 0.08
    }
    
    // Desvanecimiento natural por edad (independiente del estado de boca)
    let ageOpacity = map(particles[i].life, 0, particles[i].maxLife || 100, 0, 255);
    particles[i].alpha = Math.min(particles[i].alpha, ageOpacity);
    
    // Eliminamos partículas muertas, fuera de pantalla o invisibles
    if (particles[i].life <= 0 || 
        particles[i].y > height + 50 || 
        particles[i].alpha < 1) { // Cambiar de 3 a 1 para más gradual
      particles.splice(i, 1);
    }
  }
}

// FUNCIÓN PARA DIBUJAR PARTÍCULAS
function drawParticles() {
  for (let particle of particles) {
    particle.draw();
  }
}

// windowResized() function - Canvas responsivo
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


