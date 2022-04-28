import { useEffect, useRef, useCallback, useState } from "react";
import { clip } from "./utilities";
import { CubicBezier } from "./CubicBezier";
import './BezierInput.css';

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

    const [clean, setClean] = useState(true);
    
    const points = props.points ?? [    //initial control points for the bezier curve ; will get normalized to the range 0 - 1
        0,0,    //start
        0,1,    //first handle
        1,0,    //second handle
        1,1     //end
    ];    
    
    
    const componentRef = useRef();

    const bzRef = useRef(new CubicBezier(...points).normalize());
    const cnvRef = useRef()
    const controlCnvRef = useRef();
    const editPoint = useRef(null);
    const hoverPoint = useRef(null);

    //dimensions used for drawing ; get read from CSS or assigned default values after render
    let width;          //  graph area width (excluding controls)
    let height;         //  graph area height (excluding controls)
    let controlSize;    //  control point height & width

    //colors used by canvas drawing context; these are retrieved from CSS on initial render
    const color = useRef({});


    //get colors from CSS or use fallback values
    const getCanvasColorsFromCSS = () => {
        const style = getComputedStyle(componentRef.current);
        color.current.curveFill = style.getPropertyValue('--curve-fill') || '#4af';
        color.current.curveStroke = style.getPropertyValue('--curve-stroke') || '#fff';

        color.current.canvasBorder = style.getPropertyValue('--canvas-border') || '#444';
        color.current.trackStroke = style.getPropertyValue('--track-stroke') || '#aaa';

        color.current.controlFill = style.getPropertyValue('--control-fill') || '#06f';
        color.current.controlHoverFill = style.getPropertyValue('--control-hover-fill') || '#4af'; 
        color.current.controlStroke = style.getPropertyValue('--control-stroke') || '#fff';
        color.current.controlHandleStroke = style.getPropertyValue('--control-handle-stroke') || '#444';
    }

    
    

    const setCanvasDimensionsFromCSS = () => {
        const style = getComputedStyle(componentRef.current);
        width = Number(style.getPropertyValue('--bezier-canvas-width').replace('px','')) || 150;
        height = Number(style.getPropertyValue('--bezier-canvas-height').replace('px','')) || 120;
        controlSize = Number(style.getPropertyValue('--bezier-control-size').replace('px','')) || 18;
        
        const curveCanvas = componentRef.current.querySelector('.bezier-graph');
        curveCanvas.width = width;
        curveCanvas.height = height;

        const controlCanvas = componentRef.current.querySelector('.bezier-controls');
        controlCanvas.width = width + 2*controlSize;
        controlCanvas.height = height + 2*controlSize;
    }


    /**
     * Draws the bezier using interpolated lookup values instead of the Canvas API's bezierCurveTo method. 
     * Useful mostly for seeing what the output array looks like at very low resolutions.
     * @param {CubicBezier} bz 
     */
    /*
    function drawBezierDebug(bz){
        const ctx = cnvRef.current.getContext('2d');
        const lookups = bz.createLookupTable(resolution);
        const xStep = width/(lookups.length - 1);   
        ctx.fillStyle = '#f0f';
        ctx.strokeStyle = '#888';        
        for(let i = 0; i < lookups.length; i++){
            
            //horizontal tick marks
            ctx.lineWidth = 1;
            ctx.beginPath();            
            ctx.moveTo(i * xStep, 0);
            ctx.lineTo(i * xStep, height);
            ctx.stroke();
            
            //straight lines between lookup locations
            if(i + 1 < lookups.length){
                ctx.lineWidth = 2;
                ctx.beginPath();            
                ctx.moveTo(i * xStep, lookups[i]*height);
                ctx.lineTo((i + 1) * xStep, lookups[i+ 1]*height);
                ctx.stroke();
            }
            
            //dots at lookup values
            ctx.beginPath();                        
            ctx.arc(i * xStep, lookups[i] * height, 1, 0, 2*Math.PI);
            ctx.fill();            
        }
    }*/

    const drawBezier = bz => {
        const ctx = cnvRef.current.getContext('2d');

        ctx.clearRect(0,0,width, height);
    
        ctx.save();
        
        ctx.translate(0, height);    // flip coordinate plane so positive y axis points up
        ctx.scale(1, -1)       

        const drawCurve = () => {
            ctx.beginPath();
            ctx.lineWidth = 4;
            ctx.strokeStyle = color.current.curveStroke;
            ctx.fillStyle = color.current.curveFill;

            ctx.moveTo(bz.P0.x * width, bz.P0.y * height);        
            ctx.bezierCurveTo(bz.P1.x * width, bz.P1.y * height, bz.P2.x * width, bz.P2.y * height, bz.P3.x * width, bz.P3.y * height);
            ctx.stroke();
            ctx.lineTo(width,0)
            ctx.lineTo(0,0)
            ctx.fill()
        }
        
        drawCurve();

        //bounds        
        ctx.lineWidth = 1;
        ctx.strokeStyle=color.current.canvasBorder;
        ctx.strokeRect(0,0,width,height)

        

        ctx.restore();

    }

    

    const drawControls =  useCallback( bz => {
        const ctx = controlCnvRef.current.getContext('2d');
        const cw = ctx.canvas.width;    //  control canvas height and width
        const ch = ctx.canvas.height;   //  equal to the graph canvas dimensions + control size x 2

        ctx.save();
        ctx.clearRect(0,0,cw,ch)
        ctx.translate(0, ch);   //flip to positive up
        ctx.scale(1, -1);
        ctx.translate(controlSize, controlSize);    //use same origin as graph canvas


        const drawPoint = PN => {           
            let xOffset = 0;
            if(PN === bz.P0) xOffset = -controlSize/2;
            else if(PN === bz.P3) xOffset = controlSize/2;

            ctx.beginPath();
            ctx.fillStyle = PN === hoverPoint.current ? color.current.controlHoverFill : color.current.controlFill;
            ctx.arc(PN.x * width + xOffset, PN.y * height, controlSize/2, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.lineWidth = 1.5;
            const strokeRadius = controlSize/2 - 2;

            ctx.beginPath();
            ctx.strokeStyle = color.current.controlStroke;
            ctx.arc(PN.x * width + xOffset, PN.y * height, strokeRadius, 0, 2 * Math.PI);
            ctx.stroke();
        }


        const drawHandle = (PA, PB) => {
            ctx.strokeStyle = color.current.controlHandleStroke;
            ctx.lineWidth = 1;
            ctx.beginPath()
            ctx.moveTo(PA.x * width, PA.y * height);
            ctx.lineTo(PB.x * width, PB.y * height);
            ctx.stroke()
        }
        

        //track?
        ctx.strokeStyle = color.current.trackStroke;
        ctx.lineWidth = 2;
        ctx.beginPath()
        let x = bz.P0.x * width - controlSize/2;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ch - controlSize * 2);
        ctx.stroke()

        //track?
        ctx.strokeStyle = color.current.trackStroke;
        ctx.lineWidth = 2;
        ctx.beginPath()
        x = bz.P3.x * width + controlSize/2;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ch - controlSize * 2);
        ctx.stroke()

        drawHandle(bz.P0, bz.P1);
        drawHandle(bz.P2, bz.P3);

        drawPoint(bz.P0);
        drawPoint(bz.P1);
        drawPoint(bz.P2);       
        drawPoint(bz.P3);        

        ctx.restore();
    }, [controlSize, height, width])    
    

    const onPointerDown = e => {
        e.target.setPointerCapture(e.pointerId);
        editPoint.current = getEditPointUnderMouse(e);
    }

    const onPointerUp = e => {
        e.target.releasePointerCapture(e.pointerId);
        editPoint.current = null;
        func(bzRef.current.createLookupTable(resolution))
    }

    const getEditPointUnderMouse = e => {
        const rect = e.target.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = rect.height - (e.clientY - rect.top); //flip y to match canvas orientation

        const bz = bzRef.current;
        
        let hit = null;

        if(((controlSize + bz.P1.x * width) - mx)**2 + ((controlSize + bz.P1.y * height) - my)**2 < (controlSize/2)**2) hit = bz.P1;
        else if(((controlSize + bz.P2.x * width) - mx)**2 + ((controlSize + bz.P2.y * height) - my)**2 < (controlSize/2)**2) hit = bz.P2;
        else if(mx >= 0 && mx <= controlSize && my <= bz.P0.y * height + controlSize*2 && my >= bz.P0.y * height) hit = bz.P0;
        else if(mx >= controlSize + width && mx <= controlSize * 2 + width && my <= bz.P3.y * height + controlSize*2 && my >= bz.P3.y * height) hit = bz.P3;
        return hit;
    }    

    const onPointerMove = e => {
        hoverPoint.current = getEditPointUnderMouse(e);

        drawControls(bzRef.current);

        if(editPoint.current === null) return;

        //normalized mouse coords relative to curve canvas (the inset one)
        const rect = cnvRef.current.getBoundingClientRect();
        const mxn = (e.clientX - rect.left)/rect.width;
        const myn = (rect.height - (e.clientY - rect.top))/rect.height; //invert

        //follow mouse y, but constrain to inside canvas
        editPoint.current.y = clip(myn, 0, 1);

        //same for x if not an end point
        if(editPoint.current === bzRef.current.P1 || editPoint.current === bzRef.current.P2){
            editPoint.current.x = clip(mxn, 0, 1)
        }

        drawBezier(bzRef.current);
        drawControls(bzRef.current);

        func(bzRef.current.createLookupTable(resolution))
    }

    const onPointerLeave = e => {
        
        if(hoverPoint.current){        
            hoverPoint.current = null;      //  catches mouse leaving if control point is right up against canvas edge
            drawControls(bzRef.current);    //  redraw the controls with non-hover color
        }
    }

    //get colors for canvas drawing
    useEffect(()=>{        
        getCanvasColorsFromCSS();
        console.log('bz effect COLOR')
    }, [color]);

    useEffect(()=>{
        console.log('DRAW!')
        console.log(color?.current?.curveFill)
        drawBezier(bzRef.current);
        drawControls(bzRef.current);
        func(bzRef.current.createLookupTable(64));
    }, [bzRef, func]);    

    //get & set canvas dimensions and draw to canvas
    useEffect(()=>{
        console.log('set dimensions')
        setCanvasDimensionsFromCSS();
        drawBezier(bzRef.current);
        drawControls(bzRef.current);
    });

    //watch for class changes on document body or this component
    //on change, recompute color properties and redraw canvas
    //(only need this if class / related CSS properties change during component lifetime, eg. switching color themes or something)
    useEffect(()=>{
        console.log('MUTATION!')
        
        const updateCanvasColors = () => {
            getCanvasColorsFromCSS();  
            drawBezier(bzRef.current);
            drawControls(bzRef.current);
        }

        const classObserver = new MutationObserver(updateCanvasColors);
        classObserver.observe(componentRef.current, {attributes:true, attributeFilter:['class']})
        classObserver.observe(document.body, {attributes:true, attributeFilter:['class']})

        return () => {  //effect cleanup
            classObserver.disconnect();
        };

    },[drawControls])

    return(        
        <div className={'bezier-input' + classes} id={id} ref={componentRef} onWheel={()=> setClean(!clean)}>
            
            <div className="bezier-label-top" >{labelTop}</div>
            <div className="bezier-label-y">{labelY}</div>
            
            <div className="bezier-canvas-container">            
                <canvas className="bezier-controls" onPointerLeave={onPointerLeave} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerDown={onPointerDown} ref={controlCnvRef} />
                <canvas className="bezier-graph" ref={cnvRef}/>                        
            </div>
            
            <div className="bezier-label-x" >{labelX}</div>

        </div>
    );
}