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
      aVert = [],				//Vertice Array
      aIndex = []			//Index Array


    //..................................
    //Generate the vertices and the index array.
    for(var i=0; i < vLen; i++){
      cRow = Math.floor(i / cLen);	//Current Row
      cCol = i % cLen;				//Current Column
      //Create Vertices,x,y,z
      aVert.push(cStart+cCol*cInc, 0.2, rStart+cRow*rInc);

      //Create the index, We stop creating the index before the loop ends creating the vertices.
      if(i < iLen){
        //Column index of row R and R+1
        aIndex.push(cRow * cLen + cCol, (cRow+1) * cLen + cCol);

        //Create Degenerate Triangle, Last AND first index of the R+1 (next row that becomes the top row )
        if(cCol == cLen-1 && i < iLen-1) aIndex.push( (cRow+1) * cLen + cCol, (cRow+1) * cLen);
      }
    }

    var mesh = gl.fCreateMeshVAO("Terrain",aIndex,aVert,null,null,3);
    mesh.drawMode = gl.LINE_STRIP;
        
    return mesh;
  }
}