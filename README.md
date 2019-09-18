# 3d-Graphs
Interactive 3d graphs Using three.js.

To test these functions, run python -m http.server in the root directory then run sample.html

The core function is createPlot in plot_creation_functions.js. This takes as argument a string ('2d' or '3d'), an array of three.js meshes created from the functions in plot_creation_functions.js, and an array of pairs (string, coords) for displaying text on the graph.

The function createPlot refers to a canvas element with id "c". The script render_plots.js contains the three.js that renders the 3d graphs on the webpage. The script start.js starts the functions in render_plots.js.

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
