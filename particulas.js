class Particle {
  constructor(x, y, size, col, life, type = 'spark') {
    this.pos = createVector(x, y);                           // posición actual
    this.vel = p5.Vector.random2D().mult(random(0.3, 5.5));  // velocidad inicial
    if (type === 'brush') this.vel.mult(0.6);                // brochazo = movimiento más suave
    this.size = size * random(0.6, 1.4);                     // tamaño con ligera variación
  // Aseguro un p5.Color válido
  // Si ya viene un p5.Color (tiene .levels), lo uso; si no, convierto o aplico un fallback
    this.color = (col && col.levels) ? col : color(col || '#FF8A00');
    this.life = life;                                        // vida total en frames
    this.age = 0;                                            // edad en frames
    this.type = type;                                        // 'spark' o 'brush'
    this.angle = random(TWO_PI);                             // orientación inicial
    this.spin = random(-0.1, 0.1);                           // giro por frame
    this.alpha = 255;
    
    // Propiedades para física de acumulación
    this.gravity = 0.1;        // Fuerza de gravedad
    this.bounce = 0.3;         // Factor de rebote
    this.friction = 0.95;      // Fricción en el suelo
    this.isGrounded = false;   // Si está en el suelo
  }
  update() {
    if (this.life > 0) {
      this.vel.y += this.gravity;
      this.pos.add(this.vel);
      
      let groundLevel = height/2 ;
      if (this.pos.y >= groundLevel - this.size/2) {
        this.pos.y = groundLevel - this.size/2;
        this.vel.y *= -this.bounce;
        this.vel.x *= this.friction;
        this.isGrounded = true;
        
        if (abs(this.vel.y) < 0.5) {
          this.vel.y = 0;
        }
      }
      
      let leftBound = -width/2 + this.size/2;
      let rightBound = width/2 - this.size/2;
      
      if (this.pos.x <= leftBound || this.pos.x >= rightBound) {
        this.pos.x = constrain(this.pos.x, leftBound, rightBound);
        this.vel.x *= -this.bounce;
      }
    }
    
    this.life -= 1;
  }
  draw() {
    push();
    
    // Aplicar transparencia con la paleta de colores Halloween
    let r = red(this.color);
    let g = green(this.color);
    let b = blue(this.color);
    fill(r, g, b, this.alpha);
    
    noStroke();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    noStroke();
    
  // Salvaguarda por si color se hubiese perdido
  const col = (this.color && this.color.levels) ? this.color : color(this.color || '#FF8A00');
    
    if (this.type === 'spark') {
      // chispa circular con alpha que decae con la edad
      const a = map(this.age, 0, this.life, 255, 0);
      ellipse(0, 0, this.size);
    } else if (this.type === 'brush') {
      // brochazo rectangular con bordes redondeados
      fill(red(col), green(col), blue(col), 180);
      rectMode(CENTER);
      rect(0, 0, this.size * 2.2, this.size * 0.7, 6);
    }
    
    pop();
  }
}