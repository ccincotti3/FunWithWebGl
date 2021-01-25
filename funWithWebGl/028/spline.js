var Picking = {
  id:100,
  list:[], // keep track of all objects registered on the screen.
  target:null,
  initX:0,
  initY:0,
  initPos:new Fungi.Maths.Vec3(),
  tmpPos:new Fungi.Maths.Vec3(),

  register:function(obj,cb){
    var id = ++this.id;
    this.list.push({id:id, obj:obj, callback:cb}); // add object we want to track to list
    return id;
  },
	
  find:function(id){
    for(var i=0; i < this.list.length; i++){
      if(this.list[i].id == id) return this.list[i];
    }
    return null;
  },

  colorToID:function(a){ return a[0] | (a[1] << 8) | (a[2] << 16); },
  idToColor:function(v){ //With 3 bytes, the max value is 16777215;
    var a = new Float32Array(3);
    a[0] = (v & 0xff) / 255.0;
    a[1] = ((v & 0xff00) >> 8) / 255.0;
    a[2] = ((v & 0xff0000) >> 16) / 255.0;
    return a;
  },

  onDownOverride:function(e,ctrl,x,y){
    var yi		= Fungi.gl.fHeight - y, //Gotta flip the y
      pixel	= Fungi.Shaders.FBO.readPixel(gFbo,x,yi,1),
      id		= Picking.colorToID(pixel);
		
    if(id == 0 || id == 16777215) return; //ignore Black and white.
    ctrl.switchHandler("pick",id);
  },
  onActive:function(data){ // data is id number, find it and set as the target.
    if(!data) return;
    this.target = Picking.find(data);
  },
  onMouseUp:function(e,ctrl,x,y,dx,dy){ 
    ctrl.switchHandler("camera");
  },
  onMouseDown:function(e,ctrl,x,y){
    this.initX = x; // save to calculate deltas.
    this.initY = y;
    this.initPos.copy(this.target.obj.position);
  },
  onMouseMove:function(e,ctrl,x,y,dx,dy){
    // calculate the dragging deltas
    var v  = [0,0,0]
    dx = x-this.initX,
    dy = y-this.initY;

    this.tmpPos.copy(this.initPos)
      .add(FungiApp.mainCamera.left(v,dx*0.008))
      .add(FungiApp.mainCamera.up(v,-dy*0.008));

    this.target.obj.position.copy(this.tmpPos);
    this.target.callback(this.target.obj);

    //HACK - Calling global vars, not a nice way to approach this.
    gDMesh.clear();
    Bezier.generate(gDMesh.verts,10, // while dragging points around the screen, update position.
      gPoints._points[0].position,
      gPoints._points[1].position,
      gPoints._points[2].position,
      gPoints._points[3].position
    );
    gDMesh.update();

    //Draw line between position and control point
    FungiApp.debugLines.reset()
      .addVector(gPoints._points[0].position,gPoints._points[1].position,"#b0b0b0")
      .addVector(gPoints._points[2].position,gPoints._points[3].position,"#b0b0b0")
      .update();
  }
}

class DynamicMesh extends Fungi.Renderable{
  // Basically on init we say 'give me an empty vao that holy hold X amount of vertices'
  constructor(tVert,matName){
    super({},matName);

    this.verts			= [];
    this.bufSize		= Float32Array.BYTES_PER_ELEMENT * 3 * tVert; //3Floats per vert
    this.drawMode		= Fungi.gl.LINE_STRIP; // possible to change draw modes on the fly.
    this.visible		= false;

    //Create VAO with a buffer a predefined size buffer to dynamicly dump data in.
    Fungi.Shaders.VAO.create(this.vao)
      .emptyFloatArrayBuffer(this.vao,"vert",this.bufSize,Fungi.ATTR_POSITION_LOC,3,0,0,false)
      .finalize(this.vao,"FungiVertDebugger");
  }

  draw(){ 
    if(this.vao.count > 0)  {
    //   console.log(Fungi.gl.getActiveUniformBlockParameter(this.material.shader.program, 0, Fungi.gl.UNIFORM_BLOCK_DATA_SIZE)); //Get Size of Uniform Block
    //   console.log(Fungi.gl.getActiveUniformBlockParameter(this.material.shader.program, 0, Fungi.gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES));
    //   console.log(Fungi.gl.getActiveUniformBlockParameter(this.material.shader.program, 0, Fungi.gl.UNIFORM_BLOCK_ACTIVE_UNIFORMS));
    //   console.log(Fungi.gl.getActiveUniformBlockParameter(this.material.shader.program, 0, Fungi.gl.UNIFORM_BLOCK_BINDING));
      Fungi.gl.drawArrays(this.drawMode, 0, this.vao.count);
    }
  } // only draw if there are actually vertices pushed to the VAO.
  clear(){
    this.verts =[];
    this.vao.count = 0;
    this.visible = false;
  }

  update(){
    //If there is no verts, set this to invisible to disable rendering.
    if(this.verts.length == 0){ this.visible = false; return this; }
    this.visible = true;
		
    //Calc how many vectors we have
    this.vao.count = this.verts.length / 3;
    console.log(this.vao)

    //Push verts to GPU.
    Fungi.gl.bindBuffer(Fungi.gl.ARRAY_BUFFER,this.vao.buffers["vert"].buf);
    Fungi.gl.bufferSubData(Fungi.gl.ARRAY_BUFFER, 0, new Float32Array(this.verts), 0, null); // with subdata if our buffer is of size 20 we can just add 1 or 2 or edit etc. i think..
    Fungi.gl.bindBuffer(Fungi.gl.ARRAY_BUFFER,null);

    return this;
  }
}

// There are methods out in the wild to determine the best sampling amount for certain curves.
class Bezier{
  // Samples the curve by whatever increment you want. Sample of 5 will look jaggy for example.
  static generate(out,res,p0,p1,p2,p3){
    var inc = 1/res,
      pos = new Fungi.Maths.Vec3();

    for(var i = 0; i < res; i++){
      Bezier.getPoint(p0,p1,p2,p3, i*inc ,pos);
      out.push(pos.x,pos.y,pos.z);
    }

    Bezier.getPoint(p0,p1,p2,p3, 1 ,pos);
    out.push(pos.x,pos.y,pos.z);
  }
  // Calculate any point on the curve.
  static getPoint(p0,p1,p2,p3,t,out){
    if(t > 1) t = 1;
    else if(t < 0) t = 0;

    var i = 1 - t;

    // Bezier cubic equations, rinse repeat for x y z. Based on 4 points
    out = out || new Fungi.Maths.Vec3();
    out[0] = i * i * i * p0.x +
				3 * i * i * t * p1.x +
				3 * i * t * t * p2.x +
				t * t * t * p3.x;
    out[1] = i * i * i * p0.y +
				3 * i * i * t * p1.y +
				3 * i * t * t * p2.y +
				t * t * t * p3.y;
    out[2] = i * i * i * p0.z +
				3 * i * i * t * p1.z +
				3 * i * t * t * p2.z +
				t * t * t * p3.z;
    return out;
  }
}

class DragPoints{
  static getRenderable(){
    if(DragPoints.renderable) return DragPoints.renderable;

    //......................................
    //CREATE SHADER
    var vShader = '#version 300 es\n'+
			'layout(location=0) in vec3 a_position;' +
			'layout(location=1) in vec3 a_id;' +
			'layout(location=2) in lowp vec3 a_color;' +			
			'uniform UBOTransform{ mat4 matProjection; mat4 matCameraView; vec3 posCamera; };' +
			'out lowp vec3 color;'+
			'out lowp vec3 id;'+
			'void main(void){'+
				'vec4 worldpos = matCameraView * vec4(a_position, 1.0);'+
				'float d = distance(posCamera.xyz,worldpos.xyz);'+
				'if(d > 0.0f) gl_PointSize = max(10.0f,(100.0f/d));' +
				'else gl_PointSize = 10.0f;' +
				'color = a_color;'+
				'id = a_id;'+
				'gl_Position = matProjection * worldpos; '+
			'}';

    var fShader = '#version 300 es\n precision mediump float;'+
			'in lowp vec3 color; in lowp vec3 id;'+
			'layout(location = 0) out vec4 outColor0;'+
        	'layout(location = 1) out vec4 outColor1;'+
			'void main(void){ outColor0 = vec4(color,1.0); outColor1 = vec4(id,1.0); }';

    Fungi.Shaders.New("FungiDrawPoints",vShader,fShader)
      .prepareUniformBlocks(Fungi.Res.Ubo[Fungi.UBO_TRANSFORM],0);

    //......................................
    //CREATE MATERIAL
    var mat = Fungi.Shaders.Material.create("FungiDrawPoints","FungiDrawPoints");
    mat.useModelMatrix = false;
    mat.drawMode = Fungi.gl.POINTS;

    //......................................
    //CREATE RENDERABLE
    var ren = new DragPoints();
    ren.material = mat;
    return DragPoints.renderable = ren;
  }

  constructor(){
    var fsize = Float32Array.BYTES_PER_ELEMENT;
    var compSize = 9; // first 3 floats is position, then next 3 is colorID, then color.
    var stride = compSize * fsize; //How large is the vertex data in bytes, Pos(3)-ID(3)-Color(3), 9 Floats at 4 bytes each

    this._points		= [];
    this._isModified 	= true;
    this._vertCompSize	= compSize;
    this._stride		= stride; // total size of each chunk of your buffer is.
    this._bufSize		= stride * 20;
    this.vao			= {};
    this.visible		= true;
    this.material		= null;

    //Create VAO with a buffer with space for 100 lines.
    // Single buffer partitioned into 3 parts.
    // So instead of drawing 3 buffers for 3 attributes, we can create single buffer that is partitioned 3 ways.
    Fungi.Shaders.VAO.create(this.vao)
      .emptyFloatArrayBuffer(this.vao,"vert",this._bufSize,Fungi.ATTR_POSITION_LOC,3,stride,0,false) //Setup buffer and verts
      .partitionBuffer(1,3,stride,fsize * 3) //Setup ID (location=#, float length (3 floats), stride (part of a component of 9), offset)
      .partitionBuffer(2,3,stride,fsize * 6) //Setup Color
      .finalize(this.vao,"FungiDragPoints");
    this.vao.count = 0;
  }

  draw(){
    // not indexed so don't really need conditional.
    if(this.vao.isIndexed)	Fungi.gl.drawElements(this.material.drawMode, this.vao.count, Fungi.gl.UNSIGNED_SHORT, 0); 
    else					Fungi.gl.drawArrays(this.material.drawMode, 0, this.vao.count);
  }

  addPoint(x,y,z,cHex){
    var obj = { id:0, color:cHex, position:new Fungi.Maths.Vec3().set(x,y,z), index:this._points.length };
    obj.id = Picking.register(obj, this.updateCallback.bind(this));
    this._points.push(obj);
  }

  updateCallback(o){
    console.log(o);

    // you could potentially write more data than you should, so be careful.
    Fungi.Shaders.VAO.updateAryBufSubData(
      this.vao.buffers["vert"].buf, // bufferId
      o.index * this._stride, // where in the array I want to modify
      o.position // actual array data.
    );
  }

  // after all the point are added, its time to build the buffer.
  buildBuffer(){
    if(this._points.length == 0){ this.visible = false; return this; }
    this.visible = true;

    var ary = [], color, cid;
    for(var i=0; i < this._points.length; i++){
      color	= Fungi.Util.rgbArray(this._points[i].color);
      cid		= Picking.idToColor(this._points[i].id);

      ary.push(
        this._points[i].position.x,
        this._points[i].position.y,
        this._points[i].position.z,
        cid[0],
        cid[1],
        cid[2],
        color[0],
        color[1],
        color[2]
      );
    }

    //Calc how many vec4 elements we have
    this.vao.count = ary.length / this._vertCompSize;

    //Push verts to GPU.
    Fungi.gl.bindBuffer(Fungi.gl.ARRAY_BUFFER,this.vao.buffers["vert"].buf);
    Fungi.gl.bufferSubData(Fungi.gl.ARRAY_BUFFER, 0, new Float32Array(ary), 0, null); // push data into gpu.
    Fungi.gl.bindBuffer(Fungi.gl.ARRAY_BUFFER,null);

    return this;
  }
}