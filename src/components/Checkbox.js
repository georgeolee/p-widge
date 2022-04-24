import { useEffect, useRef } from "react";

//label to right or left??????? BIG QUESTIONS?!

export function Checkbox(props){

    const inputRef = useRef();

    const checked = props.checked ?? false;
    const label = props.label ?? 'Checkbox'
    const init = props.init ?? true;
    const func = props.func ?? ((b) => console.log(`checkbox value: ${b}`));
    const onChange = e => func(e.target.checked);
    
    

    useEffect(()=>{
        inputRef.current.checked = checked;
        if(init) func(inputRef.current.checked)
    })

    return(
        <div className="checkbox">            
            <input type="checkbox" className="checkbox-input" ref={inputRef} onChange={onChange}/>
            <div className="checkbox-label">{label}</div>
        </div>
    );
}