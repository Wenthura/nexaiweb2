import { useEffect, useRef } from 'react';

/* PBR-lite relighting of the hero nebula using its normal/roughness/height maps.
   Light follows the cursor (desktop) or device tilt (phones); drifts when idle.
   Renders the flat <img> as a fallback and hides it once the shader is live. */

const VERT =
  'attribute vec2 aPos;varying vec2 vUv;' +
  'void main(){vUv=aPos*0.5+0.5;vUv.y=1.0-vUv.y;gl_Position=vec4(aPos,0.0,1.0);}';

const FRAG = [
  'precision mediump float;',
  'varying vec2 vUv;',
  'uniform sampler2D uBase,uNorm,uRough,uHeight;',
  'uniform vec2 uMouse,uFit,uOff;',
  'uniform float uTime,uIdle;',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'void main(){',
  '  vec2 uv=vUv*uFit+uOff;',
  '  vec2 drift=vec2(0.5+0.32*sin(uTime*0.11),0.42+0.26*sin(uTime*0.08+1.7));',
  '  vec2 lightUv=mix(uMouse,drift,uIdle);',
  '  float h=texture2D(uHeight,uv).r;',
  '  vec2 puv=uv+(lightUv-vUv)*(h-0.5)*0.012;',
  '  vec3 base=texture2D(uBase,puv).rgb;',
  '  vec3 n=texture2D(uNorm,puv).rgb*2.0-1.0;n=normalize(vec3(n.xy*1.4,n.z));',
  '  float rough=texture2D(uRough,puv).r;',
  '  vec3 L=normalize(vec3((lightUv-vUv)*vec2(1.6,1.2),0.55));',
  '  vec3 V=vec3(0.0,0.0,1.0);vec3 H=normalize(L+V);',
  '  float diff=max(dot(n,L),0.0);',
  '  float spec=pow(max(dot(n,H),0.0),mix(64.0,8.0,rough))*(1.0-rough*0.85);',
  '  float dist=length(lightUv-vUv);float fall=1.0/(1.0+dist*dist*5.5);',
  '  vec3 warm=vec3(1.0,0.86,0.62);',
  '  vec2 d2=vec2(0.5+0.36*sin(uTime*0.07+3.1),0.46+0.3*cos(uTime*0.09));',
  '  vec3 L2=normalize(vec3((d2-vUv)*vec2(1.6,1.2),0.5));',
  '  float diff2=max(dot(n,L2),0.0);float dd=length(d2-vUv);float fall2=1.0/(1.0+dd*dd*6.0);',
  '  float spec2=pow(max(dot(n,normalize(L2+V)),0.0),40.0)*(1.0-rough*0.85);',
  '  vec3 cool=vec3(0.78,0.86,1.05);',
  '  float lum=dot(base,vec3(0.299,0.587,0.114));',
  '  float tw=hash(floor(uv*720.0));',
  '  float sparkle=step(0.985,tw)*(0.5+0.5*sin(uTime*3.0+tw*40.0));sparkle*=smoothstep(0.32,0.6,lum);',
  '  float starMask=smoothstep(0.5,0.82,lum);',
  '  float phase=hash(floor(uv*260.0))*6.2831;',
  '  float starPulse=0.5+0.5*sin(uTime*1.4+phase);',
  '  vec3 col=base*(0.8+diff*fall*0.5+diff2*fall2*0.22)+warm*spec*fall*0.5+cool*spec2*fall2*0.18+base*starMask*starPulse*0.5+warm*sparkle*0.35;',
  '  gl_FragColor=vec4(col,1.0);',
  '}',
].join('\n');

export default function HeroNebula({ base = '' }) {
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
    ['uBase', 'uNorm', 'uRough', 'uHeight', 'uMouse', 'uFit', 'uOff', 'uTime', 'uIdle']
      .forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

    let texW = 2048, texH = 1536, loaded = 0, dead = false;
    const srcs = [
      { url: `${base}/assets/cosmos/hero_nebula.webp`, unit: 0, u: 'uBase' },
      { url: `${base}/assets/cosmos/hero_nebula_normal.webp`, unit: 1, u: 'uNorm' },
      { url: `${base}/assets/cosmos/hero_nebula_roughness.webp`, unit: 2, u: 'uRough' },
      { url: `${base}/assets/cosmos/hero_nebula_height.webp`, unit: 3, u: 'uHeight' },
    ];

    let raf = 0, io = null, running = false, visible = true, t0 = 0, idleTimer = 0;
    const mouse = [0.5, 0.45];
    let idle = 1;
    const wake = () => { idle = 0; clearTimeout(idleTimer); idleTimer = setTimeout(() => (idle = 1), 3000); };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(2, Math.round(r.width * dpr));
      const h = Math.max(2, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
      }
      const cA = w / h, tA = texW / texH;
      let fx = 1, fy = 1, ox = 0, oy = 0;
      if (cA > tA) { fy = tA / cA; oy = (1 - fy) / 2; } else { fx = cA / tA; ox = (1 - fx) / 2; }
      gl.uniform2f(U.uFit, fx, fy); gl.uniform2f(U.uOff, ox, oy);
    };

    const frame = (now) => {
      if (!running) return;
      if (!t0) t0 = now;
      gl.uniform1f(U.uTime, (now - t0) / 1000);
      gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
      gl.uniform1f(U.uIdle, idle);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (reduced) { running = false; return; }
      raf = requestAnimationFrame(frame);
    };
    const play = () => { if (!running && visible && !document.hidden) { running = true; raf = requestAnimationFrame(frame); } };
    const pause = () => { running = false; cancelAnimationFrame(raf); };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse[0] = (e.clientX - r.left) / r.width;
      mouse[1] = (e.clientY - r.top) / r.height;
      wake();
    };
    const onTilt = (e) => {
      if (e.beta == null || e.gamma == null) return;
      mouse[0] = Math.min(1.3, Math.max(-0.3, (e.gamma + 45) / 90));
      mouse[1] = Math.min(1.3, Math.max(-0.3, (e.beta - 10) / 70));
      wake();
    };

    const start = () => {
      if (img) img.style.visibility = 'hidden';
      resize();
      window.addEventListener('resize', resize);
      const hero = canvas.closest('.pc-hero') || document;
      hero.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('deviceorientation', onTilt, { passive: true });
      if ('IntersectionObserver' in window) {
        io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; visible ? play() : pause(); }, { rootMargin: '80px' });
        io.observe(canvas);
      }
      document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
      play();
    };

    srcs.forEach((s) => {
      const im = new Image();
      im.onload = () => {
        if (dead) return;
        if (s.unit === 0) { texW = im.naturalWidth; texH = im.naturalHeight; }
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
      window.removeEventListener('deviceorientation', onTilt);
      if (io) io.disconnect();
      clearTimeout(idleTimer);
    };
  }, [base]);

  return (
    <>
      <img ref={imgRef} className="pc-hero__bg" src={`${base}/assets/cosmos/hero_nebula.webp`}
        alt="" width="2048" height="1536" aria-hidden="true" fetchPriority="high" />
      <canvas ref={canvasRef} className="pc-hero__bg pc-hero__bg--gl" aria-hidden="true"></canvas>
    </>
  );
}
