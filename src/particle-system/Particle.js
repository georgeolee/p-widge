// import p5 from 'p5'
import {Vector} from 'p5'
import {lerp} from '../utilities.js'

export const GetActiveParticleCount = () => Particle.activeCount;
export class Particle{
    
    static activeCount = 0;
    static bounds = null;

    active = false;
    pos;
    vel;
    systemOrigin;
    lifetime;
    remaining;
    baseSize;
    size;

    rotationMatrix;

    speedTable;
    sizeTable;

    

    constructor(position, velocity, lifetimeSeconds, size = 1){
      this.active = false;
      this.initialize(position, velocity, lifetimeSeconds, size);
      this.rotationMatrix = [1,0,0,1,0,0];
    }
  
    //allow reinitializing particles that have reached the end of their lifetime
    initialize(position, velocity, lifetimeSeconds = 1, startSize = 1){
      this.pos = position;
      this.vel = velocity;
      this.lifetime = lifetimeSeconds * 1000;
      this.remaining = this.lifetime;
  
      this.baseSize = startSize;
      this.size = this.baseSize;

      this.speedTable = null;
      this.sizeTable = null;
  
      this.systemOrigin = this.pos;
    }
  
    static getActiveCount(){
      return Particle.activeCount;
    }

  
    setSize(s){
      this.size = s;
    }
  
    setActive(state){
      if(!!this.active === !!state) return;
      this.active = !!state;
      Particle.activeCount += state ? 1 : -1;
    }
  
    setSpeedTable(st){
      this.speedTable = st;
    }
  
    setSizeTable(st){
      this.sizeTable = st;
    }
  
    outOfBounds(){
      //implement later
      return false;
    }

    getTableValueByLifetime(table){  //interpolate between lookup table indices based on current point in lifetime
      
      if(!table || !table.length){
        console.log(`Particle.getTableValueByLifetime(table); table is undefined, null, or length zero: ${table}`)
        return undefined;
      }
      
      

      // console.log(`table length ${table.length}`)
      if(table.length === 1) return table[0];

      const t_lifetime = 1 - this.remaining/this.lifetime || 0;      //normalized point in lifetime, starting at 0 and ending at 1
      const i_a = Math.round(t_lifetime * (table.length - 2));  //index before current point in lifetime
      const i_b = i_a + 1;                                      //index after current point in lifetime
      const t_index = t_lifetime * (table.length - 1) - i_a;    //normalized point between indices a and b, according to lifetime
      
      const value = lerp(table[i_a], table[i_b], t_index);

      // console.log(`particle getTableValueByLifetime; value: ${value}`)
      return value;
    }

    //get deltaTime from pinst running the sketch
    update(deltaTime){
      if(!this.active) return;
  
      // console.log(this.speedTable)

      let v = new Vector(this.vel.x, this.vel.y);
  
      //at least 2 values to interpolate between in speed table ?
      if(this.speedTable?.length > 1){        
        v.mult(this.getTableValueByLifetime(this.speedTable));
      }
  
      //at least 2 values to interpolate between in size table ?
      if(this.sizeTable?.length > 1){        
        this.size = this.baseSize * (this.getTableValueByLifetime(this.sizeTable));
      }
  
      // update position
      this.pos = Vector.add(this.pos, Vector.mult(v, deltaTime * 0.001));
      this.remaining -= deltaTime;
  
      //deactivate the particle if its lifetime is up or if it has moved offscreen
      if( this.remaining < 0 || this.outOfBounds() ){
        this.setActive(false);
      }
  
    }
  
  }