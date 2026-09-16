import { useEffect, useRef } from 'react'
import { PROJECTS } from '../data/projects'

interface ShockwaveShowcaseProps {
  activeIndex: number
  targetIndex: number
  progress: number
  direction?: number
}

// ── Vertex Shader: Full-Screen Quad ───────────────────────────────────────
const VS_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
    v_uv = (a_position + 1.0) * 0.5;
    v_uv.y = 1.0 - v_uv.y; // Flip Y to match WebGL image texture coordinate orientation
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`

// ── Fragment Shader: Apple-Grade Liquid Glass Shockwave, Spectral Prism & Specular Glint ──
const FS_SOURCE = `
precision highp float;

varying vec2 v_uv;

uniform sampler2D u_tex0;
uniform sampler2D u_tex1;
uniform float u_progress;       // Normalized scroll progress [0.0 - 1.0]
uniform vec2 u_resolution;     // Viewport width & height in physical pixels
uniform float u_aspect0;       // Source image 0 natural aspect ratio (w/h)
uniform float u_aspect1;       // Target image 1 natural aspect ratio (w/h)
uniform vec2 u_pointer;        // Interactive cursor position in [0, 1] UV space
uniform float u_time;          // High-precision elapsed time in seconds
uniform float u_direction;     // Scroll direction: +1.0 (down/forward) or -1.0 (up/backward)
uniform float u_introProgress; // Landing intro shockwave progress [0.0 - 1.0]

// ── Aspect Containment: Preserves 100% full image visibility without cropping ──
vec2 getContainUV(vec2 uvCoord, float canvasAspect, float imgAspect) {
    vec2 st = uvCoord - 0.5;
    if (canvasAspect > imgAspect) {
        st.x *= canvasAspect / imgAspect;
    } else {
        st.y *= imgAspect / canvasAspect;
    }
    return st + 0.5;
}

// ── Safe texture sampling with clean matte backdrop outside aspect bounds ──
vec4 sampleTex(sampler2D tex, vec2 uvCoord) {
    if (uvCoord.x < 0.0 || uvCoord.x > 1.0 || uvCoord.y < 0.0 || uvCoord.y > 1.0) {
        return vec4(0.02, 0.024, 0.028, 1.0);
    }
    return texture2D(tex, uvCoord);
}

// ── 2D Simplex Noise for organic liquid surface tension & subtle turbulence ──
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                   + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    bool isIntro = (u_introProgress < 0.999);
    float p = isIntro ? u_introProgress : clamp(u_progress, 0.0, 1.0);
    float canvasAspect = u_resolution.x / u_resolution.y;

    // ── Ultra-Fast Path: Zero shader overhead when idle on a project ──
    if (!isIntro && p <= 0.0005) {
        vec2 cUV0 = getContainUV(v_uv, canvasAspect, u_aspect0);
        gl_FragColor = sampleTex(u_tex0, cUV0);
        return;
    }
    if (!isIntro && p >= 0.9995) {
        vec2 cUV1 = getContainUV(v_uv, canvasAspect, u_aspect1);
        gl_FragColor = sampleTex(u_tex1, cUV1);
        return;
    }

    vec2 uv = v_uv;

    // ── Interactive Epicenter: Cursor gravity + Scroll directional bias ──
    vec2 dynamicCenter = isIntro
        ? mix(vec2(0.5, 0.5), u_pointer, 0.14)
        : mix(vec2(0.5, 0.5), u_pointer, 0.26);
    float envelope = sin(p * 3.14159265);
    if (!isIntro) {
        dynamicCenter.y += u_direction * (0.045 * envelope);
    }

    // Aspect-compensated coordinates from dynamic epicenter
    vec2 st = uv - dynamicCenter;
    st.x *= canvasAspect;
    float r = length(st);
    vec2 radialDir = (r > 0.0001) ? normalize(st) : vec2(0.0, 1.0);
    vec2 uvDir = vec2(radialDir.x / canvasAspect, radialDir.y);

    // ── 1. Liquid Shockwave Dynamics with Living Micro-Breathing ──
    float waveRadius = p * 2.35;
    float livingTime = u_time * 0.42;

    // Organic liquid surface tension ripple
    float noiseVal = snoise(st * 3.4 + vec2(livingTime * 0.2, p * 1.4)) * 0.032 * envelope;
    float modR = r + noiseVal;

    // Multi-harmonic damped physical wave profile with calm, heavy liquid pacing
    float d1 = modR - waveRadius;
    float wave1 = sin(d1 * 24.0 - livingTime * 0.9) * exp(-d1 * d1 * 68.0);

    float d2 = modR - (waveRadius - 0.14);
    float wave2 = sin(d2 * 32.0 - livingTime * 1.2) * exp(-d2 * d2 * 100.0) * 0.45;

    float d3 = modR - (waveRadius - 0.25);
    float wave3 = sin(d3 * 40.0 - livingTime * 1.5) * exp(-d3 * d3 * 160.0) * 0.22;

    float waveDisplacement = (wave1 + wave2 + wave3) * envelope;

    // Spatial refraction gradient: how light bends through the curved liquid shockwave
    float refractStrength = waveDisplacement * 0.065;
    vec2 baseRefract = uvDir * refractStrength;

    // ── 2. Spectral Chromatic Prism Dispersion ──
    float dispersionScale = 0.018 * envelope;
    vec2 refractR = baseRefract - uvDir * (dispersionScale * 0.65);
    vec2 refractG = baseRefract;
    vec2 refractB = baseRefract + uvDir * (dispersionScale * 0.85);

    // ── 3. Golden Vogel Spiral Bokeh Blur ──
    const int SAMPLES = 16;
    float blurRadius = envelope * 0.032;

    vec4 bokeh0 = vec4(0.0);
    vec4 bokeh1 = vec4(0.0);
    float totalW = 0.0;

    for (int i = 0; i < SAMPLES; i++) {
        float fi = float(i);
        float rSpiral = sqrt((fi + 0.5) / float(SAMPLES));
        float theta = fi * 2.39996323; // Golden angle (137.508°)
        vec2 offset = vec2(cos(theta), sin(theta)) * (rSpiral * blurRadius);
        offset.x /= canvasAspect; // Preserve circular bokeh in screen space

        vec2 sampleUV0 = getContainUV(uv + baseRefract + offset, canvasAspect, u_aspect0);
        vec2 sampleUV1 = getContainUV(uv + baseRefract + offset, canvasAspect, u_aspect1);

        float weight = 1.0 - rSpiral * 0.45;
        bokeh0 += sampleTex(u_tex0, sampleUV0) * weight;
        bokeh1 += sampleTex(u_tex1, sampleUV1) * weight;
        totalW += weight;
    }
    bokeh0 /= totalW;
    bokeh1 /= totalW;

    // Crisp chromatic samples
    vec2 cUV0_R = getContainUV(uv + refractR, canvasAspect, u_aspect0);
    vec2 cUV0_G = getContainUV(uv + refractG, canvasAspect, u_aspect0);
    vec2 cUV0_B = getContainUV(uv + refractB, canvasAspect, u_aspect0);

    vec2 cUV1_R = getContainUV(uv + refractR, canvasAspect, u_aspect1);
    vec2 cUV1_G = getContainUV(uv + refractG, canvasAspect, u_aspect1);
    vec2 cUV1_B = getContainUV(uv + refractB, canvasAspect, u_aspect1);

    vec3 crisp0 = vec3(
        sampleTex(u_tex0, cUV0_R).r,
        sampleTex(u_tex0, cUV0_G).g,
        sampleTex(u_tex0, cUV0_B).b
    );
    vec3 crisp1 = vec3(
        sampleTex(u_tex1, cUV1_R).r,
        sampleTex(u_tex1, cUV1_G).g,
        sampleTex(u_tex1, cUV1_B).b
    );

    // Blend between crisp prismatic detail and creamy optical bokeh
    vec3 col0;
    vec3 col1;

    if (isIntro) {
        // Landing intro: blooms outward from clean dark stage background into crisp Project 01
        col0 = vec3(0.031, 0.035, 0.043);
        col1 = crisp0;
    } else {
        // Scroll transitions: blend between current project and target project
        col0 = mix(crisp0, bokeh0.rgb, envelope * 0.65);
        col1 = mix(crisp1, bokeh1.rgb, envelope * 0.65);
    }

    // ── 4. Wavefront Liquid Reveal ──
    // The incoming project blooms outward definitively behind the expanding shockwave crest
    float reveal = smoothstep(waveRadius - 0.20, waveRadius + 0.05, modR);
    float spatialBlend = 1.0 - reveal;
    float timeBlend = isIntro ? smoothstep(0.05, 0.95, p) : smoothstep(0.12, 0.88, p);
    float blendFactor = clamp(max(spatialBlend, timeBlend), 0.0, 1.0);

    vec3 blended = mix(col0, col1, blendFactor);

    // ── 5. Selective Specular Highlight Glint & Iridescent Caustics ──
    // Artwork luminance: only bright elements (logos, buttons, highlights) catch radiant catchlights
    float lum0 = dot(crisp0, vec3(0.2126, 0.7152, 0.0722));
    float lum1 = dot(crisp1, vec3(0.2126, 0.7152, 0.0722));
    float surfaceLum = mix(lum0, lum1, blendFactor);
    float highlightGlint = pow(clamp((surfaceLum - 0.22) / 0.78, 0.0, 1.0), 2.2);

    // Caustic shockwave ridge with breathing oscillation
    float causticWave = exp(-d1 * d1 * 125.0) * envelope;
    float breathe = sin(livingTime * 2.5 + modR * 7.0) * 0.1;
    float dynamicCaustic = causticWave * (1.0 + breathe);

    // Iridescent chromatic spectrum rotation along the shockwave
    vec3 causticTint = vec3(
        0.86 + 0.14 * sin(modR * 14.0 + livingTime * 1.2),
        0.92 + 0.08 * sin(modR * 14.0 + livingTime * 1.2 + 2.094),
        1.00 + 0.04 * sin(modR * 14.0 + livingTime * 1.2 + 4.188)
    );

    // Base optical glass sheen + intensified crystal glint on artwork highlights
    blended += causticTint * (dynamicCaustic * (0.16 + highlightGlint * 0.45));

    // Subtle edge vignette focus
    float vignette = 1.0 - smoothstep(0.9, 1.6, r);
    blended *= mix(1.0, vignette, 0.12);

    gl_FragColor = vec4(blended, 1.0);
}
`

export const ShockwaveShowcase = ({
  activeIndex,
  targetIndex,
  progress,
  direction = 1,
}: ShockwaveShowcaseProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const texturesRef = useRef<(WebGLTexture | null)[]>([])
  const aspectsRef = useRef<number[]>([])

  // Uniform locations cache
  const uniformsRef = useRef<{
    u_tex0: WebGLUniformLocation | null
    u_tex1: WebGLUniformLocation | null
    u_progress: WebGLUniformLocation | null
    u_resolution: WebGLUniformLocation | null
    u_aspect0: WebGLUniformLocation | null
    u_aspect1: WebGLUniformLocation | null
    u_pointer: WebGLUniformLocation | null
    u_time: WebGLUniformLocation | null
    u_direction: WebGLUniformLocation | null
    u_introProgress: WebGLUniformLocation | null
  } | null>(null)

  // Interactive mouse pointer tracking
  const targetPointerRef = useRef({ x: 0.5, y: 0.5 })
  const currentPointerRef = useRef({ x: 0.5, y: 0.5 })
  const rafIdRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(performance.now())
  const introStartTimeRef = useRef<number | null>(null)
  const hasFirstImageLoadedRef = useRef(false)

  // Store latest props in refs for the animation loop
  const stateRef = useRef({ activeIndex, targetIndex, progress, direction })
  stateRef.current = { activeIndex, targetIndex, progress, direction }

  // Initialize WebGL context, compiled shaders, and geometry
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      depth: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    })
    if (!gl) return
    glRef.current = gl

    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type)
      if (!shader) return null
      glCtx.shaderSource(shader, source)
      glCtx.compileShader(shader)
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error('Shader compilation error:', glCtx.getShaderInfoLog(shader))
        glCtx.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }
    programRef.current = program
    gl.useProgram(program)

    // Full-screen quad buffer
    const posAttr = gl.getAttribLocation(program, 'a_position')
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )
    gl.enableVertexAttribArray(posAttr)
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0)

    // Uniforms
    uniformsRef.current = {
      u_tex0: gl.getUniformLocation(program, 'u_tex0'),
      u_tex1: gl.getUniformLocation(program, 'u_tex1'),
      u_progress: gl.getUniformLocation(program, 'u_progress'),
      u_resolution: gl.getUniformLocation(program, 'u_resolution'),
      u_aspect0: gl.getUniformLocation(program, 'u_aspect0'),
      u_aspect1: gl.getUniformLocation(program, 'u_aspect1'),
      u_pointer: gl.getUniformLocation(program, 'u_pointer'),
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_direction: gl.getUniformLocation(program, 'u_direction'),
      u_introProgress: gl.getUniformLocation(program, 'u_introProgress'),
    }

    // Default 1x1 placeholder pixel so textures are immediately complete
    const defaultPixel = new Uint8Array([10, 12, 16, 255])
    const textures: (WebGLTexture | null)[] = []
    const aspects: number[] = []

    PROJECTS.forEach((p, idx) => {
      const tex = gl.createTexture()
      textures[idx] = tex
      aspects[idx] = 16 / 9

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        defaultPixel
      )
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

      // Asynchronously load real project image
      const img = new Image()
      img.src = p.image
      img.onload = () => {
        aspects[idx] = img.naturalWidth / img.naturalHeight
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)

        // When the first image (Horizon AI) loads, start the landing shockwave reveal
        if (idx === 0 && !hasFirstImageLoadedRef.current) {
          hasFirstImageLoadedRef.current = true
          introStartTimeRef.current = performance.now()
        }

        // Trigger immediate redraw when texture arrives
        renderFrame()
      }
      img.onerror = (err) => {
        console.error('Failed to load project image:', p.image, err)
      }
    })

    texturesRef.current = textures
    aspectsRef.current = aspects

    return () => {
      textures.forEach((t) => t && gl.deleteTexture(t))
      if (buffer) gl.deleteBuffer(buffer)
      if (program) gl.deleteProgram(program)
    }
  }, [])

  // Core Render Routine
  const renderFrame = () => {
    const gl = glRef.current
    const program = programRef.current
    const canvas = canvasRef.current
    const uniforms = uniformsRef.current
    if (!gl || !program || !canvas || !uniforms) return

    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (width === 0 || height === 0) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const targetW = Math.floor(width * dpr)
    const targetH = Math.floor(height * dpr)

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW
      canvas.height = targetH
      gl.viewport(0, 0, targetW, targetH)
    }

    gl.useProgram(program)

    const { activeIndex: aIdx, targetIndex: tIdx, progress: p, direction: dir } = stateRef.current

    // Bind texture 0 (active project)
    const tex0 = texturesRef.current[aIdx]
    gl.activeTexture(gl.TEXTURE0)
    if (tex0) gl.bindTexture(gl.TEXTURE_2D, tex0)
    gl.uniform1i(uniforms.u_tex0, 0)

    // Bind texture 1 (target project)
    const safeTarget = Math.min(PROJECTS.length - 1, Math.max(0, tIdx))
    const tex1 = texturesRef.current[safeTarget]
    gl.activeTexture(gl.TEXTURE1)
    if (tex1) gl.bindTexture(gl.TEXTURE_2D, tex1)
    gl.uniform1i(uniforms.u_tex1, 1)

    // Reset active unit back to 0
    gl.activeTexture(gl.TEXTURE0)

    // Smoothly interpolate pointer coordinates
    currentPointerRef.current.x += (targetPointerRef.current.x - currentPointerRef.current.x) * 0.08
    currentPointerRef.current.y += (targetPointerRef.current.y - currentPointerRef.current.y) * 0.08

    const elapsed = (performance.now() - startTimeRef.current) / 1000.0

    // Landing Intro Shockwave Progress
    const now = performance.now()
    const introStart = introStartTimeRef.current
    let introProgress = 1.0

    if (!hasFirstImageLoadedRef.current || introStart === null) {
      // First image hasn't uploaded into WebGL yet: stay at pure dark background
      introProgress = 0.0
    } else {
      const elapsedSinceStart = now - introStart
      const introDuration = 1450 // 1.45s of glorious shockwave expansion
      if (elapsedSinceStart < introDuration) {
        const t = elapsedSinceStart / introDuration
        // Luxurious cubic ease-out
        introProgress = 1 - Math.pow(1 - t, 3)
      } else {
        introProgress = 1.0
      }
    }

    // Update uniforms
    gl.uniform1f(uniforms.u_progress, p)
    gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height)
    gl.uniform1f(uniforms.u_aspect0, aspectsRef.current[aIdx] || 16 / 9)
    gl.uniform1f(uniforms.u_aspect1, aspectsRef.current[safeTarget] || 16 / 9)
    gl.uniform2f(uniforms.u_pointer, currentPointerRef.current.x, currentPointerRef.current.y)
    gl.uniform1f(uniforms.u_time, elapsed)
    gl.uniform1f(uniforms.u_direction, dir)
    gl.uniform1f(uniforms.u_introProgress, introProgress)

    // Draw full-screen quad
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  // Animation loop: runs smoothly at 60+ FPS during intro, transitions, or mouse movement
  useEffect(() => {
    let active = true

    const loop = () => {
      if (!active) return
      renderFrame()

      const introStart = introStartTimeRef.current
      const isIntro = !hasFirstImageLoadedRef.current || introStart === null || (performance.now() - introStart) < 1550
      const p = stateRef.current.progress
      const isTransitioning = p > 0.0005 && p < 0.9995
      const pointerMoving =
        Math.abs(currentPointerRef.current.x - targetPointerRef.current.x) > 0.002 ||
        Math.abs(currentPointerRef.current.y - targetPointerRef.current.y) > 0.002

      // Continue loop during intro, scroll transitions, or pointer momentum
      if (isIntro || isTransitioning || pointerMoving) {
        rafIdRef.current = requestAnimationFrame(loop)
      } else {
        rafIdRef.current = null
      }
    }

    // Trigger one render immediately
    renderFrame()

    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(loop)
    }

    return () => {
      active = false
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [activeIndex, targetIndex, progress, direction])

  // Pointer event listeners for interactive epicenter sway
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      targetPointerRef.current = {
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
      }

      // Resume animation loop if it was asleep
      if (rafIdRef.current === null) {
        renderFrame()
      }
    }
  }

  const handlePointerLeave = () => {
    targetPointerRef.current = { x: 0.5, y: 0.5 }
  }

  return (
    <canvas
      ref={canvasRef}
      className="rp-webgl-canvas"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    />
  )
}

export default ShockwaveShowcase
