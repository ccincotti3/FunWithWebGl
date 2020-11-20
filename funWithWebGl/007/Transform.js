class Transform {
    constructor() {
        // transform vectors
        this.position = new Vector3(0,0,0)
        this.scale = new Vector3(1,1,1) // 1 equals no scaling
        this.rotation = new Vector3(0,0,0) // Going to store here in degrees (for visualization), but will convert to radians later on
        this.matView = new Matrix4() //Cache the results when calling updateMatrix. this will handle the transformation
        this.matNormal = new Float32Array(9) //This is a Mat3 essentially. For normals specifically, since they're transformed in a different way (only rotation and scale... not position) because they are directional based

        // Direction vectors - everytime we rotate our direction changes, these keep track of that
        // Inverse (multiply by -1 = opposite direction)
        // There are direction vectors, normalized between 0 and 1.
        this.forward = new Float32Array(4) 
        this.up = new Float32Array(4)
        this.right = new Float32Array(4)
    }

    // Big part of how the transformations are going to be handled in shader (model prerender)
    // Resource http://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/
    updateMatrix() {
        // Order of ops is important
        // TransformedVector = TranslationMatrix * RotationMatrix * ScaleMatrix * OriginalVector;
        // !!! BEWARE !!! This lines actually performs the scaling FIRST, and THEN the rotation, and THEN the translation. This is how matrix multiplication works.

        this.matView.reset() // Back to identity matrix (1, 0, 0, 0 , 1 ...)
        .vtranslate(this.position)
        .rotateX(this.rotation.x * Transform.deg2Rad)
        .rotateZ(this.rotation.z * Transform.deg2Rad)
        .rotateY(this.rotation.y * Transform.deg2Rad)
        .vscale(this.scale)

        //Calculate the Normal Matrix which doesn't need translate, then transpose and inverse the mat4 to mat 3
        // this operates directly on this.matNormal
        Matrix4.normalMat3(this.matNormal, this.matView.raw)

        // Determine Direction after all the transformations.
        // Operate directly on our direction vec (first arg).
        Matrix4.transformVec4(this.forward, [0,0,1,0], this.matView.raw) //Z
        Matrix4.transformVec4(this.up, [0,0,1,0], this.matView.raw) //Y
        Matrix4.transformVec4(this.right, [0,0,1,0], this.matView.raw) //X

        return this.matView.raw
    }

    // A copy of some logic from above, we would use for something like cameras without the matrix math.
    updateDirection(){
        Matrix4.transformVec4(this.forward, [0,0,1,0], this.matView.raw) //Z
        Matrix4.transformVec4(this.up, [0,0,1,0], this.matView.raw) //Y
        Matrix4.transformVec4(this.right, [0,0,1,0], this.matView.raw) //X

        return this
    }

    getViewMatrix(){ return this.matView.raw }
    getNormalMatrix(){ return this.matNormal }

    reset() {
        this.position.set(0,0,0)
        this.scale.set(1,1,1)
        this.rotation.set(0,0,0)
    }
}

Transform.deg2Rad = Math.PI/180 // Cache result, one less op to do for each iteration/update