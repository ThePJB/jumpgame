import React, { useRef, useEffect } from 'react';
import { NewGame } from './game.js';
import { GetContext } from './context.js';
import { NewIndexedMesh } from './indexed_mesh.js';

function WebGLCanvas() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current === null) {
      contextRef.current = GetContext(canvasRef.current);
      gameRef.current = NewGame();
      window.addEventListener('keydown', (event => {
        if (event.code === 'Space') {
          console.log("jump");
          gameRef.current.jump();
        } else if (event.key === 'A' || event.code === 'ArrowLeft') {
          gameRef.current.left_held = true;
        } else if (event.key === 'D' || event.code === 'ArrowRight') {
          gameRef.current.right_held = true;
        }
      }));
      window.addEventListener('keyup', (event => {
        if (event.key === 'A' || event.code === 'ArrowLeft') {
          gameRef.current.left_held = false;
        } else if (event.key === 'D' || event.code === 'ArrowRight') {
          gameRef.current.right_held = false;
        }
      }));
    }
    draw(gameRef.current, contextRef.current);
  }, []);

  const draw = (game, context) => {
    // console.log("draw");
    if (game === null) console.log("warning game null");
    if (context === null) console.log("warning context null");
    game.update(0.016);
    let geometry = game.get_geometry();
    let camera = game.get_camera();
    context.setMesh(geometry);
    let colour = skyColour(game.player_y);
    context.draw(colour, camera);
    requestAnimationFrame(() => draw(game, context));
  };

  //return <canvas ref={canvasRef} width={800} height={800} />;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
      <canvas ref={canvasRef} width={800} height={800} />
    </div>
  );
}

function skyColour(h) {
  let spaceH = 70;

  if (h < spaceH)  {
    let amountWhite = h / spaceH;
    amountWhite = (amountWhite + 0.5) / 1.5;
    let s = 1.0 - amountWhite;
    let colour = hsv_to_rgb([240, s, 1]);
    return colour;
  } else {
    let amountBlack = 1.0 - Math.exp(-0.05*(h - spaceH));
    let colour = [1.0 - amountBlack, 1.0 - amountBlack, 1.0 - amountBlack];
    return colour;
  }
}
function hsv_to_rgb(hsv) {
  let v = hsv[2];
  let hh = (hsv[0] % 360.0) / 60.0;
  let i = Math.floor(hh);
  let ff = hh - i;
  let p = hsv[2] * (1.0 - hsv[1]);
  let q = hsv[2] * (1.0 - hsv[1] * ff);
  let t = hsv[2] * (1.0 - hsv[1] * (1.0 - ff));

  switch (i) {
      case 0:
          return [v, t, p];
      case 1:
          return [q, v, p];
      case 2:
          return [p, v, t];
      case 3:
          return [p, q, v];
      case 4:
          return [t, p, v];
      case 5:
          return [v, p, q];
      default:
          throw new Error("unreachable");
  }
}

function App() {
  return (
    <>
      <WebGLCanvas />
    </>
  );
}

export default App;
