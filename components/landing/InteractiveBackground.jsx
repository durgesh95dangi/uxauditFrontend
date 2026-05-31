"use client";

import { useEffect, useRef, useState } from "react";

export default function InteractiveBackground() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const container = containerRef.current;
    if (!container) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const handleResize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Grid configuration
    const gridSpacing = 44;
    const maxDist = 200; // Mouse influence radius

    let currentMouseX = width / 2;
    let currentMouseY = height / 3.5;
    let targetMouseX = width / 2;
    let targetMouseY = height / 3.5;
    let isHovering = false;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
    };

    const handleMouseEnter = () => {
      isHovering = true;
    };

    // Attach listeners to parent container of canvas
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseenter", handleMouseEnter);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation (inertia)
      if (isHovering) {
        currentMouseX += (targetMouseX - currentMouseX) * 0.12;
        currentMouseY += (targetMouseY - currentMouseY) * 0.12;
      } else {
        // Slowly float in a circle when inactive
        const time = Date.now() * 0.0008;
        targetMouseX = width / 2 + Math.sin(time) * (width * 0.15);
        targetMouseY = height / 2.8 + Math.cos(time * 0.7) * (height * 0.1);
        currentMouseX += (targetMouseX - currentMouseX) * 0.04;
        currentMouseY += (targetMouseY - currentMouseY) * 0.04;
      }

      // Update CSS custom properties for radial glow gradient
      container.style.setProperty("--mouse-x", `${currentMouseX}px`);
      container.style.setProperty("--mouse-y", `${currentMouseY}px`);
      container.style.setProperty("--mouse-opacity", isHovering ? "1" : "0.65");

      const rows = Math.ceil(height / gridSpacing) + 1;
      const cols = Math.ceil(width / gridSpacing) + 1;

      // Draw base subtle grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;

      // Vertical grid lines
      for (let c = 0; c < cols; c++) {
        const x = c * gridSpacing;
        ctx.beginPath();
        for (let r = 0; r <= rows; r++) {
          const y = r * gridSpacing;
          const dx = x - currentMouseX;
          const dy = y - currentMouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let offsetX = 0;
          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            offsetX = dx * force * 0.12; // Warp grid points slightly toward/away
          }

          if (r === 0) {
            ctx.moveTo(x + offsetX, y);
          } else {
            ctx.lineTo(x + offsetX, y);
          }
        }
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let r = 0; r < rows; r++) {
        const y = r * gridSpacing;
        ctx.beginPath();
        for (let c = 0; c <= cols; c++) {
          const x = c * gridSpacing;
          const dx = x - currentMouseX;
          const dy = y - currentMouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let offsetY = 0;
          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            offsetY = dy * force * 0.12;
          }

          if (c === 0) {
            ctx.moveTo(x, y + offsetY);
          } else {
            ctx.lineTo(x, y + offsetY);
          }
        }
        ctx.stroke();
      }

      // Glowing accent line segments and intersections near mouse
      ctx.lineWidth = 1.2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gridSpacing;
          const y = r * gridSpacing;

          const dx = x - currentMouseX;
          const dy = y - currentMouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18;
            ctx.strokeStyle = `rgba(255, 122, 89, ${alpha * 0.8})`;

            const nextX = (c + 1) * gridSpacing;
            const nextY = (r + 1) * gridSpacing;

            // Compute warped coordinates
            const getWarpedPt = (px, py) => {
              const pdx = px - currentMouseX;
              const pdy = py - currentMouseY;
              const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
              if (pdist < maxDist) {
                const pforce = (maxDist - pdist) / maxDist;
                return {
                  x: px + pdx * pforce * 0.12,
                  y: py + pdy * pforce * 0.12
                };
              }
              return { x: px, y: py };
            };

            const ptCurr = getWarpedPt(x, y);
            const ptRight = getWarpedPt(nextX, y);
            const ptBottom = getWarpedPt(x, nextY);

            if (c < cols - 1) {
              ctx.beginPath();
              ctx.moveTo(ptCurr.x, ptCurr.y);
              ctx.lineTo(ptRight.x, ptRight.y);
              ctx.stroke();
            }
            if (r < rows - 1) {
              ctx.beginPath();
              ctx.moveTo(ptCurr.x, ptCurr.y);
              ctx.lineTo(ptBottom.x, ptBottom.y);
              ctx.stroke();
            }

            // Draw glowing node intersections
            if (dist < maxDist * 0.6) {
              const dotAlpha = (1 - dist / (maxDist * 0.6)) * 0.5;
              // Mix white glow with brand color
              ctx.fillStyle = `rgba(255, 158, 127, ${dotAlpha})`;
              ctx.beginPath();
              ctx.arc(ptCurr.x, ptCurr.y, 1.75, 0, Math.PI * 2);
              ctx.fill();

              // Add a soft halo
              ctx.fillStyle = `rgba(255, 122, 89, ${dotAlpha * 0.3})`;
              ctx.beginPath();
              ctx.arc(ptCurr.x, ptCurr.y, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
        container.removeEventListener("mouseenter", handleMouseEnter);
      }
    };
  }, [mounted]);

  if (!mounted) {
    return <div className="interactive-bg-wrapper" style={{ background: "#000" }} />;
  }

  return (
    <div ref={containerRef} className="interactive-bg-wrapper">
      <div className="interactive-bg-gradient" />
      <canvas ref={canvasRef} className="interactive-bg-canvas" />
    </div>
  );
}
