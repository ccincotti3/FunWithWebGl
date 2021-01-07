class Terrain {
  static createModel(gl, keepRawData) {
    return new Modal(Terrain.createMesh(gl, 1, 1, 3, 3, keepRawData))
  }

  static createMesh(gl, w, h, rLen, cLen, keepRawData) {
    var rStart = w / -2,		//Starting position for rows when calculating Z position
      cStart = h / -2,		//Starting position of column when calcuating X position
      vLen = rLen * cLen,		//Total Vertices needed to create plane
      iLen = (rLen-1)*cLen,	//Total Index values needed to create the Triangle Strip (Not counting Degenerating Triangle positions)
      cInc = w / (cLen-1),	//Increment value for columns when calcuting X position
      rInc = h / (rLen-1),	//Increment value for rows when calcuating Z position
      cRow = 0,				//Current Row
      cCol = 0,				//Current Column
      aVert = []				//Vertice Array

    //..................................
    //Generate the vertices and the index array.
    for(var i=0; i < vLen; i++){
      cRow = Math.floor(i / cLen);	//Current Row
      cCol = i % cLen;				//Current Column
      //Create Vertices,x,y,z
      aVert.push(cStart+cCol*cInc, 0.2, rStart+cRow*rInc);
    }

    var mesh = gl.fCreateMeshVAO("Terrain",null,aVert,null,null,3);
    mesh.drawMode = gl.POINTS
        
    return mesh;
  }
}