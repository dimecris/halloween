// p5.js Halloween Project - Main sketch
// Proyecto creado para la asignatura de Multimedia

let capture;
let isRunning = true;

//video
let aspectRatio, newVideoWidth, newVideoHeight;

let sonido;
let img, img2, adhesivo, adhesivo2, adhesivo3;

// Sistema de partículas Halloween
let particles = [];

// MediaPipe variables
let faceLandmarker;
let isMediaPipeReady = false;
let lastVideoTime = -1;
let jawOpen = false;
let jawOpenThreshold = 0.05; // Umbral para detectar boca abierta
let jawOpenValue = 0;

// Variables globales para coordenadas de la boca
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
  cursiveFont = await loadFont("fonts/ShantellSans-Regular.ttf");
  img = await loadImage("img/tela.png");
  img2 = await loadImage("img/murcielago.png");
  adhesivo = await loadImage("img/adhesivo.png");
  adhesivo2 = await loadImage("img/adhesivo2.png");
  adhesivo3 = await loadImage("img/adhesivo3.png");
  sonido = await loadSound("music/halloween-ghost.mp3");
 
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
    flipped: true, // Voltear el video para efecto espejo
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
      push();
      //translate(-newVideoWidth/2 - 10, -height/2 - 10);
      rectMode(CENTER);
      noStroke();
      fill(...COLORS.WHITE);
      rect(0, 40, newVideoWidth + 20,  newVideoHeight + 100);  
      pop();


      // Dibujamos el video capturado
      push();
      scale(-1, 1); // Voltear horizontalmente para efecto espejo
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

    
      creditos();
      
      // Creamos partículas Halloween cuando la boca está abierta
      if (jawOpen && frameCount % 3 === 0) { // Crear partículas cada 3 frames
        createHalloweenParticles(); // Ya no necesita parámetros, usa coordenadas globales
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
  rotY = map(jawOpenValue, 0, 0.9, 0, PI * 0.05); 

  // Con lerp para suavizar:
  let targetRotY = map(jawOpenValue, 0, 1, 0, PI * 0.05);
  rotY = lerp(rotY, targetRotY, 0.3); // Transición suave

  // Dibujamos el texto 3D Halloween
  if (blockText) {
    push();
    translate(0, - newVideoHeight/2 - 100);
    rotateX(0);  
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
      console.log(`Boca en: (${mouthCenterX.toFixed(1)}, ${mouthCenterY.toFixed(1)})`);
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
  console.log("Creando partícula en: ", x, y);
  
  // Seleccionamos colores Halloween que hemos definido
  let color = random(Object.values(COLORS));
  
  // Tamaño basado en apertura de boca
  let particleSize = map(jawOpenValue, 0, 1, 1, 25);
  let type = random(['spark', 'brush']);
  
  // Dirección basada en mouthFunnel para efectos de soplo
  let particle = new Particle(x, y, particleSize, color, 1000, type);
  
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

// windowResized() function - Canvas responsivo
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


