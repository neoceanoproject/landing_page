var canvas = document.createElement('canvas'),
    сtx = canvas.getContext('2d');
    
canvas.height = document.documentElement.clientHeight;
canvas.width = document.documentElement.clientWidth;

document.body.appendChild(canvas);

сtx.fillStyle = 'black';
сtx.fillRect(0,0,canvas.width,canvas.height);

// VHS glitch options
var lineLifeMin = 40,
    lineLifeMax = 150,
    maxLines = 8,
    lineMinHeight = 2,
    lineMaxHeight =40,
    lineVYMin = 0,
    lineVYMax = 3.5,
    glitchPerFrameMin = 1,
    glitchPerFrameMax = 2,
    
    glitchParticleAmp = 30,
    glitchVAmpMin = -100,
    glitchVAmpMax = -200,
    glitchMinHeight = 1,
    glitchMaxHeight = 3,
    glitchMinWidth = 60,
    glitchMaxWidth = 200;


// Hashes 
var glitchLines = {},
    LinesCount = 0,
    linesLength = 0;


function rand(min,max){
  return Math.random() * (max - min) + min;
}

function background(){
  сtx.fillStyle = 'rgba(0,0,0,'+rand(0.01,0.2)+')';
  сtx.fillRect(0,0,canvas.width,canvas.height);
}

function glitchLine() {
  this.height = rand(lineMinHeight,lineMaxHeight);
  // Start Y and end Y   
  this.sy = rand(0,canvas.height);
  this.ey = this.sy + this.height;
  this.vy = rand(lineVYMin,lineVYMax);
  this.gpf = rand(glitchPerFrameMin,glitchPerFrameMax);
  
  this.particles = {};
  this.particleCount = 0;
  
  this.life = rand(lineLifeMin,lineLifeMax);
  linesLength++;
  LinesCount++;
  glitchLines[LinesCount] = this;
  this.id = LinesCount;
  
}

function glitchParticle(id,sy,ey){
  this.y = rand(sy,ey);
  this.x = rand(0, canvas.width + 50);
  this.vx = rand(glitchVAmpMin,glitchVAmpMax);
  this.vy = 2;
  this.width = rand(glitchMinWidth,glitchMaxWidth);
  this.height = rand(glitchMinHeight,glitchMaxHeight)
  this.color = 'rgba(255,255,255,'+rand(-1.5,1)+')';
  
  this.lineId = id;
  glitchLines[id].particleCount += 1;
  this.id = glitchLines[id].particleCount;
  glitchLines[id].particles[this.id] = this;
  
}

glitchLine.prototype.draw = function(){
  this.sy += this.vy;
  this.ey += this.vy;
  
  for (var i in this.particles){
    this.particles[i].draw();
  }
  this.life -= 1;
  
  for (var i = 0;i< this.gpf;i++){
    new glitchParticle(this.id,this.sy,this.ey);
  }

  
  if (this.life <= 0 || this.sy > canvas.height){
    delete glitchLines[this.id];
    linesLength -= 1;
  }
}

glitchParticle.prototype.draw = function(){
  this.x += this.vx;
  this.y += this.vy;
  this.width /= 0.992;
  
  if (this.x < 0){
    delete glitchLines[this.lineId][this.id];
  }
  
  
 сtx.fillStyle = this.color;
 сtx.fillRect(this.x,this.y,this.width,this.height);
  
}

for(var i = 0;i<maxLines;i++){
  setTimeout(function(){
    new glitchLine();
  },rand(10,400));
}

setInterval(function(){
  background();
  
  if (linesLength < maxLines){
    new glitchLine();
    сtx.fillStyle = 'black';
сtx.fillRect(0,0,canvas.width,canvas.height);
  }
  
  for (var i in glitchLines){
    glitchLines[i].draw();
  }
},5);