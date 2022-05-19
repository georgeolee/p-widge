# p-widge

##### Find the app [here](https://georgelee.space/p-widge/build)! 

A browser app that provides a standalone particle system with adjustable settings and support for user-defined textures. Conceived of as a way for artists on a game jam team to design particle effects while sidestepping the speed bumps and technical hurdles of configuring a system in-engine.

Note that this is only a sketch pad of sorts, and effects will still need to be implemented afterwards for a given game engine. The intention here is to allow a degree of separation between the visual design of an effect and its implementation.

![p-widge-capture-compressed](https://user-images.githubusercontent.com/62530485/168943659-f6b1b4af-eeda-4458-af29-904f153f8974.gif)

*desktop screen capture*

## Browser Support

Tested and working as of 5-17-2022:
- Chrome (Mac, Windows, iOS)
- Firefox (Mac, Windows, iOS)
- Safari (Mac, iOS)
- Edge (Windows)


##### *All tested browser versions are the latest official release at the time of writing... with the exception of Safari, which stopped supporting my laptop at version 13.1.2 :sweat_smile:*

## Emitter Shapes

##### Create an emission map [here](https://georgelee.space/build)! 

Custom emitters can be defined as PNG files using a vector-to-color encoding method similar to the one used by normal maps. I made [this editor](https://github.com/georgeolee/map-e) to streamline the process (note that it isn't designed for mobile at the moment).

![p-widge-custom-emitter-compressed](https://user-images.githubusercontent.com/62530485/169181292-1743aaa6-82e4-49ed-bdde-8cc610d56347.gif)

## Performance Notes

The bulk of my development has been on an eleven year old laptop, so I've tried to keep framerate within a reasonable level for anyone running a modern browser on older hardware. That being said, results may vary according to device, browser, and particle settings.

A few observations, based on (very limited) testing:

- chrome is generally the fastest browser, with some variation among others across devices
- increasing the overall number of active particles – via `rate`, `lifetime`, or both – will require more calculations and draw calls
- these settings also result in a performance hit on slower devices:
  - `multiply` blend mode
  - `rotate by velocity` on
  - `image smoothing` on
  - large particle `size`

![p-widge-capture-dark-mobile-compressed-smaller](https://user-images.githubusercontent.com/62530485/168944265-d707212c-e5d0-4d3e-976e-1b87e8cc0ba9.gif)

*mobile screen capture*
