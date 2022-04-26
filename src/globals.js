import { ParticleSystemSettings } from "./particle-system/ParticleSystemSettings"

//stuff for passing data in and out of p5 sketch
export const mouse = {
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
}