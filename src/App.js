import './App.css';
import {sketch} from './sketch.js';
import p5 from 'p5';
import { Slider } from './components/Slider';
import { Checkbox } from './components/Checkbox';
import { Radio, RadioHeader } from './components/Radio';

import {useRef, useEffect} from 'react';

import { mouse, particleSettings, flags, fps } from './globals';

import { RGBAInput } from './components/RGBAInput';
import { FrameManager } from './particle-system/FrameManager';
import { FileInput } from './components/FileInput';

import { BezierInput } from './components/BezierInput/BezierInput';

/*
*   TODO: 
*       LOTS OF STUFF!
*       
*       
*         
*       
*         
*       
*       -FPS count
*       
*       -styling and stuff
*     
*       -BezierInput: 
*         
*         >push to github?
*         
*       -linter warnings - useEffect deps, etc.  
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

  //attach p5 instance
  useEffect(()=>{
    console.log('useEffect')
    const p = new p5(sketch, p5ContainerRef.current);

    return () => {
      FrameManager.removeGraphicsBuffer();
      p.remove()
    };

  },[])
 
  //print fps
  useEffect(() => {
    const fpsDisplay = document.getElementById('fps-display');
    const fpsUpdate = setInterval(
      ()=> fpsDisplay.innerHTML = `fps: ${Math.round(fps.current * 10**2) / 10**2 || fps.current}`, 
      100
      );

    return () => clearInterval(fpsUpdate);
  }, [])

  return (
    <div className="App" onPointerMove={onAppPointerMove} onPointerDown={onAppPointerDown} onPointerUp={onAppPointerUp}>
      <header className="App-header">p-widget</header>      
      
      <div className='controls-left'>        
        
        <Slider label='lifetime' min={0} max={2} step={0.01} func={n => particleSettings.particleLifetime = n}/>
        
        <Slider label='Max Size' min={0} max={200} step={1} defaultValue={150} func={n => particleSettings.particleBaseSize = n}/>
        <Slider label='Size Random Factor' min={0} max={1} step={0.01} func={n => particleSettings.particleSizeRandomFactor = n}/>
        <BezierInput labelTop='Size Curve' labelY='<— Size' labelX='Particle Lifetime —>' points={[0,0.4,   0.5,1,   0.2,0.3,   1,0]} func={lookups => particleSettings.sizeTable = lookups}/>        
        
        <Slider label='Max Speed' min={0} max={500} step={1} defaultValue={175} func={n => particleSettings.particleBaseSpeed = n}/>
        <Slider label='Speed Random Factor' min={0} max={1} step={0.01} func={n => particleSettings.particleSpeedRandomFactor = n}/>
        <BezierInput labelTop='Speed Curve' labelY='<— Speed' labelX='Particle Lifetime —>' points={[0,0.7,   0.5,1,   0.5,0,   1,1]} func={lookups => particleSettings.speedTable = lookups}/>
      
        <Checkbox label='dark?' func={()=>{document.body.classList?.toggle('dark')}} init={false}/>
      </div>
      
      <div ref={p5ContainerRef} className='p5-container'>
        <div id='fps-display'></div>
      </div>
      
      <div className='controls-right'>
        <Slider label='rate' min={0} max={500} step={1} func={n => particleSettings.rate = n}/>
        <Slider label='arc' min={0} max={360} step={1}  defaultValue={360} func={n => particleSettings.arc = n}/>
        <Slider label='rotation' min={0} max={360} step={1} defaultValue={0} func={n => particleSettings.rotation = n}/>
        <Slider label='size' min={0} max={100} step={1} defaultValue={50} func={n => particleSettings.emitterSize = n}/>
        <Checkbox label='auto emit' func={b => {particleSettings.emitAuto = b; flags.emitTimerReset = true}} checked/>
        <Checkbox label='rotate particles by velocity' func={b => particleSettings.rotateByVelocity = b}/>
        

        <FileInput label='Particle Image' func={url=>{particleSettings.imageUrl = url; flags.recolor = true}}/>

        <FileInput label='Emission Map' func={url => {particleSettings.emapUrl = url; flags.loadEmap = true}}/>

        <RadioHeader label='Blend Mode'/>
        <Radio name='blend-mode'label='alpha' func={()=>particleSettings.p5BlendMode = 'blend'} />
        <Radio name='blend-mode'label='add' func={()=>particleSettings.p5BlendMode = 'add'} checked/>        
        <Radio name='blend-mode'label='multiply' func={()=>particleSettings.p5BlendMode = 'multiply'} />
        <Radio name='blend-mode'label='screen' func={() => particleSettings.p5BlendMode = 'screen'}/>
        <Radio name='blend-mode'label='hard light' func={() => particleSettings.p5BlendMode = 'hard_light'}/>
      </div>      

      <div className='controls-center'>
        <RGBAInput label='start color' rgb='#ff6600' alpha={255} func={rgba => {FrameManager.setStartColor(rgba); flags.recolor = true}} timeoutFunc={()=> flags.slowRecolor = true} timeout={1000}/>
        <RGBAInput label='end color' rgb='#ff0066' alpha={0} func={rgba => {FrameManager.setEndColor(rgba); flags.recolor = true}} timeoutFunc={()=> flags.slowRecolor = true} timeout={1000}/>
        <RGBAInput label='background color' rgb='#000000' alpha={255} func={rgba => {particleSettings.backgroundColor = rgba; flags.dirtyBackground = true}}/>
      </div>

    </div>
  );
}

export default App;
