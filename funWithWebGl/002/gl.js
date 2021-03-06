function GLInstance() {
  const canvasEl = document.createElement("canvas");
  document.querySelector('body').appendChild(canvasEl);

  const gl = canvasEl.getContext("webgl2")
  if(!gl){ console.error("WebGL context is not available."); return null; }

  console.log("WebGL2 initialized")

  // -----------------------------------------------------------------------
  // Configuration setup
  gl.clearColor(1.0, 1.0, 1.0, 1.0); //white;

  // -----------------------------------------------------------------------
  // Methods
  gl.fClear = function(){
    this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT);
    return this;
  }

  gl.fCreateArrayBuffer = function(floatAry, isStatic = true) {
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER, floatAry, isStatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,null); 

    return buffer;
  }

  // -----------------------------------------------------------------------
  // Setters and Getters

  //Set the size of the canvas html element and the rendering view port
  gl.fSetSize = function(w,h){
    //set the size of the canvas, on chrome we need to set it 3 ways to make it work perfectly.
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.canvas.width = w;
    this.canvas.height = h;

    //when updating the canvas size, must reset the viewport of the canvas 
    //else the resolution webgl renders at will not change
    this.viewport(0,0,w,h);
    return this;
  }

  return gl;
}