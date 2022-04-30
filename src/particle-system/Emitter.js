
export class Emitter{

    points;
    nextPointIndex;
    randomOrder;
    emissionMap;
    #p5;

    constructor(p5Instance){
      
      this.points = [0,0,0]; // x, y, radians // <—— single point, centered at origin, emitting right  
      this.nextPointIndex = 0;
      this.randomOrder = true;
      this.emissionMap = null;
      this.#p5 = p5Instance;      
    }
      
  
    loadEmissionMap(url){
      console.log('loading emap')
      this.#p5.loadImage(url, (image) => {
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
  
            const [r,g,b,a] = image.pixels.slice(i, i + 4);
  
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
          console.log(`new emitter point count: ${(this.points.length)/3}`)
      });
    }
  }