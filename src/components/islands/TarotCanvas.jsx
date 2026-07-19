import { useEffect, useRef } from 'react';

/* Relights one feature artwork with its normal/roughness/height maps.
   Light follows the cursor (desktop) / device tilt (phone); drifts when idle. */

const VERT =
  'attribute vec2 aPos;varying vec2 vUv;' +
  'void main(){vUv=aPos*0.5+0.5;vUv.y=1.0-vUv.y;gl_Position=vec4(aPos,0.0,1.0);}';

const FRAG = [
  'precision mediump float;',
  'varying vec2 vUv;',
  'uniform sampler2D uBase,uNorm,uRough,uHeight;',
  'uniform vec2 uLight;uniform float uTime,uIdle,uPhase;',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'void main(){',
  '  vec2 drift=vec2(0.5+0.34*sin(uTime*0.13+uPhase),0.42+0.3*sin(uTime*0.09+uPhase*1.7));',
  '  vec2 lightUv=mix(uLight,drift,uIdle);',
  '  float hgt=texture2D(uHeight,vUv).r;',
  '  vec2 puv=vUv+(lightUv-vUv)*(hgt-0.5)*0.02;',
  '  vec3 base=texture2D(uBase,puv).rgb;',
  '  vec3 n=texture2D(uNorm,puv).rgb*2.0-1.0;n=normalize(vec3(n.xy*1.6,n.z));',
  '  float rough=texture2D(uRough,puv).r;',
  '  vec3 L=normalize(vec3((lightUv-vUv)*vec2(1.4,2.0),0.45));',
  '  vec3 V=vec3(0.0,0.0,1.0);vec3 H=normalize(L+V);',
  '  float diff=max(dot(n,L),0.0);',
  '  float spec=pow(max(dot(n,H),0.0),mix(70.0,10.0,rough))*(1.0-rough*0.8);',
  '  float dist=length(lightUv-vUv);float fall=1.0/(1.0+dist*dist*4.0);',
  '  vec3 warm=vec3(1.0,0.87,0.63);',
  '  float lum=dot(base,vec3(0.299,0.587,0.114));',
  '  float tw=hash(floor(vUv*420.0));',
  '  float sparkle=step(0.982,tw)*(0.5+0.5*sin(uTime*2.6+tw*40.0+uPhase));sparkle*=smoothstep(0.3,0.55,lum);',
  '  vec3 col=base*(0.78+diff*fall*0.65)+warm*spec*fall*0.65+warm*sparkle*0.3;',
  '  gl_FragColor=vec4(col,1.0);',
  '}',
].join('\n');

export default function TarotCanvas({ slug, base = '', index = 0, alt = '' }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    const compile = (t, s) => {
      const sh = gl.createShader(t);
      gl.shaderSource(sh, s); gl.compileShader(sh);
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {};
    ['uBase', 'uNorm', 'uRough', 'uHeight', 'uLight', 'uTime', 'uIdle', 'uPhase']
      .forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

    let loaded = 0, dead = false, raf = 0, io = null, running = false, visible = false, t0 = 0;
    const phase = index * 1.9;
    let px = 0, py = 0, hasPointer = false, lastMove = 0;
    let tX = 0, tY = 0, hasTilt = false, lastTilt = 0;

    const onMove = (e) => { px = e.clientX; py = e.clientY; hasPointer = true; lastMove = performance.now(); };
    const onTilt = (e) => {
      if (e.beta == null || e.gamma == null) return;
      tX = Math.min(1.4, Math.max(-0.4, (e.gamma + 45) / 90));
      tY = Math.min(1.4, Math.max(-0.4, (e.beta - 10) / 70));
      hasTilt = true; lastTilt = performance.now();
    };

    const srcs = [
      { url: `${base}/assets/cosmos/${slug}.webp`, unit: 0, u: 'uBase' },
      { url: `${base}/assets/cosmos/${slug}_normal.webp`, unit: 1, u: 'uNorm' },
      { url: `${base}/assets/cosmos/${slug}_roughness.webp`, unit: 2, u: 'uRough' },
      { url: `${base}/assets/cosmos/${slug}_height.webp`, unit: 3, u: 'uHeight' },
    ];

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const w = Math.max(2, Math.round(r.width));
      const h = Math.max(2, Math.round(r.height));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    };
    const frame = (now) => {
      if (!running) return;
      if (!t0) t0 = now;
      const r = canvas.getBoundingClientRect();
      let lx = 0.5, ly = 0.4, idle = 1;
      if (hasTilt && now - lastTilt < 4000) { lx = tX; ly = tY; idle = 0; }
      else if (hasPointer && now - lastMove < 3000 && r.width > 0) { lx = (px - r.left) / r.width; ly = (py - r.top) / r.height; idle = 0; }
      gl.uniform2f(U.uLight, lx, ly);
      gl.uniform1f(U.uTime, (now - t0) / 1000);
      gl.uniform1f(U.uIdle, idle);
      gl.uniform1f(U.uPhase, phase);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (reduced) { running = false; return; }
      raf = requestAnimationFrame(frame);
    };
    const play = () => { if (!running && visible && !document.hidden) { running = true; raf = requestAnimationFrame(frame); } };
    const pause = () => { running = false; cancelAnimationFrame(raf); };

    const start = () => {
      if (img) img.style.visibility = 'hidden';
      resize();
      window.addEventListener('resize', resize);
      document.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('deviceorientation', onTilt, { passive: true });
      if ('IntersectionObserver' in window) {
        io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; visible ? play() : pause(); }, { rootMargin: '100px' });
        io.observe(canvas);
      } else { visible = true; play(); }
      document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
    };

    srcs.forEach((s) => {
      const im = new Image();
      im.onload = () => {
        if (dead) return;
        const t = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + s.unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
        gl.uniform1i(U[s.u], s.unit);
        if (++loaded === srcs.length) start();
      };
      im.onerror = () => (dead = true);
      im.src = s.url;
    });

    return () => {
      dead = true; pause();
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMove);
      window.removeEventListener('deviceorientation', onTilt);
      if (io) io.disconnect();
    };
  }, [slug, base, index]);

  return (
    <>
      <img ref={imgRef} src={`${base}/assets/cosmos/${slug}.webp`} alt={alt} width="512" height="768" loading="lazy" />
      <canvas ref={canvasRef} aria-hidden="true"></canvas>
    </>
  );
}
