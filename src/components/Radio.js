import { useEffect, useRef } from "react";

export function RadioHeader(props){
    const label = props.label ?? 'Radio Group';

    return(
        <div className="radio radio-header">{label}</div>
    );
}

export function Radio(props){

    const inputRef = useRef();

    const name = props.name ?? 'radio-group-default';
    const label = props.label ?? 'radio-option-default';    
    const checked = !!props.checked || false;
    const init = props.init ?? true;
    const func = props.func ?? (() => console.log(`radio: selected ${label}`));
    const onChange = e => {if(e.target.checked) func()}

    useEffect(()=>{
        inputRef.current.checked = checked;        
        if(init && checked) func();
    },
    [inputRef])

    return(
        <div className="radio">
            <input className="radio-input" type="radio" ref={inputRef} name={name} onChange={onChange}/>
            <div className="radio-label">{label}</div>
        </div>
    );
}