
import React, { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import { useAppStore } from '../store/useAppStore';
import { createToyCurvedMetric, createMinkowskiMetric, getLightConeConfig, stepGeodesic } from '../math/relativity';

export const RelativityScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { metricType, gravityStrength } = useAppStore();
  
  const sceneRef = useRef<{ 
    scene: BABYLON.Scene, 
    cones: BABYLON.Mesh[],
    geoRoot: BABYLON.TransformNode
  } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.03, 1);

    const camera = new BABYLON.ArcRotateCamera("cam", Math.PI/2, Math.PI/4, 25, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvasRef.current, true);

    const grid = BABYLON.MeshBuilder.CreateGround("grid", { width: 24, height: 24, subdivisions: 24 }, scene);
    const gridMat = new BABYLON.StandardMaterial("gridMat", scene);
    gridMat.wireframe = true;
    gridMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    grid.material = gridMat;

    const cones: BABYLON.Mesh[] = [];
    const range = 8; const step = 4;
    for(let x = -range; x <= range; x+=step) {
        for(let z = -range; z <= range; z+=step) {
            const future = BABYLON.MeshBuilder.CreateCylinder("fut", { height: 2, diameterTop: 2, diameterBottom: 0, tessellation: 16 }, scene);
            const past = BABYLON.MeshBuilder.CreateCylinder("past", { height: 2, diameterTop: 0, diameterBottom: 2, tessellation: 16 }, scene);
            future.position.y = 1; past.position.y = -1;
            const mat = new BABYLON.StandardMaterial("coneMat", scene);
            mat.alpha = 0.4; mat.emissiveColor = BABYLON.Color3.Yellow(); mat.disableLighting = true;
            future.material = mat; past.material = mat;
            const node = BABYLON.Mesh.MergeMeshes([future, past], true, true, undefined, false, true);
            if (node) {
                node.position.x = x; node.position.z = z;
                cones.push(node);
                (node as any).metricPos = { x, z };
            }
        }
    }

    const geoRoot = new BABYLON.TransformNode("geoRoot", scene);
    sceneRef.current = { scene, cones, geoRoot };
    
    engine.runRenderLoop(() => scene.render());
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
        window.removeEventListener('resize', onResize);
        scene.dispose();
        engine.dispose();
    };
  }, []);

  // Handle Trace Events
  useEffect(() => {
      const handleTrace = () => {
          if (!sceneRef.current) return;
          const { scene, geoRoot } = sceneRef.current;
          
          // Initial conditions for a light-like geodesic moving +x slightly offset
          // 4-Pos: [t, x, y, z] = [0, -10, 0, 2]
          // 4-Vel: [1, 1, 0, 0] (Minkowski light like)
          // We need to verify null condition for curved metric? 
          // g_tt (dt)^2 + g_xx (dx)^2 = 0 => dt = dx * sqrt(-g_xx/g_tt).
          
          let startPos: [number, number, number, number] = [0, -10, 0, 2];
          let startVel: [number, number, number, number] = [1, 1, 0, 0];

          if (metricType === 'curved') {
             // Adjust initial dt/dlambda to ensure it's null (lightlike)
             const m = createToyCurvedMetric(startPos[1], startPos[2], startPos[3], gravityStrength);
             const gtt = m.components[0];
             const gxx = m.components[5];
             // gtt dt^2 + gxx dx^2 = 0 -> dt = dx * sqrt(-gxx/gtt)
             const dt_val = Math.sqrt(-gxx/gtt);
             startVel = [dt_val, 1, 0, 0];
          }

          const points: BABYLON.Vector3[] = [];
          let currentPos = startPos;
          let currentVel = startVel;
          
          for(let i=0; i<200; i++) {
              points.push(new BABYLON.Vector3(currentPos[1], 0.2, currentPos[3])); // Map x, z to scene
              const next = stepGeodesic(currentPos, currentVel, gravityStrength, metricType === 'flat', 0.2);
              currentPos = next.pos;
              currentVel = next.vel;
          }

          const path = BABYLON.MeshBuilder.CreateLines("geo", { points }, scene);
          path.color = BABYLON.Color3.Red();
          path.parent = geoRoot;
      };

      const handleClear = () => {
          sceneRef.current?.geoRoot.getChildren().forEach(c => c.dispose());
      };

      window.addEventListener('trace-geodesic', handleTrace);
      window.addEventListener('clear-geodesics', handleClear);
      return () => {
          window.removeEventListener('trace-geodesic', handleTrace);
          window.removeEventListener('clear-geodesics', handleClear);
      };
  }, [metricType, gravityStrength]);

  useEffect(() => {
    if (!sceneRef.current) return;
    const { cones } = sceneRef.current;
    cones.forEach(cone => {
        const { x, z } = (cone as any).metricPos;
        let metric;
        if (metricType === 'flat') {
            metric = createMinkowskiMetric();
        } else {
            metric = createToyCurvedMetric(x, 0, z, gravityStrength);
        }
        const { slope } = getLightConeConfig(metric);
        if (slope > 0) {
             const scaleXZ = (1 / slope); 
             cone.scaling.x = scaleXZ;
             cone.scaling.z = scaleXZ;
        }
    });
  }, [metricType, gravityStrength]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};