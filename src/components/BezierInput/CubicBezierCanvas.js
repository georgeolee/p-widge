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
    classChangeObserver;
    sizeChangeObserver;
    
    

    density;
    curveStrokeWidth;
    controlStrokeWidth;
    controlStrokeInset;
    handleStrokeWidth
    boundsStrokeWidth;

    /**
     * 
     * @param {HTMLCanvasElement} canvasElement 
     * @param {CubicBezier} cubicBezier 
     */
    constructor(canvasElement = null, cubicBezier = null){
        
        this.color = {};
        this.editPoint = null;
        this.hoverPoint = null;


        // resolution of canvas in proportion to computed css size
        this.density = 2;

        this.curveStrokeWidth = 4 * this.density;
        this.controlStrokeWidth = 1.5 * this.density;
        this.controlStrokeInset = 2 * this.density;
        this.boundsStrokeWidth = 1 * this.density;
        this.handleStrokeWidth = 1 * this.density;

        const updateCanvasColors = () => {
            this.setCanvasColorsFromCSS();
            this.redraw();
        };

        //allow changing canvas colors by toggling CSS class
        this.classChangeObserver = new MutationObserver(updateCanvasColors);


        const updateCanvasSize = () => {
            this.setCanvasDimensionsFromCSS();
            this.redraw();
        }
        this.sizeChangeObserver = new ResizeObserver(updateCanvasSize);        

        if(canvasElement) this.attachCanvas(canvasElement);
        this.bezier = cubicBezier;
    }

    /**
     * 
     * @param {HTMLCanvasElement} canvasElement 
     */
    attachCanvas(canvasElement){        

        if(!canvasElement){
            //error
            throw new Error('CubicBezierCanvas.attachCanvas: canvasElement is null or undefined');
        }

        if(canvasElement.tagName !== 'CANVAS'){
            throw new Error('CubicBezierCanvas.attachCanvas: function argument is not an HTMLCanvasElement');
        }

        if(this.canvas){            
            this.classChangeObserver.disconnect();  //observer cleanup
            this.sizeChangeObserver.disconnect();
        }

        this.canvas = canvasElement;
        this.setCanvasColorsFromCSS(canvasElement);
        this.setCanvasDimensionsFromCSS(canvasElement);
        
        this.classChangeObserver.observe(this.canvas, {attributes:true, attributeFilter: ['class']});       // watch canvas for changes
        this.classChangeObserver.observe(document.body, {attributes:true, attributeFilter: ['class']});     // watch document body for changes

        this.sizeChangeObserver.observe(document.body);
        this.sizeChangeObserver.observe(this.canvas);

        this.redraw();
    }

    setCanvasColorsFromCSS(){
        const style = getComputedStyle(this.canvas);
        this.color.curveFill = style.getPropertyValue('--bezier-curve-fill') || '4af';
        this.color.curveStroke = style.getPropertyValue('--bezier-curve-stroke') || 'fff';
        this.color.canvasBorder = style.getPropertyValue('--bezier-canvas-border') || '444';
        this.color.backgroundFill = style.getPropertyValue('--bezier-background-fill') || 'eee';
        this.color.trackStroke = style.getPropertyValue('--bezier-track-stroke') || 'aaa';
        this.color.controlFill = style.getPropertyValue('--bezier-control-fill') || '06f';
        this.color.controlHoverFill = style.getPropertyValue('--bezier-control-hover-fill') || '4af'; 
        this.color.controlStroke = style.getPropertyValue('--bezier-control-stroke') || 'fff';
        this.color.controlHandleStroke = style.getPropertyValue('--bezier-control-handle-stroke') || '444';
    }

    setCanvasDimensionsFromCSS(){
        const style = getComputedStyle(this.canvas);
        this.canvas.width = Number(style.getPropertyValue('--bezier-canvas-width').replace('px','')) || 150;
        this.canvas.height = Number(style.getPropertyValue('--bezier-canvas-height').replace('px','')) || 120;
        

        this.controlSize = Number(style.getPropertyValue('--bezier-control-size').replace('px','')) || 18; 
        
    
        this.canvas.width *= this.density;
        this.canvas.height *= this.density;
        this.controlSize *= this.density;
    }

    drawBezier(bz){
        const ctx = this.canvas.getContext('2d');

        //graph width and height
        const gw = this.canvas.width - 2 * this.controlSize; 
        const gh = this.canvas.height - 2 * this.controlSize;

        ctx.save();

        ctx.translate(0, this.canvas.height);    // flip coordinate plane so positive y axis points up
        ctx.scale(1, -1);

        ctx.translate(this.controlSize, this.controlSize);  //inset to leave empty space around the graph edge for controls

        const drawCurve = () => {
            ctx.beginPath();
            ctx.lineWidth = this.curveStrokeWidth;
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
        ctx.lineWidth = this.boundsStrokeWidth;
        ctx.strokeStyle=this.color.canvasBorder;
        ctx.strokeRect(0,0,gw,gh)
        ctx.restore();

    }

    

    drawControls(bz){
        const ctx = this.canvas.getContext('2d');
        const {width:cw, height:ch} = this.canvas;  //canvas dimensions
        const gw = cw - 2*this.controlSize;
        const gh = ch - 2*this.controlSize;

        ctx.save();

        ctx.translate(0, this.canvas.height);   //flip to positive up
        ctx.scale(1, -1);

        ctx.translate(this.controlSize, this.controlSize);    //use same origin as bezier graph

        const drawPoint = PN => {           
            let xOffset = 0;
            if(PN === bz.P0) xOffset = -this.controlSize/2;
            else if(PN === bz.P3) xOffset = this.controlSize/2;

            ctx.beginPath();
            ctx.fillStyle = PN === this.hoverPoint ? this.color.controlHoverFill : this.color.controlFill;
            ctx.arc(PN.x * gw + xOffset, PN.y * gh, this.controlSize/2, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.lineWidth = this.controlStrokeWidth;
            const strokeRadius = this.controlSize/2 - this.controlStrokeInset;

            ctx.beginPath();
            ctx.strokeStyle = this.color.controlStroke;
            ctx.arc(PN.x * gw + xOffset, PN.y * gh, strokeRadius, 0, 2 * Math.PI);
            ctx.stroke();
        }


        const drawHandle = (PA, PB) => {
            ctx.strokeStyle = this.color.controlHandleStroke;
            ctx.lineWidth = this.handleStrokeWidth;
            ctx.beginPath()
            ctx.moveTo(PA.x * gw, PA.y * gh);
            ctx.lineTo(PB.x * gw, PB.y * gh);
            ctx.stroke()
        }
        

        //draw slider tracks for P0 and P3
        ctx.strokeStyle = this.color.trackStroke;
        ctx.lineWidth = 2;
        ctx.beginPath()
        let x = bz.P0.x * gw - this.controlSize/2;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ch - this.controlSize * 2);
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
        //mouse coords relative to canvas
        const rect = e.target.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * this.density;
        const my = (rect.height - (e.clientY - rect.top))*this.density; //match flipped canvas origin for y


        //graph area width and height
        const gw = this.canvas.width - this.controlSize * 2;
        const gh = this.canvas.height - this.controlSize * 2;

        
        const [P0, P1, P2, P3] = [this.bezier.P0, this.bezier.P1, this.bezier.P2, this.bezier.P3];

        //get bezier coords in canvas space
        const p0x = P0.x * gw + this.controlSize - this.controlSize/2;
        const p0y = P0.y * gh + this.controlSize;
        const p1x = P1.x * gw + this.controlSize;
        const p1y = P1.y * gh + this.controlSize;
        const p2x = P2.x * gw + this.controlSize;
        const p2y = P2.y * gh + this.controlSize;
        const p3x = P3.x * gw + this.controlSize + this.controlSize/2;
        const p3y = P3.y * gh + this.controlSize;

        let hit = null;

        // square distance comparison
        if(
            (p1x - mx)**2 + 
            (p1y - my)**2     < 
            (this.controlSize/2)**2
            ) hit = P1;

        else if(
            (p2x - mx)**2 + 
            (p2y - my)**2 < 
            (this.controlSize/2)**2
            ) hit = P2;

        else if(
            (p0x - mx)**2 +
            (p0y - my)**2 <
            (this.controlSize/2)**2
            ) hit = P0;

        else if(
            (p3x - mx)**2 +
            (p3y - my)**2 <
            (this.controlSize/2)**2
            ) hit = P3;        
        
        return hit;
    }

    clearCanvas(){
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        ctx.fillStyle = this.color.backgroundFill;
        ctx.fillRect(this.controlSize,this.controlSize,this.canvas.width - 2 * this.controlSize, this.canvas.height - 2 * this.controlSize);
    }

    redraw(){
        this.clearCanvas();
        this.drawBezier(this.bezier);
        this.drawControls(this.bezier);
    }

    onCanvasPointerMove(e){        
        
        //redraw if pointer move while editing
        if(this.editPoint){
            
            //get normalized mouse coords relative to graph area
            const rect = this.canvas.getBoundingClientRect();            
            const mxn = (e.clientX - this.controlSize/this.density - rect.left)/(rect.width - 2*this.controlSize/this.density);
            const myn = (rect.height - this.controlSize/this.density - (e.clientY - rect.top))/(rect.height - 2*this.controlSize/this.density); //invert

            //follow mouse y, but constrain inside graph area
            this.editPoint.y = clip(myn, 0, 1);

            //same for x if not an end point
            if(this.editPoint === this.bezier.P1 || this.editPoint === this.bezier.P2){
                this.editPoint.x = clip(mxn, 0, 1)
            }

            this.redraw();
        }
        
        //redraw if hover state changed
        else{
            const hp = this.getControlPointUnderMouse(e);
            if(hp !== this.hoverPoint){
                this.hoverPoint = hp;
                this.redraw();
            }
            
            if(hp) document.body.style.cursor = 'pointer';
            else document.body.style.cursor = 'default';
        }        
    }

    onCanvasPointerDown(e){
        e.target.setPointerCapture(e.pointerId);
        this.editPoint = this.getControlPointUnderMouse(e);
    }

    onCanvasPointerUp(e){
        e.target.releasePointerCapture(e.pointerId);
        this.editPoint = null;

        if(!this.hoverPoint) document.body.style.cursor = 'default';
    }

    onCanvasPointerLeave(e){
        if(this.hoverPoint){        
            this.hoverPoint = null;            //  catches mouse leaving if control point is right up against canvas edge
            this.drawControls(this.bezier);    //  redraw the controls with non-hover color
        }

        if(!this.editPoint) document.body.style.cursor = 'default';
    }

}