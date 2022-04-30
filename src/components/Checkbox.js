import { useEffect, useRef } from "react";

//label to right or left??????? BIG QUESTIONS?!

export function Checkbox(props){

    const inputRef = useRef();

    const {
        checked = false,
        label = 'Checkbox',
        init = true,
        func = b => console.log(`checkbox value: ${b}`),
    } = props;

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