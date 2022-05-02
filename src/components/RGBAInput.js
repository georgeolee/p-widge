import { useEffect, useRef } from "react";
import { parseHexColorString } from "../utilities";

export function RGBAInput(props){
 
    const {
        rgb = '#ffffff',
        alpha = 255,
        label = 'rgba-input-default',
        func = color => console.log(color),
        timeout = 100,
        timeoutFunc,
    } = props;

    const rgbInputRef = useRef();
    const alphaInputRef = useRef();
    const timeoutRef = useRef(null);

    
    const composeColor = () => {
        const color = parseHexColorString(rgbInputRef.current.value);
        color.a = ((Number(alphaInputRef.current.value) / 255) ** 2) * 255;
        return color;
    }

    const onChangeAny = () => {        
        func(composeColor());
        if(timeoutRef.current) clearTimeout(timeoutRef.current);
        if(typeof timeoutFunc === 'function') timeoutRef.current = setTimeout(timeoutFunc, timeout);
    };
    
    //initialize input values
    useEffect(()=>{
        rgbInputRef.current.value = rgb;
        alphaInputRef.current.value = alpha;
    }, [rgb, alpha]);

    useEffect(() => {
        onChangeAny();
    })

    return(
        <div className="rgba-picker">
            <div className="rgba-label">{label}</div>
            <label>
            RGB&emsp;<input type="color" className="rgb-input" ref={rgbInputRef} onChange={onChangeAny}/>
            </label>
            <label>
            Alpha&emsp;<input type="range" min={0} max={255} step={0.5} className="alpha-input" ref={alphaInputRef} onChange={onChangeAny}/>
            </label>            
        </div>
    );
}