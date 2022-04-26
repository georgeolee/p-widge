import {Vector} from "p5";
import { FrameManager } from "./particle-system/FrameManager";
import { ParticleSystem } from "./particle-system/ParticleSystem";
import { mouse, particleSettings, flags } from "./globals";
import { parseHexColorString, randomRange } from "./utilities";

import { V2D } from "./components/BezierInput/V2D";

import { CubicBezier } from "./components/BezierInput/CubicBezier";

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

    randomRange()

    let backgroundColor = FrameManager.composeP5Color(s.settings.backgroundColor);

    // const v2 = new V2D(0, 8)

    // v2.add(new V2D(30,30))

    console.log(
        V2D.sum(
            new V2D(1,1),
            new V2D(1,1),
            new V2D(10,10),
            new V2D(10,10),
            new V2D(100,100),
            new V2D(100,100),
        )
    )

    ////// TESTING STUFF
    console.log('TESTING')
    
    const points = [
        0,0,
        0.5, 1,
        0.5, 1,
        1,0
    ]

    const bz = new CubicBezier(...points);

    // bz.setPoint(2,1,1)

    console.log('BZ TEST')
    console.log(bz.getPointAtParameterValue(0.5))
    
    const lookups = bz.createLookupTable(32);
    console.log(lookups)

    // console.log(bz)
    // bz.setPoint(3, 100, 100)
    // console.log(bz)

    ///TESTING STUFF

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