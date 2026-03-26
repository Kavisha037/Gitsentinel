'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function InteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- Interaction Groups ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const farLayer = new THREE.Group();
    const midLayer = new THREE.Group();
    const frontLayer = new THREE.Group();
    mainGroup.add(farLayer, midLayer, frontLayer);

    // --- Layer 1: Cosmic Dust (Far) ---
    // Increased star count for higher density
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 4000; 
    const starsPosArray = new Float32Array(starsCount * 3);
    const starsSizes = new Float32Array(starsCount);
    
    for (let i = 0; i < starsCount; i++) {
      starsPosArray[i * 3] = (Math.random() - 0.5) * 200;
      starsPosArray[i * 3 + 1] = (Math.random() - 0.5) * 200;
      starsPosArray[i * 3 + 2] = (Math.random() - 0.5) * 100 - 50;
      starsSizes[i] = Math.random();
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPosArray, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.12,
      color: 0x3ACBE0,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    farLayer.add(stars);

    // --- Layer 2: Neural Core (Mid) ---
    // Increased opacity for better visibility
    const globeGeometry = new THREE.IcosahedronGeometry(12, 3);
    const globeMaterial = new THREE.MeshBasicMaterial({
      color: 0x2672FF,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    midLayer.add(globe);

    // Neural Nodes
    const nodesCount = 60;
    const nodesGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const nodesMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x3ACBE0, 
      transparent: true, 
      opacity: 0.6 
    });
    const nodesList: THREE.Mesh[] = [];
    
    for (let i = 0; i < nodesCount; i++) {
      const node = new THREE.Mesh(nodesGeometry, nodesMaterial);
      const angle = Math.random() * Math.PI * 2;
      const radius = 12 + Math.random() * 8;
      node.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 25,
        Math.sin(angle) * radius
      );
      midLayer.add(node);
      nodesList.push(node);
    }

    // Connections
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x2672FF, 
      transparent: true, 
      opacity: 0.08 
    });
    for (let i = 0; i < 40; i++) {
      const p1 = nodesList[Math.floor(Math.random() * nodesCount)].position;
      const p2 = nodesList[Math.floor(Math.random() * nodesCount)].position;
      const lineGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const line = new THREE.Line(lineGeom, lineMaterial);
      midLayer.add(line);
    }

    // --- Layer 3: Geometric Flow (Front) ---
    const shapes: THREE.Mesh[] = [];
    const shapeGeom = new THREE.TorusGeometry(0.6, 0.06, 16, 32);
    const shapeMat = new THREE.MeshBasicMaterial({ 
      color: 0x3ACBE0, 
      transparent: true, 
      opacity: 0.15 
    });
    
    for (let i = 0; i < 20; i++) {
      const shape = new THREE.Mesh(shapeGeom, shapeMat);
      shape.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 20 + 15
      );
      shape.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      frontLayer.add(shape);
      shapes.push(shape);
    }

    camera.position.z = 45;

    // --- Animation State ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentOpacity = 0.4;
    let targetOpacity = 0.4;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) - 0.5;
      mouseY = (event.clientY / window.innerHeight) - 0.5;
      
      // Increase visibility on movement
      targetOpacity = 0.8;
      
      // Reset visibility after a short delay (simulated in animate)
      if (glowRef.current) {
        glowRef.current.style.setProperty('--mouse-x', (event.clientX / window.innerWidth * 100) + '%');
        glowRef.current.style.setProperty('--mouse-y', (event.clientY / window.innerHeight * 100) + '%');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Interpolation for smooth parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Smoothly decay opacity back to idle state if no movement
      targetOpacity += (0.4 - targetOpacity) * 0.01;
      currentOpacity += (targetOpacity - currentOpacity) * 0.05;
      
      if (containerRef.current) {
        containerRef.current.style.opacity = currentOpacity.toString();
      }

      // Rotate groups
      globe.rotation.y += 0.0015;
      stars.rotation.y -= 0.0003;
      
      // Parallax Tilt
      mainGroup.rotation.y = targetX * 0.3;
      mainGroup.rotation.x = -targetY * 0.3;
      
      // Magnetic Drift
      midLayer.position.x = targetX * 8;
      midLayer.position.y = -targetY * 8;
      
      frontLayer.position.x = targetX * 15;
      frontLayer.position.y = -targetY * 15;

      // Shape floating motion
      shapes.forEach((s, i) => {
        s.position.y += Math.sin(time + i) * 0.015;
        s.rotation.x += 0.006;
        s.rotation.y += 0.003;
      });

      // Periodic Pulse Effect
      const pulseScale = 1 + Math.sin(time * 0.5) * 0.06;
      globe.scale.set(pulseScale, pulseScale, pulseScale);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      {/* Background Canvas */}
      <div 
        ref={containerRef} 
        className="fixed inset-0 -z-20 pointer-events-none transition-opacity duration-700 opacity-40" 
      />
      
      {/* Radial Glow Overlay - Intensified */}
      <div 
        ref={glowRef}
        className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(58,203,224,0.15)_0%,transparent_60%)]" 
      />
      
      <style jsx global>{`
        :root {
          --mouse-x: 50%;
          --mouse-y: 50%;
        }
      `}</style>
    </>
  );
}
