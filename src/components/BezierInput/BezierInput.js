import { useEffect, useRef} from "react";
import { CubicBezier } from "./CubicBezier";
import { CubicBezierCanvas } from "./CubicBezierCanvas";
import './BezierInput.css';


/**
 * A bezier curve with click and drag edit handles. 
 * It passes an array of lookup values to a handler function after initial render and on user input.
 * Lookup values are interpolated
 * @param props
 * @param {function} .func - function to handle lookup values ; logs to console by default
 * @param {number} .resolution - number of lookup entries to generate
 * @param {(number|vector)[]} .points - an array of 8 numbers or 4 vector objects specifying initial control points for the bezier curve
 * @param {string} .labelX.labelY.labelTop - graph labels
 * @param {string} .id
 * @param {string} .className
 * @returns 
 */
export function BezierInput(props){
    const resolution = props.resolution || 64; 
    const labelTop = props.labelTop ?? 'New Bezier Input';  
    const labelX = props.labelX ?? 'x axis label';
    const labelY = props.labelY ?? 'y axis label';
    const points = props.points ?? [    
        0,0,    //P0
        0,1,    //P1
        1,0,    //P2
        1,1     //P3
    ];    
    
    const bezierRef = useRef(new CubicBezier(...points).normalize());
    const bezierCanvasRef = useRef(new CubicBezierCanvas(null, bezierRef.current));
    const canvasElementRef = useRef();

    const handleCanvasPointerMove = e => {
        const func = props.func ?? (lookups => {console.log('bezier lookup values:'); console.log(lookups)});
        bezierCanvasRef.current.onCanvasPointerMove(e);        
        
        if(bezierCanvasRef.current.editPoint){  //editing?
            func(bezierRef.current.createLookupTable(resolution));
        }     
    }

    //attach the rendered canvas to the CubicBezierCanvas instance
    useEffect(() => {        
        bezierCanvasRef.current.attachCanvas(canvasElementRef.current);            
    },[]);

    //call the handler function after initial render or function change
    useEffect(()=>{
        const func = props.func ?? (lookups => {console.log('bezier lookup values:'); console.log(lookups)});
        func(bezierRef.current.createLookupTable(resolution));
    }, [props.func, resolution]);

    return(        
        <div 
            className={'bezier-input' + (props.className ? ' ' + props.className : '')} 
            id={props.id}>
            
            <div className="bezier-label-top" >{labelTop}</div>
            <div className="bezier-label-y">{labelY}</div>
            
            <canvas 
                className="bezier-canvas" 
                onPointerLeave={(e)=> bezierCanvasRef.current.onCanvasPointerLeave(e, bezierCanvasRef.current)} 
                onPointerMove={handleCanvasPointerMove} 
                onPointerUp={e => bezierCanvasRef.current.onCanvasPointerUp(e)} 
                onPointerDown={e => bezierCanvasRef.current.onCanvasPointerDown(e)} 
                ref={canvasElementRef} 
            />
            
            <div className="bezier-label-x" >{labelX}</div>

        </div>
    );
}