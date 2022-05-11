import './App.css';
import {sketch} from './sketch.js';
import p5 from 'p5';
import { LabeledSlider } from './components/LabeledSlider.js';
import { Checkbox } from './components/Checkbox';
import { Radio, RadioHeader } from './components/Radio';
import {useRef, useEffect} from 'react';
import { mouse, particleSettings, flags, fps } from './globals';
import { RGBAInput } from './components/RGBAInput';
import { FrameManager } from './particle-system/FrameManager';
import { FileInput } from './components/FileInput';
import { BezierInput } from './components/BezierInput/BezierInput';
import { LinkButton } from './components/LinkButton';

import { GetActiveParticleCount } from './particle-system/Particle';

const version = '0.1.1';

/*
*   TODO: 
*         
        THIS : !          
          
  *       -speed and size tags
          -mid tone / low contrast theme
          -css breakpoints for in-between window sizes ; 2 col layout?

*       -figure out group heading / panel heading / tag situation *****
*       -major css housekeeping 
*       
        -favicon
*      
*       continue tooltips - rgba, placement (currently, left slider values get covered up), appearance & timing
*       continue stylesheet cleanup
*       theme cleanup
*       control cleanup
*
*       -github images 
*       -styling and stuff  ***
*     
*       -BezierInput: 
*         - separate lookup res from sample res?
*         >github update
*         
*       -linter warnings - useEffect deps, etc.  
*       
*         
*
*/


function App() {


  const onAppPointerMove = e => {
    const canvasRect = p5ContainerRef.current.getBoundingClientRect();
    if(!canvasRect)return;

    mouse.pageX = e.pageX;
    mouse.pageY = e.pageY;
    mouse.clientX = e.clientX;
    mouse.clientY = e.clientY;
    mouse.canvasX = e.clientX - canvasRect.left;
    mouse.canvasY = e.clientY - canvasRect.top;
    mouse.overCanvas = mouse.canvasX >= 0 && mouse.canvasY >= 0 && mouse.canvasX <= canvasRect.width && mouse.canvasY <= canvasRect.height;
  }

  const now = new Date();
  const isNightTime = now.getHours() < 6 || now.getHours() > 18;


  const p5ContainerRef = useRef();

  //attach p5 instance
  useEffect(()=>{
    const p = new p5(sketch, p5ContainerRef.current);

    return () => {
      FrameManager.removeGraphicsBuffer();
      p.remove()
    };

  },[]);
 
  //print fps & particle count to screen
  useEffect(() => {
    const fpsDisplay = document.getElementById('fps-display');
    const particleCountDisplay = document.getElementById('particle-count-display');
    const dcp = 0;
    const displayUpdate = setInterval( ()=> {
      fpsDisplay.textContent = `fps: ${Math.round(fps.current * 10**dcp) / 10**dcp || fps.current}`;
      particleCountDisplay.textContent = `particle count: ${GetActiveParticleCount()}`;
      }, 100);

    return () => clearInterval(displayUpdate);
  }, [])


  // attach mouse listener
  useEffect(()=>{
    document.body.addEventListener('pointermove', onAppPointerMove);

    return () => document.body.removeEventListener('pointermove', onAppPointerMove);
  });


  return (
    <div className="App">      

      <div className='App-header'>
        <div className='title'><h1>p-widge </h1></div>
        
        <div className='sub'>
          2D particle scratch pad
          <br/>
          version {version}
          <br/>
          © 2022 george lee
        </div>                
      </div>
      
      
      <div className='controls-center' data-panel-tag="color settings">
        <div className='color-inputs'>

          <div>
          <RGBAInput 
            label='Particle Start' 
            rgb='#ff6600' 
            alpha={255} 
            func={rgba => {FrameManager.setStartColor(rgba); flags.recolor = true}} 
            timeoutFunc={()=> flags.slowRecolor = true} 
            timeout={500}
            tooltip='Tint color for each particle at the start of its lifetime.&#xa;Particle tint will transition between this and end color over its lifetime.'/>
          </div>

          <RGBAInput 
            label='Particle End'             
            rgb='#ff0066' 
            alpha={0} 
            func={rgba => {FrameManager.setEndColor(rgba); flags.recolor = true}} 
            timeoutFunc={()=> flags.slowRecolor = true} 
            timeout={500}
            tooltip='Tint color for each particle at the end of its lifetime.'/>


          <RGBAInput 
            label='Background' 
            rgb='#2d3434' 
            alpha={255} 
            func={rgba => {particleSettings.backgroundColor = rgba; flags.dirtyBackground = true}}
            tooltip='Background color to paint over canvas at the start of each frame. &#xa; If alpha is less than fully opaque, some of the previous frame will show through.'/>
        </div>        
      </div>


      <div className='buttons'>
          <FileInput 
                label='Load Image' 
                className='pimage-input'
                func={url=>{particleSettings.imageUrl = url; flags.recolor = true}}
                tooltip="Import a PNG image to use for particles."
                />          
            
          <FileInput 
            label='Load E&#8209;Map' 
            className='emap-input'
            func={url => {particleSettings.emapUrl = url; flags.loadEmap = true}}
            tooltip="Import a PNG image that defines a set of particle emission vectors. &#xa;—&#xa;To create an emission map, click the 'Create E-Map' button."
            />

          <LinkButton 
            label='Create E&#8209;Map'
            className="emap-link" 
            href='https://georgelee.space/build'             
            tooltip="Create a new particle emission map. &#xa;—&#xa;Links to a new tab where you can design an emitter shape."/>
        </div>

      <div className='horizontal-gutter'></div>

      <div className='controls-left' data-panel-tag="particle properties">        
        
        
        <LabeledSlider 
          label='Lifetime' 
          min={0} 
          max={5} 
          defaultValue={1.5}
          step={0.01} 
          func={n => particleSettings.particleLifetime = n}
          suffix=' s'
          tooltip='How many seconds each particle remains active for after being emitted.'/>
        
        

        
          <LabeledSlider 
            label='Max Size' 
            min={0} 
            max={200} 
            step={1} 
            defaultValue={100} 
            func={n => particleSettings.particleBaseSize = n}
            tooltip='Max size of each particle, before applying randomness.'/>
          
          <LabeledSlider 
            label='Randomness' 
            min={0} 
            max={1} 
            step={0.01} 
            func={n => particleSettings.particleSizeRandomFactor = n}
            tooltip='size'/>
        
        
        <div className='bezier-tooltip' data-tooltip='size curve'>
          <BezierInput 
            labelTop='Size Curve' 
            labelY='<— Size' 
            labelX='Particle Lifetime —>' 
            points={[0,0.4,   0.5,1,   0.2,0.3,   1,0]} 
            func={lookups => particleSettings.sizeTable = lookups}/>                
        </div>        



          <LabeledSlider 
            label='Max Speed' 
            min={0} 
            max={500} 
            step={1} 
            defaultValue={175} 
            func={n => particleSettings.particleBaseSpeed = n}
            tooltip='Set the maximum particle speed. This corresponds to the top of the bezier graph below.'/>

          <LabeledSlider 
            label='Randomness' 
            min={0} 
            max={1} 
            step={0.01} 
            func={n => particleSettings.particleSpeedRandomFactor = n}
            tooltip='The max speed of each emitted particle gets multiplied by a random number between 1 and 1 minus this number.'/>

        
        
        <div className='bezier-tooltip' data-tooltip="Modifies the speed of a particle over its lifetime. Click and drag to edit the curve points.">
          <BezierInput 
            labelTop='Speed Curve' 
            labelY='<— Speed' 
            labelX='Particle Lifetime —>' 
            points={[0,0.7,   0.5,1,   0.5,0,   1,1]} 
            func={lookups => particleSettings.speedTable = lookups}/>
        </div>

      </div>
      
      
      
      <div ref={p5ContainerRef} className='p5-container'>      
        <input type="checkbox"/>
        <div id='canvas-display-area'>
          <div id='fps-display'></div>
          <div id='particle-count-display'></div>
        </div>        
      </div>
      
      <div className='controls-right' data-panel-tag="emitter properties">

        
        
        <LabeledSlider 
          label='rate' 
          min={0} 
          max={500} 
          step={1} 
          suffix='/s' 
          func={n => particleSettings.rate = n}
          tooltip='Set the number of particles emitted per second.'/>
        
        <LabeledSlider 
          label='arc' 
          min={0} 
          max={360} 
          step={1} 
          suffix='º' 
          defaultValue={360} 
          func={n => particleSettings.arc = n}
          tooltip='Set the emission arc for each point defined by the current emitter'/>
        
        <LabeledSlider 
          label='rotation' 
          min={0} 
          max={360} 
          step={1} 
          suffix='º' 
          defaultValue={0} 
          func={n => particleSettings.rotation = n}
          tooltip='Rotate the entire emitter around its center.'/>
        
        <LabeledSlider 
          label='size' 
          min={0} 
          max={100} 
          step={1} 
          suffix='%' 
          defaultValue={50} 
          func={n => particleSettings.emitterSize = n}
          tooltip='Set emitter size as a percentage of canvas size. &#xa;—&#xa;Has no effect on the default emitter, which is a single point.'/>
        
        <Checkbox 
          label='auto emit' 
          func={b => {particleSettings.emitAuto = b; flags.emitTimerReset = true}} 
          tooltip='Toggles between continuous emission mode (default) and emit on mouse press only.'
          checked/>

        <Checkbox 
          label='rotate image by velocity' 
          func={b => particleSettings.rotateByVelocity = b}
          tooltip='Rotate particle images to match the direction of their movement.&#xa;SLOW!'/>

        <Checkbox 
          label='image smoothing' 
          func={b => flags.setImageSmoothing = b}
          tooltip='Toggles bilinear filtering off (default) or on (SLOW!)'/>
        
        

        <div style={{display:'flex', justifyContent:'space-between'}}>
          <div className='radio-group'>
            <RadioHeader label='Blend Mode'/>
            <Radio 
              name='blend-mode'
              label='alpha' 
              func={()=>particleSettings.p5BlendMode = 'blend'} 
              tooltip='"Normal" blend mode. Alpha values are used to blend colors together.'
              checked/>

            <Radio 
              name='blend-mode'
              label='add' 
              func={()=>particleSettings.p5BlendMode = 'add'} 
              tooltip='RGB values are added together. The result is always brighter.' 
              />

            <Radio 
              name='blend-mode'
              label='multiply' 
              func={()=>particleSettings.p5BlendMode = 'multiply'} 
              tooltip='RGB values (scaled between 0 and 1) are multiplied together. The result is always darker.&#xa;Note: SLOW!'/>      
          
          </div>
          
          <div className='radio-group'>
            <RadioHeader label='Editor Theme'/>
            
            <Radio 
              name='editor-theme' 
              label='light' 
              func={()=>document.body.classList.remove('dark', 'toast')} 
              checked={!isNightTime}/>

            <Radio 
              name='editor-theme' 
              label='dark' 
              func={()=>{document.body.classList.remove('toast'); document.body.classList.add('dark')}} 
              checked={isNightTime}/>

            <Radio name='editor-theme' 
              label='toast' 
              func={()=>{document.body.classList.remove('dark', 'light'); document.body.classList.add('toast')}}/>
          </div>

        </div>
        
        

        
      </div>            

    </div>
  );
}

export default App;
