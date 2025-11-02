// Proyecto Halloween p5.js - UOC Multimedia
// Aplicación interactiva con detección facial

let capture;
let isRunning = true;

// Variables de video
let aspectRatio, newVideoWidth, newVideoHeight;

let sonido;
let img, img2, img3, adhesivo, adhesivo2, adhesivo3;

// Sistema de partículas Halloween
let particles = [];

// Variables MediaPipe
let faceLandmarker;
let isMediaPipeReady = false;
let lastVideoTime = -1;
let jawOpen = false;
let jawOpenThreshold = 0.05; // Umbral para detectar boca abierta
let jawOpenValue = 0;

// Coordenadas de la boca
let mouthCenterX = 0;
let mouthCenterY = 0;

// Fuentes
let blockFont;
let defaultFont;
let cursiveFont;

// Texto 3D variables
let blockText;
let h1 = "ABRE LA BOCA";
let blockTextSize = 130;
let rotX, rotY;

// Paleta de colores Halloween
// Colores oscuros característicos de Halloween
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

// Variables para controles de cámara
let startButton, stopButton;
let cameraInitialized = false;

// Función para detectar si se ejecuta en Electron
function isElectron() {
  return (typeof navigator !== 'undefined' && /electron/i.test(navigator.userAgent))
      || (typeof window !== 'undefined' && window.audios && typeof window.audios.url === 'function');

}


// Función setup - Inicialización
async function setup() {
  // Canvas adaptable al tamaño de ventana
  createCanvas(windowWidth, windowHeight, WEBGL);
  await initializeMediaPipe();
  
  // Cargar recursos
  blockFont = await loadFont("fonts/Scary-Halloween-Font.ttf");
  defaultFont = await loadFont("fonts/TiltWarp-Regular-VariableFont_XROT,YROT.ttf");
  cursiveFont = await loadFont("fonts/ShantellSans-Regular.ttf");

  img = await loadImage("img/tela.png");
  img2 = await loadImage("img/murcielago.png");
  img3 = await loadImage("img/calabaza.png");
  adhesivo = await loadImage("img/adhesivo.png");
  adhesivo2 = await loadImage("img/adhesivo2.png");
  adhesivo3 = await loadImage("img/adhesivo3.png");

  try {
     if (isElectron()) {
      console.log('Ejecutando en Electron - Carga audio desde preload.js');
      const sonidoUrl = window.audios.url('halloween-ghost.mp3');
      sonido = await loadSound(sonidoUrl);
    }else{
      console.log("Cargando audio en entorno web");
      sonido = await loadSound("music/halloween-ghost.mp3");

    }
  } catch (error) {
    console.warn("Audio no disponible, continuando sin sonido:", error);
    sonido = null;
  }
  
  textAlign(CENTER, CENTER);
  textSize(blockTextSize);
    
  blockText = blockFont.textToModel(h1, 0, 0, {
    extrude: 100,
    sampleFactor: 0.25,
  });

  textFont(defaultFont);
  
  // Crear controles de cámara
  createCameraControls();
  
  // Inicializar la cámara después
  capture = null;
  isRunning = false;
  cameraInitialized = false;
  
  // Rotación inicial del texto 3D
  rotX = 0;
  rotY = 0;
}

// Función para crear controles de cámara
function createCameraControls() {
  // Crear botón de activar cámara
  startButton = createButton('Activar Cámara');
  startButton.position(windowWidth - 250, 20);
  startButton.class('camera-button start');
  startButton.mousePressed(activateCamera);
  
  // Crear botón de pausar cámara
  stopButton = createButton(' ');
  stopButton.position(windowWidth - 50, 20);
  stopButton.class('camera-button stop');
  stopButton.style('display', 'none');
  stopButton.mousePressed(pauseCamera);
  
  console.log('Controles de cámara creados');
}

// Función para activar la cámara
async function activateCamera() {
  try {
    console.log('Activando cámara...');
    
    // Crear captura de video
    capture = createCapture({
      video: {
        width: 1280,
        height: 720,
        facingMode: 'user',
      },
      audio: false,
    }, function() {
      console.log('Cámara activada correctamente');
      isRunning = true;
      cameraInitialized = true;
      
      // Cambiar visibilidad de botones
      startButton.style('display', 'none');
      stopButton.style('display', 'block');
    });
    
    capture.hide(); // Ocultar elemento video HTML por defecto
    
  } catch (error) {
    console.error('Error al activar cámara:', error);
    
    // Mostrar mensaje de error en canvas
    push();
    fill(...COLORS.DARK_RED);
    textAlign(CENTER, CENTER);
    textSize(24);
    text('Error: No se pudo acceder a la cámara', 0, 100);
    text('Verifica permisos del navegador', 0, 130);
    pop();
  }
}

// Función para pausar la cámara
function pauseCamera() {
  console.log('Pausando cámara...');
  
  if (capture) {
    capture.remove();
    capture = null;
  }
  if (sonido && sonido.isPlaying()) { 
    sonido.stop();
  }
  isRunning = false;
  cameraInitialized = false;
  
  // Cambiar visibilidad de botones
  startButton.style('display', 'block');
  stopButton.style('display', 'none');
  
  // Limpiar partículas
  particles = [];
  
  console.log('Cámara pausada');
}

// initializeMediaPipe() function - Cargar y configurar MediaPipe Face Landmarker
// Manejo de errores para fallback si no está disponible
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
    console.log('MediaPipe Face Landmarker configurado');
  } catch (error) {
    console.error('MediaPipe no disponible:', error);
    isMediaPipeReady = false;
  }
}

// draw() function - Main animation loop, runs continuously
function draw() {
  // Estado sin cámara activa - Mostrar pantalla de espera
  if (!cameraInitialized || !capture) {
    background(...COLORS.BLACK);
    
    // Mostrar texto 3D incluso sin cámara
    if (blockText) {
      push();
      translate(0, -100);
      rotateX(0);
      rotateY(frameCount * 0.01); // Rotación suave automática
      fill(...COLORS.ORANGE);
      stroke(...COLORS.DARK_RED);
      strokeWeight(2);
      model(blockText);
      pop();
    }
    
    // Mensaje de instrucciones
    fill(...COLORS.WHITE);
    textSize(24);
    text('Haz clic en "Activar Cámara" para comenzar', 0, 100);
    return; // Salir de draw() hasta que se active la cámara
  }

  // Renderizar video si está ejecutándose
  if (capture && isRunning && capture.elt && capture.elt.readyState >= 2) {
    // Mostrar texto 3D
    if (blockText) {
      push();
      rotateX(rotX);
      rotateY(frameCount * 0.01);
      fill(...COLORS.ORANGE);
      stroke(...COLORS.DARK_RED);
      strokeWeight(2);
      model(blockText);
      pop();
    }
    
    // Detectar si MediaPipe está listo para procesar
    isMediaPipeReady && detectFaceAndJaw();
    
    let videoWidth = capture.width;
    let videoHeight = capture.height;
    
    if (videoWidth > 0 && videoHeight > 0) {
      aspectRatio = videoWidth / videoHeight;
      newVideoWidth = 800;
      newVideoHeight = newVideoWidth / aspectRatio;
      
      // Cambiamos el background según el estado de la boca
      if (jawOpen) {
        background(...COLORS.GREEN);
        if (sonido) {
          if (!sonido.isPlaying()) {
            sonido.play();
            sonido.loop();
          } 
        }
      } else {
        background(...COLORS.ORANGE)
        if (sonido) {
          sonido.stop();
        }
      }

      drawUI();
      creditos();
      
      // Creamos partículas Halloween cuando la boca está abierta
      if (jawOpen && frameCount % 3 === 0) {
        createHalloweenParticles();
      }
    }
  } 

  clearDepth();

  // Actualizamos y dibujamos las partículas
  updateParticles();
  drawParticles();

  // Interacciones para rotar el texto 3D
  let targetRotY = map(jawOpenValue, 0, 1, 0, PI * 0.05);
  rotY = lerp(rotY, targetRotY, 0.3);

  // Dibujamos el texto 3D Halloween
  if (blockText && cameraInitialized) {
    push();
    translate(0, -newVideoHeight/2 - 100);
    rotateX(0);  
    rotateY(rotY);
    jawOpen ? fill(...COLORS.GREEN) : fill(...COLORS.WHITE);
    model(blockText);
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
      
    // Procesar blendshapes (deformaciones)
    if (detectionResults.faceBlendshapes && detectionResults.faceBlendshapes.length > 0) {
        const blendshapes = detectionResults.faceBlendshapes[0].categories;
        
        for (let i = 0; i < blendshapes.length; i++) {
          if (blendshapes[i].categoryName === 'jawOpen') {
            jawOpenValue = blendshapes[i].score;
            jawOpen = jawOpenValue > jawOpenThreshold;
            break
          }
         
        }
    }
    
    // Procesar landmarks faciales (posiciones)
    if (detectionResults.faceLandmarks && detectionResults.faceLandmarks.length > 0) {
      const landmarks = detectionResults.faceLandmarks[0];
      
      // Landmarks clave para la boca según MediaPipe Face Model
      const upperLip = landmarks[13];   // Centro labio superior
      const lowerLip = landmarks[14];   // Centro labio inferior
      const leftCorner = landmarks[61]; // Comisura izquierda
      const rightCorner = landmarks[291]; // Comisura derecha
      
      // Calcular centro de la boca
      const normalizedMouthX = (upperLip.x + lowerLip.x) / 2;
      const normalizedMouthY = (upperLip.y + lowerLip.y) / 2;
      
      // Convertir coordenadas normalizadas (0-1) a coordenadas del canvas WEBGL
      // MediaPipe coordenadas están espejadas, así que invertimos X
      mouthCenterX = map(1 - normalizedMouthX, 0, 1, -newVideoWidth/2, newVideoWidth/2);
      mouthCenterY = map(normalizedMouthY, 0, 1, -newVideoHeight/2, newVideoHeight/2);
      
      // Debug: mostrar coordenadas
      //console.log(`Boca en: (${mouthCenterX.toFixed(1)}, ${mouthCenterY.toFixed(1)})`);
    }
  }
}

function creditos() {
  push();
  translate(0, newVideoHeight/2 + 50);
  
 
      fill(...COLORS.BLACK);
      textSize(20);
      textFont(cursiveFont);
      text('Laboratorio HealthySmile', 0, 0);
   
  pop();
}

// FUNCIÓN PARA CREAR PARTÍCULAS HALLOWEEN - Desde posición real de la boca
function createHalloweenParticles() {
  // Usar coordenadas reales detectadas por MediaPipe
  let x = mouthCenterX ;
  let y = mouthCenterY;;
  //console.log("Creando partícula en: ", x, y);
  
  // Colores Halloween definidos
  let colorRandom = random(Object.values(COLORS));
  
  // Tamaño basado en apertura de boca
  let particleSize = map(jawOpenValue, 0, 1, 1, 25);
  let type = random(['spark', 'brush']);
  
  // Dirección basada en mouthFunnel para efectos de soplo
  let particle = new Particle(x, y, particleSize, colorRandom, 1000, type);
  
  particles.push(particle);
}

// FUNCIÓN PARA ACTUALIZAR PARTÍCULAS - Con acumulación en el suelo
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
    
    // Eliminar solo cuando la vida se agota o alpha es muy bajo
    if (particles[i].life <= 0 || particles[i].alpha < 0.5) {
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
// FUNCIÓN PARA DIBUJAR INTERFAZ DE USUARIO
function drawUI() {
   push();
      rectMode(CENTER);
      noStroke();
      fill(...COLORS.WHITE);
      rect(0, 40, newVideoWidth + 20, newVideoHeight + 100);  
      pop();

      // Dibujamos el video capturado con efecto espejo
      push();
      scale(-1, 1);
      imageMode(CENTER);
      image(capture, 0, 0, newVideoWidth, newVideoHeight);
      pop();

      push();
      // Posicionamos donde queremos la imagen
      translate(-width/2, -height/2 - 10);
      imageMode(CORNER);
      image(img, 0, 0, 400, 400 / (img.width / img.height));
      pop();

      push();
      translate(width/2 - 200, -height/2 + 50);
      imageMode(CORNER);
      image(img2, 0, 0, 200, 200 / (img2.width/ img2.height));
      pop();

      push();
      translate(-width/2 +200, height/2 - 100);
      rotate(PI/4); // 45 grados
      imageMode(CENTER);
      image(img2, 0, 0, 100, 100 / (img2.width/ img2.height));
      pop();

      push();
      translate(width/2 -410, height/2 - 370);
      imageMode(CORNER);
      image(img3, 0, 0, 400, 400 / (img3.width/ img3.height));
      pop();

      push();
      translate(newVideoWidth/2, -newVideoHeight/2);
      rotate(PI/4); // 45 grados
      imageMode(CENTER);
      image(adhesivo, 0, 0, 150, 150 / (adhesivo.width / adhesivo.height));
      pop();

      push();
      translate(-newVideoWidth/2, -newVideoHeight/2);
      rotate(-PI/4); // 45 grados
      imageMode(CENTER);
      image(adhesivo2, 0, 0, 150, 150 / (adhesivo2.width / adhesivo2.height));
      pop();

      push();
      translate(newVideoWidth/2, newVideoHeight/2 + 100);
      rotate(-PI/4); // 45 grados
      imageMode(CENTER);
      image(adhesivo3, 0, 0, 150, 150 / (adhesivo3.width / adhesivo3.height));
      pop();

      push();
      translate(-newVideoWidth/2, newVideoHeight/2 + 100);
      rotate(PI/4); // 45 grados
      imageMode(CENTER);
      image(adhesivo3, 0, 0, 150, 150 / (adhesivo3.width / adhesivo3.height));
      pop();
      
      // Aplicamos un overlay semitransparente para el efecto Halloween
      push();
      noStroke();
      fill(...COLORS.BLACK, 100);
      plane(newVideoWidth, newVideoHeight);
      pop();
}

// Función para reposicionar botones en caso de resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Reposicionar botones
  if (startButton) {
      startButton.position(windowWidth - 250, 20);
  }
  if (stopButton) {
      stopButton.position(windowWidth - 50, 20);
  }
}


