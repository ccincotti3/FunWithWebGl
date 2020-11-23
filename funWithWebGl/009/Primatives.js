const Primatives = {}

Primatives.Quad = class {
  static createModel(gl) { return new Model(Primatives.Quad.createMesh(gl)) }
  static createMesh(gl) {
    const aVert = [
      -0.5, 0.5, 0,
      -0.5, -0.5, 0,
      0.5, -0.5, 0,
      0.5, 0.5, 0
    ]
    const aUv = [
      0,0,
      0,1,
      1,1,
      1,0
    ]
    const aIndex = [
      0,1,2,
      2,3,0
    ]
    const mesh = gl.fCreateMeshVAO("Quad", aIndex, aVert, null, aUv)
    mesh.noCulling = true
    mesh.doBlending = true

    return mesh
  }
}

Primatives.MultiQuad = class {
  static createModel(gl){ return new Model(Primatives.MultiQuad.createMesh(gl)); }
  static createMesh(gl){
    var	aIndex = [ ], //0,1,2, 2,3,0
      aUV = [ ], //0,0, 0,1, 1,1, 1,0 
      aVert = [];		

    for(var i=0; i < 10; i++){
      //Calculate a random size, y rotation and position for the quad
      var size = 0.2 + (0.8* Math.random()),		//Random Quad Size in the range of 0.2 - 1.0
        half = size * 0.5,						//Half of size, this is the radius for rotation
        angle = Math.PI * 2 * Math.random(),	//Random angle between 0 - 360 degrees in radians
        dx = half * Math.cos(angle),			//Calc the x distance, used as an offset for the random position
        dy = half * Math.sin(angle),			//Calc the y distance, for same offset but used in z 
        x = -2.5 + (Math.random()*5),			//Random position between -2.5 - 2.5
        y = -2.5 + (Math.random()*5),			
        z = 2.5 - (Math.random()*5),
        p = i * 4;								//Index of the first vertex of a quad

      //Build the 4 points of the quad
      aVert.push(x-dx, y+half, z-dy);		//TOP LEFT
      aVert.push(x-dx, y-half, z-dy);		//BOTTOM LEFT
      aVert.push(x+dx, y-half, z+dy);		//BOTTOM RIGHT			
      aVert.push(x+dx, y+half, z+dy);		//TOP RIGHT

      aUV.push(0,0, 0,1, 1,1, 1,0);		//Quad's UV
      aIndex.push(p,p+1,p+2, p+2,p+3,p);	//Quad's Index
    }

    var mesh = gl.fCreateMeshVAO("MultiQuad",aIndex,aVert,null,aUV);
    mesh.noCulling = true;
    mesh.doBlending = true;
    return mesh;
  }
}

/**
 * Bad because when rendered, because we only have 8 points,
 * so we only have 8 attributes of information.
 * So you can't define individual faces, and thus the color
 * will interpolate across the whole cube rather than
 * each face getting it's own color.
 * 
 * Each face has to be a quad, and then you tie them all together.
 * So like you can make a cube this way, but if you add attributes like color, textures etc,
 * you're relatively limited.
 */
Primatives.CubeBad = class {
  static createModel(gl){ return new Model(Primatives.CubeBad.createMesh(gl)); }
  static createMesh(gl){
    var aVert = [
        -0.5,0.5,0,0, -0.5,-0.5,0,0, 0.5,-0.5,0,0, 0.5,0.5,0,0,			//Front
        0.5,0.5,-1,1, 0.5,-0.5,-1,1, -0.5,-0.5,-1,1, -0.5,0.5,-1,1		//Back
      ],
      aUV = [
        0,0, 0,1, 1,1, 1,0, 
        0,0, 0,1, 1,1, 1,0
      ],
      aIndex = [
        0,1,2, 2,3,0, //Front
			  4,5,6, 6,7,4, //Back
			  3,2,5, 5,4,3, //Right
			  7,0,3, 3,4,7, //Top
			  7,6,1, 1,0,7  //Left
			 ];
    return gl.fCreateMeshVAO("Cube",aIndex,aVert,null,aUV,4);
  }
}

Primatives.GridAxis = class {
  static createModel(gl, inclAxis) { return new Model(Primatives.GridAxis.createMesh(gl, inclAxis)) }
  static createMesh(gl, inclAxis) {
    // const verts = [ 0, 0.5, 0, 0,  0, -0.5, 0, 1 ]
    //Dynamiclly create a grid
    var verts = [],
      size = 1.8,			// W/H of the outer box of the grid, from origin we can only go 1 unit in each direction, so from left to right is 2 units max
      div = 10.0,			// How to divide up the grid
      step = size / div,	// Steps between each line, just a number we increment by for each line in the grid.
      half = size / 2;	// From origin the starting position is half the size.

    var p;	//Temp variable for position value.
    for(var i=0; i <= div; i++){
      //Vertical line
      p = -half + (i * step);
      verts.push(p);		//x1
      verts.push(0);		//y1
      verts.push(half);	//z1
      verts.push(0);		//c2

      verts.push(p);		//x2
      verts.push(0);	    //y2
      verts.push(-half);	//z2
      verts.push(0);		//c2

      //Horizontal line
      p = half - (i * step);
      verts.push(-half);	//x1
      verts.push(0);		//y1
      verts.push(p);		//z1
      verts.push(0);		//c1

      verts.push(half);	//x2
      verts.push(0);		//y2
      verts.push(p);		//z2
      verts.push(0);		//c2
    }

    if(inclAxis) {
      // x axis
      verts.push(-1.1);   //x1
      verts.push(0);   //y1
      verts.push(0);   //z1
      verts.push(1);   //c1

      verts.push(1.1);   //x1
      verts.push(0);   //y1
      verts.push(0);   //z1
      verts.push(1);   //c1

      //y axis
      verts.push(0);//x1
      verts.push(-1.1);	//y1
      verts.push(0);		//z1
      verts.push(2);		//c2

      verts.push(0);		//x2
      verts.push(1.1);	//y2
      verts.push(0);		//z2
      verts.push(2);		//c2

      //z axis
      verts.push(0);		//x1
      verts.push(0);		//y1
      verts.push(-1.1);	//z1
      verts.push(3);		//c2

      verts.push(0);		//x2
      verts.push(0);		//y2
      verts.push(1.1);	//z2
      verts.push(3);		//c2
    }


    const attrColorLoc = 4; // Same that we set up in shader. Define here so we can use it.
    const mesh = {
      vao: gl.createVertexArray(),
      drawMode: gl.LINES,
    }

    mesh.vertexComponentLen = 4
    mesh.vertexCount = verts.length / mesh.vertexComponentLen;

    const strideLen = Float32Array.BYTES_PER_ELEMENT * mesh.vertexComponentLen // Vertex size in bytes

    // Setup the buffer
    mesh.bufVertices = gl.createBuffer();

    gl.bindVertexArray(mesh.vao)

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bufVertices)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(ATTR_POSITION_LOC)
    gl.enableVertexAttribArray(attrColorLoc)

    gl.vertexAttribPointer(
      ATTR_POSITION_LOC,
      3,
      gl.FLOAT,
      false,
      strideLen,
      0
    )
    gl.vertexAttribPointer(
      attrColorLoc,
      1,
      gl.FLOAT,
      false,
      strideLen,
      Float32Array.BYTES_PER_ELEMENT * 3
    )

    //Cleanup
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.mMeshCache["grid"] = mesh;
    return mesh;
  }
}