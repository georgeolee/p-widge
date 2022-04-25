import {Vector} from "p5";
import { FrameManager } from "./particle-system/FrameManager";
import { ParticleSystem } from "./particle-system/ParticleSystem";
import { mouse, particleSettings, flags } from "./globals";
import { parseHexColorString } from "./utilities";

export function sketch(p){
        
    FrameManager.p5 = p;
    const s = new ParticleSystem(p, particleSettings)

    const blendModes = {
        add: p.ADD,
        blend: p.BLEND,
        multiply: p.MULTIPLY,
        screen: p.SCREEN,
        hard_light: p.HARD_LIGHT,
        
        default: p.ADD
    }

    let backgroundColor = FrameManager.composeP5Color(s.settings.backgroundColor);

    p.setup = function(){
        p.createCanvas(600,600)
        p.background(255)        
        

        p.fill(255);
        p.stroke(0);
        p.strokeWeight(5)
        

        s.pos = p.createVector(p.width/2,p.height/2)
             
    }

    p.draw = function(){
        
        handleFlags();

        p.blendMode(p.BLEND)
        p.background(backgroundColor);
        
        setParticleBlendMode(s.settings.p5BlendMode);

        if(s.settings.emitAuto || (mouse.overCanvas && p.mouseIsPressed)){
            s.emitPerSecond(s.settings.rate, s.settings.overwrite)
        }
        s.update(p.deltaTime);


        const targetPosition = mouse.overCanvas ? new Vector(mouse.canvasX, mouse.canvasY) : new Vector(p.width/2, p.height/2);
        s.pos = Vector.lerp(s.pos, targetPosition, 0.2);    // a little bit of damping to motion
    }

    function handleFlags(){
        if(flags.loadEmap && s.settings.emapUrl){
            s.emitter.loadEmissionMap(s.settings.emapUrl);
            flags.loadEmap = false;
        }

        if(flags.recolor && s.settings.imageUrl){
            FrameManager.queueRecolor(frames => s.settings.imageFrames = frames);
            flags.recolor = false;
        }

        if(flags.dirtyBackground){
            backgroundColor = FrameManager.composeP5Color(s.settings.backgroundColor);
            flags.dirtyBackground = false;
        }
    }

    function setParticleBlendMode(modeString){
        const mode = blendModes[modeString.toLowerCase()] ?? blendModes.default;
        p.blendMode(mode);
    }
}