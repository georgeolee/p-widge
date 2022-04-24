import './App.css';
import {sketch} from './sketch.js';
import p5 from 'p5';
import { Slider } from './components/Slider';
import { Checkbox } from './components/Checkbox';
import { Radio } from './components/Radio';

import {useRef, useEffect} from 'react';

import { mouse, particleSettings } from './globals';

import { parseHexColorString } from './utilities';

/*
*   TODO: 
*       LOTS OF STUFF!
*       -managing image - where / how to do
*         > color, url move into particle system settings? 
*       -link particle system position to mouse ; use app mouse pos relative to canvas element rather than p5 variable
*         > mouse over canvas : lerp towards mouse
*         > mouse not over canvas : lerp towards canvas center
*       -keep it clean

*       -begin work on ui ; figure out what is reusable & what should be tweaked / redone
*         > keep inline styles to a minimum
*
*       -canvas size, blend mode - where do these settings go?
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


  const p5ContainerRef = useRef();
  useEffect(()=>{
    const p = new p5(sketch, p5ContainerRef.current);

    return(()=> {
      p.remove();
    });

  },[])

  return (
    <div className="App" onPointerMove={onAppPointerMove}>
      <header className="App-header">p-widget</header>      
      
      <div className='controls-left'>
        <Slider label='size' min={0} max={200} step={1} func={n => particleSettings.particleBaseSize = n}/>
        <Slider label='speed' min={0} max={500} step={1} func={n => particleSettings.particleBaseSpeed = n}/>
        <Slider label='lifetime' min={0} max={2} step={0.01} func={n => particleSettings.particleLifetime = n}/>
      </div>
      
      <div ref={p5ContainerRef} className='p5-container'></div>
      
      <div className='controls-right'>
        <Slider label='rate' min={0} max={500} step={1} func={n => particleSettings.rate = n}/>
        <Slider label='rotation' min={0} max={360} step={1} func={n => particleSettings.rotation = n}/>
        <Checkbox label='auto emit' func={b => particleSettings.emitAuto = b} checked/>

        <Radio label='option A' checked/>
        <Radio label='option B'/>
      </div>      

    </div>
  );
}

export default App;
