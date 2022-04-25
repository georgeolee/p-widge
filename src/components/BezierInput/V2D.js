export class V2D{
    x;
    y;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */

    constructor(x, y){
        this.x = x;
        this.y = y;        
    }

    /**
     * 
     * @param {V2D} vec 
     * 
     */
    
    add(vec){
        this.x += vec.x;
        this.y += vec.y;
    }

    /**
     * Multiplies the x and y components of this V2D object by a scalar value
     * @param {number} scalar 
     */
    scale(scalar){
        this.x *= scalar;
        this.y *= scalar;
    }

    /**
     * 
     * @param {V2D} vecA 
     * @param {V2D} vecB 
     * @param {number} t 
     * @returns 
     */

    static lerp(vecA, vecB, t){
        return new V2D(vecA.x * (1 - t) + vecB.x * t, vecA.y * (1 - t) + vecB.y * t);
    }

    /**
     * 
     * @param {V2D} vec 
     * @param {number} scalar 
     * @returns 
     */
    static scale(vec, scalar){
        const v = new V2D(vec.x, vec.y)
        v.scale(scalar);
        return v;
    }

    /**
     * Sums up the components of any number of V2D arguments without mutating the original objects.
     * @param  {...V2D} vecs 
     * @returns a new V2D object
     */
    static sum(...vecs){
        const sum = new V2D(0,0);
        vecs.reduce((prev, curr) => {sum.add(curr); return sum}, sum)
        return sum;
    }
}