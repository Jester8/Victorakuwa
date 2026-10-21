"use client";

import { useEffect, useRef } from "react";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixelRatio;
  uniform vec3 uBounds;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aSize;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // Drift upward like dust in light, wrapping within the box; scrolling lifts it faster.
    float h = uBounds.y;
    p.y = mod(p.y + uTime * aSpeed + uScroll * 3.0 + h * 0.5, h) - h * 0.5;
    p.x += sin(uTime * 0.25 + aPhase) * 0.35;
    p.z += cos(uTime * 0.2 + aPhase) * 0.25;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (14.0 / -mv.z);

    float edge = smoothstep(h * 0.5, h * 0.3, abs(p.y));
    float twinkle = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase * 6.0);
    vAlpha = edge * twinkle;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(1.0), glow * glow * vAlpha * uOpacity);
  }
`;

/**
 * Soft, slowly rising motes of light layered over the hero photos.
 * Three.js is fetched only after first paint, never for reduced-motion users,
 * and rendering stops whenever the hero is off screen or the tab is hidden.
 */
export default function HeroParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    let disposed = false;
    let cleanup = () => {};

    const start = async () => {
      const THREE = await import("three");
      if (disposed) return;

      const isSmall = window.innerWidth < 768;
      const count = isSmall ? 260 : 620;
      const bounds = new THREE.Vector3(26, 16, 10);
      const pixelRatio = Math.min(window.devicePixelRatio, isSmall ? 1.5 : 1.75);

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
        });
      } catch {
        return; // No WebGL: the static glow stays as the fallback.
      }
      renderer.setPixelRatio(pixelRatio);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity 1.2s ease";
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
      camera.position.set(0, 0, 12);

      const positions = new Float32Array(count * 3);
      const speeds = new Float32Array(count);
      const phases = new Float32Array(count);
      const sizes = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * bounds.x;
        positions[i * 3 + 1] = (Math.random() - 0.5) * bounds.y;
        positions[i * 3 + 2] = (Math.random() - 0.5) * bounds.z;
        speeds[i] = 0.12 + Math.random() * 0.35;
        phases[i] = Math.random() * Math.PI * 2;
        sizes[i] = 0.6 + Math.random() * Math.random() * 3.2;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
      geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
      geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

      const uniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uOpacity: { value: 0.7 },
        uPixelRatio: { value: pixelRatio },
        uBounds: { value: bounds },
      };
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = container;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      const pointer = { x: 0, y: 0 };
      const onPointerMove = (event: PointerEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      const clock = new THREE.Clock();
      let elapsed = 0;
      let rafId = 0;
      let inView = true;
      let running = false;

      const frame = () => {
        rafId = requestAnimationFrame(frame);
        elapsed += Math.min(clock.getDelta(), 0.05);

        const progress = Math.min(window.scrollY / (container.clientHeight || 1), 1);
        uniforms.uTime.value = elapsed;
        uniforms.uScroll.value += (progress - uniforms.uScroll.value) * 0.08;
        uniforms.uOpacity.value = 0.7 * (1 - progress * 0.8);

        camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.04;
        camera.position.y += (-pointer.y * 0.8 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
        points.rotation.y = elapsed * 0.015;

        renderer.render(scene, camera);
      };

      const updateRunning = () => {
        const shouldRun = inView && !document.hidden && !reducedMotion.matches;
        if (shouldRun && !running) {
          running = true;
          clock.getDelta();
          rafId = requestAnimationFrame(frame);
        } else if (!shouldRun && running) {
          running = false;
          cancelAnimationFrame(rafId);
        }
      };

      const intersection = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        updateRunning();
      });
      intersection.observe(container);
      document.addEventListener("visibilitychange", updateRunning);
      reducedMotion.addEventListener("change", updateRunning);

      updateRunning();
      requestAnimationFrame(() => {
        renderer.domElement.style.opacity = "1";
      });

      cleanup = () => {
        running = false;
        cancelAnimationFrame(rafId);
        intersection.disconnect();
        resizeObserver.disconnect();
        document.removeEventListener("visibilitychange", updateRunning);
        reducedMotion.removeEventListener("change", updateRunning);
        window.removeEventListener("pointermove", onPointerMove);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    // Wait until the browser is idle so Three.js never competes with the first paint.
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => void start(), { timeout: 2000 })
      : window.setTimeout(() => void start(), 600);

    return () => {
      disposed = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="hero-particles pointer-events-none absolute inset-0"
    />
  );
}
