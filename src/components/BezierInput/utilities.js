/**
 * Get mouse position relative to HTML element
 * @param {HTMLElement} elt 
 * @param {MouseEvent} evt 
 * @returns an object containing x and y
 */
export const getMousePos = (elt, evt) => {
    let rect = elt.getBoundingClientRect();    
    return {
        x:evt.clientX - rect.left, 
        y:evt.clientY - rect.top
    }
}


/**
 * 
 * @param {number} number 
 * @param {number} nplaces 
 * @returns number, rounded to nplaces decimal places
 */
export const dcp = (number, nplaces) => {
    return (Math.round(number * Math.pow(10, nplaces))/ (Math.pow(10, nplaces)))
}

export const clip = (val, min, max) => {
    return Math.max(Math.min(val, max), min);
}

export const lerp = (start, end, t) => {
    return start * (1 - t) + end * t;
}