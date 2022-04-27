import { useEffect, useRef } from "react";
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

    console.log('BEXIER RENDERRRRRR')
    const resolution = 32;

    //PROPS
    
    const func = props.func ?? (lookups => console.log(lookups));
    const labelTop = props.labelTop ?? 'New Bezier Input';
    const labelX = props.labelX ?? 'x axis label';
    const labelY = props.labelY ?? 'y axis label';

    //initial control points for the bezier curve
    //NOTE: these will get normalized to the range 0 - 1
    const points = props.points ?? [
        0,0,    //start
        0,1,    //first handle
        1,0,    //second handle
        1,1     //end
    ];

    const init = props.init ?? true;
    
    const id = props.id ?? '';
    const className = props.className ? ` ${props.className}` : '';
    
    
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
    const getColors = () => {
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

    
    useEffect(()=>{        
        getColors();
        console.log('bz effect')

    }, [color]);

    const getDimensions = () => {
        const style = getComputedStyle(componentRef.current);

    }

    

    

    function drawBezier(bz){
        const ctx = cnvRef.current.getContext('2d');

        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;
        

        ctx.clearRect(0,0,cw, ch);
        
        ctx.save(); //ctx.restore() to go back
        
        ctx.translate(0, ch);    //use standard cartesian coordinate plane with origin in bottom-left      
        ctx.scale(cw, -ch)

        

        

        const drawCurve = () => {
            ctx.beginPath();
            ctx.lineWidth = 4/cw;
            ctx.strokeStyle = color.current.curveStroke;
            ctx.fillStyle = color.current.curveFill;

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
        ctx.strokeStyle=color.current.canvasBorder;
        ctx.strokeRect(0,0,1,1)

        ctx.restore();

    }

    

    function drawControls(bz){
        const ctx = controlCnvRef.current.getContext('2d');
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;

        ctx.save();

        ctx.clearRect(0,0,cw,ch)

        ctx.translate(0, ch);
        ctx.scale(1, -1);

        ctx.translate(controlSize, controlSize);


        const drawPoint = PN => {           
            
            const radius = controlSize/2 + 2;
            ctx.beginPath();
            ctx.fillStyle = PN === hoverPoint.current ? color.current.controlHoverFill : color.current.controlFill;
            ctx.arc(PN.x * width, PN.y * height, radius, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.lineWidth = 1.5;
            const offset = 2;

            ctx.beginPath();
            ctx.strokeStyle = color.current.controlStroke;
            ctx.arc(PN.x * width, PN.y * height, radius - offset, 0, 2 * Math.PI);
            ctx.stroke();
        }

        const drawEndPoint = PN => {

            ctx.fillStyle = PN === hoverPoint.current ? color.current.controlHoverFill : color.current.controlFill;
            
            const direction = PN === bz.P3 ? 1 : -1;

            ctx.fillRect(PN.x * width, PN.y * height - controlSize/2, controlSize * direction, 2 * controlSize/2);

            ctx.strokeStyle = color.current.controlStroke;
            ctx.lineWidth = 1.5;

            const offset = 2;

            ctx.strokeRect(PN.x * width + offset * direction, PN.y * height - controlSize/2 + offset, (controlSize - offset*2) *  direction, 2 * (controlSize/2 - offset))
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

        drawPoint(bz.P1)
        drawPoint(bz.P2)

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

        editPoint.current = getEditPointUnderMouse(e);
    }

    function getEditPointUnderMouse(e){
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

    function onPointerUp(e){
        e.target.releasePointerCapture(e.pointerId);
        editPoint.current = null;
        hoverPoint.current = getEditPointUnderMouse(e);
        func(bzRef.current.createLookupTable(64))
    }

    function onPointerMove(e){
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

        func(bzRef.current.createLookupTable(16))
    }

    function onPointerLeave(e){
        
        if(hoverPoint.current){        
            hoverPoint.current = null;      //  catches mouse leaving if control point is right up against canvas edge
            drawControls(bzRef.current);    //  redraw the controls (no hover color)
        }
    }

    //
    useEffect(()=>{
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
        
        drawBezier(bzRef.current);
        drawControls(bzRef.current);
    });

    //recompute custom color properties from CSS & trigger a canvas redraw if component class changes
    //only need this effect if toggling CSS class to change appearance at runtime
    useEffect(()=>{
        console.log('MUTATE EFFECT!')
        const callback = function(mutationsList, observer){
            getColors();
            drawBezier(bzRef.current);
            drawControls(bzRef.current);
            console.log('mutateeeeee!!!')
        }

        const classObserver = new MutationObserver(callback)
        classObserver.observe(componentRef.current, {attributes:true, attributeFilter:['class']})
        classObserver.observe(document.body, {attributes:true, attributeFilter:['class']})

        return () => {
            classObserver.disconnect();
        };

    },[componentRef.current, bzRef.current])

    return(        
        <div className={'bezier-input' + className} id={id} ref={componentRef}>
            
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