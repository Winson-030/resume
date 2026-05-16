"use client";

import { useEffect, useRef, useState } from "react";

export function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  })[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return;
    const ctx = gl as WebGLRenderingContext;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      vec3 palette(float t) {
        return vec3(0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67))));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 0.15;
        
        vec2 p = uv * 2.0 - 1.0;
        p.x *= u_resolution.x / u_resolution.y;
        
        float d = 0.0;
        for (int i = 0; i < 4; i++) {
          float fi = float(i);
          float angle = t + fi * 1.57;
          p = abs(p) / dot(p, p) - vec2(cos(angle), sin(angle)) * 0.7;
          d += length(p) * exp(-length(p) * 0.5);
        }
        
        vec3 col = palette(d * 0.1 + t * 0.1) * 0.08;
        col *= smoothstep(1.5, 0.0, d);
        
        gl_FragColor = vec4(col, col.r * 0.5);
      }
    `;

    function createShader(type: number, source: string) {
      const shader = ctx.createShader(type)!;
      ctx.shaderSource(shader, source);
      ctx.compileShader(shader);
      if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
        ctx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = ctx.createProgram()!;
    ctx.attachShader(program, vs);
    ctx.attachShader(program, fs);
    ctx.linkProgram(program);
    ctx.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
    ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);

    const posLoc = ctx.getAttribLocation(program, "a_position");
    ctx.enableVertexAttribArray(posLoc);
    ctx.vertexAttribPointer(posLoc, 2, ctx.FLOAT, false, 0, 0);

    const timeLoc = ctx.getUniformLocation(program, "u_time");
    const resLoc = ctx.getUniformLocation(program, "u_resolution");
    ctx.uniform2f(resLoc, canvas.width, canvas.height);

    ctx.enable(ctx.BLEND);
    ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);

    let animId: number;
    let startTime = performance.now();

    function render() {
      if (prefersReducedMotion) return;
      const time = (performance.now() - startTime) / 1000;
      ctx.uniform1f(timeLoc, time);
      ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-[0.12] dark:opacity-[0.08]"
      aria-hidden="true"
    />
  );
}
