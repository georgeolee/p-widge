import { V2D } from "./V2D";
import { lerp } from "../../utilities";

export class CubicBezier{

    P0;
    P1;
    P2;
    P3;

    constructor(...args){
        if(args.length === 8 && args.every(arg => typeof arg === 'number')){
            this.P0 = new V2D(args[0], args[1]);
            this.P1 = new V2D(args[2], args[3]);
            this.P2 = new V2D(args[4], args[5]);
            this.P3 = new V2D(args[6], args[7]);
        }
        else if(args.length === 4 && args.every(arg => typeof arg.x === 'number' && typeof arg.y === 'number')){
            this.P0 = new V2D(args[0].x, args[0].y);
            this.P1 = new V2D(args[1].x, args[1].y);
            this.P2 = new V2D(args[2].x, args[2].y);
            this.P3 = new V2D(args[3].x, args[3].y);
        }

        else throw new Error(`CubicBezier: invalid constructor arguments\n${args}`);
    }

    /**
     * Get the (x, y) point on the bezier curve for a given value of parameter t.
     * @param {number} t 
     * @returns a 2D vector object with the x and y coordinates of the point
     */
    getPointAtParameterValue(t){
        return V2D.sum(
            V2D.scale(this.P0, (1-t)**3),
            V2D.scale(this.P1, 3 * ((1-t)**2) * t),
            V2D.scale(this.P2, 3 * (1-t) * (t**2)),
            V2D.scale(this.P3, t**3),
        );
    }


    /**
     * Sample the curve for 0 <= t <= 1
     * @param {number} lookupResolution 
     * @param {number} sampleResolution 
     * @returns an array of approximate y values for evenly spaced values of x
     */
    createLookupTable(lookupResolution, sampleResolution = lookupResolution){
        
        if(sampleResolution <= 1 || lookupResolution <= 1) return [this.getPointAtParameterValue(0)]

        const samples = [];                        
        const tStep = 1 / (sampleResolution - 1);

        samples.push(this.getPointAtParameterValue(0));

        for(let n = 1; n < sampleResolution; n++){
            samples.push(this.getPointAtParameterValue(n * tStep));
        }

        const lookups = [];
        
        //assuming here that P0.x <= P1.x <= P3.x and P0.x <= P2.x <= P3.x
        const xRange = samples[samples.length - 1].x - samples[0].x;
        const xStep = xRange / (lookupResolution - 1);
        
        lookups.push(samples[0].y);


        let prevSampleIndex = 0;
        let nextSampleIndex = 1;
        let xPrev = samples[prevSampleIndex].x;
        let xNext = samples[nextSampleIndex].x;


        for(let n = 1; n < lookupResolution - 1; n++){
            const x = samples[0].x + xStep * n;

            while(xNext < x && nextSampleIndex < samples.length - 1){
                prevSampleIndex = nextSampleIndex;
                nextSampleIndex++;
                xPrev = xNext;
                xNext = samples[nextSampleIndex].x;
            }

            const distPrev = Math.abs(xPrev - x);
            const distNext = Math.abs(xNext - x);

            const t = distPrev / (distPrev + distNext);

            const yApprox = lerp(samples[prevSampleIndex].y, samples[nextSampleIndex].y, t);

            lookups.push(yApprox);
        }        

        lookups.push(samples[samples.length - 1].y);

        return lookups;
    }
}