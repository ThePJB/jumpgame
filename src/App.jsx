import React, { useEffect, useRef } from 'react';
import {cam_vp} from './math.js'
import { GetContext } from './context.js';
import './App.css';

// todo would like to move most of this shit into a context object
// especially if it could have like the uniform locations for referencing etc.

function CalculateGeometry(seed, t) {
  const phase1 = t;
  const phase2 = phase1 + 2*Math.PI/3;
  const phase3 = phase2 + 2*Math.PI/3;
  const vertices = [phase1, phase2, phase3].map((phase) => ({
    x: Math.cos(phase),
    y: Math.sin(phase),
  }));

  // Concatenate the x and y values into a flat array
  return new Float32Array(vertices.flatMap((vertex) => [vertex.x, vertex.y]));
}

function GetCamera() {
  // lets zoom in -z
  return cam_vp(
    (0, 0, 1),
    (0, 0, -1),
    1,
    1,
    0.01,
    1000.0,
  );
}

function WebGLCanvas() {
  const canvasRef = useRef(null);
  const tRef = useRef(0);
  const vboRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error('Unable to initialize WebGL. Your browser may not support it.');
      return;
    }

    const vertexShaderSource = `
      attribute vec4 a_position;
      uniform mat4 u_cameraMatrix;
      
      void main() {
        gl_Position = u_cameraMatrix * a_position;
      }
    `;
    const fragmentShaderSource = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const cameraMatrixLocation = gl.getUniformLocation(program, 'u_cameraMatrix');
    const vertices = CalculateGeometry(69, tRef.current);

    // Create and bind the VBO
    vboRef.current = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboRef.current);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    draw(gl);
  }, []);

  const draw = (gl) => {
    const cameraMatrix = GetCamera();
    gl.uniformMatrix4fv(cameraMatrixLocation, false, cameraMatrix);

    tRef.current += 0.01; // Increment t on each frame
    const geometry = CalculateGeometry(69, tRef.current);

    // Update the VBO with new data
    gl.bindBuffer(gl.ARRAY_BUFFER, vboRef.current);
    gl.bufferData(gl.ARRAY_BUFFER, geometry, gl.STATIC_DRAW);

    // Your drawing logic using WebGL goes here
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Request the next animation frame
    requestAnimationFrame(() => draw(gl));
  };

  return <canvas ref={canvasRef} width={400} height={400} />;
}

function App() {
  return (
    <>
      <WebGLCanvas />
    </>
  );
}

export default App;
