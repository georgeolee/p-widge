export const clip = (val, min, max) => {
    return Math.max(Math.min(val, max), min);
}

export const lerp = (start, end, t) => {
    return start * (1 - t) + end * t;
}

//simple 2D vectors
export class V2D{
    x;
    y;

    /**
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y){
        this.x = x;
        this.y = y;        
    }

    /**
     * Multiplies a 2D vector's X and Y components by a scalar value without changing the original vector.
     * @param {V2D} vec - a 2D vector object
     * @param {number} scalar a number to multiply vec.x and vec.y by
     * @returns a new 2D vector
     */
    static scale(vec, scalar){
        return new V2D(vec.x * scalar, vec.y * scalar)
    }

    /**
     * Sums up the components of any number of vectors without changing the originals.
     * @param  {...V2D} vecs 
     * @returns a new 2D vector
     */
    static sum(...vecs){
        const sum = new V2D(0,0);
        for(const v of vecs){
            sum.x += v.x;
            sum.y += v.y;
        }
        return sum;
    }
}