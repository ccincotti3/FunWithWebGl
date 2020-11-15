/*NOTES:
Tutorial on how to control FPS :: https://gist.github.com/elundmark/38d3596a883521cb24f5 
EXAMPLE:
rloop = new RenderLoop(function(dt){ 
	console.log(rloop.fps + " " + dt);
},10).start();

http://creativejs.com/resources/requestanimationframe/index.html
https://webgl2fundamentals.org/webgl/lessons/webgl-animation.html
*/

class RenderLoop{
	constructor(callback,fps){
		const oThis = this;
		this.msLastFrame = null;	//The time in Miliseconds of the last frame.
		this.callBack = callback;	//What function to call for each frame
		this.isActive = false;		//Control the On/Off state of the render loop
		this.fps = 0;				//Save the value of how fast the loop is going.

		if(!fps && fps > 0){ //Build a run method that limits the framerate
			this.msFpsLimit = 1000/fps; //Calc how many milliseconds per frame in one second of time.
			
			this.run = function(msCurrent){ // requestAnimationFrame gives us the now time
				//Calculate Deltatime between frames and the FPS currently.
				const msDelta = (msCurrent - oThis.msLastFrame),
					deltaTime	= msDelta / 1000.0;		//What fraction of a single second is the delta time
				
				if(msDelta >= oThis.msFpsLimit){ //Now execute frame since the time has elapsed.
					oThis.fps			= Math.floor(1/deltaTime);
					oThis.msLastFrame	= msCurrent - (msDelta % this.msFpsLimit);
					oThis.callBack(deltaTime);
				}

				if(oThis.isActive) window.requestAnimationFrame(oThis.run);
			}
		}else{ //Else build a run method thats optimised as much as possible.
			this.run = function(msCurrent){
				//Calculate Deltatime between frames and the FPS currently.
				const msDelta = (msCurrent - oThis.msLastFrame),
                deltaTime	= (msCurrent - oThis.msLastFrame) / 1000.0;	//ms between frames, Then / by 1 second to get the fraction of a second.

				//Now execute frame since the time has elapsed.
				oThis.fps			= Math.floor(1/deltaTime); //Time it took to generate one frame, divide 1 by that to get how many frames in one second.
                oThis.msLastFrame	= msCurrent;

				oThis.callBack(deltaTime);
				if(oThis.isActive) window.requestAnimationFrame(oThis.run);
			}
		}
	}

	start(){
		this.isActive = true;
		this.msLastFrame = performance.now();
		window.requestAnimationFrame(this.run);
		return this;
	}

	stop(){ this.isActive = false; }
}