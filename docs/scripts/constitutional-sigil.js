/*
 * Constitutional Sigil / canonical 2D background adaptation.
 * Source: https://github.com/zeropoet/constitutional-sigil
 * Revision: d04de5fca5294e6d58714ed0e6048dad75a8d666
 * Seed: 0. Time: 0. Monochrome, static, and noninteractive by design.
 */

(() => {
  const canvas = document.querySelector("#constitutional-sigil");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const seed = Number.parseInt(canvas.dataset.seed || "0", 10) >>> 0;
  const baseSize = 800;
  const time = 0;

  const mulberry32 = (initial) => {
    let state = initial;
    return () => {
      let value = (state += 0x6d2b79f5);
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  };

  const buildConstitution = (initial) => {
    const random = mulberry32(initial);
    return {
      radialFrequency: 6,
      angularFrequency: 6,
      radialScale: 0.04 + random() * 0.02,
      timeScale: 1.5 + random(),
      anchorStrength: 1 + random() * 0.6,
      anchorSpread: 0.015 + random() * 0.01
    };
  };

  const constitution = buildConstitution(seed);
  const energy = (x, y, instant) => {
    const radius = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);
    const radial = Math.sin(
      constitution.radialFrequency * (radius * constitution.radialScale)
        - constitution.timeScale * instant
    );
    const angular = 0.25 * Math.cos(constitution.angularFrequency * angle);
    const anchorA = Math.exp(
      -constitution.anchorSpread * ((x + 80) * (x + 80) + y * y)
    );
    const anchorB = Math.exp(
      -constitution.anchorSpread * ((x - 80) * (x - 80) + y * y)
    );
    return radial + angular - constitution.anchorStrength * (anchorA + anchorB);
  };

  const draw = () => {
    const bounds = canvas.getBoundingClientRect();
    const size = Math.max(1, Math.min(bounds.width, bounds.height));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const pixels = Math.round(size * pixelRatio);

    if (canvas.width !== pixels || canvas.height !== pixels) {
      canvas.width = pixels;
      canvas.height = pixels;
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, size, size);
    context.save();
    context.translate(size / 2, size / 2);
    context.scale(size / baseSize, size / baseSize);

    context.strokeStyle = "rgba(17,17,17,0.12)";
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(-350, 0);
    context.lineTo(350, 0);
    context.moveTo(0, -350);
    context.lineTo(0, 350);
    context.stroke();

    context.strokeStyle = "rgba(17,17,17,0.25)";
    context.lineWidth = 1.2;
    for (let radius = 40; radius < 280; radius += 30) {
      const offset = energy(radius, 0, time) * 6;
      context.beginPath();
      context.arc(0, 0, radius + offset, 0, Math.PI * 2);
      context.stroke();
    }

    context.strokeStyle = "rgba(17,17,17,0.16)";
    context.lineWidth = 1.1;
    const epsilon = 1;
    for (let x = -240; x <= 240; x += 60) {
      for (let y = -240; y <= 240; y += 60) {
        const gradientX = (energy(x + epsilon, y, time) - energy(x - epsilon, y, time)) / (2 * epsilon);
        const gradientY = (energy(x, y + epsilon, time) - energy(x, y - epsilon, time)) / (2 * epsilon);
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x - gradientX * 28, y - gradientY * 28);
        context.stroke();
      }
    }

    const spiral = (mirror = 1) => {
      context.beginPath();
      for (let angle = 0; angle < Math.PI * 4; angle += 0.05) {
        const baseRadius = 20 + angle * 18;
        const baseX = Math.cos(angle) * baseRadius;
        const baseY = Math.sin(angle) * baseRadius;
        const localEnergy = energy(baseX, baseY, time);
        const displacement = (localEnergy / (1 + Math.abs(localEnergy))) * 20;
        const x = mirror * Math.cos(angle) * (baseRadius + displacement);
        const y = Math.sin(angle) * (baseRadius + displacement);
        if (angle === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    };

    context.strokeStyle = "rgba(17,17,17,0.38)";
    context.lineWidth = 1.3;
    spiral(1);
    spiral(-1);

    context.fillStyle = "rgba(17,17,17,0.72)";
    context.strokeStyle = "rgba(17,17,17,0.32)";
    context.lineWidth = 1;
    for (const x of [-150, 150]) {
      context.beginPath();
      context.arc(x, 0, 4, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.arc(x, 0, 5.5, 0, Math.PI * 2);
      context.stroke();
    }

    context.strokeStyle = "rgba(17,17,17,0.3)";
    context.lineWidth = 1.8;
    context.beginPath();
    context.arc(0, 0, 300, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  };

  const observer = new ResizeObserver(draw);
  observer.observe(canvas);
  draw();
})();
