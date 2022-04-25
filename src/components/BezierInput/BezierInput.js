import { V2D } from "./V2D";

import { useEffect, useRef, useState } from "react";
import { getMousePos } from "./utilities";


export function BezierInput(props){

    const margin = props.margin ?? 20;
    const points = props.points ?? [
            0,0,    //start
            0,1,    //first handle
            1,0,    //second handle
            1,1     //end
        ];


    const P0 = useRef(new V2D(points[0], points[1]));
    const P1 = useRef(new V2D(points[2], points[3]));
    const P2 = useRef(new V2D(points[4], points[5]));
    const P3 = useRef(new V2D(points[6], points[7]));

    
    
    return(
        <div>
            <canvas/>
        </div>
    );
}