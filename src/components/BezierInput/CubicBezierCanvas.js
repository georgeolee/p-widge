import { CubicBezier } from "./CubicBezier";
import { clip } from "./utilities";

export class CubicBezierCanvas{
    canvas;
    bezier;
    color;

    width;
    height;
    controlSize;

    editPoint;
    hoverPoint;


    /*

        hover state?

        mouse pos

        editing?

    */

    constructor(canvasElement = null, cubicBezier = null){
        this.canvas = canvasElement;
        this.bezier = cubicBezier;
        this.color = {};
    
        this.editPoint = null;
        this.hoverPoint = null;

    }

    attachCanvas(canvasElement){
        if(this.canvas){
            //cleanup
        }

        if(!canvasElement){
            //error
            throw new Error('CubicBezierCanvas.attachCanvas: canvasElement is null or undefined');
        }

        this.canvas = canvasElement;
        this.getCanvasColorsFromCSS(canvasElement);
        this.setCanvasDimensionsFromCSS(canvasElement);
    }

    getCanvasColorsFromCSS(){
        const style = getComputedStyle(this.canvas);
        this.color.curveFill = style.getPropertyValue('--curve-fill') || '#4af';
        this.color.curveStroke = style.getPropertyValue('--curve-stroke') || '#fff';

        this.color.canvasBorder = style.getPropertyValue('--canvas-border') || '#444';
        this.color.trackStroke = style.getPropertyValue('--track-stroke') || '#aaa';

        this.color.controlFill = style.getPropertyValue('--control-fill') || '#06f';
        this.color.controlHoverFill = style.getPropertyValue('--control-hover-fill') || '#4af'; 
        this.color.controlStroke = style.getPropertyValue('--control-stroke') || '#fff';
        this.color.controlHandleStroke = style.getPropertyValue('--control-handle-stroke') || '#444';
    }

    setCanvasDimensionsFromCSS(){
        const style = getComputedStyle(this.canvas);
        this.width = Number(style.getPropertyValue('--bezier-canvas-width').replace('px','')) || 150;
        this.height = Number(style.getPropertyValue('--bezier-canvas-height').replace('px','')) || 120;
        this.controlSize = Number(style.getPropertyValue('--bezier-control-size').replace('px','')) || 18;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    drawBezier(bz){
        const ctx = this.canvas.getContext('2d');

        //graph width and height
        const gw = this.canvas.width - 2 * this.controlSize; 
        const gh = this.canvas.height - 2 * this.controlSize;

        ctx.save();

        
        // ctx.clearRect(0,0,this.width, this.height);        
        ctx.translate(0, this.height);    // flip coordinate plane so positive y axis points up
        ctx.scale(1, -1);

        ctx.translate(this.controlSize, this.controlSize);

        const drawCurve = () => {
            ctx.beginPath();
            ctx.lineWidth = 4;
            ctx.strokeStyle = this.color.curveStroke;
            ctx.fillStyle = this.color.curveFill;
            ctx.moveTo(bz.P0.x * gw, bz.P0.y * gh);        
            ctx.bezierCurveTo(bz.P1.x * gw, bz.P1.y * gh, bz.P2.x * gw, bz.P2.y * gh, bz.P3.x * gw, bz.P3.y * gh);
            ctx.stroke();
            ctx.lineTo(gw,0)
            ctx.lineTo(0,0)
            ctx.fill()
        }
        
        drawCurve();

        //bounds        
        ctx.lineWidth = 1;
        ctx.strokeStyle=this.color.canvasBorder;
        ctx.strokeRect(0,0,gw,gh)
        ctx.restore();

    }

    

    drawControls(bz){
        const ctx = this.canvas.getContext('2d');
        const cw = this.canvas.width;    //  control canvas height and width
        const ch = this.canvas.height;   //  equal to the graph canvas dimensions + control size x 2

        const gw = cw - 2*this.controlSize;
        const gh = ch - 2*this.controlSize;

        ctx.save();
        // ctx.clearRect(0,0,cw,ch)
        ctx.translate(0, this.height);   //flip to positive up
        ctx.scale(1, -1);

        ctx.translate(this.controlSize, this.controlSize);    //use same origin as graph canvas


        const drawPoint = PN => {           
            let xOffset = 0;
            if(PN === bz.P0) xOffset = -this.controlSize/2;
            else if(PN === bz.P3) xOffset = this.controlSize/2;

            ctx.beginPath();
            ctx.fillStyle = PN === this.hoverPoint ? this.color.controlHoverFill : this.color.controlFill;
            ctx.arc(PN.x * gw + xOffset, PN.y * gh, this.controlSize/2, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.lineWidth = 1.5;
            const strokeRadius = this.controlSize/2 - 2;

            ctx.beginPath();
            ctx.strokeStyle = this.color.controlStroke;
            ctx.arc(PN.x * gw + xOffset, PN.y * gh, strokeRadius, 0, 2 * Math.PI);
            ctx.stroke();
        }


        const drawHandle = (PA, PB) => {
            ctx.strokeStyle = this.color.controlHandleStroke;
            ctx.lineWidth = 1;
            ctx.beginPath()
            ctx.moveTo(PA.x * gw, PA.y * gh);
            ctx.lineTo(PB.x * gw, PB.y * gh);
            ctx.stroke()
        }
        

        //track?
        ctx.strokeStyle = this.color.trackStroke;
        ctx.lineWidth = 2;
        ctx.beginPath()
        let x = bz.P0.x * gw - this.controlSize/2;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ch - this.controlSize * 2);
        ctx.stroke()

        //track?
        ctx.strokeStyle = this.color.trackStroke;
        ctx.lineWidth = 2;
        ctx.beginPath()
        x = bz.P3.x * gw + this.controlSize/2;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ch - this.controlSize * 2);
        ctx.stroke()

        drawHandle(bz.P0, bz.P1);
        drawHandle(bz.P2, bz.P3);

        drawPoint(bz.P0);
        drawPoint(bz.P1);
        drawPoint(bz.P2);       
        drawPoint(bz.P3);        

        ctx.restore();
    }

    getControlPointUnderMouse(e){
        const rect = e.target.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = rect.height - (e.clientY - rect.top); //flip y to match canvas orientation

        const gw = this.width - this.controlSize * 2;
        const gh = this.height - this.controlSize * 2;

        
        const bz = this.bezier;
        
        let hit = null;

        const p0x = bz.P0.x * gw + this.controlSize - this.controlSize/2;
        const p0y = bz.P0.y * gh + this.controlSize;
        const p1x = bz.P1.x * gw + this.controlSize;
        const p1y = bz.P1.y * gh + this.controlSize;
        const p2x = bz.P2.x * gw + this.controlSize;
        const p2y = bz.P2.y * gh + this.controlSize;
        const p3x = bz.P3.x * gw + this.controlSize + this.controlSize/2;
        const p3y = bz.P3.y * gh + this.controlSize;


        // console.log(`mx: ${mx}\tmy: ${my}\tp1x: ${p1x}\tp1y: ${p1y}`)
        if(
            (p1x - mx)**2 + 
            (p1y - my)**2     < 
            (this.controlSize/2)**2
            ) hit = bz.P1;

        else if(
            (p2x - mx)**2 + 
            (p2y - my)**2 < 
            (this.controlSize/2)**2
            ) hit = bz.P2;

        else if(
            (p0x - mx)**2 +
            (p0y - my)**2 <
            (this.controlSize/2)**2
            ) hit = bz.P0;

        else if(
            (p3x - mx)**2 +
            (p3y - my)**2 <
            (this.controlSize/2)**2
            ) hit = bz.P3;

        return hit;
    }

    clearCanvas(){
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0,0,this.width, this.height)
    }


    redraw(){
        this.clearCanvas();
        this.drawBezier(this.bezier);
        this.drawControls(this.bezier);
    }

    onCanvasPointerMove(e){
        this.hoverPoint = this.getControlPointUnderMouse(e);

        this.clearCanvas()
        // this.drawControls(this.bezier);

        if(this.editPoint){
            //normalized mouse coords relative to curve canvas (the inset one)
            const rect = this.canvas.getBoundingClientRect();

            const mxn = (e.clientX - this.controlSize - rect.left)/(rect.width - 2*this.controlSize);
            const myn = (rect.height - this.controlSize - (e.clientY - rect.top))/(rect.height - 2*this.controlSize); //invert

            //follow mouse y, but constrain to inside graph area
            this.editPoint.y = clip(myn, 0, 1);

            //same for x if not an end point
            if(this.editPoint === this.bezier.P1 || this.editPoint === this.bezier.P2){
                this.editPoint.x = clip(mxn, 0, 1)
            }
        }
        
        

        

        this.drawBezier(this.bezier);
        this.drawControls(this.bezier);

        //this in react? V TODO

        // func(this.bezier.createLookupTable(resolution))
    }

    onCanvasPointerDown(e){
        console.log(`this: ${this}`)
        console.log(`this . edit point: ${this.editPoint}`)
        e.target.setPointerCapture(e.pointerId);
        this.editPoint = this.getControlPointUnderMouse(e);
    }

    onCanvasPointerUp(e){
        e.target.releasePointerCapture(e.pointerId);
        this.editPoint = null;
        
        //React? V TODO
        // func(bzRef.current.createLookupTable(resolution))
    }

    onCanvasPointerLeave(e){
        console.log(this)
        if(this.hoverPoint){        
            this.hoverPoint = null;      //  catches mouse leaving if control point is right up against canvas edge
            this.drawControls(this.bezier);    //  redraw the controls with non-hover color
        }
    }

    // const updateCanvasColors = () => {
    //     getCanvasColorsFromCSS();  
    //     drawBezier(bzRef.current);
    //     drawControls(bzRef.current);
    // }

    // const classObserver = new MutationObserver(updateCanvasColors);
    // classObserver.observe(componentRef.current, {attributes:true, attributeFilter:['class']})
    // classObserver.observe(document.body, {attributes:true, attributeFilter:['class']})

    // return () => {  //effect cleanup
    //     classObserver.disconnect();
    // };
}