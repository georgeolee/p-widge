import { useRef } from "react";
import { parseHexColorString } from "../utilities";
import { Slider } from "./Slider/Slider";

export function RGBAInput(props){
 
    const {
        rgb = '#ffffff',
        alpha = 255,
        label = 'rgba-input-default',
        func = color => console.log(color),
        timeout = 100,
        timeoutFunc,
    } = props;


    const timeoutRef = useRef(null);

    // get alpha as a hex string
    const a = alpha > 16 ? alpha.toString(16) : '0' + alpha.toString(16);
    
    const colorRef = useRef(parseHexColorString(rgb + a))


    const handleInputAny = () => {        
        func(colorRef.current)
        if(timeoutRef.current) clearTimeout(timeoutRef.current);
        if(typeof timeoutFunc === 'function') timeoutRef.current = setTimeout(timeoutFunc, timeout);
    };
    
    const handleRGBInput = evt => {
        const {r, g, b} = parseHexColorString(evt.target.value);
        colorRef.current.r = r;
        colorRef.current.g = g;
        colorRef.current.b = b;        
        handleInputAny();
    }

    const handleAlphaInput = num => {
        if(colorRef.current) colorRef.current.a = (num**2)/255;        
        handleInputAny();
    };
    

    // don't need this — handleAlphaInput gets called from Slider after render
    // useEffect(() => {
        // func(colorRef.current);
    // });

    return(
        <div className="rgba-picker">
            <div className="rgba-label">{label}</div>
            <label>
            RGB&emsp;<input type="color" className="rgb-input" defaultValue={rgb} onChange={handleRGBInput}/>
            </label>
            <label>                
            {/* Alpha&emsp;<input type="range" min={0} max={255} step={0.5} className="alpha-input" defaultValue={alpha} ref={alphaInputRef} onChange={onChangeAny}/> */}
            Alpha&emsp;<Slider type="range" min={0} max={255} step={0.5} defaultValue={alpha} className="alpha-input" func={handleAlphaInput}/>
            </label>            
        </div>
    );
}