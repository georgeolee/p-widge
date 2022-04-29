import { useEffect, useRef } from "react";
import { parseHexColorString } from "../utilities";
import { mouse } from "../globals";

export function RGBAInput(props){
 
    const rgb = props.rgb || '#ffffff';
    const alpha = props.alpha ?? 255;
    const label = props.label ?? 'rgba-input-default';
    const rgbInputRef = useRef();
    const alphaInputRef = useRef();

    const func = props.func ?? (color => console.log(color));    
    

    const timeoutRef = useRef(null);

    


    const composeColor = () => {
        const color = parseHexColorString(rgbInputRef.current.value);
        color.a = (Number(alphaInputRef.current.value) / 255) ** 2 * 255;
        return color;
    }

    const onChangeAny = () => {        
        func(composeColor()); console.log('rgba change; buttons ' + mouse.buttons);
        if(timeoutRef.current) clearTimeout(timeoutRef.current);
        if(props.timeoutFunc) timeoutRef.current = setTimeout(props.timeoutFunc, props.timeout ?? 100);
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
            Alpha&emsp;<input type="range" min={0} max={255} step={1} className="alpha-input" ref={alphaInputRef} onChange={onChangeAny}/>
            </label>            
        </div>
    );
}