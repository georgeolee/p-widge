import {DEGREES_TO_RADS, getRandomVelocity, randomRange} from '../utilities.js'
import {Vector} from 'p5'
import { Particle } from './Particle.js';
import { Emitter } from './Emitter.js';



export class ParticleSystem {

    emitter;    
    nextIndex;
    pos;
    rotation;
    lastEmitMillis;   
    p5;


    //NEW CONSTRUCTOR - MOVE SETTINGS INTO SETTINGS CLASS
    constructor(p5Instance, settingsObject = null) {

      this.p5 = p5Instance;
      this.settings = settingsObject;

      this.pos = new Vector(0,0);
      this.nextIndex = 0;
      this.lastEmitMillis = Date.now();

      this.particles = new Array(this.settings.maxParticleCount).fill(null).map(()=>{
        const v = getRandomVelocity(this.settings.particleBaseSpeed * (1 - this.settings.particleSpeedRandomFactor), this.settings.particleBaseSpeed, this.settings.pointRotation - this.settings.arc/2, this.settings.pointRotation + this.settings.arc/2)
        return new Particle(new Vector(0,0), v, this.settings.particleLifetime, this.settings.particleBaseSize);
      })

      this.emitter = new Emitter(p5Instance);                  
    } 
  
    initialize(particle){
  
      let o = this.pos; 
      let emissionAngle = 0;
  
      //get start position & angle from an emitter point
      if(this.emitter && this.emitter.points.length >= 3){
  
        const i = this.emitter.nextPointIndex;

        const [ex, ey, angle] = this.emitter.points.slice(i, i + 3);
        // emissionAngle = angle;
        
        //TESTING/////////////////
        emissionAngle = angle + this.settings.rotation;
        // console.log(this.settings.rotation)

        //base size of emitter, determined by canvas size
        const BASE_SIZE = Math.min(this.p5.width, this.p5.height);

        // ex*= 

        //offset particle position based on emitter point position, scaled by emitter size
        const emitterOffset = new Vector(ex * BASE_SIZE * this.settings.emitterSize / 2 / 100, ey * BASE_SIZE * this.settings.emitterSize / 2 / 100); //divide by 2 because emitter points are saved as values between -1 and 1 ; divide by 100 bc emitter.size is a percent value
        

        //TESTING////////////////

        // emitterOffset.x = emitterOffset.x * Math.cos(-this.settings.rotation * DEGREES_TO_RADS) - emitterOffset.y * Math.sin(-this.settings.rotation * DEGREES_TO_RADS);
        // emitterOffset.y = emitterOffset.x * Math.sin(-this.settings.rotation * DEGREES_TO_RADS) + emitterOffset.y * Math.cos(-this.settings.rotation * DEGREES_TO_RADS);
        
        [emitterOffset.x, emitterOffset.y] =
        
        [emitterOffset.x * Math.cos(this.settings.rotation * DEGREES_TO_RADS) - emitterOffset.y * Math.sin(this.settings.rotation * DEGREES_TO_RADS),
        emitterOffset.x * Math.sin(this.settings.rotation * DEGREES_TO_RADS) + emitterOffset.y * Math.cos(this.settings.rotation * DEGREES_TO_RADS)]

        o = Vector.add(o, emitterOffset);
  
        //next point for random or sequential order
        this.emitter.nextPointIndex = this.emitter.randomOrder ? Math.floor(Math.random() * (this.emitter.points.length / 3)) * 3 : this.emitter.nextPointIndex = (i + 3) % this.emitter.points.length;
      }
  
      const particleAngle = randomRange(emissionAngle - this.settings.arc/2, emissionAngle + this.settings.arc/2) * DEGREES_TO_RADS;
      const particleSpeed = randomRange(this.settings.particleBaseSpeed * (1-this.settings.particleSpeedRandomFactor), this.settings.particleBaseSpeed);
      const v = new Vector(particleSpeed * Math.cos(particleAngle), particleSpeed * Math.sin(particleAngle));
        
      
      const cosAngle = Math.cos(particleAngle);
      const sinAngle = Math.sin(particleAngle);

      particle.rotationMatrix = [cosAngle, sinAngle, -sinAngle, cosAngle, 0, 0];

      // console.log(v)

      //initial particle size
      const randomFactor = this.settings.particleSizeRandomFactor * Math.random() + (1 - this.settings.particleSizeRandomFactor);
      const s = this.settings.particleBaseSize * randomFactor;
  
      particle.initialize(o, v, this.settings.particleLifetime, s);
      particle.setSpeedTable(this.settings.speedTable);
      particle.setSizeTable(this.settings.sizeTable);                

      // console.log(particle.vel)
    }
  
  
    emit(number, overwrite = true){      
      let emitted = 0;
      let n = 0;  //count the number of array indices checked
  
      for(let i = this.nextIndex; emitted < number; i = (i + 1) % this.particles.length){
  
        const particle = this.particles[i];
  
        //CHECK - cycled through the entire array ?
        if(n >= this.particles.length && i === this.nextIndex){ // ? is the second half needed?
          break;
        }
  
        n++;//checking another index
          
        if(!overwrite && particle?.active) continue; //don't overwrite active particles if overwrite set to false
  
        this.initialize(particle);        //emit new particle
        particle.systemOrigin = this.pos; //save the position of the particle system at initialization; required for rotation in global mode
        particle.setActive(true);
        emitted++;
        
        this.nextIndex = (i + 1) % this.particles.length; //remember the next index to look at next time emit is called
      }
  
  
    }
  
  
  
    update(deltaTime){

      for(let i = 0; i < this.particles.length; i++){
        const p = this.particles[i];
        if(!p?.active) continue;
        p.update(deltaTime);        
      }
      
      this.drawParticles();
    }
  
    drawParticle(p){
      //particle coordinates relative to its origin
      // const px = p.pos.x - p.systemOrigin.x;
      // const py = p.pos.y - p.systemOrigin.y;

      //rotate relative X and Y by emitter rotation
      // let pRotatedX = Math.cos(-this.settings.rotation * DEGREES_TO_RADS) * px - Math.sin(-this.settings.rotation * DEGREES_TO_RADS) * py;
      // let pRotatedY = Math.sin(-this.settings.rotation * DEGREES_TO_RADS) * px + Math.cos(-this.settings.rotation * DEGREES_TO_RADS) * py;
      
      //add origin position back to get the particle's world position after rotation
      // pRotatedX += p.systemOrigin.x;
      // pRotatedY += p.systemOrigin.y;

      this.p5.push();
      // this.p5.translate(pRotatedX, pRotatedY); 
      
      //TEST?////////
      this.p5.translate(p.pos.x, p.pos.y)

      // console.log(p.pos)
      // console.log(p.vel)

      if(this.settings.rotateByVelocity) this.p5.rotate(p.vel.heading() - this.settings.rotation*DEGREES_TO_RADS);  //if rotate by angle, rotate here

      // if(this.settings.rotateByVelocity) this.p5.applyMatrix(...p.rotationMatrix);

      //animate through frames over particle lifetime
      if(this.settings.imageFrames?.length > 0){ 
        const i = Math.floor(this.settings.imageFrames.length * (p.remaining/p.lifetime))
        const theImage = this.settings.imageFrames[i]
        const normalizedSize = 1 / theImage.width;
        this.p5.scale(p.size * normalizedSize);
        this.p5.translate(-theImage.width/2, -theImage.height/2);
        this.p5.image(theImage,0,0)
      }
      
      else{ //no frames - draw magenta error to the canvas
        this.p5.stroke(255,0,255)
        this.p5.strokeWeight(10)
        this.p5.point(0,0)
      }

      this.p5.pop();

    }
  
    drawParticles(){  
  
      //draw most recent particle first
      for(let i = this.nextIndex, n = 0; n < this.particles.length; n++, i = (i + 1) % this.particles.length){
        const p = this.particles[i];
        if(!p?.active) continue;
  
        this.drawParticle(p);
        
      }
    }
  
    isSaturated(){
      return Particle.getActiveCount() >= this.settings.maxParticleCount
    }
  
    // call this from update
    emitPerSecond(perSecond, overwrite){
      const perMil = perSecond * 0.001;
      const numToEmit = (Date.now() - this.lastEmitMillis) * perMil;
      if(numToEmit >= 1){
        this.emit(Math.round(numToEmit), overwrite);
        this.lastEmitMillis = Date.now();
      }
    }

  }