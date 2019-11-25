function renderPlots() {
  const plots = Array.from(document.querySelectorAll('.plot'));
  const animatedPlots = plots.filter(u => u.plotProps.animated);
  const staticPlots = plots.filter(u => !u.plotProps.animated);

  function renderAnimated() {
    requestAnimationFrame(renderAnimated);

    animatedPlots.forEach( plot => {
      plot.plotProps.context.frame();
      plot.plotProps.renderer.render(plot.plotProps.scene, plot.plotProps.camera);
    });
  }

  function renderStatic() {
    staticPlots.forEach( plot => {
      plot.plotProps.context.frame();
      plot.plotProps.renderer.render(plot.plotProps.scene, plot.plotProps.camera);
    })
  }

  requestAnimationFrame(renderAnimated);
  renderStatic();
}

function init3dPlot({showAxes=true, showGrid=false, axisBound=6, width=400, height=400,
                     cameraPos=[1.3, 1.5, 1.7], tickEvery=1, numberAxes=false}={}) {
  initPlot(3, {showAxes: showAxes, showGrid: showGrid, axisBound: axisBound, width: width, height: height,
               cameraPos: cameraPos, tickEvery: tickEvery, numberAxes: numberAxes});
}

function init2dPlot({showAxes=true, showGrid=false, axisBound=6, width=400, height=400,
                     tickEvery=1, numberAxes=false}={}) {
  initPlot(2, {showAxes: showAxes, showGrid: showGrid, axisBound: axisBound, width: width, height: height,
               tickEvery: tickEvery, numberAxes: numberAxes});
}


function initPlot(dimension, {showAxes=true, showGrid=false, axisBound=6, width=400, height=400,
                              cameraPos=[1.3, 1.5, 1.7], tickEvery=1, numberAxes=false}={}) {
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
  var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
  var scene = new THREE.Scene();
  const fov = 60;
  var camera = new THREE.PerspectiveCamera(fov, width / height, .01, 1000);

  // MathBox context
  var context = new MathBox.Context(renderer, scene, camera).init();

  var mathbox = context.api;

  // Set size
  renderer.setSize(width, height);
  context.resize({ viewWidth: width, viewHeight: height });

  // Place camera and set background
  if (dimension === 2) {
    camera.position.set(
      0,
      0,
      (axisBound / 2) / Math.tan((2 * Math.PI * fov) / 360)
    );
  } else {
    camera.position.set(...cameraPos);
  }

  renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);


  let controls = new THREE.OrbitControls(camera, renderer.domElement);

  if (dimension === 3) {
    controls.enablePan = false;
    controls.noPan = true;
  }
  if (dimension === 2) {
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableRotate = false;
    controls.noRotate = true;
    controls.noZoom = true;
    controls.noPan = true;
  }

  controls.addEventListener('change', () => renderer.render(scene, camera));
  
  const axisLimits = {
    xMin: -axisBound,
    xMax: axisBound,
    yMin: -axisBound,
    yMax: axisBound,
    zMin: -axisBound,
    zMax: axisBound,
  }

  // MathBox elements
  view = mathbox
  .set({
    focus: 3,
  })
  .cartesian({
    range: [[axisLimits.xMin, axisLimits.xMax], [axisLimits.yMin, axisLimits.yMax], [axisLimits.zMin, axisLimits.zMax]],
    scale: [1, 1, 1],
  });

  if (showAxes) {
    view.axis({
      detail: 1,
    });
  
    view.axis({
      axis: 2,
    });
  
    if (dimension === 3) {
      view.axis({
        axis: 3,
      });
    }
    


    view.scale({
      axis: 1,
      factor: tickEvery,
      zero: false,
    }).ticks({
      width: 2,
    });
    if (numberAxes) {
      xNumbers = []
      for (let i=axisLimits.xMin; i<=axisLimits.xMax; i+=tickEvery) {
        if (i !== 0) {
          xNumbers.push(i);
        }
      }
      view.text({
        live: false,
        data: xNumbers,
      }).label({
        color: 'black',
        opacity: 0.5,
      });
    }
    
  
    view.scale({
      axis: 2,
      factor: tickEvery,
      zero: false
      }).ticks({
      width: 2,
    });

    if (numberAxes) {
      yNumbers = []
      for (let i=axisLimits.yMin; i<=axisLimits.yMax; i+=tickEvery) {
        if (i !== 0) {
          yNumbers.push(i);
        }
      }
      view.text({
        live: false,
        data: yNumbers,
      }).label({
        color: 'black',
        opacity: 0.5,
        offset: [-24, 0]
      });
    }
  
    if (dimension === 3) {
      view.scale({
        axis: 3,
        factor: tickEvery,
        zero: false,
      }).ticks({
        width: 2
      });

      if (numberAxes) {
        zNumbers = []
        for (let i=axisLimits.zMin; i<=axisLimits.zMax; i+=tickEvery) {
          if (i !== 0) {
            zNumbers.push(i);
          }
        }
        view.text({
          live: false,
          data: zNumbers,
        }).label({
          color: 'black',
          opacity: 0.5
        });
      }

    }
    
  };


  if (showGrid) {
    view.grid({
      axes: [1, 2],
      opacity: 0.2,
    });
  
    if (dimension === 3) {
      view.grid({
        axes: [1, 3],
        opacity: 0.2,
      });
    
      view.grid({
        axes: [2, 3],
        opacity: 0.2,
      });
    }
    
  };

  div.plotProps = {
    view: view,
    context: context,
    renderer: renderer,
    scene: scene,
    camera: camera,
    axisLimits: axisLimits,
    animated: false,
    dimension: dimension,
  }

  return div;
}


// shader scripts are from Jose Carlos's answer here: https://groups.google.com/forum/#!topic/mathbox/5tSbCsYNgB8

const VERTEX_SHADER_SCRIPT = `
// Enable STPQ mapping
#define POSITION_STPQ;

void getVertex(inout vec4 xyzw, inout vec4 stpq) {
// Store XYZ per vertex in STPQ
stpq = xyzw;
}
`

const FRAGMENT_SHADER_SCRIPT = `
// Enable STPQ mapping
#define POSITION_STPQ

uniform float x_min;
uniform float x_max;
uniform float y_min;
uniform float y_max;
uniform float z_min;
uniform float z_max;
    
/////////  default mathbox material shader  ///////// 

varying vec3 vNormal;
varying vec3 vLight;
varying vec3 vPosition;

vec3 offSpecular(vec3 color) {
vec3 c = 1.0 - color;
return 0.5 - c * c;
}

vec4 getShadedColor(vec4 rgba, inout vec4 stpq) {

vec3 color = rgba.xyz;
vec3 color2 = offSpecular(rgba.xyz);

vec3 normal = normalize(vNormal);
vec3 light = normalize(vLight);
vec3 position = normalize(vPosition);

float side    = gl_FrontFacing ? -1.0 : 1.0;
float cosine  = side * dot(normal, light);
float diffuse = mix(max(0.0, cosine), .5 + .5 * cosine, 1.0);

vec3  halfLight = normalize(light + position);
float cosineHalf = max(0.0, side * dot(normal, halfLight));
float specular = pow(cosineHalf, 16.0);

float x = stpq.x;
float y = stpq.y;
float z = stpq.z;
// What Steven suggested
if (x < x_min || x > x_max || y < y_min || y > y_max || z < z_min || z > z_max)
{
    discard;
}

return vec4(color * (diffuse * .9 + .05) + .25 * color2 * specular, rgba.a);
}

/////////  --------------------  /////////
 `

function createShader() {
  const div = document.currentScript.parentNode;
  return div.plotProps.view.shader({
          code: VERTEX_SHADER_SCRIPT,
          })
          .vertex({
            pass: 'data'
          })
          .shader({
            code: FRAGMENT_SHADER_SCRIPT,
          },{
            x_min: function(){return div.plotProps.axisLimits.xMin},
            x_max: function(){return div.plotProps.axisLimits.xMax},
            y_min: function(){return div.plotProps.axisLimits.yMin},
            y_max: function(){return div.plotProps.axisLimits.yMax},
            z_min: function(){return div.plotProps.axisLimits.zMin},
            z_max: function(){return div.plotProps.axisLimits.zMax}
          })
          .fragment({
            gamma: true
          });
}

// every material needs to have depthWrite = false and depthTest = true in order for transparency to work correctly
// this function sets those attributes for all material descendants of obj
// it's called at the end of createCurve, createSurface, etc.
function setMaterialProps(obj) {
  if (obj.material) {
    obj.material.transparent = true;
    obj.material.depthWrite = false;
    obj.material.depthTest = true;
  }
  if (obj.children) {
    obj.children.forEach(child => setMaterialProps(child));
  }
}

function createSurface(f, bounds, color, {paramDivisions=[64, 64]}={}) {
  // f is something like (u, v) => [Math.cos(u)*Math.cos(v), Math.cos(u)*Math.sin(v), Math.sin(u)]
  // bounds is something like [[-Math.PI/2, Math.PI/2], [0, 2*Math.PI]]
  const div = document.currentScript.parentNode;

  div.plotProps.view.area({
    width: paramDivisions[0],
    height: paramDivisions[1],
    expr: function (emit, _, _, i, j, _, _) {
      u = bounds[0][0] + (i/paramDivisions[0])*(bounds[0][1] - bounds[0][0]);
      v = bounds[1][0] + (j/paramDivisions[1])*(bounds[1][1] - bounds[1][0]);
      x = f(u, v)[0];
      y = f(u, v)[1];
      z = f(u, v)[2];
      emit(x, y, z);
    },
  });
  
  createShader().surface({
    color: color,
    width: 5,
    opacity: 0.5,
  });

  // needed to make transparency work correctly
  setMaterialProps(div.plotProps.scene);
}

function createAnimatedSurface(f, bounds, color, {paramDivisions=[64, 64]}={}) {
  // f is something like (u, v, t) => [(2 + Math.sin(t))*Math.cos(u)*Math.cos(v), (2 + Math.sin(t))*Math.cos(u)*Math.sin(v), (2 + Math.sin(t))*Math.sin(u)]
  // bounds is something like [[-Math.PI/2, Math.PI/2], [0, 2*Math.PI]]
  const div = document.currentScript.parentNode;
  div.plotProps.animated = true;

  div.plotProps.view.area({
    width: paramDivisions[0],
    height: paramDivisions[1],
    expr: function (emit, _, _, i, j, t, _) {
      u = bounds[0][0] + (i/paramDivisions[0])*(bounds[0][1] - bounds[0][0]);
      v = bounds[1][0] + (j/paramDivisions[1])*(bounds[1][1] - bounds[1][0]);
      x = f(u, v, t)[0];
      y = f(u, v, t)[1];
      z = f(u, v, t)[2];
      emit(x, y, z);
    },
  });
  
  createShader().surface({
    color: color,
    width: 5,
    opacity: 0.5,
  });

  // needed to make transparency work correctly
  setMaterialProps(div.plotProps.scene);
}

function createCurve(f, bounds, color, {paramDivisions=64}={}) {
  // f is a function like u => [u, u**2, u**3]
  const div = document.currentScript.parentNode;

  div.plotProps.view.interval({
    // id: 'sampler',
    width: paramDivisions,
    expr: function (emit, _, i, _) {
      u = bounds[0] + (i/(paramDivisions-1))*(bounds[1]-bounds[0]);
      x = f(u)[0];
      y = f(u)[1];
      z = (div.plotProps.dimension === 3) ? f(u)[2] : 0;
      if (x < div.plotProps.axisLimits.xMin
        || x > div.plotProps.axisLimits.xMax
        || y < div.plotProps.axisLimits.yMin
        || y > div.plotProps.axisLimits.yMax 
        || z < div.plotProps.axisLimits.zMin
        || z > div.plotProps.axisLimits.zMax) {
        return;
      }
      emit(x, y, z);
    },
    channels: div.plotProps.dimension,
  });
  
  div.plotProps.view.line({
    // points: '#sampler',
    color: color,
    width: 2,
    opacity: 0.5,
  });

  // needed to make transparency work correctly
  setMaterialProps(div.plotProps.scene);
}

function createAnimatedCurve(f, bounds, color, {paramDivisions=64}={}) {
  // f is a function like u, t => [Math.sin(t)*u, u**2, u**3]
  const div = document.currentScript.parentNode;
  div.plotProps.animated = true;

  div.plotProps.view.interval({
    // id: 'sampler',
    width: paramDivisions,
    expr: function (emit, _, i, t) {
      u = bounds[0] + (i/(paramDivisions-1))*(bounds[1]-bounds[0]);
      x = f(u, t)[0];
      y = f(u, t)[1];
      z = (div.plotProps.dimension === 3) ? f(u, t)[2] : 0;
      if (x < div.plotProps.axisLimits.xMin
        || x > div.plotProps.axisLimits.xMax
        || y < div.plotProps.axisLimits.yMin
        || y > div.plotProps.axisLimits.yMax 
        || z < div.plotProps.axisLimits.zMin
        || z > div.plotProps.axisLimits.zMax) {
        return;
      }
      emit(x, y, z);
    },
    channels: div.plotProps.dimension,
  });
  
  div.plotProps.view.line({
    // points: '#sampler',
    color: color,
    width: 2,
    opacity: 0.5,
  });

  // needed to make transparency work correctly
  setMaterialProps(div.plotProps.scene);
}

function createLine(anchor, direction, color, {bounds=null, paramDivisions=256}={}) {
  // line through anchor in the direction of direction
  // anchor and direction are either both arrays of length 2 or arrays of length 3
  const div = document.currentScript.parentNode;
  const dim = div.plotProps.dimension;

  if (!bounds) {
    const axisLimits = div.plotProps.axisLimits
    const maxAxisLimit = Math.max(...Object.keys(axisLimits).map(key => Math.abs(axisLimits[key])));
    const maxVectorEntry = Math.max(...anchor, ...direction);
    const bound = (maxVectorEntry !== 0) ? 8*maxAxisLimit/maxVectorEntry : 10;
    bounds = [-bound, bound];
  }

  if (dim === 2) {
    f = u => [anchor[0] + u*direction[0], anchor[1] + u*direction[1]];
  }
  if (dim === 3) {
    f = u => [anchor[0] + u*direction[0], anchor[1] + u*direction[1], anchor[2] + u*direction[2]];
  }

  createCurve(f, bounds, color, paramDivisions);
}

function createPlane(anchor, span1, span2, color, {bounds=null, paramDivisions=[64, 64]}={}) {
  // plane through anchor in the direction of span1 and span2
  // anchor, span1, and span2 are arrays of length 3.
  const div = document.currentScript.parentNode;

  if (!bounds) {
    const axisLimits = div.plotProps.axisLimits
    const maxAxisLimit = Math.max(...Object.keys(axisLimits).map(key => Math.abs(axisLimits[key])));
    const maxVectorEntry = Math.max(...anchor, ...span1, ...span2);
    const bound = (maxVectorEntry !== 0) ? 8*maxAxisLimit/maxVectorEntry : 10;
    bounds = [[-bound, bound], [-bound, bound]];
  }
  
  f = (u, v) => [anchor[0] + u*span1[0] + v*span2[0], anchor[1] + u*span1[1] + v*span2[1], anchor[2] + u*span1[2] + v*span2[2]];
  createSurface(f, bounds, color, paramDivisions);
}