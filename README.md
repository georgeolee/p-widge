# p-widge

##### Find the app [here](https://georgelee.space/p-widge/build).

A browser app that provides a standalone particle system with out of the box functionality. Users can upload their own textures and adjust various settings. Conceived of as a way for artists on a game jam team to experiment with particle effects without getting hung up on implementation details.

Note that this is just a sketch pad of sorts, without any in-engine implementation — the intention here is to make the initial design step more beginner-friendly by shifting technical hurdles further down the development line.

![p-widge-capture-compressed](https://user-images.githubusercontent.com/62530485/168943659-f6b1b4af-eeda-4458-af29-904f153f8974.gif)

*desktop view*

## Browser Support

Tested and working as of 5-17-2022:
- Chrome (Mac, Windows, iOS)
- Firefox (Mac, Windows, iOS)
- Safari (Mac, iOS)
- Edge (Windows)


##### *All tested browser versions are the latest official release at the time of writing... with the exception of Safari, which stopped supporting my laptop at version 13.1.2 :sweat_smile:*

## Emitter Shapes

##### Create an emission map [here](https://georgelee.space/build).

The default emitter is just a single point, but custom emitters can be imported from PNG files. Emission vectors are encoded with a color-as-vector approach similar to the one used in normal mapping. I made [a click and drag editor](https://github.com/georgeolee/map-e) to simplify the process of creating a new emitter (note that it isn't designed for mobile at the moment).

![p-widge-custom-emitter-compressed](https://user-images.githubusercontent.com/62530485/169181292-1743aaa6-82e4-49ed-bdde-8cc610d56347.gif)

*custom emitter shape*

## Performance Notes

I've tried to keep framerate within a reasonable level for anyone running a modern browser on older hardware. That being said, results may vary according to device, browser, and particle settings.

A few observations, based on (very limited) testing:

- chrome is generally the fastest browser, with some variation among others across devices
- increasing the overall number of active particles – via `rate`, `lifetime`, or both – will require more calculations and draw calls
- these settings also result in a performance hit on slower devices:
  - `multiply` blend mode
  - `rotate by velocity` on
  - `image smoothing` on
  - large particle `size`

![p-widge-capture-dark-mobile-compressed-smaller](https://user-images.githubusercontent.com/62530485/168944265-d707212c-e5d0-4d3e-976e-1b87e8cc0ba9.gif)

*mobile view*
