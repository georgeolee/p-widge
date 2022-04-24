import {useEffect, useRef} from 'react';

export function Slider(props){
    const valueRef = useRef();
    const inputRef = useRef();

    const label = props.label ?? 'Slider: ';
    const func = props.func ?? (n => console.log(`slider value: ${n}`));

    const min = props.min ?? 0;
    const max = props.max ?? 1;
    const step = props.step ?? 0.01;    
    const init = props.init ?? true;    
    const defaultValue = props.defaultValue ?? (min + max) / 2;
    
    const onChange = (e) => {
        valueRef.current.innerHTML = e.target.value;
        func?.(Number(e.target.value));
    }    

    useEffect(()=>{        
        valueRef.current.innerHTML = inputRef.current.value;
        if(init) func?.(Number(inputRef.current.value));
    },
    [valueRef, inputRef])

    return(
        <div className='slider'>
            <div className='slider-label'>{label}</div>            
            <input type="range" className='slider-input' ref={inputRef} onChange={onChange} defaultValue={defaultValue} min={min} max={max} step={step}/>
            <div className='slider-value' ref={valueRef}></div>
        </div>
    );
}