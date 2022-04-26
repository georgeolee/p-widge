import { V2D } from "./V2D";

import { useEffect, useRef, useState } from "react";
import { getMousePos, clip } from "./utilities";
import { CubicBezier } from "./CubicBezier";


/*
    TODO:
        -cleanup
        -pointer capture & release
        -lookup table & attaching func - does it work?

*/


export function BezierInput(props){

    const func = props.func ?? (lookups => console.log(lookups));
    const init = props.init ?? true;

    const width =  150;
    const height = width;


    const margin = props.margin ?? 18;
    const points = props.points ?? [
            0,0,    //start
            0,1,    //first handle
            1,0,    //second handle
            1,1     //end
        ];


    const bzRef = useRef(new CubicBezier(...points));
    const cnvRef = useRef()
    const controlCnvRef = useRef();
    const editPoint = useRef(null);

    function drawBezier(bz){
        const ctx = cnvRef.current.getContext('2d');

        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;
        

        ctx.clearRect(0,0,cw, ch);

        ctx.fillStyle = '#000';
        ctx.fillStyle = '#06f';
        ctx.fillStyle = '#ddd';
        ctx.fillRect(0,0,cw,ch);
        
        ctx.save(); //ctx.restore() to go back
        
        ctx.translate(0, ch);    //use standard cartesian coordinate plane with origin in bottom-left      
        ctx.scale(cw, -ch)

        

        

        const drawCurve = () => {
            ctx.beginPath();
            ctx.lineWidth = 4/cw;
            ctx.strokeStyle = '#fff';
            // ctx.fillStyle = '#06f'
            // ctx.fillStyle = '#f44'

            ctx.fillStyle = '#4af';

            ctx.moveTo(bz.P0.x, bz.P0.y);        
            ctx.bezierCurveTo(bz.P1.x, bz.P1.y, bz.P2.x, bz.P2.y, bz.P3.x, bz.P3.y);
            ctx.stroke();
            ctx.lineTo(1,0)
            ctx.lineTo(0,0)
            ctx.fill()
        }
        
        drawCurve();

        //bounds
        ctx.lineWidth = 1/cw;
        ctx.strokeStyle='#000'
        ctx.strokeRect(0,0,1,1)

        ctx.restore();

    }

    

    function drawControls(bz){
        const ctx = controlCnvRef.current.getContext('2d');
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;


        const curveScale = {
            x: cw - 2*margin,
            y: ch - 2*margin
        }

        ctx.save();

        ctx.clearRect(0,0,cw,ch)

        ctx.translate(0, ch);
        ctx.scale(1, -1);

        ctx.translate(margin, margin);


        const drawHandle = PN => {
            
            ctx.beginPath();
            ctx.fillStyle = '#fff';
            ctx.arc(PN.x * curveScale.x, PN.y * curveScale.y, margin/2 + 2, 0, 2 * Math.PI);
            ctx.fill();

            ctx.beginPath();
            // ctx.fillStyle = '#f44';
            ctx.fillStyle = '#06f';
            ctx.arc(PN.x * curveScale.x, PN.y * curveScale.y, margin/2, 0, 2 * Math.PI);
            ctx.fill();
        }

        const drawEndPoint = PN => {
            // ctx.fillStyle = '#f44'
            ctx.fillStyle = '#06f';
            ctx.fillRect(PN.x * curveScale.x, PN.y * curveScale.y - margin, PN === bz.P3 ? margin : -margin, 2 * margin)
        }

        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.beginPath()
        ctx.moveTo(bz.P0.x * curveScale.x, bz.P0.y * curveScale.y);
        ctx.lineTo(bz.P1.x * curveScale.x, bz.P1.y * curveScale.y);
        ctx.stroke()

        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.beginPath()
        ctx.moveTo(bz.P2.x * curveScale.x, bz.P2.y * curveScale.y);
        ctx.lineTo(bz.P3.x * curveScale.x, bz.P3.y * curveScale.y);
        ctx.stroke()
        
        drawHandle(bz.P1)
        drawHandle(bz.P2)

        drawEndPoint(bz.P0);
        drawEndPoint(bz.P3);        

        ctx.restore();
    }

    useEffect(()=>{
        drawBezier(bzRef.current);
        drawControls(bzRef.current);
        if(init) func(bzRef.current.createLookupTable(64));
    }, [bzRef]);

    function onPointerDown(e){
        e.target.setPointerCapture(e.pointerId);
        const rect = e.target.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = rect.width - (e.clientY - rect.top); //flip y to match canvas orientation

        const curveScale = {
            x: controlCnvRef.current.width - 2*margin,
            y: controlCnvRef.current.height - 2*margin
        }

        const bz = bzRef.current;

        let hit = null;
        
        if(((margin + bz.P1.x * curveScale.x) - mx)**2 + ((margin + bz.P1.y * curveScale.y) - my)**2 < (margin/2)**2) hit = bz.P1;
        else if(((margin + bz.P2.x * curveScale.x) - mx)**2 + ((margin + bz.P2.y * curveScale.y) - my)**2 < (margin/2)**2) hit = bz.P2;
        else if(mx >= 0 && mx <= margin && my <= bz.P0.y * curveScale.y + margin*2 && my >= bz.P0.y * curveScale.y) hit = bz.P0;
        else if(mx >= margin + curveScale.x && mx <= margin * 2 + curveScale.x && my <= bz.P3.y * curveScale.y + margin*2 && my >= bz.P3.y * curveScale.y) hit = bz.P3;

        // console.log(`hit ${hit?.toString()}: ${hit}`); 

        editPoint.current = hit;
    }

    function onPointerUp(e){
        e.target.releasePointerCapture(e.pointerId);
        editPoint.current = null;
        
        // const lookups = bzRef.current.createLookupTable(64);

        func(bzRef.current.createLookupTable(64))
    }

    function onPointerMove(e){
        if(editPoint.current === null) return;

        //normalized mouse coords relative to curve canvas (the inset one)
        // const rect = e.target.getBoundingClientRect();


        //THIS LOOKS SKETCHY?
        const rect = cnvRef.current.getBoundingClientRect();
        const mxn = (e.clientX - rect.left)/rect.width;
        const myn = (rect.height - (e.clientY - rect.top))/rect.height; //invert

        editPoint.current.y = clip(myn, 0, 1);

        if(editPoint.current === bzRef.current.P1 || editPoint.current === bzRef.current.P2){
            editPoint.current.x = clip(mxn, 0, 1)
        }

        drawBezier(bzRef.current);
        drawControls(bzRef.current);

        func(bzRef.current.createLookupTable(16))
    }

    return(
        <div style={{display:'flex', border: '1px solid black', margin: 'auto'}}>            
                <canvas onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerDown={onPointerDown} ref={controlCnvRef} width={width + 2*margin} height={height + 2*margin} style={{position:'absolute'}}/>
                <canvas ref={cnvRef} width={width} height={height} style={{width:width, height:height, margin:margin + 'px'}}/>            
        </div>
    );
}