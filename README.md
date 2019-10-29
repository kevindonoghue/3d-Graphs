# 3d-Graphs
Interactive 3d graphs using three.js.

To test these functions, run python -m http.server in the root directory then run sample.html

The core function is createPlot in plot_creation_functions.js. This takes as argument a string ('2d' or '3d'), an array of three.js meshes created from the functions in plot_creation_functions.js, and an array of pairs (string, coords) for displaying text on the graph. Call createPlot within a script tag within a div (see sample.html for examples). The function createPlot will assign its containing div a class 'plot' that is used to identify it as containing information to be rendered. The function createPlot also refers to a canvas element with id 'c'. This canvas element should appear at the start of body, with styling given as in sample.html. The styling ensures it spans the entire page and sits behind all other elements.

The script render_plots.js contains the code that renders the 3d graphs on the page. To actually render everything add <script>plots();</script> at the bottom of the page.

Here are the useful functions in plot_creation_functions.js and their usage is documented in the code. The 3d versions are meant to be used when '3d' is passed to createPlot and the 2d versions are meant to be used when '2d' is passed to createPlot.
- create3dLineSegment
- create2dLineSegment
- create3dArrow
- create2dArrow
- create3dVector
- create2dVector
- create3dLine
- create2dLine
- createPlane
- create3dQuadrilateral
- create2dQuadrilateral
- create2dTriangle
- createParallelpiped
- create3dPoint

To create text, pass it as labels in createPlot. The other functions in plot_creation_functions.js are helper functions.
