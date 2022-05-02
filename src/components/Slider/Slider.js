import {useEffect, useRef} from 'react';
import './Slider.css';

export function Slider(props){
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
    
    const onChange = (e) => {
        valueRef.current.textContent = e.target.value;
        func?.(Number(e.target.value));
    }    

    useEffect(()=>{        
        valueRef.current.textContent = inputRef.current.value;
        if(init) func?.(Number(inputRef.current.value));
    });

    return(
        <div className='slider'>
            <div className='slider-label'>{label}</div>            
            <input type="range" className='slider-input' ref={inputRef} onChange={onChange} defaultValue={defaultValue} min={min} max={max} step={step}/>
            <div className='slider-value' ref={valueRef}></div>
        </div>
    );
}