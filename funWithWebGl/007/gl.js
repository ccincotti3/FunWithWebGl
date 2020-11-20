//--------------------------------------------------
// Global Constants 
//--------------------------------------------------
const ATTR_POSITION_NAME	= "a_position";
const ATTR_POSITION_LOC		= 0;
const ATTR_NORMAL_NAME		= "a_norm";
const ATTR_NORMAL_LOC		= 1;
const ATTR_UV_NAME			= "a_uv";
const ATTR_UV_LOC			= 2;


function GLInstance() {
    const canvasEl = document.createElement("canvas");
    document.querySelector('body').appendChild(canvasEl);

    const gl = canvasEl.getContext("webgl2")
    if(!gl){ console.error("WebGL context is not available."); return null; }

    console.log("WebGL2 initialized")

    	//...................................................
	//Setup custom properties
	gl.mMeshCache = [];	//Cache all the mesh structs, easy to unload buffers if they all exist in one place.

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
            this.vertexAttribPointer(ATTR_POSITION_LOC, 3, this.FLOAT, false, 0, 0);	//Set which buffer the attribute will pull its data from
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
        }
        // Clean up
        this.bindVertexArray(null); //Unbind the VAO, very Important. always unbind when your done using one.
        this.bindBuffer(this.ARRAY_BUFFER, null); //Unbind any buffers that might be set
        if(aryInd)  this.bindBuffer(this.ELEMENT_ARRAY_BUFFER,null);


        this.mMeshCache[name] = rtn;
        console.log(rtn)
        return rtn;
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