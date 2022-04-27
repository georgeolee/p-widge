import './App.css';
import {sketch} from './sketch.js';
import p5 from 'p5';
import { Slider } from './components/Slider';
import { Checkbox } from './components/Checkbox';
import { Radio, RadioHeader } from './components/Radio';

import {useRef, useEffect} from 'react';

import { mouse, particleSettings, flags } from './globals';

import { RGBAInput } from './components/RGBAInput';
import { FrameManager } from './particle-system/FrameManager';
import { FileInput } from './components/FileInput';

import { BezierInput } from './components/BezierInput/BezierInput';

/*
*   TODO: 
*       LOTS OF STUFF!
*       
*       -RGBAInput  
*         > LQ / HQ - 4/8/32? depending on still editing vs input release
*         > change implementation 
*             — on pointer up > after N seconds w/o input
*       
*       -canvas size - settings?
*       -randomness sliders
*       -emitter size slider
*     
*       CubicBezier: 
*         -styling - continue transitiion from inline to stylesheet
*         -get canvas dimensions from CSS?
*         
*         
*
*         
*
*/

function App() {


  const onAppPointerMove = e => {
    const canvasRect = p5ContainerRef.current.querySelector('canvas')?.getBoundingClientRect();
    if(!canvasRect){console.log('onAppPointerMove : canvasRect null or undefined'); return}

    mouse.pageX = e.pageX;
    mouse.pageY = e.pageY;
    mouse.clientX = e.clientX;
    mouse.clientY = e.clientY;
    mouse.canvasX = e.clientX - canvasRect.left;
    mouse.canvasY = e.clientY - canvasRect.top;
    mouse.overCanvas = mouse.canvasX >= 0 && mouse.canvasY >= 0 && mouse.canvasX <= canvasRect.width && mouse.canvasY <= canvasRect.height;
  }

  const onAppPointerUp = e => {
    mouse.buttons = e.buttons;
  }

  const onAppPointerDown = e => {
    mouse.buttons = e.buttons;
  }


  const p5ContainerRef = useRef();

  useEffect(()=>{
    console.log('useEffect')
    const p = new p5(sketch, p5ContainerRef.current);


    return(()=> {
      p.remove();
    });

  },[])
 
  return (
    <div className="App" onPointerMove={onAppPointerMove} onPointerDown={onAppPointerDown} onPointerUp={onAppPointerUp}>
      <header className="App-header">p-widget</header>      
      
      <div className='controls-left'>        
        
        <Slider label='lifetime' min={0} max={2} step={0.01} func={n => particleSettings.particleLifetime = n}/>
        
        <Slider label='Base Size' min={0} max={200} step={1} defaultValue={150} func={n => particleSettings.particleBaseSize = n}/>
        <BezierInput labelTop='Size Curve' labelY='% Base Size' labelX='Particle Lifetime —>' points={[0,0,   0.5,1,   0.5,2,   1,1]} func={lookups => particleSettings.sizeTable = lookups}/>        
        
        <Slider label='Base Speed' min={0} max={500} step={1} defaultValue={175} func={n => particleSettings.particleBaseSpeed = n}/>
        <BezierInput labelTop='Speed Curve' labelY='% Base Speed' labelX='Particle Lifetime —>' points={[0,0,   0.5,1,   0.5,0,   1,1]} func={lookups => particleSettings.speedTable = lookups}/>
      </div>
      
      <div ref={p5ContainerRef} className='p5-container'></div>
      
      <div className='controls-right'>
        <Slider label='rate' min={0} max={500} step={1} func={n => particleSettings.rate = n}/>
        <Slider label='rotation' min={0} max={360} step={1} defaultValue={0} func={n => particleSettings.rotation = n}/>
        <Checkbox label='auto emit' func={b => particleSettings.emitAuto = b} checked/>
        

        <FileInput label='Particle Image' func={url=>{particleSettings.imageUrl = url; flags.recolor = true}}/>

        <FileInput label='Emission Map' func={url => {particleSettings.emapUrl = url; flags.loadEmap = true}}/>

        <RadioHeader label='Blend Mode'/>
        <Radio name='blend-mode'label='alpha' func={()=>particleSettings.p5BlendMode = 'blend'} />
        <Radio name='blend-mode' label='add' func={()=>particleSettings.p5BlendMode = 'add'} checked/>        
        <Radio name='blend-mode'label='multiply' func={()=>particleSettings.p5BlendMode = 'multiply'} />
        <Radio name='blend-mode'label='screen' func={() => particleSettings.p5BlendMode = 'screen'}/>
        <Radio name='blend-mode'label='hard light' func={() => particleSettings.p5BlendMode = 'hard_light'}/>
        
        <BezierInput func={lookups => {}}/>
      </div>      

      <div className='controls-center'>
        <RGBAInput label='start color' rgb='#ff6600' alpha={255} func={rgba => {FrameManager.setStartColor(rgba); flags.recolor = true}} finish={()=> flags.slowRecolor = true}/>
        <RGBAInput label='end color' rgb='#ff0066' alpha={0} func={rgba => {FrameManager.setEndColor(rgba); flags.recolor = true}} finish={()=> flags.slowRecolor = true}/>
        <RGBAInput label='background color' rgb='#000000' alpha={255} func={rgba => {particleSettings.backgroundColor = rgba; flags.dirtyBackground = true}}/>
      </div>

    </div>
  );
}

export default App;
