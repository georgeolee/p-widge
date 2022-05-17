# p-widge

##### Find the app [here](https://georgelee.space/p-widge/build)! 

A lightweight scratch pad for sketching out 2D particle effects. It runs in the browser and provides a standalone particle system with adjustable settings and support for user-defined textures. 

This app came about after working on game jams with friends of very different artistic and technical backgrounds. It aims to lower the technical barrier to entry for artists by taking speed bumps like software installation, compilation, and component setup out of the early part of the design process.

Note that this is intended as a sketch pad of sorts, and doesn't actually export to Unity or any other game engine. However, all the features available here should be replicable in (and eclipsed by) any fully-featured particle system.

## Emitter Shapes

##### Create an emitter [here](https://georgelee.space/build)! 

The default particle emitter is just a single point, but custom emitter shapes can be defined as PNG files. The red and green channels of each pixel map to the emission direction at a given point, with blue or a transparent alpha channel masking out non-emitting points. I made [another tool](https://github.com/georgeolee/map-e) to streamline the process, but you can also use any image editor that exports to PNG.

## Performance Notes

My laptop hit its tenth birthday over a year ago, so I've tried to keep framerate within a reasonable level for anyone running a modern browser on older hardware. That being said, lightning-fast performance is not a top priority here.

A few observations:

- chrome is generally the fastest browser, with some variation among others according to device
- increasing the overall number of active particles – via `rate`, `lifetime`, or both – will require more calculations and draw calls
- these settings also result in a performance hit on slower devices:
  - `multiply` blend mode
  - `rotate by velocity` on
  - `image smoothing` on
  - large particle `size`

## Browser Support

Tested and working as of May 17, 2022:
- Chrome (Mac, Windows, iOS)
- Firefox (Mac, Windows, iOS)
- Safari (Mac, iOS)
- Edge (Windows)

##### *All browser versions are the latest official release at the time of writing... with the exception of Safari, which stopped supporting my laptop at version 13.1.2 :sweat_smile:*