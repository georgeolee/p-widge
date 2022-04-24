/*
      * store emission points as sets of 3 numbers - x,y,angle
      *
      * normalize from -1 to 1 in x and y ; leave angle as is
      *
      *
      * loop through each location when emitting from the particle system sequentially or in random order
      *
      * encode position & direction as r,g values like in a normal map
      * use alpha to mask empty locations
      */


export class Emitter{

    points;
    nextPointIndex;
    randomOrder;
    size;
    emissionMap;
    #p5;

    constructor(p5Instance){
      
      this.points = [0,0,0]; // <—— single point, centered at origin, emitting right  
      this.nextPointIndex = 0;
      this.randomOrder = true;
      this.size = 25;
      this.emissionMap = null;
      this.#p5 = p5Instance;
      //TODO : add support for locally rotating each emitter point
      
      console.log(`emitter constructor ; has p5: ${!!this.#p5} ; points ${this.points}`)
    }
      
  
    loadEmissionMap(em){
      console.log('loading emap')
      this.#p5.loadImage(em, (image) => {
          this.emissionMap = image;
  
          const w = image.width;
          const h = image.height;
  
          image.loadPixels();
  
  
          console.log('loaded image')
          console.log(`image? ${image}`)
  
          // don't forget - account for r g b a in 4 separate indices ; where / how to do this?
          const getX = (pixelIndex) => Math.floor(pixelIndex / 4) % w;
          const getY = (pixelIndex) => Math.floor(Math.floor(pixelIndex / 4) / w);
  
          const epoints = [];
  
          let xMin = 1, xMax = -1, yMin = 1, yMax = -1;
  
          //pixels r,g,b,a
          for(let i = 0; i < image.pixels.length; i+=4){
            const x = getX(i);
            const y = getY(i);
  
            const r = image.pixels[i];
            const g = image.pixels[i+1];
            const b = image.pixels[i+2];
            const a = image.pixels[i+3];
  
            const normalizedB = (b - 128) / 128;  //normalizes the range of b values from 0 — 255 to -1 — 1, with 128 remapped to 0
  
            // use alpha and blue magnitude as a mask
            if(a > 127 && Math.abs(normalizedB) < 0.1){              
              const longestSide = Math.max(w, h);
  
              const normalizedX = longestSide > 1 ? (x - (longestSide - 1) / 2) * 2 / ( longestSide - 1) : 0;
              const normalizedY = longestSide > 1 ? (y - (longestSide - 1) / 2) * 2 / ( longestSide - 1) : 0;
  
              const normalizedR = (r - 255/2) * 2 / 255;
              const normalizedG = (g - 255/2) * 2 / 255;
  
              const angle = Math.atan2(normalizedG, normalizedR) * 180 / Math.PI;
  
              if(normalizedX > xMax) xMax = normalizedX;
              if(normalizedX < xMin) xMin = normalizedX;
              if(normalizedY > yMax) yMax = normalizedY;
              if(normalizedY < yMin) yMin = normalizedY;              
  
              epoints.push(normalizedX, normalizedY, angle);
            }
  
          }
  
          //center the emission points around (0,0)
          const xOffset = (xMax + xMin) / 2;
          const yOffset = (yMax + yMin) / 2;
          for(let i = 0; i < epoints.length; i+= 3){
            epoints[i] -= xOffset;
            epoints[i+1] -= yOffset;
          }
  
          this.points = epoints;
  
          console.log( `epoints length: ${this.points.length}`)
          console.log(`point count: ${(this.points.length)/3}`)
      });
    }
  }