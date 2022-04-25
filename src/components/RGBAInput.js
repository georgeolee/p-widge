import { useEffect, useRef } from "react";
import { parseHexColorString } from "../utilities";

export function RGBAInput(props){
 
    const label = props.label ?? 'rgba-input-default';
    const rgbInputRef = useRef();
    const alphaInputRef = useRef();
    const func = props.func ?? (color => console.log(color));    
    const rgb = props.rgb || '#ffffff';
    const alpha = props.alpha ?? 255;
    const init = props.init ?? true;

    const composeColor = () => {
        const color = parseHexColorString(rgbInputRef.current.value);
        color.a = (Number(alphaInputRef.current.value) / 255) ** 2 * 255;
        return color;
    }

    const onChangeAny = () => func(composeColor());

    useEffect(() => {
        rgbInputRef.current.value = rgb;
        alphaInputRef.current.value = alpha;
        if(init) onChangeAny();
    },
    [rgbInputRef, alphaInputRef])

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