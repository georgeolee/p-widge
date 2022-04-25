import {Vector} from 'p5'

export const DEGREES_TO_RADS = Math.PI / 180;
export const RADS_TO_DEGREES = 180 / Math.PI;

export function lerp(a, b, t){
    return a*(1 - t) + b*t;
}

export function constrain(val, min, max){
    return Math.min(max, Math.max(min, val));
}

export function randomRange(minInclusive, maxExclusive){
    return Math.random() * (maxExclusive - minInclusive) + minInclusive;
}

export function getRandomVelocity(sMin, sMax, aMin, aMax){
    const r = Math.random() * (sMax - sMin) + sMin;
    const theta = (Math.random() * (aMax - aMin) + aMin) * DEGREES_TO_RADS;
    
    return new Vector(r * Math.cos(theta), r * Math.sin(theta));
}

export function parseHexColorString(hexColorString){
    
    const prefix = /^#|^0x/;                //  match hexadecimal prefix
    const invalidChars = /[^(0-9|a-f)]/i    //  match anything besides 0-9 or a-f, case insensitive
    const validLengths = [3,4,6,8];         //  valid lengths for rgb(a) string

    //trim any prefix and start/end whitespace from the string
    let str = hexColorString.replace(prefix, '').trim();
    
    //invalid format?
    if(!validLengths.includes(str.length) || str.match(invalidChars)) return undefined;

    //if in RGB / RGBA format, double it to RRGGBB / RRGGBBAA
    if(str.length <= 4) str = str                                       
                                .split('')                              //[r, g, b]
                                .map(char => char + char)               //[rr, gg, bb]
                                .reduce((prev, curr) => prev + curr)    //(rr+gg)+bb

    //parse each char pair to a decimal number & return results
    return {
        r: parseInt(str.substring(0, 2), 16),
        g: parseInt(str.substring(2, 4), 16),
        b: parseInt(str.substring(4, 6), 16),
        a: str.length === 8 ? parseInt(str.substring(6, 8), 16) : 255,  //default to 255 if no alpha value supplied
    }
}