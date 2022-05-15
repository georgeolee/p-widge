import './App.css';
import {sketch} from './sketch.js';
import p5 from 'p5';
import { LabeledSlider } from './components/LabeledSlider.js';
import { Checkbox } from './components/Checkbox';
import { Radio, RadioHeader } from './components/Radio';
import {useRef, useEffect} from 'react';
import { pointer, particleSettings, flags, fps } from './globals';
import { RGBAInput } from './components/RGBAInput';
import { FrameManager } from './particle-system/FrameManager';
import { FileInput } from './components/FileInput';
import { BezierInput } from './components/BezierInput/BezierInput';
import { LinkButton } from './components/LinkButton';

import { GetActiveParticleCount } from './particle-system/Particle';

import fire from './fire.png'

const version = '0.1.2';

/*
*   TODO: 
*         
        THIS : !          

        useEffect cleanup
        stylesheet cleanup
            > fixed mode canvas css            
            > add in a landscape orientation?

        figure out what to do about that empty space at the top *****

        fixed mode - canvas position when embedding as fullsize iframe ; set top via css prop? *****

        -consolidate / clean up media queries
            > intermediate sizes 
*       
        mobile testing
*      
*       continue tooltips - rgba, bz size
*       theme cleanup
*
*       -github images 
*       -styling and stuff  ***
*     
*       
*         
*
*/


function App() {


  const onAppPointerMove = e => {
    const canvasRect = p5ContainerRef.current.querySelector('.p5Canvas')?.getBoundingClientRect();
    if(!canvasRect)return;

    pointer.pageX = e.pageX;
    pointer.pageY = e.pageY;
    pointer.clientX = e.clientX;
    pointer.clientY = e.clientY;
    pointer.canvasX = e.clientX - canvasRect.left;
    pointer.canvasY = e.clientY - canvasRect.top;
    pointer.overCanvas = pointer.canvasX >= 0 && pointer.canvasY >= 0 && pointer.canvasX <= canvasRect.width && pointer.canvasY <= canvasRect.height;
  }

  

  const now = new Date();
  const isNightTime = now.getHours() < 6 || now.getHours() > 18;

  const p5ContainerRef = useRef();

  //create p5 instance & attach touch listeners to p5 canvas
  useEffect(()=>{
    
    const listenerCleanups = [];
    
    const onCanvasTouchStart = e => {
      const touch = e.changedTouches.item(0);
      if(touch) onAppPointerMove(touch);    
    }
  
    const onCanvasTouchEnd = () => {
      pointer.overCanvas = false;
    }

    const attachP5CanvasListeners = (mutationsList) => {
      mutationsList.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if(node.nodeName === 'CANVAS' && node.classList.contains('p5Canvas')){
            node.addEventListener('touchstart', onCanvasTouchStart);
            node.addEventListener('touchend', onCanvasTouchEnd);

            listenerCleanups.push(
              (() => node?.removeEventListener('touchstart', onCanvasTouchStart)),
              (() => node?.removeEventListener('touchend', onCanvasTouchEnd))
            );
          }
        })
      })
    }
    

    const canvasObserver = new MutationObserver(attachP5CanvasListeners);

    canvasObserver.observe(p5ContainerRef.current, {childList: true});
    
    const p = new p5(sketch, p5ContainerRef.current);    

    return () => {
      
      for(const cleanup of listenerCleanups){
        cleanup();
      }

      canvasObserver.disconnect();
      FrameManager.removeGraphicsBuffer();
      p.remove();
        
    };

  },[]);
 
  //print fps & particle count to screen
  useEffect(() => {
    const fpsDisplay = document.getElementById('fps-overlay');
    const particleCountDisplay = document.getElementById('particle-count-overlay');
    const dcp = 0;
    const displayUpdate = setInterval( ()=> {
      fpsDisplay.textContent = `fps: ${Math.round(fps.current * 10**dcp) / 10**dcp || fps.current}`;
      particleCountDisplay.textContent = `particle count: ${GetActiveParticleCount()}`;
      }, 100);

    return () => clearInterval(displayUpdate);
  }, [])

  // attach pointer listeners
  useEffect(()=>{
    document.body.addEventListener('pointermove', onAppPointerMove);

    //listener cleanup
    return () => {
      document.body.removeEventListener('pointermove', onAppPointerMove);
    }
  });

  // get width of vertical scrollbar (if any) and update css property
  useEffect(() =>{
    const computeScrollbarWidth = () => {
      const scrollWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollWidth}px`);
    }

    computeScrollbarWidth();
    window.onresize = computeScrollbarWidth;
  })

  return (
    <div className="App">      

      <div id='canvas-underlay'>
        <img src={fire} alt="happy 8-bit fire" />
      </div>

      <div className='App-header'>
        <div className='title'><h1>p&#8209;widge</h1></div>
        
        <div className='sub'>
          2D particle scratch pad
          <br/>
          version {version}
          <br/>
          © 2022 george lee
        </div>                
      </div>
      
      
      <div className='controls-center' data-panel-tag="color settings">
          <RGBAInput 
            label='Particle Start' 
            rgb='#ff6600' 
            alpha={255} 
            func={rgba => {FrameManager.setStartColor(rgba); flags.recolor = true}} 
            timeoutFunc={()=> flags.slowRecolor = true} 
            timeout={500}
            tooltip='Particle start color.'/>          

          <RGBAInput 
            label='Particle End'             
            rgb='#ff0066' 
            alpha={0} 
            func={rgba => {FrameManager.setEndColor(rgba); flags.recolor = true}} 
            timeoutFunc={()=> flags.slowRecolor = true} 
            timeout={500}
            tooltip='Particle end color.'/>


          <RGBAInput 
            label='Background' 
            rgb='#2d3434' 
            alpha={255} 
            func={rgba => {particleSettings.backgroundColor = rgba; flags.dirtyBackground = true}}
            tooltip='Background color. &#xa; If alpha is less than fully opaque, some of the previous frame will show through as new frames are painted.'/>
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
            tooltip="Create a new particle emission map. &#xa;—&#xa;Opens a new tab where you can design an emitter shape."/>
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
            label='Base Size' 
            min={0} 
            max={200} 
            step={1} 
            defaultValue={100} 
            func={n => particleSettings.particleBaseSize = n}
            tooltip='Base size of each particle, before applying randomness or curve values.'/>
          
          <LabeledSlider 
            label='Randomness' 
            min={0} 
            max={1} 
            step={0.01} 
            func={n => particleSettings.particleSizeRandomFactor = n}
            tooltip='Size randomness.&#xa;—&#xa;The initial speed of each particle is a weighted average between base value B and a random number from 0 to B. This sets the balance of random vs. non-random weight.'/>
        
        
        <div className='bezier-tooltip' data-tooltip='Modifies the size of each particle over its lifetime.&#xa;—&#xa;Click and drag to edit the curve points.'>
          <BezierInput 
            labelTop='Size Curve' 
            labelY='<— Size' 
            labelX='Particle Lifetime —>' 
            points={[0,0.4,   0.5,1,   0.2,0.3,   1,0]} 
            func={lookups => particleSettings.sizeTable = lookups}/>                
        </div>        



          <LabeledSlider 
            label='Base Speed' 
            min={0} 
            max={500} 
            step={1} 
            defaultValue={175} 
            func={n => particleSettings.particleBaseSpeed = n}
            tooltip='Base speed of each particle, before applying randomness or curve values.'/>

          <LabeledSlider 
            label='Randomness' 
            min={0} 
            max={1} 
            step={0.01} 
            func={n => particleSettings.particleSpeedRandomFactor = n}
            tooltip='Speed randomness.&#xa;—&#xa;Uses the same formula as size.'/>

        
        
        <div className='bezier-tooltip' data-tooltip="Modifies the speed of each particle over its lifetime.&#xa;—&#xa;Click and drag to edit the curve points.">
          <BezierInput 
            labelTop='Speed Curve' 
            labelY='<— Speed' 
            labelX='Particle Lifetime —>' 
            points={[0,0.7,   0.5,1,   0.5,0,   1,1]} 
            func={lookups => particleSettings.speedTable = lookups}/>
        </div>

      </div>
      
      
      
      <div ref={p5ContainerRef} className='p5-container'>      
        <input id='canvas-display-toggle' type="checkbox" defaultChecked/>
        <div id='canvas-overlay'>
          <div id='fps-overlay'></div>
          <div id='particle-count-overlay'></div>
        </div>        
      </div>
      
      <div className='controls-right' data-panel-tag="system | emitter properties">

        
        
        <LabeledSlider 
          label='rate' 
          min={0} 
          max={500} 
          step={1} 
          suffix='/s' 
          func={n => particleSettings.rate = n}
          tooltip='Number of particles to emit per second.'/>
        
        <LabeledSlider 
          label='arc' 
          min={0} 
          max={360} 
          step={1} 
          suffix='º' 
          defaultValue={360} 
          func={n => particleSettings.arc = n}
          tooltip='Emission arc for each point defined by the current emitter'/>
        
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
          tooltip='Emitter size as a percentage of canvas size. &#xa;—&#xa;Has no effect on the default emitter, which is a single point.'/>
        
        <Checkbox 
          label='auto emit' 
          func={b => {particleSettings.emitAuto = b; flags.emitTimerReset = true}} 
          tooltip='Toggles between continuous emission mode (default) and emit on mouse press / touch only.'
          checked/>

        <Checkbox 
          label='rotate image by velocity' 
          func={b => particleSettings.rotateByVelocity = b}
          tooltip='Rotate particle images to match the direction of their movement.'/>

        <Checkbox 
          label='image smoothing' 
          func={b => flags.setImageSmoothing = b}
          tooltip='Toggles bilinear filtering when drawing particle textures.'/>
        
        

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
              tooltip='RGB values (scaled between 0 and 1) are multiplied together. The result is always darker.'/>      
          
          </div>
          
          <div className='radio-group'>
            <RadioHeader label='Editor Theme'/>
            
            <Radio 
              name='editor-theme' 
              label='light' 
              func={()=>document.body.classList.remove('dark')} 
              checked={!isNightTime}
              tooltip='A cheery red color theme.'/>

            <Radio 
              name='editor-theme' 
              label='dark' 
              func={()=>{document.body.classList.add('dark')}} 
              checked={isNightTime}
              tooltip='A subdued blue theme. Cut your eyes some slack!'/>
          </div>

        </div>
        
        

        
      </div>            

    </div>
  );
}

export default App;
