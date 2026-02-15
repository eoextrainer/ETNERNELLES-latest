import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './SplashScreen3D.css';

const SplashScreen3D = ({ onComplete }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 100;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ff88, 1.5, 500);
    pointLight1.position.set(0, 0, 50);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 1.2, 500);
    pointLight2.position.set(-100, 100, 0);
    scene.add(pointLight2);

    // Create starfield for void effect
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(1500); // 500 stars * 3 coordinates
    for (let i = 0; i < 1500; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 500;
      starPositions[i + 1] = (Math.random() - 0.5) * 500;
      starPositions[i + 2] = (Math.random() - 0.5) * 500;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.5,
      sizeAttenuation: true,
      opacity: 0.6,
      transparent: true,
    });

    const stars = new THREE.Points(starsGeometry, starMaterial);
    scene.add(stars);

    // Function to create character texture
    const createCharacterTexture = (char) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw character
      ctx.font = 'bold 280px Arial';
      ctx.fillStyle = '#00ff88';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      ctx.fillText(char, canvas.width / 2, canvas.height / 2);

      // Outline effect
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 4;
      ctx.strokeText(char, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    // Create character meshes
    const characters = [
      { char: 'K', targetX: -35, startX: -80 },
      { char: 'C', targetX: 0, startX: 0 },
      { char: 'D', targetX: 35, startX: 80 },
    ];

    const meshes = characters.map((charData) => {
      const geometry = new THREE.PlaneGeometry(30, 50);
      const texture = createCharacterTexture(charData.char);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xffffff,
        transparent: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = charData.startX;
      mesh.position.y = 0;
      mesh.position.z = 0;
      mesh.userData.targetX = charData.targetX;
      mesh.userData.startX = charData.startX;
      mesh.userData.char = charData.char;

      scene.add(mesh);
      return mesh;
    });

    // Animation variables
    const animationDuration = 3000; // 3 seconds
    let startTime = null;
    let animationComplete = false;

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Rotate starfield
      stars.rotation.x += 0.0002;
      stars.rotation.y += 0.0003;

      // Animate characters
      meshes.forEach((mesh) => {
        // Ease-in-out cubic for smooth motion
        const easeProgress = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // Move towards target position
        mesh.position.x = mesh.userData.startX + (mesh.userData.targetX - mesh.userData.startX) * easeProgress;

        // Floating motion during animation
        const floatAmount = Math.sin(progress * Math.PI * 2) * 10;
        mesh.position.y = floatAmount;

        // Rotation
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.008;
        mesh.rotation.z += 0.003;

        // Scale oscillation
        const scaleAmount = 1 + Math.sin(progress * Math.PI) * 0.2;
        mesh.scale.set(scaleAmount, scaleAmount, 1);

        // Opacity pulsing
        if (mesh.material.map) {
          mesh.material.opacity = 0.8 + Math.sin(progress * Math.PI) * 0.2;
        }
      });

      renderer.render(scene, camera);

      // Continue animation or complete
      if (progress < 1) {
        animationIdRef.current = requestAnimationFrame(animate);
      } else if (!animationComplete) {
        animationComplete = true;
        // Hold final frame for 1 second then complete
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    };

    animationIdRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      // Dispose of resources
      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        if (mesh.material.map) mesh.material.map.dispose();
        mesh.material.dispose();
      });
      
      starsGeometry.dispose();
      starMaterial.dispose();
      
      renderer.dispose();
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef} 
      className="splash-screen-3d-container"
    />
  );
};

export default SplashScreen3D;
