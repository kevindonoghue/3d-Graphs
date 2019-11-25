function initPlot(showAxes=true, showGrid=false, axisBound=3, width=400, height=400) {
  const div = document.currentScript.parentNode;
  div.className = "plot";
  div.width = width;
  div.height = height;
  div.style.width = `${width}px`;
  div.style.height = `${height}px`;

  const canvas = document.createElement('canvas');
  canvas.className = 'local-c';
  div.appendChild(canvas);

  // Vanilla Three.js
  var renderer = new THREE.WebGLRenderer({canvas: canvas});
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, width / height, .01, 1000);

  // MathBox context
  var context = new MathBox.Context(renderer, scene, camera).init();


  var mathbox = context.api;

  // Set size
  renderer.setSize(width, height);
  context.resize({ viewWidth: width, viewHeight: height });

  // Place camera and set background
  camera.position.set(0, 0, axisBound+2);
  renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);


  let controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', () => renderer.render(scene, camera));

  
  xMin = -axisBound,
  xMax = axisBound,
  yMin = -axisBound,
  yMax = axisBound,
  zMin = -axisBound,
  zMax = axisBound,


  // MathBox elements
  view = mathbox
  .set({
    focus: 3,
  })
  .cartesian({
    range: [[-axisBound, axisBound], [-axisBound, axisBound], [-axisBound, axisBound]],
    scale: [1, 1, 1],
  });

  if (showAxes) {
    view.axis({
      detail: 1,
    });
  
    view.axis({
      axis: 2,
    });
  
    view.axis({
      axis: 3,
    });

    view.scale({
      axis: 1,
    }).ticks({
      width: 2,
    });
  
    view.scale({
      axis: 2,
    }).ticks({
      width: 2,
    });
  
    view.scale({
      axis: 3,
    }).ticks({
      width: 2
    });
  };


  if (showGrid) {
    view.grid({
      width: 1,
      opacity: 0.2,
      zBias: -5,
    });
  
    view.grid({
      axes: [1, 3],
      opacity: 0.2,
    });
  
    view.grid({
      axes: [2, 3],
      opacity: 0.2,
    });
  };



  view.interval({
    id: 'sampler',
    width: 64,
    expr: function (emit, x, i, t) {
      y = Math.sin(x + t) * .7;
      emit(x, y);
    },
    channels: 2,
  }).line({
    points: '#sampler',
    color: 0x3090FF,
    width: 5,
    opacity: 0.5,
  });

  div.view = view;
  div.context = context;
  div.renderer = renderer;
  div.scene = scene;
  div.camera = camera;
}