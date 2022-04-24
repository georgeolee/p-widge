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
    const prefix = /^#|^0x/;
    const validLengths = [3,4,6,8];

    let str = hexColorString.replace(prefix, '').trim();
    if(!validLengths.includes(str.length)) return undefined;
    if(str.length <= 4) str += str;

    return {
        r: parseInt(str.substring(0, 2), 16),
        g: parseInt(str.substring(2, 4), 16),
        b: parseInt(str.substring(4, 6), 16),
        a: str.length % 3 ? parseInt(str.substring(6, 8), 16) : undefined,
    }
}