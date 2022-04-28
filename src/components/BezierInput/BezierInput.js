import { useEffect, useRef, useCallback, useState } from "react";
import { clip } from "./utilities";
import { CubicBezier } from "./CubicBezier";
import './BezierInput.css';

import { CubicBezierCanvas } from "./CubicBezierCanvas";

/*
    TODO:
        -cleanup

*/

/**
 * 
 * @param {*} props 
 * @returns 
 */
export function BezierInput(props){

    console.log('BEZIER RENDERRRRRR')    

    //PROPS
    
    const func = props.func ?? (lookups => console.log(lookups));   //  attached function ; should take an array of lookup values as argument
    const resolution = 64;                                          //  # of lookup values ; the higher the number, the smoother the approximation will be

    const labelTop = props.labelTop ?? 'New Bezier Input';  //graph labels
    const labelX = props.labelX ?? 'x axis label';
    const labelY = props.labelY ?? 'y axis label';

    
    const id = props.id ?? '';
    const classes = props.className ? ` ${props.className}` : '';

    // const [clean, setClean] = useState(true);
    
    const points = props.points ?? [    //initial control points for the bezier curve ; will get normalized to the range 0 - 1
        0,0,    //start
        0,1,    //first handle
        1,0,    //second handle
        1,1     //end
    ];    
    
    
    const componentRef = useRef();

    const bezierRef = useRef(new CubicBezier(...points).normalize());
    const bezierCanvasRef = useRef(new CubicBezierCanvas(null, bezierRef.current))

    const canvasElementRef = useRef();

    const handlePointerMove = e => {
        bezierCanvasRef.current.onCanvasPointerMove(e);
        func(bezierRef.current.createLookupTable(resolution));
    }

    useEffect(() => {
        bezierCanvasRef.current.canvas = canvasElementRef.current;

        //draw canvas
    });

    return(        
        <div className={'bezier-input' + classes} id={id} ref={componentRef}>
            
            <div className="bezier-label-top" >{labelTop}</div>
            <div className="bezier-label-y">{labelY}</div>
            
            <canvas 
                className="bezier-canvas" 
                onPointerLeave={bezierCanvasRef.current.onCanvasPointerLeave} 
                onPointerMove={handlePointerMove} 
                onPointerUp={bezierCanvasRef.current.onCanvasPointerUp} 
                onPointerDown={bezierCanvasRef.current.onCanvasPointerDown} 
                ref={canvasElementRef} 
            />
            
            <div className="bezier-label-x" >{labelX}</div>

        </div>
    );
}