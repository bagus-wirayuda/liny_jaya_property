(function () {
  const palette = {
    foundation: [0x52667b, 0x293956],
    deck: [0xc6cdd3, 0x58667f],
    paving: [0x9faab8, 0x45556e],
    lawn: [0x5f8c6a, 0x2f554d],
    planting: [0x91af72, 0x56795a],
    foliage: [0x467b58, 0x355d53],
    bark: [0x655246, 0x464350],
    plaster: [0xe9edf1, 0x9ca9c4],
    stone: [0xa8b9c8, 0x6e7d98],
    roof: [0x3d5065, 0x25324c],
    metal: [0x263d52, 0x28344a],
    timber: [0xb88358, 0x9f624a],
    glass: [0x79abc3, 0xffb365],
    reflection: [0xa3c8d9, 0xffd09a],
    rail: [0x759cae, 0x62748d],
    shadow: [0x73848e, 0x39465f],
  };

  function mesh() {
    const vertices = [];
    function color(value, light) {
      return [16, 8, 0].map((shift) => Math.min(1, ((value >> shift) & 255) * light / 255));
    }
    function surface(points, material, light) {
      const [day, dusk] = palette[material];
      for (let i = 1; i < points.length - 1; i++) {
        for (const index of [0, i, i + 1]) {
          const position = points[index];
          const shade = light * (0.88 + Math.min(0.12, Math.max(0, position[1]) * 0.055));
          vertices.push(...position, ...color(day, shade), ...color(dusk, shade));
        }
      }
    }
    function box(x, y, z, width, height, depth, material) {
      const a = [x, y, z], b = [x + width, y, z];
      const c = [x + width, y, z + depth], d = [x, y, z + depth];
      const e = [x, y + height, z], f = [x + width, y + height, z];
      const g = [x + width, y + height, z + depth], h = [x, y + height, z + depth];
      surface([e, h, g, f], material, 1.16);
      surface([d, c, g, h], material, 1.01);
      surface([b, f, g, c], material, 0.79);
      surface([a, d, h, e], material, 0.91);
      surface([a, e, f, b], material, 0.73);
      surface([a, b, c, d], material, 0.65);
    }
    function crown(x, y, z, radius, height, material) {
      const ring = (level, side) => {
        const angle = (side + (level % 2) * 0.5) * Math.PI / 4;
        const latitude = level * Math.PI / 4;
        return [x + Math.cos(angle) * Math.sin(latitude) * radius,
          y + Math.cos(latitude) * height, z + Math.sin(angle) * Math.sin(latitude) * radius];
      };
      for (let level = 0; level < 4; level++) {
        for (let side = 0; side < 8; side++) {
          const a = ring(level, side), b = ring(level, side + 1);
          const c = ring(level + 1, side + 1), d = ring(level + 1, side);
          const light = 1.12 - level * 0.10 + 0.13 * Math.sin(side * Math.PI / 4);
          surface([a, b, c], material, light);
          surface([a, c, d], material, light - 0.05);
        }
      }
    }
    function glazing(x, y, z, width, height, divisions) {
      box(x, y, z, width, height, 0.12, "metal");
      const panel = width / divisions;
      for (let i = 0; i < divisions; i++) {
        const left = x + i * panel;
        box(left + 0.055, y + 0.065, z + 0.123, panel - 0.105, height - 0.13, 0.018, "glass");
        surface([
          [left + 0.07, y + height - 0.10, z + 0.145],
          [left + panel - 0.07, y + height - 0.10, z + 0.145],
          [left + panel - 0.07, y + height * 0.71, z + 0.145],
        ], "reflection", 0.96);
        box(left + 0.06, y + height * 0.53, z + 0.148, panel - 0.11, 0.034, 0.02, "metal");
      }
    }

    // Site platform, planting beds and approach.
    box(-6.25, -0.52, -4.45, 12.5, 0.40, 8.9, "foundation");
    box(-6.30, -0.14, -4.50, 12.6, 0.14, 9, "deck");
    box(-6.08, 0.01, -4.28, 12.16, 0.06, 8.56, "lawn");
    box(-5.96, 0.08, 1.65, 5.9, 0.06, 2.48, "shadow");
    for (let i = 0; i < 9; i++) {
      box(-5.94 + i * 0.65, 0.14, 1.67, 0.625, 0.022, 2.43, i % 3 === 0 ? "deck" : "paving");
    }
    for (let i = 0; i < 5; i++) box(1.05, 0.10, 2.02 + i * 0.44, 2.02, 0.055, 0.31, "deck");
    box(1.04, 0.11, 1.28, 2.03, 0.19, 0.81, "stone");
    box(1.02, 0.27, 1.26, 2.08, 0.085, 0.86, "deck");

    // Ground floor and front colonnade.
    box(-4.73, 0.08, -2.88, 9.22, 0.22, 4.52, "stone");
    box(-4.51, 0.29, -2.76, 8.72, 2.11, 3.88, "stone");
    glazing(-4.38, 0.32, 1.11, 4.50, 1.85, 4);
    glazing(1.05, 0.36, 1.11, 2.88, 1.81, 3);
    box(0.14, 0.29, 1.08, 0.84, 2.15, 0.23, "timber");
    for (const x of [-4.73, 4.06]) box(x, 0.27, 1.17, 0.29, 2.18, 0.28, "plaster");
    box(-4.86, 2.36, -2.92, 9.44, 0.26, 5.24, "plaster");
    box(-4.75, 2.33, 2.14, 9.21, 0.072, 0.23, "metal");

    // Upper volume, screen, glazing and cantilevered roof.
    box(-3.85, 2.63, -2.76, 7.87, 2.05, 3.77, "plaster");
    box(2.58, 2.63, -2.45, 1.58, 2.03, 3.51, "timber");
    glazing(-3.22, 2.71, 1.00, 5.72, 1.78, 5);
    box(-4.02, 2.58, 0.93, 0.49, 2.07, 0.43, "plaster");
    for (let i = 0; i < 8; i++) box(2.66 + i * 0.175, 2.61, 1.06, 0.059, 1.96, 0.18, "timber");
    box(-3.95, 2.57, 2.05, 6.46, 0.43, 0.027, "rail");
    for (let i = 0; i < 6; i++) box(-3.95 + i * 1.29, 2.57, 2.09, 0.035, 0.46, 0.036, "metal");
    box(-3.98, 3.02, 2.06, 6.51, 0.046, 0.042, "metal");
    box(-4.28, 4.56, -3.02, 8.83, 0.26, 4.76, "plaster");
    box(-4.36, 4.80, -3.09, 8.99, 0.095, 4.9, "roof");
    box(1.12, 4.89, -2.68, 2.23, 0.27, 1.48, "stone");

    // Side windows, landscaping and entry markers.
    for (const z of [-2.22, -1.02]) {
      box(4.22, 0.78, z, 0.045, 1.08, 0.85, "metal");
      box(4.268, 0.84, z + 0.055, 0.02, 0.96, 0.74, "glass");
      box(4.026, 3.04, z, 0.046, 1.02, 0.83, "metal");
      box(4.075, 3.10, z + 0.055, 0.02, 0.9, 0.72, "glass");
    }
    for (const [x, z, scale] of [[-5.23, -1.30, 0.88], [5.19, 2.14, 0.72], [5.25, -2.45, 1.02]]) {
      box(x - 0.055, 0.08, z - 0.055, 0.11, 1.86 * scale, 0.11, "bark");
      crown(x, 2.02 * scale, z, 0.82 * scale, 1.01 * scale, "foliage");
      crown(x + 0.27 * scale, 1.87 * scale, z + 0.24 * scale, 0.50 * scale, 0.63 * scale, "planting");
    }
    for (let i = 0; i < 8; i++) {
      const x = 3.44 + (i % 4) * 0.53;
      crown(x, 0.17, 3.12 + Math.floor(i / 4) * 0.43, 0.25, 0.25, i % 2 ? "planting" : "foliage");
    }
    for (const x of [0.80, 3.29]) {
      box(x, 0.10, 3.61, 0.13, 0.46, 0.13, "metal");
      box(x - 0.018, 0.55, 3.592, 0.166, 0.06, 0.166, "reflection");
    }
    return new Float32Array(vertices);
  }

  function createRenderer(gl) {
    const shaders = [
      [gl.VERTEX_SHADER, `
        attribute vec3 position, dayColor, duskColor;
        uniform vec2 orbit, elevation, scale;
        uniform float dusk;
        varying vec3 color;
        void main() {
          float forward = position.x * orbit.x + position.z * orbit.y;
          float x = position.x * orbit.y - position.z * orbit.x;
          float y = position.y * elevation.y - forward * elevation.x;
          float depth = position.y * elevation.x + forward * elevation.y;
          float distance = 1.0 - depth / 32.0;
          gl_Position = vec4(x * scale.x, y * scale.y - 0.22 * distance, -depth / 17.0, distance);
          color = mix(dayColor, duskColor, dusk);
        }`],
      [gl.FRAGMENT_SHADER, `
        precision mediump float;
        varying vec3 color;
        void main() { gl_FragColor = vec4(color, 1.0); }`],
    ];
    const program = gl.createProgram();
    for (const [type, source] of shaders) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);
    const vertices = mesh();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    ["position", "dayColor", "duskColor"].forEach((name, index) => {
      const attribute = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(attribute);
      gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 36, index * 12);
    });
    const [orbit, elevation, scale, dusk] = ["orbit", "elevation", "scale", "dusk"]
      .map((name) => gl.getUniformLocation(program, name));
    gl.enable(gl.DEPTH_TEST);
    return (width, height, angle, pitch, lighting) => {
      const size = Math.min(width / 8.9, height / 5.6);
      gl.viewport(0, 0, width, height);
      gl.uniform2f(scale, size / width, size / height);
      gl.uniform2f(orbit, Math.sin(angle), Math.cos(angle));
      gl.uniform2f(elevation, Math.sin(pitch), Math.cos(pitch));
      gl.uniform1f(dusk, lighting);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 9);
    };
  }

  let mounted;
  LJ.mountArchitecture = () => {
    const figure = document.querySelector(".architecture");
    if (!figure || figure === mounted) return;
    if (mounted) {
      figure.replaceWith(mounted);
      return;
    }
    mounted = figure;
    const canvas = figure.querySelector("canvas");
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
    const render = gl && createRenderer(gl);
    if (!render) return;

    const photo = figure.querySelector(".architecture-photo");
    const help = figure.querySelector("#architecture-help");
    const controls = figure.querySelector(".architecture-controls");
    const light = controls.querySelector(".architecture-light");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    canvas.hidden = false;
    photo.hidden = true;
    controls.hidden = false;
    help.textContent = "Geser atau gunakan tombol panah";

    let angle = motion.matches ? 0.54 : 0.10;
    let targetAngle = 0.54;
    let pitch = 0.45, targetPitch = pitch;
    let lighting = 0, targetLight = 0;
    let pointer, frame;
    function paint() {
      frame = null;
      const speed = motion.matches ? 1 : 0.17;
      angle += (targetAngle - angle) * speed;
      pitch += (targetPitch - pitch) * speed;
      lighting += (targetLight - lighting) * speed;
      const ratio = Math.min(devicePixelRatio, 2);
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      if (!width || !height) return;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      render(width, height, angle, pitch, lighting);
      if (Math.abs(targetAngle - angle) + Math.abs(targetPitch - pitch) + Math.abs(targetLight - lighting) > 0.002)
        requestPaint();
    }
    function requestPaint() {
      if (frame == null) frame = requestAnimationFrame(paint);
    }
    function turn(direction) {
      targetAngle += direction * Math.PI / 5;
      requestPaint();
    }
    for (const button of controls.querySelectorAll("[data-model-turn]")) {
      button.addEventListener("click", () => turn(Number(button.dataset.modelTurn)));
    }
    light.addEventListener("click", () => {
      targetLight = 1 - targetLight;
      light.setAttribute("aria-pressed", String(targetLight === 1));
      figure.classList.toggle("architecture--dusk", targetLight === 1);
      requestPaint();
    });
    canvas.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      turn(event.key === "ArrowLeft" ? -1 : 1);
    });
    canvas.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      pointer = event;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!pointer || pointer.pointerId !== event.pointerId) return;
      targetAngle += (event.clientX - pointer.clientX) * 0.012;
      targetPitch = Math.max(0.19, Math.min(0.85, targetPitch + (event.clientY - pointer.clientY) * 0.007));
      pointer = event;
      requestPaint();
    });
    canvas.addEventListener("lostpointercapture", () => { pointer = null; });
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      canvas.hidden = true;
      photo.hidden = false;
      controls.hidden = true;
      help.textContent = "Visual konsep arsitektur";
    });
    new ResizeObserver(requestPaint).observe(canvas);
    requestPaint();
  };
})();
