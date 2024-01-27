import { useEffect, useRef } from 'react';
import {cam_vp, normalize} from './math.js'
import { GetContext } from './context.js';
import './App.css';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
// create a new random function based on the seed
// ok heres the plan.
// width(z) amount
// generate mesh with 
// height is like noise times width thing
// also varying lods yea

function CalculateGeometry2(seed, t) {
  const phase1 = t;
  const phase2 = phase1 + 2*Math.PI/3;
  const phase3 = phase2 + 2*Math.PI/3;
  const vertices = [phase1, phase2, phase3].map((phase) => ({
    x: Math.cos(phase),
    y: Math.sin(phase),
    z: 0.0,
  }));

  // Concatenate the x and y values into a flat array
  return new Float32Array(vertices.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]));
}

function GetFDMNormal(heightfn, x, z, epsilon = 0.001) {
  // Compute the height at the central point
  const centerHeight = heightfn(x, z);

  // Compute heights at neighboring points
  const heightXPlus = heightfn(x + epsilon, z);
  const heightXMinus = heightfn(x - epsilon, z);
  const heightZPlus = heightfn(x, z + epsilon);
  const heightZMinus = heightfn(x, z - epsilon);

  // Compute partial derivatives using central differencing
  const dHeight_dx = (heightXPlus - heightXMinus) / (2 * epsilon);
  const dHeight_dz = (heightZPlus - heightZMinus) / (2 * epsilon);

  // The normal vector is the negative gradient of the height function
  const normal = [-dHeight_dx, 1, -dHeight_dz];
  
  // Normalize the normal vector
  const length = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2);
  normal[0] /= length;
  normal[1] /= length;
  normal[2] /= length;

  return normal;
}

function CreateHeightmapMesh(heightfn, xmin, xmax, numx, zmin, zmax, numz) {
  const vertices = [];
  const indices = [];

  for (let i = 0; i <= numx; i++) {
      for (let j = 0; j <= numz; j++) {
          const x = xmin + (xmax - xmin) * (i / numx);
          const z = zmin + (zmax - zmin) * (j / numz);
          const y = heightfn(x, z);
          const normal = GetFDMNormal(heightfn, x, z);
          vertices.push(x, y, z, normal[0], normal[1], normal[2]);

          if (i < numx && j < numz) {
              const index = i * (numz + 1) + j;

              indices.push(index, index + numz + 1, index + 1);
              indices.push(index + 1, index + numz + 1, index + numz + 2);
          }
      }
  }

  return { vertices, indices };
}

function CreateTestTriangleMesh() {
  // Define vertices with 3D positions and normals as a flat array
  const vertices = [
    // Vertex 0
    -1, -1, 0,  // x, y, z
    0, 0, 1,    // normal x, normal y, normal z

    // Vertex 1
    1, -1, 0,
    0, 0, 1,

    // Vertex 2
    0, 1, 0,
    0, 0, 1,
  ];

  // Define triangle indices
  const indices = [0, 1, 2];

  return { vertices, indices };
}

function CreateRotatedTriangleMesh(t) {
  // Define vertices with 3D positions and normals as a flat array
  const angle = t; // Rotation angle in radians

  const cosTheta = Math.cos(angle);
  const sinTheta = Math.sin(angle);

  const vertices = [
    // Vertex 0
    -1 * cosTheta,  // x
    -1,             // y
    -1 * sinTheta,  // z
    sinTheta,       // normal x
    0,              // normal y
    cosTheta,       // normal z

    // Vertex 1
    1 * cosTheta,
    -1,
    1 * sinTheta,
    sinTheta,
    0,
    cosTheta,

    // Vertex 2
    0 * cosTheta,
    1,
    0 * sinTheta,
    sinTheta,
    0,
    cosTheta,
  ];

  // Define triangle indices
  const indices = [0, 1, 2];

  return { vertices, indices };
}

// Example height function
// ok its a bit retarded and also we need to switch to indexed drawing
function heightFunction(x, z) {
  return Math.sin(x) * Math.cos(z);
}

const hft = (t, x, z) => heightFunction(x+t*2, z+t*4);

function CalculateGeometry(seed, t) {
  const result = CreateHeightmapMesh((x,z) => hft(t, x, z), -10, 10, 50, -10, 10, 50);
  //const result = CreateRotatedTriangleMesh(t);
  return result;
}

// look the camera actually works thats all im sayin
// but im not really sure why it clips off when the vertex is too close

function GetCamera(t) {
  // lets zoom in -z
  return cam_vp(
    [0, -4, 8],
    normalize([0, 1, -1]),
    2,
    1,
    0.01,
    1000.0,
  );
}

function GetCamera2(t) {
  // lets zoom in -z
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]
  ;
}

function WebGLCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let context = GetContext(canvasRef.current);
    draw(context);
  }, []);

  const draw = (context) => {
    const geometry = CalculateGeometry(69, context.t);
    const cameraMatrix = GetCamera();
    context.draw(geometry, cameraMatrix);
    requestAnimationFrame(() => draw(context));
  };

  return <canvas ref={canvasRef} width={800} height={800} />;
}

function App() {
  return (
    <>
      <WebGLCanvas />
    </>
  );
}

export default App;
