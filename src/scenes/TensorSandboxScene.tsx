
import React, { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import { useAppStore } from '../store/useAppStore';
import { eigenDecompositionSymmetric } from '../math/tensors';

export const TensorSandboxScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tensor = useAppStore((state) => state.sandboxTensor);
  const sceneRef = useRef<{ scene: BABYLON.Scene, glyph: BABYLON.Mesh } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.09, 1);

    // Camera
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 12, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvasRef.current, true);
    camera.wheelPrecision = 50;

    // Lighting
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);
    light.intensity = 0.8;
    new BABYLON.PointLight("pl", new BABYLON.Vector3(-5, 5, -5), scene);

    // World Axes
    const axes = new BABYLON.AxesViewer(scene, 4);

    // Tensor Glyph (Ellipsoid)
    const sphere = BABYLON.MeshBuilder.CreateSphere("glyph", { diameter: 2, segments: 32 }, scene);
    const mat = new BABYLON.StandardMaterial("glyphMat", scene);
    mat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0);
    mat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    mat.alpha = 0.9;
    sphere.material = mat;

    sceneRef.current = { scene, glyph: sphere };

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
    const { glyph } = sceneRef.current;

    try {
      const eigen = eigenDecompositionSymmetric(tensor);
      const vals = eigen.values;
      
      // Normalization to keep glyph visible but not exploding
      // We find the max absolute eigenvalue and scale so max dimension is ~3 units
      const maxVal = Math.max(Math.abs(vals[0]), Math.abs(vals[1]), Math.abs(vals[2]));
      const scaleFactor = maxVal > 0.001 ? 3.0 / maxVal : 1;

      // Apply scaling. Absolute value for shape dimensions.
      // (Sign could be color coded in future)
      glyph.scaling.x = Math.max(0.1, Math.abs(vals[0]) * scaleFactor);
      glyph.scaling.y = Math.max(0.1, Math.abs(vals[1]) * scaleFactor);
      glyph.scaling.z = Math.max(0.1, Math.abs(vals[2]) * scaleFactor);

      // If we had eigenvectors, we would apply rotationQuaternion here.
      // For v0.1 we assume diagonal-ish visualization or purely scalar based.
      glyph.rotationQuaternion = BABYLON.Quaternion.Identity();

    } catch (e) {
      console.error(e);
    }
  }, [tensor]);

  return <canvas ref={canvasRef} className="w-full h-full outline-none" />;
};
