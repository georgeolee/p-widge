# p-widge

##### Find the app [here](https://georgelee.space/p-widge/build)! 

A lightweight scratch pad for sketching out 2D particle effects. It runs in the browser and provides a standalone particle system with adjustable settings and support for user-defined textures. 

This app came about after working on game jams with friends of very different artistic and technical backgrounds. It aims to lower the technical barrier to entry for artists by removing speed bumps like software installation, compilation, and component setup from the initial design process. 

Note that this is intended as a sketch pad of sorts, and doesn't actually export to any particular game engine. However, all the features available here should be replicable in (and eclipsed by) any fully-featured particle system.

![p-widge-capture-compressed](https://user-images.githubusercontent.com/62530485/168943659-f6b1b4af-eeda-4458-af29-904f153f8974.gif)

*desktop screen capture*

## Browser Support

Tested and working as of May 17, 2022:
- Chrome (Mac, Windows, iOS)
- Firefox (Mac, Windows, iOS)
- Safari (Mac, iOS)
- Edge (Windows)


##### *All browser versions are the latest official release at the time of writing... with the exception of Safari, which stopped supporting my laptop at version 13.1.2 :sweat_smile:*

## Emitter Shapes

##### Create an emitter [here](https://georgelee.space/build)! 

The default particle emitter is just a single point, but its possible to define your own emitter shapes. Custom emitters can be created as PNG files where the red and green channels of each pixel map to an emission vector and low blue/alpha values mask out non-emitting points. I made [another tool](https://github.com/georgeolee/map-e) to streamline the process, but you can also use any image editor that exports to PNG.

## Performance Notes

My laptop hit its tenth birthday over a year ago, so I've tried to keep framerate within a reasonable level for anyone running a modern browser on older hardware. That being said, your experience might vary according to device, browser, and particle settings.

A few observations, going off of my own (limited) testing:

- chrome is generally the fastest browser, with some variation among others across devices
- increasing the overall number of active particles – via `rate`, `lifetime`, or both – will require more calculations and draw calls
- these settings also result in a performance hit on slower devices:
  - `multiply` blend mode
  - `rotate by velocity` on
  - `image smoothing` on
  - large particle `size`

![p-widge-capture-dark-mobile-compressed-smaller](https://user-images.githubusercontent.com/62530485/168944265-d707212c-e5d0-4d3e-976e-1b87e8cc0ba9.gif)

*mobile screen capture*
