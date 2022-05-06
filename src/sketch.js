import {Vector} from "p5";
import { FrameManager } from "./particle-system/FrameManager";
import { ParticleSystem } from "./particle-system/ParticleSystem";
import { mouse, particleSettings, flags, fps } from "./globals";

export function sketch(p){
    
    p.disableFriendlyErrors = true;
    FrameManager.p5 = p;
    const s = new ParticleSystem(p, particleSettings)

    const blendModes = {
        add: p.ADD,
        blend: p.BLEND,
        multiply: p.MULTIPLY,        
        default: p.ADD
    }

    const frameRate = 60;

    let backgroundColor = FrameManager.composeP5Color(s.settings.backgroundColor);
    let mousePressLastFrame = p.mouseIsPressed;
    

    

    p.setup = function(){
        let cnv = p.createCanvas(600,600)
        p.background(255)        
        

        p.fill(255);
        p.stroke(0);
        p.strokeWeight(5)
        

        s.pos = p.createVector(p.width/2,p.height/2)
        
        p.frameRate(frameRate);

        p.noSmooth();
        
        console.log('SMOOTH?')
        console.log(cnv.elt.getContext('2d').imageSmoothingEnabled)
    }

    p.draw = function(){
        fps.update()
        handleFlags();

        p.blendMode(p.BLEND)
        p.background(backgroundColor);
        
        setParticleBlendMode(s.settings.p5BlendMode);

        if(!s.settings.emitAuto && p.mouseIsPressed && !mousePressLastFrame){
            s.lastEmitMillis = Date.now()
        }

        if(s.settings.emitAuto || (mouse.overCanvas && p.mouseIsPressed)){
            s.emitPerSecond(s.settings.rate, s.settings.overwrite)
        }
        s.update(p.deltaTime);


        const targetPosition = mouse.overCanvas ? new Vector(mouse.canvasX, mouse.canvasY) : new Vector(p.width/2, p.height/2);
        s.pos = Vector.lerp(s.pos, targetPosition, 0.2);    // a little bit of damping to motion
    
        mousePressLastFrame = p.mouseIsPressed;

        
    }

    function handleFlags(){
        if(flags.loadEmap && s.settings.emapUrl){
            s.emitter.loadEmissionMap(s.settings.emapUrl);
            flags.loadEmap = false;
        }

        if(flags.recolor && s.settings.imageUrl){
            FrameManager.queueRecolor(frames => s.settings.imageFrames = frames, 8);
            flags.recolor = false;
        }

        if(flags.slowRecolor && s.settings.imageUrl){
            FrameManager.queueRecolor(frames => s.settings.imageFrames = frames, 64);
            flags.slowRecolor = false;
        }

        if(flags.dirtyBackground){
            backgroundColor = FrameManager.composeP5Color(s.settings.backgroundColor);
            flags.dirtyBackground = false;
        }

        if(flags.emitTimerReset){
            s.lastEmitMillis = Date.now();
            flags.emitTimerReset = false;
        }

        if(typeof flags.setImageSmoothing === 'boolean'){
            const setSmoothing = {
                false : () => p.noSmooth(),
                true : () => p.smooth()
            }[flags.setImageSmoothing];
            
            setSmoothing();
            flags.setImageSmoothing = null;
        }
    }

    function setParticleBlendMode(modeString){
        const mode = blendModes[modeString.toLowerCase()] ?? blendModes.default;
        p.blendMode(mode);
    }
}