$(function(){
  /* 
    :glitchBoy
  */
  function glitchBoy(canvas, options){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.origCanvas = document.createElement('canvas');
    this.origContext = this.origCanvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.options = options;
  }
  glitchBoy.prototype.drawImage = function(img, x, y){
    this.canvas.getContext("2d").drawImage(img, x, y);
  };
  glitchBoy.prototype.glitchWave = function(renderLineHeight, cuttingHeight){
    var image = this.ctx.getImageData(0, renderLineHeight, this.width, cuttingHeight);
    this.ctx.putImageData(image, 0, renderLineHeight - 10);
  };
  glitchBoy.prototype.glitchSlip = function(waveStrength, startHeight, endHeight){
    if(endHeight < startHeight){
      var temp = endHeight;
      endHeight = startHeight;
      startHeight = temp;
    }
    for(var h = startHeight; h < endHeight; h++){
      if(Math.random() < 0.1)h++;
      var image = this.ctx.getImageData(0, h, this.width, 1);
      this.ctx.putImageData(image, Math.random()*waveStrength-(waveStrength/2), h); 
    }
  };
  glitchBoy.prototype.glitchFillRandom = function(fillCnt, cuttingMaxHeight){
    var cw = this.width;
    var ch = this.height;
    for(var i = 0; i< fillCnt; i++){
      var rndX = cw * Math.random();
      var rndY = ch * Math.random();
      var rndW = cw * Math.random();
      var rndH = cuttingMaxHeight * Math.random();
      var image = this.ctx.getImageData(rndX,rndY,rndW, rndH);
      this.ctx.putImageData(image, (rndX* Math.random())%cw, rndY);
    }
  }
  glitchBoy.prototype.process = function () {
  
  }

  /* 
    :videoGirl
  */
  function videoGirl(options, callback){
    var options = $.extend({
      src:"",
      type:'video/ogg',
      controls:false,
      autoplay:true,
      loop:true,
      muted:true
    }, options);
    var video = document.createElement('video');
    video.crossOrigin = 'anonymous'; // important!!!!
    video.controls = options.controls;
    video.autoplay = options.autoplay;
    video.loop = options.loop;
    video.muted = options.muted;
    var source = document.createElement('source');
    source.src = options.src;
    source.type = options.type;
    video.appendChild(source);
    this.video = video;
    this.source = source;
    //video.play();
    // load
    if(callback !== null){
      video.addEventListener('loadeddata', callback);
    }
  };


  // sync
  var FPS = 30;
  var frm = 0;
  var vGirl = new videoGirl({
    src:'http://upload.wikimedia.org/wikipedia/commons/b/b1/Big_buck_bunny_zoom_in.ogv',
    type:'video/ogg'
  }, sync);
  function sync(){
    var canvas = document.getElementById("myCanvas");
    var glitch = new glitchBoy(canvas);
    setInterval(function(){
      frm++;
      glitch.drawImage(vGirl.video, 0, 0); 
      glitch.glitchWave((frm * 3) % glitch.height, 10);
      if(frm %100 < 10){
        // fillCnt, cuttingMaxHeight
        glitch.glitchFillRandom(5, 20);
      }
      if(80 < frm%100){
        glitch.glitchSlip(10,200,300);
      }
      if(95 < frm%100){
        glitch.glitchSlip(10,100* Math.random(),400 * Math.random());
      }
    }, 1000/FPS);
  }

});