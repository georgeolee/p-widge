import './App.css';
import {sketch} from './sketch.js';
import p5 from 'p5';
import { LabeledSlider } from './components/LabeledSlider.js';
import { Checkbox } from './components/Checkbox';
import { Radio, RadioHeader } from './components/Radio';
import { GroupName } from './components/GroupName';
import {useRef, useEffect} from 'react';
import { mouse, particleSettings, flags, fps } from './globals';
import { RGBAInput } from './components/RGBAInput';
import { FrameManager } from './particle-system/FrameManager';
import { FileInput } from './components/FileInput';
import { BezierInput } from './components/BezierInput/BezierInput';
import { GetActiveParticleCount } from './particle-system/Particle';


/*
*   TODO: 
*       
*
*       -figure out font situation *** 
*       -emap link & icon cleanup ; black open icon rework?       
*       

*       -delete filter stuff
*      
*       continue tooltips - rgba
*       continue stylesheet cleanup
*       theme cleanup
*       control cleanup
*
*       -github images 
*       -styling and stuff  ***
*     
*       -BezierInput: 
*         - separate lookup res from sample res?
*         >push to github?
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
    console.log('useEffect')
    const p = new p5(sketch, p5ContainerRef.current);

    return () => {
      FrameManager.removeGraphicsBuffer();
      p.remove()
    };

  },[])
 
  //print fps & particle count to screen
  useEffect(() => {
    const fpsDisplay = document.getElementById('fps-display');
    const particleCountDisplay = document.getElementById('particle-count-display');
    const dcp = 0;
    const displayUpdate = setInterval( ()=> {
      fpsDisplay.textContent = `fps: ${Math.round(fps.current * 10**dcp) / 10**dcp || fps.current}`;
      particleCountDisplay.textContent = `particle count: ${GetActiveParticleCount()}`;
      }, 100);

      console.log(getComputedStyle(document.body).getPropertyValue('font-family'))

    return () => clearInterval(displayUpdate);
  }, [])


  return (
    <div className="App" onPointerMove={onAppPointerMove}>      



      <h1 className="App-header" data-tooltip="words and stuff">p-widget</h1>            
      <div className='controls-left'>        
        
        <GroupName label='Lifetime'/>
        <LabeledSlider 
          label='Lifetime' 
          min={0} 
          max={5} 
          step={0.01} 
          func={n => particleSettings.particleLifetime = n}
          suffix=' s'
          tooltip='How many seconds each particle remains active for after being emitted.'/>
        
        
        <GroupName label='Size'/>
        <LabeledSlider 
          label='Max' 
          min={0} 
          max={200} 
          step={1} 
          defaultValue={150} 
          func={n => particleSettings.particleBaseSize = n}
          tooltip='Max size of each particle, before applying randomness.'/>
        
        <LabeledSlider 
          label='Random Factor' 
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

        <GroupName label='Speed'/>

        <LabeledSlider 
          label='Max' 
          min={0} 
          max={500} 
          step={1} 
          defaultValue={175} 
          func={n => particleSettings.particleBaseSpeed = n}
          tooltip='Set the maximum particle speed. This corresponds to the top of the bezier graph below.'/>

        <LabeledSlider 
          label='Random Factor' 
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
        <div id='canvas-display-area'>
          <div id='fps-display'></div>
          <div id='particle-count-display'></div>
        </div>
      </div>
      
      <div className='controls-right'>

        <GroupName label='Emitter Settings'/>
        
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
          tooltip='Set the emission arc for each point defined by the current emitter.'/>
        
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
          tooltip='Set emitter size as a percentage of canvas size. Has no effect on the default emitter, which is a single point.'/>
        
        <Checkbox 
          label='auto emit' 
          func={b => {particleSettings.emitAuto = b; flags.emitTimerReset = true}} 
          tooltip='Emit particles continuously. If unchecked, you can still click + hold over the canvas to spawn particles.'
          checked/>

        <Checkbox 
          label='rotate image by velocity' 
          func={b => particleSettings.rotateByVelocity = b}
          tooltip='Rotate particle images to match the direction of their movement.&#xa;SLOW!'/>

        <Checkbox 
          label='image smoothing' 
          func={b => flags.setImageSmoothing = b}
          tooltip='Toggles bilinear filtering on or off.&#xa;&#xa;SLOW! Leave this off by default.'/>

        <div style={{display:'flex'}}>
          <FileInput 
              label='Load Particle Image' 
              func={url=>{particleSettings.imageUrl = url; flags.recolor = true}}
              tooltip="Import a PNG image to use for particles."
              />          
          
          <FileInput 
            label='Load E-Map' 
            func={url => {particleSettings.emapUrl = url; flags.loadEmap = true}}
            tooltip="Import a PNG image that defines a set of particle emission vectors."
            />
        </div>
        
        

        <div style={{display:'flex', justifyContent:'space-between'}}>
          <div>
            <RadioHeader label='Blend Mode' tooltip='Choose how the canvas blends overlapping colors together.'/>
            <Radio 
              name='blend-mode'
              label='alpha' 
              func={()=>particleSettings.p5BlendMode = 'blend'} 
              tooltip='"Normal" blend mode. Alpha values are used to blend colors together.'/>

            <Radio 
              name='blend-mode'
              label='add' 
              func={()=>particleSettings.p5BlendMode = 'add'} 
              tooltip='RGB values are added together. The result is always brighter.' 
              checked/>

            <Radio 
              name='blend-mode'
              label='multiply' 
              func={()=>particleSettings.p5BlendMode = 'multiply'} 
              tooltip='RGB values (scaled between 0 and 1) are multiplied together. The result is always darker.&#xa;Note: SLOW!'/>      
          
          </div>
          
          <div>
            <RadioHeader label='Editor Theme' tooltip='Choose a color theme for the editor.'/>
            
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
        
        <div style={{display:'flex', alignItems:'center'}}>
          <a href="https://georgelee.space/build" target='_blank'></a> create an emission map
        </div>

      </div>      

      <div className='controls-center'>
        <GroupName label="Colors"/>
        <div className='color-inputs'>
          <RGBAInput 
            label='start color' 
            rgb='#ff6600' 
            alpha={255} 
            func={rgba => {FrameManager.setStartColor(rgba); flags.recolor = true}} 
            timeoutFunc={()=> flags.slowRecolor = true} 
            timeout={500}
            tooltip='Tint color for each particle at the start of its lifetime.&#xa;Particle tint will transition between this and end color over its lifetime.'/>

          <RGBAInput 
            label='end color' 
            rgb='#ff0066' 
            alpha={0} 
            func={rgba => {FrameManager.setEndColor(rgba); flags.recolor = true}} 
            timeoutFunc={()=> flags.slowRecolor = true} 
            timeout={500}
            tooltip='Tint color for each particle at the end of its lifetime.'/>
            
          <RGBAInput 
            label='background color' 
            rgb='#000000' 
            alpha={255} 
            func={rgba => {particleSettings.backgroundColor = rgba; flags.dirtyBackground = true}}
            tooltip='Background color to paint over canvas at the start of each frame. &#xa; If alpha is less than fully opaque, some of the previous frame will remain.'/>
        </div>        
      </div>

    </div>
  );
}

export default App;
