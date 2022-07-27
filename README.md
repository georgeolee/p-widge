# p-widge

##### Find the app [here](https://p-widge.netlify.app).

A browser sketch pad for mocking up 2D particle effects. For the game jam artist who is too busy churning out assets to wrangle up a particle system in-engine.

![p-widge-capture-compressed](https://user-images.githubusercontent.com/62530485/168943659-f6b1b4af-eeda-4458-af29-904f153f8974.gif)

*desktop view*

## Browser Support

Tested and working as of 5-17-2022:
- Chrome (Mac, Windows, iOS)
- Firefox (Mac, Windows, iOS)
- Safari (Mac, iOS)
- Edge (Windows)

## Emitter Shapes

##### Create an emission map [here](https://map-e.netlify.app).

The default emitter is just a single point, but custom emitters can be imported from PNG files. Emission vectors are encoded as colors, similar to the approach used in normal mapping. You can use [this editor](https://github.com/georgeolee/map-e) to simplify the process, but anything that exports to PNG will work.

![p-widge-custom-emitter-compressed](https://user-images.githubusercontent.com/62530485/169181292-1743aaa6-82e4-49ed-bdde-8cc610d56347.gif)

*custom emitter shape*

## Performance Notes

I've tried to keep framerate within a reasonable level on older hardware. That being said, results may vary according to device, browser, and particle settings.

![p-widge-capture-dark-mobile-compressed-smaller](https://user-images.githubusercontent.com/62530485/168944265-d707212c-e5d0-4d3e-976e-1b87e8cc0ba9.gif)

*mobile view*
