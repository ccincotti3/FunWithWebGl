// Cameras don't really exist. We're not actually moving this around
// A camera is just a transformation matrix that moves the world, instead of us moving the camera.
// If we want to move the camera back, really we're moving the world forward
// The projection matrix with the camera matrix gives this illusion
class Camera {
  // fov - field of view.
  // near - how near we can see
  // far - how far we can see
  constructor(gl, fov = 45, near = 0.1,far = 100.0) {
    this.projectionMatrix = new Float32Array(16);
    const ratio = gl.canvas.width / gl.canvas.height
    Matrix4.perspective(this.projectionMatrix, fov, ratio, near, far) // mutates directly to proj matrix

    this.transform = new Transform(); //Setup transform to control the position of the camera
    this.viewMatrix = new Float32Array(16) //Cache the matrix that will hold the inverse of the transform

    this.mode = Camera.MODE_ORBIT; //Set what mode to use
  }

  panX(v){
    if(this.mode == Camera.MODE_ORBIT) return; // Panning on the X Axis is only allowed when in free mode
    this.updateViewMatrix();
    this.transform.position.x += this.transform.right[0] * v;
    this.transform.position.y += this.transform.right[1] * v;
    this.transform.position.z += this.transform.right[2] * v; 
  }

  panY(v){
    this.updateViewMatrix();
    this.transform.position.y += this.transform.up[1] * v;
    if(this.mode == Camera.MODE_ORBIT) return; //Can only move up and down the y axix in orbit mode
    this.transform.position.x += this.transform.up[0] * v;
    this.transform.position.z += this.transform.up[2] * v; 
  }

  panZ(v){
    this.updateViewMatrix();
    if(this.mode == Camera.MODE_ORBIT){
      this.transform.position.z += v; //orbit mode does translate after rotate, so only need to set Z, the rotate will handle the rest.
    }else{
      //in freemode to move forward, we need to move based on our forward which is relative to our current rotation
      this.transform.position.x += this.transform.forward[0] * v;
      this.transform.position.y += this.transform.forward[1] * v;
      this.transform.position.z += this.transform.forward[2] * v; 
    }
  }
    
  // Replaces the one in our transform since Camera's do not scale.
  // Also the two modes we have means we need to customize this function to handle both
  updateViewMatrix() {
    if(this.mode === Camera.MODE_FREE){
      this.transform.matView.reset()
        .vtranslate(this.transform.position)
        .rotateX(this.transform.rotation.x * Transform.deg2Rad)
        .rotateY(this.transform.rotation.y * Transform.deg2Rad)
    } else {
      // Notice the different order of operations
      this.transform.matView.reset()
        .rotateX(this.transform.rotation.x * Transform.deg2Rad)
        .rotateY(this.transform.rotation.y * Transform.deg2Rad)
        .vtranslate(this.transform.position)
    }

    this.transform.updateDirection(); // Need to know the direction for panning

    // Cameras work by doing the inverse transformation of all meshes!
    Matrix4.invert(this.viewMatrix, this.transform.getViewMatrix())

    return this.viewMatrix
  }
}

Camera.MODE_FREE = 0;	//Allows free movement of position and rotation, basicly first person type of camera
Camera.MODE_ORBIT = 1;	//Movement is locked to rotate around the origin, Great for 3d editors or a single model viewer

class CameraController {
  constructor(gl, camera) {
    this.canvas = gl.canvas //Need access to the canvas html element, mainly to access events
    this.camera = camera //Reference to the camera to control

    const box = gl.canvas.getBoundingClientRect();
    this.offsetX = box.left;						//Help calc global x,y mouse cords.
    this.offsetY = box.top;

    this.rotateRate = -300 //How fast to rotate, degrees per dragging delta
    this.panRate = 5 //How fast to pan, max unit per dragging delta
    this.zoomRate = 200 //How fast to zoom or can be viewed as forward/backward movement

    this.initX;									//Starting X,Y position on mouse down
    this.initY;
    this.prevX;									//Previous X,Y position on mouse move
    this.prevY;
        
    this.onUpHandler = this.onMouseUp;
    this.onMoveHandler = this.onMouseMove;

    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e))
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault(); // Need to prevent window from zooming
      this.onMouseWheel(e)
    }, { passive: false }) // Need to use preventDefault
  }

    //Transform mouse x,y cords to something useable by the canvas.
    getMouseVec2 = (e) => {
      return { 
        x: e.pageX - this.offsetX,
        y: e.pageY - this.offsetY
      }
    }

    //Begin listening for dragging movement
	onMouseDown = (e) => {
	  this.initX = this.prevX = e.pageX - this.offsetX;
	  this.initY = this.prevY = e.pageY - this.offsetY;
        
	  this.canvas.addEventListener("mouseup",this.onUpHandler);
	  this.canvas.addEventListener("mousemove",this.onMoveHandler);
	}
    
	//End listening for dragging movement
	onMouseUp = (e) => {
	  this.canvas.removeEventListener("mouseup",this.onUpHandler);
	  this.canvas.removeEventListener("mousemove",this.onMoveHandler);
	}
    
    onMouseWheel = (e) => {
      const delta = Math.max(-1, Math.min(1, (e.deltaY || -e.detail))); //Try to map wheel movement to a number between -1 and 1
      this.camera.panZ(delta * (this.zoomRate / this.canvas.height));		//Keep the movement speed the same, no matter the height diff
    }
    onMouseMove = (e) => {
      const x = e.pageX - this.offsetX,	//Get X,y where the canvas's position is origin.
        y = e.pageY - this.offsetY,
        dx = x - this.prevX,		//Difference since last mouse move
        dy = y - this.prevY;

      //When shift is being helt down, we pan around else we rotate.
      if(!e.shiftKey){
        this.camera.transform.rotation.y += dx * (this.rotateRate / this.canvas.width);
        this.camera.transform.rotation.x += dy * (this.rotateRate / this.canvas.height);
      }else{
        this.camera.panX( -dx * (this.panRate / this.canvas.width) );
        this.camera.panY( dy * (this.panRate / this.canvas.height) );
      }

      this.prevX = x;
      this.prevY = y;
    }
}