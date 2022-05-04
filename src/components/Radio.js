import { useEffect, useRef } from "react";

export function RadioHeader(props){
    const {label = 'Radio Group'} = props;

    return(
        <div className="radio radio-header">
            {label}
        </div>
    );
}

export function Radio(props){

    const inputRef = useRef();  

    const {
        name = 'radio-group-default', 
        label = 'radio-option-default', 
        func = () => console.log('checked ' + label), 
        checked = false, 
        init = true } = props;

    useEffect(()=>{
        inputRef.current.checked = !!checked;        
        if(init && checked) func?.();
    },
    [init, func, checked])

    return(
        <div className="radio radio-item">
            <input 
                className="radio-input" 
                type="radio" ref={inputRef} 
                name={name} 
                onChange={e => {if(e.target.checked) func?.()}}
            />
            <div className="radio-label">
                {label}
            </div>
        </div>
    );
}