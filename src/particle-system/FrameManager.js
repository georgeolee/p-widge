import p5 from 'p5'

export class FrameManager{
    static isBusy;
    static queue;
    static maxQueueSize;
    static url; //image url
    static frameCount;
    
    //p5
    static p5;    
    static startColor;
    static endColor;

    //static initialization block
    static{
        this.isBusy = false;
        this.queue = [];
        this.maxQueueSize = 1;

        this.p5 = null;

        this.url = './images/default-particle.png';
        this.frameCount = 32;
        
        
        this.startColor = null;
        this.endColor = null;
    }

    static createFrames(url, count, callback){
        if(!this.p5){
            console.log('no p5 instance assigned yet to static class FrameManager; assign one to FrameManager.p5');
            return;
        }

        if(!this.startColor || !this.endColor){
            console.log('null or invalid value for FrameManager.startColor or FrameManager.endColor; assign a p5.Color to each');
            return;
        }

        console.log(`creating ${count} frames from url: ${url}`)

        this.p5.loadImage(url, (pimg)=>{
            // console.log(`loaded image from url: ${url}`)
            pimg.loadPixels();
            const buffer = this.p5.createGraphics(pimg.width,pimg.height);
            const t_step = count > 1 ? 1/(count - 1) : 0;
            const frames = [];
            for(let n = 0; n < count; n++){
                buffer.tint(this.p5.lerpColor(this.startColor, this.endColor, 1 - t_step * n));
                buffer.image(pimg, 0, 0);
                const frame = this.p5.createImage(pimg.width, pimg.height);
                frame.copy(buffer, 0, 0, buffer.width, buffer.height, 0, 0, frame.width, frame.height);
                frames.push(frame);
            }
            // console.log(`created ${frames.length} frames`)
            callback?.(frames); //invoke the callback w/ the created frames as an argument
            
        })
    }

    static queueRecolor(callback){
                
        const onFinished = (frames) => {         
            callback(frames);
            this.isBusy = false; 
            this.processQueue();
        }
        
        const recolor = () => {
            this.isBusy = true;
            this.createFrames(this.url, this.frameCount, onFinished);
        }

        if(!this.isBusy) recolor();        

        else{
            if(this.queue.length >= this.maxQueueSize){
                this.queue.splice(0,1); //remove the oldest element from the array if reached max queue size
            }
            this.queue.push(recolor);
        }
    }

    static processQueue(newestFirst = true){
        //get the most recent push (or the oldest one)
        const recolor = newestFirst ? this.queue.pop() : this.queue.splice(0,1)[0];
        recolor?.();
    }


}