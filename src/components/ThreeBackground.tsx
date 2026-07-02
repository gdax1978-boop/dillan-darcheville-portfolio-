import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    camera.position.set(0, 8, 20);
    camera.lookAt(0, 0, 0);

    // Wireframe grid landscape
    const geo = new THREE.PlaneGeometry(60, 60, 50, 50);
    geo.rotateX(-Math.PI / 2);
    const originalY = new Float32Array(geo.attributes.position.count);
    for (let i = 0; i < geo.attributes.position.count; i++) {
      originalY[i] = geo.attributes.position.getY(i);
    }

    const mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const grid = new THREE.Mesh(geo, mat);
    grid.position.y = -5;
    scene.add(grid);

    // Floating particles
    const pCount = 400;
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPositions[i]     = (Math.random() - 0.5) * 60;
      pPositions[i + 1] = (Math.random() - 0.5) * 30;
      pPositions[i + 2] = (Math.random() - 0.5) * 60;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.06, transparent: true, opacity: 0.35 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Horizon glow plane
    const glowGeo = new THREE.PlaneGeometry(60, 2);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, -5, -20);
    scene.add(glow);

    let animId: number;
    let t = 0;
    const pos = geo.attributes.position;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.004;

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setY(i, originalY[i] + Math.sin(x * 0.25 + t) * 0.6 + Math.cos(z * 0.25 + t * 0.8) * 0.4);
      }
      pos.needsUpdate = true;

      particles.rotation.y = t * 0.04;
      camera.position.x = Math.sin(t * 0.08) * 1.5;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.offsetWidth;
      const h = canvas.parentElement.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      pGeo.dispose();
      pMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
