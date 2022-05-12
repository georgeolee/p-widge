import { particleSettings } from '../globals';
import { lerp } from '../utilities';

export class FrameManager{
    static isBusy;
    static queue;
    static maxQueueSize;
    // static url; //image url
    static frameCount;
    
    //p5
    static p5;    
    static startColor;
    static endColor;
    static buffer;

    //static initialization block
    static{
        this.isBusy = false;
        this.queue = [];
        this.maxQueueSize = 1;
        this.p5 = null;
        this.frameCount = 32;
        this.startColor = null;
        this.endColor = null;
        this.buffer = null;
    }

    static createFrames(url, count, callback){
        if(!this.p5){
            console.log('FrameManager failed to create new frames; missing reference to p5 instance');
            return;
        }

        if(!this.startColor || !this.endColor){
            console.log('FrameManager failed to create new frames; missing start or end color');
            return;
        }

        if(!url){
            console.log('FrameManager failed to create new frames; missing url');
            return;
        }

        this.p5.loadImage(url, (pimg)=>{
            pimg.loadPixels();

            if(pimg.width * pimg.height > 256 * 256){
                if(pimg.width > pimg.height){
                    pimg.resize(256, 0);
                }
                else pimg.resize(0,256);
            }

            //create offscreen p5 canvas if it doesn't exist yet, and resize it to match the incoming image
            if(!this.buffer) this.buffer = this.p5.createGraphics(pimg.width,pimg.height);
            else this.buffer.resizeCanvas(pimg.width, pimg.height, false);

            const t_step = count > 1 ? 1/(count - 1) : 0;
            const frames = [];


            for(let n = 0; n < count; n++){
                this.buffer.tint(this.composeP5Color( this.lerpColorRGBA(this.startColor, this.endColor, 1 - t_step * n)));
                this.buffer.image(pimg, 0, 0);
                const frame = this.p5.createImage(pimg.width, pimg.height);
                frame.copy(this.buffer, 0, 0, this.buffer.width, this.buffer.height, 0, 0, frame.width, frame.height);
                frames.push(frame);
            }
            console.log(`recolored ${frames.length} frames`)
            callback?.(frames); //invoke the callback w/ the created frames as an argument            
        })
    }

    static removeGraphicsBuffer(){
        this.buffer?.remove();
    }

    static setStartColor(colorObject){
        this.startColor = colorObject;
    }

    static setEndColor(colorObject){
        this.endColor = colorObject;
    }

    static lerpColorRGBA(a, b, t){
        return {
            r: lerp(a.r, b.r, t),
            g: lerp(a.g, b.g, t),
            b: lerp(a.b, b.b, t),
            a: lerp(a.a, b.a, t)
        }
    }

    static setUrl(url){
        this.url = url;
    }

    static composeP5Color(rgba){
        if(!this.p5){
            console.log('FrameManager.composeP5Color: no p5 instance yet! ; failed to create color');            
        }
        return this?.p5?.color(rgba.r, rgba.g, rgba.b, rgba.a);
    }


    static queueRecolor(callback, frameCount = this.frameCount){
        
        //do this when recolor finishes
        const onFinished = (frames) => {         
            callback(frames);
            this.isBusy = false; 
            this.processQueue(); //check the queue for recolor jobs
        }
        
        const recolor = () => {
            this.isBusy = true;
            this.createFrames(particleSettings.imageUrl, frameCount, onFinished);
        }

        //not busy — recolor right away!
        if(!this.isBusy) recolor();        

        //busy! — push the recolor job into the queue
        else{
            // console.log(`FM BUSY`); 
            if(this.queue.length >= this.maxQueueSize){
                this.queue.splice(0,1); //remove the oldest element from the array if reached max queue size
            }
            this.queue.push(recolor);
        }
    }

    static processQueue(newestFirst = true){
        //get the most recent push or the oldest one
        const recolor = newestFirst ? this.queue.pop() : this.queue.splice(0,1)[0];
        recolor?.();
    }


}