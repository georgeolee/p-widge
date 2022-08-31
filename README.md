# p-widge

#### Click [here](https://p-widge.netlify.app) to run the app.

A browser sketch pad for mocking up 2D particle effects. For game artists who don't want to set down the iPad or wrestle with a sprawling program like Unity. You can drop in your own textures and tweak settings as you go, but everything runs out of the box — no lengthy setup or special software required.

![p-widge-capture-compressed](https://user-images.githubusercontent.com/62530485/168943659-f6b1b4af-eeda-4458-af29-904f153f8974.gif)

## Emitter Shapes

#### Click [here](https://map-e.netlify.app) to create and download an emission map.

The default emitter is just a single point, but custom emitter shapes can be loaded from PNG vector maps. You can create one in a minute or two using the above link. You can also use a different program so long as it exports to PNG – read the note below on encoding emission vectors.

*Note: the encoding method for emitter textures is similar to the one used by normal maps, but the Y axis is positive going down instead of up. Pixels with a nonzero Z component or a transparent alpha channel won't emit particles.*

![p-widge-custom-emitter-compressed](https://user-images.githubusercontent.com/62530485/169181292-1743aaa6-82e4-49ed-bdde-8cc610d56347.gif)

![p-widge-capture-dark-mobile-compressed-smaller](https://user-images.githubusercontent.com/62530485/168944265-d707212c-e5d0-4d3e-976e-1b87e8cc0ba9.gif)
