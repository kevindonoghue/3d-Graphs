// function to create a plot
// correct usage should involve enclosing a script containing createPlot in a div:
// <div>
//   <script>
//     createPlot(...)
//   </script>
// </div>
// this function changes the className of div to "plot" and changes its width and height styles to width and height
// dimension is a string, either '2d' or '3d'
// axisSize is the length of each positive axis
// a good larger alternative to the default is width=height=500 and axisSize=10
// labels is a list of arrays of the form ['a string', [1, 2, 3]] of a string and a 3d coordinate
// or a list of arrays ['a string', [1, 2]] of a string and a 3d coordinate
function createPlot(
  dimension,
  meshes = [],
  labels = [],
  width = 400,
  height = 400,
  axisSize = 6
) {
  const domElement = document.currentScript.parentNode;
  domElement.className = "plot";
  domElement.width = width;
  domElement.height = height;
  domElement.style.width = `${width}px`;
  domElement.style.height = `${height}px`;
  domElement.dimension = dimension;
  domElement.meshes = meshes.flat() // meshes is a list of lists of meshes, so you flatten them into a single list
  domElement.labels = labels;
  domElement.axisSize = axisSize;
  document.getElementById('c').active = true;
}

// 3d line helper function
function create3dLineSegment(p, q, color = 0x000000) {
  // creates a line segment between p and q and returns it in an array of length 1
  // p and q are arrays of length 3
  let v1 = new THREE.Vector3(...p);
  let v2 = new THREE.Vector3(...q);
  let lineGeometry = new THREE.Geometry();
  lineGeometry.vertices.push(v1, v2);
  lineMaterial = new THREE.LineBasicMaterial({
    color: color
  });
  let line = new THREE.Line(lineGeometry, lineMaterial);
  return [line];
}

// 2d line helper function
function create2dLineSegment(p, q, color = 0x000000) {
  // creates a line segment between p and q and returns it in an array of length 1
  // p and q are arrays of length 2
  p = p.concat([0]);
  q = q.concat([0]);
  return create3dLineSegment(p, q, color);
}

// arrowhead helper function
function createArrowhead(p, v, color = 0x000000, radius = 0.1, length = 0.5) {
  // creates an arrowhead with tip at p, pointing in direction v
  // returns it in an array of length 1
  // p and v are arrays of length 3
  let mod = new THREE.Vector3(...v);
  mod.normalize();
  mod.multiplyScalar(length / 2);
  let tip = new THREE.Vector3(...p);
  let center = new THREE.Vector3();
  center.subVectors(tip, mod);
  let arrowheadGeometry = new THREE.ConeGeometry(radius, length);
  arrowheadGeometry.rotateX(Math.PI / 2);
  let arrowheadMaterial = new THREE.MeshBasicMaterial({
    color: color
  });
  let arrowhead = new THREE.Mesh(arrowheadGeometry, arrowheadMaterial);
  arrowhead.position.set(...center.toArray());
  arrowhead.lookAt(tip);
  return [arrowhead];
}

// 3d arrow helper function
function create3dArrow(p, q, color = 0x000000) {
  // creates an arrow from p to q
  // returns it in an array of length 2
  // p and q are arrays of length 3
  line = create3dLineSegment(p, q, color);
  dir = new THREE.Vector3();
  dir.subVectors(new THREE.Vector3(...q), new THREE.Vector3(...p));
  arrowhead = createArrowhead(q, dir.toArray(), color);
  arrow = line.concat(arrowhead);
  return arrow;
}

// 2d arrow helper function
function create2dArrow(p, q, color = 0x000000) {
  // creates an arrow from p to q
  // returns it in an array of length 2
  // p and q are arrays of length 2
  p = p.concat([0]);
  q = q.concat([0]);
  line = create3dLineSegment(p, q, color);
  dir = new THREE.Vector3();
  dir.subVectors(new THREE.Vector3(...q), new THREE.Vector3(...p));
  arrowhead = createArrowhead(q, dir.toArray(), color);
  arrow = line.concat(arrowhead);
  return arrow;
}

// 3d vector helper function
function create3dVector(v, color = 0x000000) {
  // v is an array of length 3
  // returns an arrow from (0, 0, 0) to v in an array of length 1
  return create3dArrow([0, 0, 0], v, color);
}

// 2d vector helper function
function create2dVector(v, color = 0x000000) {
  // v is an array of length 2
  // returns an arrow from (0, 0) to v in an array of length 1
  return create2dArrow([0, 0], v, color);
}

// function that helps in graphing planes
function getPointInPlane(v1, v2, v3, t, s) {
  // here v1, v2, v3 are arrays of length 3
  // returns vector tv_1 + sv_2 + v_3 as a Vector3
  vector1 = new THREE.Vector3(...v1);
  vector2 = new THREE.Vector3(...v2);
  vector3 = new THREE.Vector3(...v3);
  return vector1
    .multiplyScalar(t)
    .addScaledVector(vector2, s)
    .add(vector3);
}

function createAxes(dimension, axisSize) {
  // returns the x, y, and z axes as geometries in an array
  // draw axes
  // axisSize is an integer
  xAxis = create3dArrow([-1 * (axisSize - 0.5), 0, 0], [axisSize - 0.5, 0, 0]);
  yAxis = create3dArrow([0, -1 * (axisSize - 0.5), 0], [0, axisSize - 0.5, 0]);

  if (dimension === "2d") {
    return [...xAxis, ...yAxis];
  }
  zAxis = create3dArrow([0, 0, -1 * (axisSize - 0.5)], [0, 0, axisSize - 0.5]);

  // draw bounding box
  let bb = axisSize - 0.001;
  let mbb = -1 * bb;
  bbCorners = [
    [bb, bb, bb],
    [bb, mbb, bb],
    [bb, bb, mbb],
    [bb, mbb, mbb],
    [mbb, bb, bb],
    [mbb, mbb, bb],
    [mbb, bb, mbb],
    [mbb, mbb, mbb]
  ];
  bbCoords = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [4, 5],
    [4, 6],
    [5, 7],
    [6, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]
  ];
  let bbEdges = [];
  bbCoords.map(x => {
    bbEdges = bbEdges.concat(
      create3dLineSegment(bbCorners[x[0]], bbCorners[x[1]], 0xcccccc)
    );
  });
  return [...xAxis, ...yAxis, ...zAxis, ...bbEdges];
}

function create3dLine(v1, v2, color=0x000000) {
  // create the line obtained by adding span(v1) to v2
  // here v1 and v2 are arrays of length 3
  const endpoints = [
    [v1[0] * 100 + v2[0], v1[1] * 100 + v2[1], v1[2] * 100 + v2[2]],
    [v1[0] * -100 + v2[0], v1[1] * -100 + v2[1], v1[2] * -100 + v2[2]]
  ];
  return create3dLineSegment(...endpoints, color);
}

function create2dLine(v1, v2, color=0x000000) {
  // create the line obtained by adding span(v1) to v2
  // here v1 and v2 are arrays of length 2
  v1 = v1.concat([0]);
  v2 = v2.concat([0]);
  return create3dLine(v1, v2, color);
}

function createPlane(v1, v2, v3, color=0x000000) {
  // create the plane obtained by adding span(v1, v2) to v3
  // here v1, v2, v3 are arrays of length 3
  const cornerParams = [[100, 100], [-100, 100], [-100, -100], [100, -100]];
  const planeGeometry = new THREE.Geometry();
  cornerParams.map(x => {
    planeGeometry.vertices.push(getPointInPlane(v1, v2, v3, x[0], x[1]));
  });

  planeGeometry.faces.push(new THREE.Face3(0, 1, 2));
  planeGeometry.faces.push(new THREE.Face3(0, 2, 3));
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    depthTest: true
  });
  return [new THREE.Mesh(planeGeometry, planeMaterial)];
}

function create3dTriangle(p, q, r, faceColor, edgeColor) {
  // create a triangle with vertices at p, q, r
  // p, q, and r are arrays of length 3
  triGeometry = new THREE.Geometry();
  [p, q, r].forEach(x => {
    triGeometry.vertices.push(new THREE.Vector3(...x));
  });
  triGeometry.faces.push(new THREE.Face3(0, 1, 2));
  const triMaterial = new THREE.MeshBasicMaterial({
    color: faceColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    depthTest: true
  });
  return [
    new THREE.Mesh(triGeometry, triMaterial),
    ...create3dLineSegment(p, q, edgeColor),
    ...create3dLineSegment(q, r, edgeColor),
    ...create3dLineSegment(r, p, edgeColor)
  ];
}

function create3dQuadrilateral(p, q, r, s, faceColor, edgeColor) {
  // create a square with vertices at p, q, r, s
  // p, q, r, and s are arrays of length 3
  quadGeometry = new THREE.Geometry();
  [p, q, r, s].forEach(x => {
    quadGeometry.vertices.push(new THREE.Vector3(...x));
  });
  quadGeometry.faces.push(new THREE.Face3(0, 1, 2));
  quadGeometry.faces.push(new THREE.Face3(0, 2, 3));
  const quadMaterial = new THREE.MeshBasicMaterial({
    color: faceColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    depthTest: true
  });

  return [
    new THREE.Mesh(quadGeometry, quadMaterial),
    ...create3dLineSegment(p, q, edgeColor),
    ...create3dLineSegment(q, r, edgeColor),
    ...create3dLineSegment(r, s, edgeColor),
    ...create3dLineSegment(s, p, edgeColor)
  ];
}

function create2dTriangle(p, q, r, faceColor, edgeColor) {
  p = p.concat([0]);
  q = q.concat([0]);
  r = q.concat([0]);
  return create3dTriangle(p, q, r, faceColor, edgeColor);
}

function create2dQuadrilateral(p, q, r, s, faceColor, edgeColor) {
  p = p.concat([0]);
  q = q.concat([0]);
  r = q.concat([0]);
  s = s.concat([0]);
  return create3dQuadrilateral(p, q, r, s, faceColor, edgeColor);
}

function createParallelepiped(v1, v2, v3, anchor, faceColor, edgeColor) {
  // creates a parallelepiped spanned by v1, v2, v3 with anchor at anchor
  // v1, v2, v3, anchor are arrays of length 3
  v1 = new THREE.Vector3(...v1);
  v2 = new THREE.Vector3(...v2);
  v3 = new THREE.Vector3(...v3);
  anchor = new THREE.Vector3(...anchor);
  return [
    ...create3dQuadrilateral(
      anchor.toArray(),
      new THREE.Vector3().addVectors(anchor, v1).toArray(),
      new THREE.Vector3()
        .addVectors(anchor, v1)
        .add(v2)
        .toArray(),
      new THREE.Vector3().addVectors(anchor, v2).toArray(),
      faceColor,
      edgeColor
    ),
    ...create3dQuadrilateral(
      anchor.toArray(),
      new THREE.Vector3().addVectors(anchor, v1).toArray(),
      new THREE.Vector3()
        .addVectors(anchor, v1)
        .add(v3)
        .toArray(),
      new THREE.Vector3().addVectors(anchor, v3).toArray(),
      faceColor,
      edgeColor
    ),
    ...create3dQuadrilateral(
      anchor.toArray(),
      new THREE.Vector3().addVectors(anchor, v2).toArray(),
      new THREE.Vector3()
        .addVectors(anchor, v2)
        .add(v3)
        .toArray(),
      new THREE.Vector3().addVectors(anchor, v3).toArray(),
      faceColor,
      edgeColor
    ),
    ...create3dQuadrilateral(
      new THREE.Vector3().addVectors(anchor, v1).toArray(),
      new THREE.Vector3()
        .addVectors(anchor, v1)
        .add(v2)
        .toArray(),
      new THREE.Vector3()
        .addVectors(anchor, v1)
        .add(v2)
        .add(v3)
        .toArray(),
      new THREE.Vector3()
        .addVectors(anchor, v1)
        .add(v3)
        .toArray(),
      faceColor,
      edgeColor
    ),
    ...create3dQuadrilateral(
      new THREE.Vector3().addVectors(anchor, v2).toArray(),
      new THREE.Vector3()
        .addVectors(anchor, v2)
        .add(v3)
        .toArray(),
      new THREE.Vector3()
        .addVectors(anchor, v2)
        .add(v3)
        .add(v1)
        .toArray(),
      new THREE.Vector3()
        .addVectors(anchor, v2)
        .add(v1)
        .toArray(),
      faceColor,
      edgeColor
    ),
    ...create3dQuadrilateral(
      new THREE.Vector3().addVectors(anchor, v3).toArray(),
      new THREE.Vector3()
        .addVectors(anchor, v3)
        .add(v1)
        .toArray(),
      new THREE.Vector3()
        .addVectors(anchor, v3)
        .add(v1)
        .add(v2)
        .toArray(),
      new THREE.Vector3()
        .addVectors(anchor, v3)
        .add(v2)
        .toArray(),
      faceColor,
      edgeColor
    )
  ];
}

// create text at p with font font
// text is a string
// p is an array of length 3
function create3dText(text, p, font) {
  let size = 0.5;
  const textGeometry = new THREE.TextGeometry(text, {
    font: font,
    size: size,
    height: 0.001
  });
  const textMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000
  });
  textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(...p)
  return textMesh
}

// create text at p with font font
// text is a string
// p is an array of length 2
function create2dText(text, p, font) {
  p = p.concat([0]);
  return create3dText(text, p, font);
}

// create axis labels using font
// returns an array of meshes of length 2 or 3
// dimension is '2d' or '3d'
function createAxisLabels(font, dimension, axisSize) {
  let size = 0.5;
  const textXGeometry = new THREE.TextGeometry("x", {
    font: font,
    size: size,
    height: 0.001
  });
  const textYGeometry = new THREE.TextGeometry("y", {
    font: font,
    size: size,
    height: 0.001
  });
  const textZGeometry = new THREE.TextGeometry("z", {
    font: font,
    size: size,
    height: 0.001
  });
  const textMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000
  });
  textX = new THREE.Mesh(textXGeometry, textMaterial);
  textY = new THREE.Mesh(textYGeometry, textMaterial);
  textZ = new THREE.Mesh(textZGeometry, textMaterial);
  textX.position.set(axisSize - 0.3, -0.17, 0);
  textY.position.set(-0.1, axisSize - 0.3, 0);
  textZ.position.set(0, -0.17, axisSize - 0.3);
  if (dimension === "3d") {
    return [textX, textY, textZ];
  }
  if (dimension === "2d") {
    return [textX, textY];
  }
}

// function to create an individual tick mark
// returned in an array containing a single mesh
// to be used in createAxisTickMarks
function createTickMark(p, v, radius = 0.1, length = 0.01) {
  // creates a thin disk centered at p, pointing in direction v
  // returns it as a mesh
  // p and v are arrays of length 3
  let dir = new THREE.Vector3(...v);
  let center = new THREE.Vector3(...p);
  let diskGeometry = new THREE.CylinderGeometry(radius, radius, length, 32);
  diskGeometry.rotateX(Math.PI / 2);
  let diskMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000
  });
  let disk = new THREE.Mesh(diskGeometry, diskMaterial);
  disk.position.set(...p);
  disk.lookAt(center.add(dir));
  return disk;
}

// function to create tick marks on axis
// dimension is either '2d' or '3d'
function createAxisTickMarks(dimension, axisSize) {
  const centers = [];
  for (let i = -axisSize + 1; i < axisSize; i += 1) {
    if (i != 0) {
      centers.push(i);
    }
  }
  totalTicksGeometry = new THREE.Geometry();

  let tick = null;
  let direction = [1, 0, 0];
  centers.forEach(center => {
    tick = createTickMark([center, 0, 0], direction);
    tick.updateMatrix();
    totalTicksGeometry.mergeMesh(tick);
  });

  direction = [0, 1, 0];
  centers.forEach(center => {
    tick = createTickMark([0, center, 0], direction);
    tick.updateMatrix();
    totalTicksGeometry.mergeMesh(tick);
  });

  if (dimension === "2d") {
    totalTicksMesh = new THREE.Mesh(
      totalTicksGeometry,
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    return totalTicksMesh;
  }

  direction = [0, 0, 1];
  centers.forEach(center => {
    tick = createTickMark([0, 0, center], direction);
    tick.updateMatrix();
    totalTicksGeometry.mergeMesh(tick);
  });

  totalTicksMesh = new THREE.Mesh(
    totalTicksGeometry,
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  return totalTicksMesh;
}

// Create a sphere representing a point 3d space
// is an array of length 3
function create3dPoint(p, color=0x000000) {
  geometry = new THREE.SphereGeometry(0.15);
  geometry.translate(...p);
  material = new THREE.MeshBasicMaterial({color: color});
  mesh = new THREE.Mesh(geometry, material);
  return [mesh];
}

// Create a 2d point
function create2dPoint(p, color=0x000000) {
  p.push(0);
  return create3dPoint(p, color=color);
}