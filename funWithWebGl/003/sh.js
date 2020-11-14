class Shader {
    constructor(gl, vertShaderSrc, fragShaderSrc) {
        this.program = ShaderUtil.createProgramFromText(gl, vertShaderSrc, fragShaderSrc, true)

        if (this.program) {
            this.gl = gl
            gl.useProgram(this.program);
            this.attribLoc = ShaderUtil.getStandardAttribLocations(gl, this.program)
            this.uniformLoc = {} //To be used in later lessons
        }
    }

    activate() {
        this.gl.useProgram(this.program);
        return this;
    }

    deactivate() {
        this.gl.useProgram(null);
        return this;
    }

    dispose() {
        if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) {
            this.gl.useProgram(null)
        }
        this.gl.deleteProgram(this.program)
    }

    // Abstract method 
    preRender() {}

    renderModel(model) {
        this.gl.bindVertexArray(model.mesh.vao);

        if(model.mesh.indexCount) {
            this.gl.drawElements(
                model.mesh.drawMode,
                model.mesh.indexLength,
                gl.UNSIGNED_SHORT,
                0
            )
        } else {
            this.gl.drawArrays(
                model.mesh.drawMode, 0, model.mesh.vertexCount
            )
        }
        this.gl.bindVertexArray(null)
        
        return this;
    }

}

class ShaderUtil {
    static  domShaderSrc(id) {
        const shaderSrc = document.getElementById(id);
        if (!shaderSrc || !shaderSrc.innerText) {
            console.error("Shader source not found")
        }
        return shaderSrc.innerText
    }

    static createShader(gl, src, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader)

        //Get Error data if shader failed compiling
		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
			console.error("Error compiling shader : " + src, gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}

		return shader;
    }

    static createProgram(gl, vShader, fShader, doValidate) {
        const prog = gl.createProgram();
        gl.attachShader(prog, vShader);
        gl.attachShader(prog, fShader);

        // Force predefined locations for specific attributes. If the attribute isn't used in the shader, it's location will default to -1.
        gl.bindAttribLocation(prog, ATTR_POSITION_LOC, ATTR_POSITION_NAME)
        gl.bindAttribLocation(prog, ATTR_NORMAL_LOC, ATTR_NORMAL_NAME)
        gl.bindAttribLocation(prog, ATTR_UV_LOC, ATTR_UV_NAME)

        gl.linkProgram(prog)

        //Check if successful
		if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
			console.error("Error creating shader program.",gl.getProgramInfoLog(prog));
			gl.deleteProgram(prog); return null;
		}

		//Only do this for additional debugging.
		if(doValidate){
			gl.validateProgram(prog);
			if(!gl.getProgramParameter(prog,gl.VALIDATE_STATUS)){
				console.error("Error validating program", gl.getProgramInfoLog(prog));
				gl.deleteProgram(prog); return null;
			}
		}

        // clean up
        gl.detachShader(prog, fShader);
        gl.detachShader(prog, vShader);
        gl.deleteShader(fShader);
        gl.deleteShader(vShader);

        return prog
    }

    static domShaderProgram(gl, vectID, fragID, doValidate = true) {
          // Get the shader sources
          const vShaderSrc = ShaderUtil.domShaderSrc(vectID); if(!vShaderSrc) { return ShaderUtil.handleError("vShaderSrc not found") }
          const fShaderSrc = ShaderUtil.domShaderSrc(fragID); if(!fShaderSrc) { return ShaderUtil.handleError("fShaderSrc not found")}
  
          // Compile the shaders from the sources
          const vShader = ShaderUtil.createShader(gl, vShaderSrc, gl.VERTEX_SHADER);  if(!vShader) { return ShaderUtil.handleError("vShader not created")}
          const fShader = ShaderUtil.createShader(gl, fShaderSrc, gl.FRAGMENT_SHADER); if(!fShader) { gl.deleteShader(vShader); return ShaderUtil.handleError("fShader no created")}
  
          // link the two shaders and create a program
          const shaderProg = ShaderUtil.createProgram(gl, vShader, fShader, doValidate)

          return shaderProg
    }

    static createProgramFromText(gl,vShaderTxt, fShaderTxt, doValidate = true) {
        // Compile the shaders from the sources
        const vShader = ShaderUtil.createShader(gl, vShaderTxt, gl.VERTEX_SHADER);  if(!vShader) { return ShaderUtil.handleError("vShader not created")}
        const fShader = ShaderUtil.createShader(gl, fShaderTxt, gl.FRAGMENT_SHADER); if(!fShader) { gl.deleteShader(vShader); return ShaderUtil.handleError("fShader no created")}

        // link the two shaders and create a program
        const shaderProg = ShaderUtil.createProgram(gl, vShader, fShader, doValidate)

        return shaderProg
    }

    // Get the locations of standard attribs that we'll be using. Location will be -1 if not found (not being used in shader)
    static getStandardAttribLocations(gl, program) {
        return {
            position: gl.getAttribLocation(program, ATTR_POSITION_NAME),
            norm: gl.getAttribLocation(program, ATTR_NORMAL_NAME),
            uv: gl.getAttribLocation(program, ATTR_UV_NAME)
        }
    }

    static handleError(...err) {
        console.error(err)
        return null
    }
}