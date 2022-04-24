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
}

export const particleSettings = new ParticleSystemSettings();