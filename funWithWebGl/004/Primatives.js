const Primatives = {}

Primatives.GridAxis = class {
    static createMesh(gl) {
        const verts = [ 0, 0.5, 0, 0,  0, -0.5, 0, 1 ]

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