class ObjLoader {
  static domToMesh(gl, meshName,elmID,flipYUV, keepRawData = true) {
    const d = ObjLoader.parseFromDom(elmID, flipYUV);
    const mesh = gl.fCreateMeshVAO(meshName, ...d, 3)
    if(keepRawData) {
      mesh.aIndex = d[0];
      mesh.aVert = d[1];
      mesh.aNorm = d[2];
    }
    return mesh
  }

  // flipYUV is to flip uv since blender works opposite than what we would expect.
  static parseFromDom(elmID, flipYUV) {
    return ObjLoader.parseObjText(document.getElementById(elmID).innerHTML, flipYUV)
  }

  static parseObjText(txt, flipYUV) {
    txt = txt.trim() + "\n"; // add newline to be able to access last line in the for loop

    // Object files are compressed, we need to take this
    // info and rebuilt in webgl

    // Basically.. 
    // aCache - save unique value of 3 components together in the event of repeat groups
    // c## is what comes from the file
    // f## is what we're actually going to rebuild in webgl
    let line, // line text from obj file
      itm, // line split into an array
      //   ary, // Itm split into an array, used for faced decoding
      //   ind, // used to calculated index of the cache arrays
      isQuad = false, // Determine if face is a quad or not
      aCache = {}, // Cache Dictionary key = itm array element, val = final index of the vertice
      cVert = [], // Cache Vertice array read from obj
      cNorm = [], // Cache Normal array
      cUV = [], // Cache UV array
      fVert = [], // Final Index sorted Vertice Array
      fNorm = [], // Final Index Sorted Normal Array
      fUV = [], // Final Index Sorted UV Array
      fIndex = [] // Final SortedIndex Array
        
    let i; // iterator
    let fIndexCnt = 0 // Final count of unique vertices
    let posA = 0
    let posB = txt.indexOf("\n", 0)

    while(posB > posA) {
      line = txt.substring(posA, posB).trim();

      switch(line.charAt(0)){
        // Cache Vertex Data for Index processing when going through face data
        // Sample Data (x, y, z)
        // v -1.000000 1.000000 1.000000  
        // vt 0.000000 0.666667
        // vn 0.000000A 0.000000 -1.000000
        case "v":
          itm = line.split(" ");
          itm.shift(); // remove "v"
          switch(line.charAt(1)) {
            case " ": cVert.push(parseFloat(itm[0]), parseFloat(itm[1]), parseFloat(itm[2]) ); break; // VERTEX
            case "t": cUV.push(parseFloat(itm[0]), parseFloat(itm[1]) ); break; // UV
            case "n": cNorm.push(parseFloat(itm[0]), parseFloat(itm[1]), parseFloat(itm[2]) ); break; // NORMAL
          }
          break;
        case "f":
          itm = line.split(" ");
          itm.shift(); // remove "f"
          isQuad = false;

          for(i=0; i < itm.length; i++) {
            //In the event the face is a quad
            // if its a triangle the loop will go only to i=2
            // We're going to go back 1, and create a second triangle.
            // [0,1,2,2,3,0] remember a quad is 4 points with this index array (two triangles)
            if(i === 3 && !isQuad) {
              i = 2; //Last vertex in the first triangle is the start of the 2nd triangle in a quad.
              isQuad = true;
            }
            //Has this vertex data been processed?
            if(itm[i] in aCache) {
              fIndex.push( aCache[itm[i]] ); //it has, add its index to the list
            } else {
              // New Unique vertex data, process it
              const ary = itm[i].split("/")

              //Parse Vertex Data and save final version ordered correctly by index
              let ind = (parseInt(ary[0])-1)*3
              fVert.push( cVert[ind], cVert[ind+1], cVert[ind+2]);

              //Parse Normal Data and save final version ordered correctly by index
              ind = (parseInt(ary[2])-1)*3
              fNorm.push( cNorm[ind], cNorm[ind+1], cNorm[ind+2]);

              //Parse Texture Data if available and save final version ordered correctly by index
              if(ary[1] != "") { // if no texture, it's blank
                ind = (parseInt(ary[1])-1) * 2;
                fUV.push( cUV[ind], (!flipYUV) ? cUV[ind+1] : 1-cUV[ind+1]) // flip value = 1 minus that value
              }

              //Cache the vertex item value and its new index
              //The idea is to create an index for each unique set of vertex data base on the face data
              //So when the index is found, just add the index value without duplicating vertex, normal, and texture
              aCache[ itm[i] ] = fIndexCnt
              fIndex.push(fIndexCnt)
              fIndexCnt++
            }

            //In a quad, the last vertex of the second triangle is the first vertex in the first triangle.
            if(i === 3 && isQuad) { fIndex.push(aCache[itm[0]]) }
          }
          break;
      }

      //Get ready to parse the next line of the obj data
      posA = posB+1;
      posB = txt.indexOf("\n", posA)
    }
    console.log({fIndex, fVert, fNorm, fUV, cVert})
    return [fIndex, fVert, fNorm, fUV]
  }
}