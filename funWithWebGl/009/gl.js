//--------------------------------------------------
// Global Constants 
//--------------------------------------------------
const ATTR_POSITION_NAME	= "a_position";
const ATTR_POSITION_LOC		= 0;
const ATTR_NORMAL_NAME		= "a_norm";
const ATTR_NORMAL_LOC		= 1;
const ATTR_UV_NAME			= "a_uv";
const ATTR_UV_LOC			= 2;

class GlUtil { 
  //Convert Hex colors to float arrays -> values btwn 0 and 1
  // Accepts formats with/out # -> #FF0000, 00FF00,
  static rgbArray(...args) {
    if (!args.length) { return null; }
    const rtn = [];
    for (let i = 0; i < args.length; i++) {
      const hex = args[i];
      if(hex.length < 6) {
        continue
      }
      const p = hex[0] === "#" ? 1 : 0 //Determine starting position

      rtn.push(
        parseInt(hex[p] + hex[p+1],16) / 255.0,
        parseInt(hex[p+2] + hex[p+3],16) / 255.0,
        parseInt(hex[p+4] + hex[p+5],16) / 255.0,
      )
    }
    return rtn
  }
}


function GLInstance() {
  const canvasEl = document.createElement("canvas");
  document.querySelector('body').appendChild(canvasEl);

  const gl = canvasEl.getContext("webgl2")
  if(!gl){ console.error("WebGL context is not available."); return null; }

  console.log("WebGL2 initialized")

  //...................................................
  //Setup custom properties
  gl.mMeshCache = [];	//Cache all the mesh structs, easy to unload buffers if they all exist in one place.
  gl.mTextureCache = [];	//Cache all the mesh structs, easy to unload buffers if they all exist in one place.

  // -----------------------------------------------------------------------
  // Setup gl, configuration setup.. a lot of these are gl defaults, but we're being explicit
  gl.cullFace(gl.BACK); // We're saying do not render the back of a triangle, BACK is default.
  gl.frontFace(gl.CCW) // render triangles in a counter clockwise fashion. CCW is default
  gl.enable(gl.DEPTH_TEST) // We're saying to render pixels that are closer to the camera, rather than overwriting ones that are rendered later in loop
  gl.enable(gl.CULL_FACE) // Cull back face, so only show triangles that are created clockwise 
  gl.depthFunc(gl.LEQUAL) // for depth test, less than equal to
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA) // to allow us to use alpha channel

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

  // Turns arrays into GL buffers, then setup a VAO that will predefine the buffers to standard shader attributes.
  gl.fCreateMeshVAO = function(name, aryInd, aryVert, aryNorm, aryUV) {
    const rtn = { drawMode: this.TRIANGLES }

    rtn.vao = this.createVertexArray();
    this.bindVertexArray(rtn.vao) // Binding a VAO makes it so all global calls actually now work on the VAO (like vertexAttribPointer, enableVertexAttribArray)

    //.......................................................
    //Set up vertices
    if(aryVert !== undefined && aryVert != null){
      rtn.bufVertices = this.createBuffer(); // create buffer
      rtn.vertexComponentLen = 3; // How many floats make up a vertext
      rtn.vertexCount = aryVert.length / rtn.vertexComponentLen; //How man vertices in the array

      // BAU, but now we are operating on the VAO.
      this.bindBuffer(this.ARRAY_BUFFER,rtn.bufVertices);
      this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryVert), this.STATIC_DRAW);

      // Remember, we are now operating on the bound VAO, since we bound it above
      this.enableVertexAttribArray(ATTR_POSITION_LOC);					//Enable the position attribute in the shader
      this.vertexAttribPointer(ATTR_POSITION_LOC, 4, this.FLOAT, false, 0, 0);	//Set which buffer the attribute will pull its data from
    }

    // Now do for others
    if(aryNorm !== undefined && aryNorm != null){
      rtn.bufNormals = this.createBuffer(); // create buffer

      // BAU, but now we are operating on the VAO.
      this.bindBuffer(this.ARRAY_BUFFER,rtn.bufNormals);
      this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryNorm), this.STATIC_DRAW);

      // Remember, we are now operating on the bound VAO, since we bound it above
      this.enableVertexAttribArray(ATTR_NORMAL_LOC);					//Enable the position attribute in the shader
      this.vertexAttribPointer(ATTR_NORMAL_LOC, 3, this.FLOAT, false, 0, 0);	//Set which buffer the attribute will pull its data from
    }

    if(aryUV){
      rtn.bufUV = this.createBuffer(); 

      this.bindBuffer(this.ARRAY_BUFFER,rtn.bufUV);
      this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryUV), this.STATIC_DRAW);

      this.enableVertexAttribArray(ATTR_UV_LOC);
      this.vertexAttribPointer(ATTR_UV_LOC, 2, this.FLOAT, false, 0, 0);	// 2 floats ONLY per component.
    }

    if(aryInd) {
      rtn.bufIndex = this.createBuffer(); 
      rtn.indexCount = aryInd.length;

      this.bindBuffer(this.ELEMENT_ARRAY_BUFFER,rtn.bufIndex);
      this.bufferData(this.ELEMENT_ARRAY_BUFFER, new Uint16Array(aryInd), this.STATIC_DRAW);
      // this.bindBuffer(this.ELEMENT_ARRAY_BUFFER,null); For some reason this broke everything. Why
      /**
             * Since there always exists just one ELEMENT_ARRAY_BUFFER, the VAO stores the last binding state of this buffer type. Thus the index buffer has to be bound up to the moment where the VAO gets unbound.
             * https://stackoverflow.com/questions/33651162/vertex-array-objects-binding-order
             */
    }
    // Clean up
    this.bindVertexArray(null); //Unbind the VAO, very Important. always unbind when your done using one.
    this.bindBuffer(this.ARRAY_BUFFER, null); //Unbind any buffers that might be set
    if(aryInd)  this.bindBuffer(this.ELEMENT_ARRAY_BUFFER,null);


    this.mMeshCache[name] = rtn;
    console.log(rtn)
    return rtn;
  }

  gl.fLoadTexture = function(name, img, doYFlip) {
    const tex = this.createTexture();
    
    if(doYFlip === true) { this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true) } // Flip Y coords of UV's upside down. Blender puts UV's upside down. If texture seems mangled, see if this does anything.
    this.bindTexture(this.TEXTURE_2D, tex) // Set texture buffer
    this.texImage2D(this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, img) // Push img to GPU.

    // setup scaling
    this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR) // Scale up
    this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR_MIPMAP_NEAREST) // Scale down
    this.generateMipmap(this.TEXTURE_2D) //Precalc different sizes of texture for better quality rendering

    this.bindTexture(this.TEXTURE_2D, null)
    this.mTextureCache[name] = tex

    if(doYFlip === true) { this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false) } // Flip Y coords of UV's upside down. Blender puts UV's upside down. If texture seems mangled, see if this does anything.

    return tex
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
    
  // Fit canvas to percentage of screen
  gl.fFitScreen = function(wp = 1, hp = 1) {
    return this.fSetSize(window.innerWidth * wp, window.innerHeight * hp)
  }

  return gl;
}