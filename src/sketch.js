import {Vector} from "p5";
import { FrameManager } from "./particle-system/FrameManager";
import { ParticleSystem } from "./particle-system/ParticleSystem";
import { mouse, particleSettings } from "./globals";
import { parseHexColorString } from "./utilities";

export function sketch(p){
        
    const s = new ParticleSystem(p, particleSettings)
    
    FrameManager.maxQueueSize = 1;
    FrameManager.startColor = p.color(0,0,255);
    FrameManager.endColor = p.color(255,0,0,0);
    FrameManager.queueRecolor(frames => s.settings.imageFrames = frames)
    

    p.setup = function(){
        p.createCanvas(600,600)
        p.background(255)        
        

        p.fill(255);
        p.stroke(0);
        p.strokeWeight(5)
        

        s.pos = p.createVector(p.width/2,p.height/2)
                     
        // s.emitter.loadEmissionMap('./images/emap-test.png')        
        
        // s.settings.apply({local:true})     

        console.log(parseHexColorString('#fff236'))
    }

    p.draw = function(){
        
        p.blendMode(p.BLEND)
        p.background(0);
        p.blendMode(p.ADD)
        s.update(p.deltaTime);
        
        const targetPosition = mouse.overCanvas ? new Vector(mouse.canvasX, mouse.canvasY) : new Vector(p.width/2, p.height/2);
        s.pos = Vector.lerp(s.pos, targetPosition, 0.2);    // a little bit of damping to motion
    }
}