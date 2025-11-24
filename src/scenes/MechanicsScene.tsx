
import React, { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import { useAppStore } from '../store/useAppStore';
import { calculateBeamStress, calculatePlateHoleStress, calculateStressTrajectory } from '../math/mechanics';
import { vonMisesStress } from '../math/tensors';
import { Tensor3 } from '../types';

export const MechanicsScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mechanicsExample, beamLoad, loadFactor, showStressTrajectories } = useAppStore();
  
  const sceneRef = useRef<{ 
    scene: BABYLON.Scene, 
    beamMesh: BABYLON.Mesh,
    plateMesh: BABYLON.Mesh,
    trajRoot: BABYLON.TransformNode
  } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.12, 1);

    const camera = new BABYLON.ArcRotateCamera("cam", -Math.PI/2, Math.PI/3, 14, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvasRef.current, true);

    new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    const beam = BABYLON.MeshBuilder.CreateBox("beam", { width: 6, height: 1, depth: 1, updatable: true }, scene);
    beam.increaseVertices(20);
    beam.isVisible = false;
    
    const plate = BABYLON.MeshBuilder.CreateGround("plate", { width: 8, height: 8, subdivisions: 50, updatable: true }, scene);
    plate.isVisible = false;

    const trajRoot = new BABYLON.TransformNode("trajRoot", scene);

    const mat = new BABYLON.StandardMaterial("mechMat", scene);
    mat.specularColor = BABYLON.Color3.Black();
    mat.backFaceCulling = false;
    beam.material = mat;
    plate.material = mat;

    sceneRef.current = { scene, beamMesh: beam, plateMesh: plate, trajRoot };

    engine.runRenderLoop(() => scene.render());
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
        window.removeEventListener('resize', onResize);
        scene.dispose();
        engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const { beamMesh, plateMesh, trajRoot } = sceneRef.current;

    // Clear trajectories
    trajRoot.getChildren().forEach(c => c.dispose());

    const effectiveLoad = beamLoad * loadFactor;

    if (mechanicsExample === 'BEAM') {
        plateMesh.isVisible = false;
        beamMesh.isVisible = true;
        updateBeam(beamMesh, effectiveLoad);
        if (showStressTrajectories) drawBeamTrajectories(trajRoot, effectiveLoad);
    } else {
        beamMesh.isVisible = false;
        plateMesh.isVisible = true;
        updatePlate(plateMesh, effectiveLoad / 10);
        if (showStressTrajectories) drawPlateTrajectories(trajRoot, effectiveLoad / 10);
    }

  }, [mechanicsExample, beamLoad, loadFactor, showStressTrajectories]);

  const updateBeam = (mesh: BABYLON.Mesh, load: number) => {
    const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    if (!positions) return;
    
    const colors: number[] = [];
    const L = 6; const I = 1/12; const h = 1;
    const maxStress = (5000 * 1 * 6 * 0.5) / I; // Static normalization base on max possible

    for (let i = 0; i < positions.length; i += 3) {
        const localX = positions[i];
        const localY = positions[i+1];
        const physicalX = localX + 3;
        const stress = calculateBeamStress(physicalX, localY, load, L, I, h);
        const vm = vonMisesStress(stress);
        const t = Math.min(vm / maxStress, 1);
        colors.push(t, 0.2 * (1-t), 1-t, 1);
    }
    mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
  };

  const updatePlate = (mesh: BABYLON.Mesh, tension: number) => {
    const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    if (!positions) return;
    
    const colors: number[] = [];
    const a = 1.0;
    const maxStress = 3 * 200; // Normalization base

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i+2];
        const r = Math.sqrt(x*x + z*z);
        
        if (r < a) {
            colors.push(0, 0, 0, 0); 
        } else {
            const theta = Math.atan2(z, x);
            const stress = calculatePlateHoleStress(r, theta, tension, a);
            const vm = vonMisesStress(stress);
            const t = Math.min(vm / maxStress, 1);
            colors.push(t, 0.2 * (1-t), 1-t, 1);
        }
    }
    mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
  };

  const drawBeamTrajectories = (root: BABYLON.TransformNode, load: number) => {
      const L = 6; const I = 1/12; const h = 1;
      // Seeds: vertical line at x=1, x=3, x=5
      const seeds = [];
      for(let x of [1, 3, 5]) {
          for(let y = -0.4; y <= 0.4; y+=0.2) {
              seeds.push({x, y});
          }
      }

      seeds.forEach(seed => {
          const path = calculateStressTrajectory(
              seed, 
              40, 
              0.1, 
              (x, y) => calculateBeamStress(x, y, load, L, I, h)
          );
          // Convert physical x (0..6) to local x (-3..3)
          const points = path.map(p => new BABYLON.Vector3(p.x - 3, p.y, 0.51)); // Offset Z slightly
          BABYLON.MeshBuilder.CreateLines("traj", { points }, sceneRef.current!.scene).parent = root;
      });
  };

  const drawPlateTrajectories = (root: BABYLON.TransformNode, tension: number) => {
      // Seeds circle around hole
      const seeds = [];
      for(let t = 0; t < Math.PI * 2; t+=Math.PI/6) {
          const r = 2.0;
          seeds.push({ x: r*Math.cos(t), y: r*Math.sin(t) });
      }

      seeds.forEach(seed => {
          // Check bounds for singularity
          const path = calculateStressTrajectory(
              seed,
              50,
              0.15,
              (x, y) => {
                  const r = Math.sqrt(x*x+y*y);
                  const th = Math.atan2(y, x);
                  return calculatePlateHoleStress(r, th, tension, 1.0);
              }
          );
          const points = path.map(p => new BABYLON.Vector3(p.x, 0.1, p.y));
          BABYLON.MeshBuilder.CreateLines("traj", { points }, sceneRef.current!.scene).parent = root;
      });
  };

  return <canvas ref={canvasRef} className="w-full h-full" />;
};