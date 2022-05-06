import {useRef} from 'react';
import { Slider } from './Slider/Slider';


export function LabeledSlider(props){
    const valueRef = useRef();
    
    const {
        label = 'Slider',
        min = 0,
        max = 1,
        step = 0.01,
        defaultValue = (min + max) / 2,
        func = n => console.log(`${label} value: ${n}`),
        init = true,
        suffix = '',
        tooltip,
    } = props;
    
    //this gets called on change from inside <Slider/>
    //and also on render, if init is true
    const handleInput = num => {
        valueRef.current.textContent = num + suffix;
        func?.(num);
    }    

    return(
        <div className='labeled-slider'>
            <div className='slider-label'>{label}</div>            
            <div className='slider-input-wrapper' data-tooltip={tooltip}>
            <Slider className='slider-input' func={handleInput} defaultValue={defaultValue} min={min} max={max} step={step} init={init}/>
            </div>            
            <div className='slider-value' ref={valueRef}></div>
        </div>
    );
}