export class ParticleSystemSettings{

    //system
    emitter;
    imageFrames;
    sizeTable
    speedTable
      
    rotateByVelocity;

    emitAuto;

    maxParticleCount;    
    rate  
    pointRotation
    arc

    //particles
    particleLifetime;
    particleBaseSpeed;
    particleBaseSize;
    particleSizeRandomFactor;
    particleSpeedRandomFactor;


    /*
    *   bare minimum setup
    *   >emitter
    *   >imageFrames
    * 
    */

    
    
    constructor(s = null){
        

        this.emitter = s?.emitter || null;
        this.imageFrames = s?.imageFrames || null;
        this.speedTable = s?.speedTable || [1,0];
        this.sizeTable = s?.sizeTable || [1,0];

        this.emitAuto = s?.emitAuto ?? true;
        this.rotateByVelocity = s?.rotateByVelocity ?? false;
        
        this.maxParticleCount = s?.maxParticleCount ?? 1500;
        this.rotation = s?.rotation ?? 0;
        this.rate = s?.rate ?? 200;
        this.arc = s?.arc ?? 360;
        this.pointRotation = s?.pointRotation ?? 0;
        
        this.particleLifetime = s?.particleLifetime ?? 2;
        this.particleBaseSpeed = s?.particleBaseSpeed ?? 100;
        this.particleBaseSize = s?.particleBaseSize ?? 30;
        this.particleSizeRandomFactor = s?.particleSizeRandomFactor ?? 0.5;
        this.particleSpeedRandomFactor = s?.particleSpeedRandomFactor ?? 0.5;        
    }

    apply(settings){

        for(const name of Object.keys(settings)){
            if(this.hasOwnProperty(name)){  // hasOwn recommended as eventual replacement ; might not be supported on older browsers                
                this[name] = settings[name]
            }
        }
    }
}