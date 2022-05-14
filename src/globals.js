import { ParticleSystemSettings } from "./particle-system/ParticleSystemSettings"

//stuff for passing data in and out of p5 sketch
export const pointer = {
    pageX: null,
    pageY: null,

    clientX: null,
    clientY: null,    

    canvasX: null,
    canvasY: null,

    overCanvas: false,

    buttons: 0,
}

export const particleSettings = new ParticleSystemSettings();

export const flags = {
    recolor: false,

    slowRecolor: false,
    
    loadEmap: false,
    dirtyBackground: false,

    emitTimerReset: false,
}

//get average fps over the last 60 frames
export const fps = {
    current: NaN,

    frameMils: new Array(60).fill(NaN),
    nextFrameIndex: 0,
    lastFrameTime: Date.now(),

    update: function(){
        this.frameMils[this.nextFrameIndex] = Date.now() - this.lastFrameTime;
        this.nextFrameIndex = (this.nextFrameIndex + 1) % this.frameMils.length;
        this.lastFrameTime = Date.now();
        this.current = 1000 / (this.frameMils.reduce( (p,n) => p + n) / this.frameMils.length) || 'calculating...';
    },    
}