import {useEffect, useRef} from 'react';
import { Slider } from './Slider/Slider';


export function LabeledSlider(props){
    const valueRef = useRef();
    const inputRef = useRef();
    
    const {
        label = 'Slider',
        min = 0,
        max = 1,
        step = 0.01,
        defaultValue = (min + max) / 2,
        func = n => console.log(`${label} value: ${n}`),
        init = true,
    } = props;
    
    
    const handleInput = num => {
        valueRef.current.textContent = num;
        func?.(num);
    }    

    useEffect(()=>{       
        const sliderValue = valueRef.current.parentNode.querySelector('input').value;
        valueRef.current.textContent = sliderValue;
        if(init) func?.(Number(sliderValue));
    });

    return(
        <div className='slider labeled-slider'>
            <div className='slider-label'>{label}</div>            
            <Slider className='slider-input' func={handleInput} defaultValue={defaultValue} min={min} max={max} step={step} init={init}/>
            <div className='slider-value' ref={valueRef}></div>
        </div>
    );
}