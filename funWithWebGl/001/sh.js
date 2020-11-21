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
}