// modified from https://threejs.org/examples/#webgl_multiple_elements_text


async function plots(fontPath='./fonts/helvetiker_regular.typeface.json') {
  // load the font
  const font = await loadFont(fontPath);
  
  // load the dom elements that have scene, camera, and controls data
  const scenes = getScenes(font);
  
  // load the canvas spanning the whole page
  const canvas = document.getElementById('c');

  // render everything and set up event handlers for controls and window resizing
  init(canvas, scenes);
}

const loader = new THREE.FontLoader();
function loadFont(url) {
  return new Promise((resolve, reject) => {
  loader.load(url, resolve, undefined, reject);
  });
}

// render scenes for every plot in the html document
function init(canvas, scenes) {
  // create renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  // need to enable local clipping to make sure graphs are contained in bounding cubes
  renderer.localClippingEnabled = true;

  renderer.setPixelRatio(window.devicePixelRatio);

  // set up listeners to render if controls are used or window is resized
  scenes.forEach( scene => {
    scene.controls.addEventListener('change', render);
  })
  window.addEventListener('resize', render);
  window.addEventListener('scroll', render);

  render();

  // adjust the renderer on changing the window size
  function updateSize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      renderer.setSize(width, height, false);
    }
  }


  function render() {
    // ensure the webpage outside the plots is not covered
    renderer.setClearColor(0xffffff);
    renderer.setScissorTest(false);
    renderer.clear();

    // adjust any window changes
    updateSize();

    // render each plot
    renderer.setClearColor(0xffffff);
    renderer.setScissorTest(true);
    scenes.forEach(scene => {
      const rect = scene.plot.getBoundingClientRect();
      if (
        rect.bottom < 0 ||
        rect.top > renderer.domElement.clientHeight ||
        rect.right < 0 ||
        rect.left > renderer.domElement.clientWidth
      ) {
        return; // if the scene is outside the viewing area, don't bother rendering it
      }

      // get location of the plot on the window
      const width = rect.right - rect.left;
      const height = rect.bottom - rect.top;
      const left = rect.left;
      const bottom = renderer.domElement.clientHeight - rect.bottom;

      // ensure the labels are looking at the camera
      scene.labels.forEach(mesh => {
        mesh.lookAt(scene.camera.position);
      });

      // render only in that part of the window
      renderer.setViewport(left, bottom, width, height);
      renderer.setScissor(left, bottom, width, height);
      renderer.render(scene, scene.camera);
    });
  }
}

function getScenes(font) {
  scenes = []

  // the createPlot function sets its corresponding div's class to 'plot'
  plots = document.querySelectorAll(".plot");
  plots.forEach(plot => {
    let scene = new THREE.Scene();
    scene.plot = plot;
    const dimension = plot.dimension; // either '2d' or '3d'
    const axisSize = plot.axisSize;
    const width = plot.width; // in pixels
    const height = plot.height; // in pixels

    let fov = 45;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 20000);
    if (dimension === "3d") {
      // position the camera so that the entire scene is contained in the viewing area
      // and so that the camere looks approximately (but not exactly) down the vector (1, 1, 1)
      let cameraVector = new THREE.Vector3(
        0,
        0,
        (axisSize * 5) / Math.tan((2 * Math.PI * fov) / 360)
      );
      cameraVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        (2 * Math.PI) / 8
      );
      cameraVector.applyAxisAngle(
        new THREE.Vector3(1, 0, 0),
        (-2 * Math.PI) / 7
      );
      camera.position.set(...cameraVector.toArray());
    }
    if (dimension === "2d") {
      // position the camera so it faces the xy plane and captures the entire scene
      camera.position.set(
        0,
        0,
        (axisSize * 2.75) / Math.tan((2 * Math.PI * fov) / 360)
      );
    }

    // allow the user to rotate and zoom the scene
    let controls = new THREE.OrbitControls(camera, plot);
    if (dimension === "3d") {
      controls.enablePan = false;
    }
    if (dimension === "2d") {
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.enableRotate = false;
    }
    scene.camera = camera;
    scene.controls = controls;

    // light is not needed because MeshBasicMaterial is the only material used
    // scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // create the three axis lines and the three arows
    createAxes(dimension, axisSize).forEach(mesh => {
      scene.add(mesh);
    });

    scene.labels = []
    // create the x, y, and z labels
    // add them to the array labels so they can manipulated when animate is called
    createAxisLabels(font, dimension, axisSize).forEach(mesh => {
      scene.add(mesh);
      // labels.push({
      //   mesh: mesh,
      //   camera: camera
      // });
      scene.labels.push(mesh);
    });

    // create the tick marks as a single Mesh
    scene.add(createAxisTickMarks(dimension, axisSize));

    // add any lines, planes, etc
    plot.meshes.forEach(mesh => {
      scene.add(mesh);
    });

    plot.labels.forEach(pair => {
      text = pair[0];
      p = pair[1];
      if (dimension=='3d') {
        textMesh = create3dText(text, p, font);
      }
      else if (dimension=='2d') {
        textMesh = create2dText(text, p, font);
      }
      scene.add(textMesh);
      scene.labels.push(textMesh);
      // labels.push({
      //   mesh: textMesh,
      //   camera: camera
      // });
    });

    // bounding box for plot
    const clippingPlanes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), axisSize),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), axisSize),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), axisSize),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), axisSize),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), axisSize),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), axisSize)
    ];
    scene.children.forEach(child => {
      if (child.material) {
        child.material.clippingPlanes = clippingPlanes;
      }
    });

    // for each plot, make a scene
    scenes.push(scene);
  });

  return scenes;
}


