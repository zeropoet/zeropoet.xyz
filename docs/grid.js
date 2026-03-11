(() => {
  const canvas = document.querySelector(".grid-canvas");
  const cursorDot = document.querySelector(".cursor-dot");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const interactiveSelector = "a, button, input, textarea, select, summary, [role='button']";

  const state = {
    width: 1,
    height: 1,
    dpr: 1,
    spacingX: 0,
    spacingY: 0,
    spacingDiag: 0,
    overscanX: 0,
    overscanY: 0,
    drift: 0,
    frameCount: 0,
    pointer: {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      active: false,
      engaged: false,
      ready: false
    },
    nodes: new Map()
  };

  function noise(seed) {
    const value = Math.sin(seed * 127.1) * 43758.5453123;
    return value - Math.floor(value);
  }

  function smoothstep(value) {
    const clamped = Math.max(0, Math.min(1, value));
    return clamped * clamped * (3 - 2 * clamped);
  }

  function smootherstep(value) {
    const clamped = Math.max(0, Math.min(1, value));
    return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
  }

  function viewport() {
    return {
      width: Math.max(1, window.innerWidth),
      height: Math.max(1, window.innerHeight)
    };
  }

  function nodeKey(row, col) {
    return `${row}:${col}`;
  }

  function rebuildMetrics() {
    const { width, height } = state;
    const unit = Math.min(width, height);
    const area = width * height;
    const baselineArea = 1440 * 900;
    const densityScale = Math.pow(area / baselineArea, 0.1);
    const baseSpacing = Math.max(18, Math.min(44, Math.floor(unit / 24)));
    const responsiveSpacing = Math.max(18, Math.min(48, baseSpacing / densityScale));
    const aspect = width / Math.max(1, height);
    const aspectOffset = Math.max(-0.12, Math.min(0.12, (aspect - 1.4) * 0.14));
    const cellRatio = Math.max(0.88, Math.min(1.14, 1 + aspectOffset));

    state.spacingX = responsiveSpacing * cellRatio;
    state.spacingY = responsiveSpacing / cellRatio;
    state.spacingDiag = Math.hypot(state.spacingX, state.spacingY);
    state.overscanX = Math.max(state.spacingX * 8, width * 0.4);
    state.overscanY = Math.max(state.spacingY * 8, height * 0.4);
    state.nodes.clear();
  }

  function resizeCanvas() {
    const { width, height } = viewport();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    state.width = width;
    state.height = height;
    state.dpr = dpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuildMetrics();
  }

  function ensureNode(row, col) {
    const key = nodeKey(row, col);
    let node = state.nodes.get(key);
    if (node) return node;

    const bx = col * state.spacingX;
    const by = row * state.spacingY;
    node = {
      row,
      col,
      bx,
      by,
      x: bx,
      y: by,
      vx: 0,
      vy: 0,
      phase: noise(row * 71.3 + col * 19.7) * Math.PI * 2,
      reveal: 0
    };
    state.nodes.set(key, node);
    return node;
  }

  function visibleBounds() {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const minCol = Math.floor((scrollX - state.overscanX) / state.spacingX) - 1;
    const maxCol = Math.ceil((scrollX + state.width + state.overscanX) / state.spacingX) + 1;
    const minRow = Math.floor((scrollY - state.overscanY) / state.spacingY) - 1;
    const maxRow = Math.ceil((scrollY + state.height + state.overscanY) / state.spacingY) + 1;

    return {
      scrollX,
      scrollY,
      minCol,
      maxCol,
      minRow,
      maxRow,
      cols: maxCol - minCol + 1,
      rows: maxRow - minRow + 1
    };
  }

  function ensureVisibleNodes(bounds) {
    const nodes = new Array(bounds.cols * bounds.rows);

    for (let row = bounds.minRow; row <= bounds.maxRow; row += 1) {
      for (let col = bounds.minCol; col <= bounds.maxCol; col += 1) {
        const localIndex = (row - bounds.minRow) * bounds.cols + (col - bounds.minCol);
        nodes[localIndex] = ensureNode(row, col);
      }
    }

    return nodes;
  }

  function pruneNodes(bounds) {
    const marginCols = 14;
    const marginRows = 14;
    for (const [key, node] of state.nodes) {
      if (
        node.col < bounds.minCol - marginCols ||
        node.col > bounds.maxCol + marginCols ||
        node.row < bounds.minRow - marginRows ||
        node.row > bounds.maxRow + marginRows
      ) {
        state.nodes.delete(key);
      }
    }
  }

  function syncPointer(x, y) {
    if (!state.pointer.ready) {
      state.pointer.x = x;
      state.pointer.y = y;
      state.pointer.prevX = x;
      state.pointer.prevY = y;
      state.pointer.ready = true;
      return;
    }

    state.pointer.prevX = state.pointer.x;
    state.pointer.prevY = state.pointer.y;
    state.pointer.x = x;
    state.pointer.y = y;
  }

  function updateCursor(point) {
    if (!(cursorDot instanceof HTMLElement)) return;
    cursorDot.style.opacity = "1";
    cursorDot.style.left = `${point.clientX}px`;
    cursorDot.style.top = `${point.clientY}px`;

    const element = document.elementFromPoint(point.clientX, point.clientY);
    cursorDot.classList.toggle(
      "is-hovering",
      element instanceof Element ? Boolean(element.closest(interactiveSelector)) : false
    );
  }

  function updatePointerFromEvent(event) {
    const point = "touches" in event && event.touches.length ? event.touches[0] : event;
    if (!point) return;
    state.pointer.active = true;
    syncPointer(point.clientX, point.clientY);
    updateCursor(point);
  }

  function applySpring(a, b, restLength, ax, ay, nodes) {
    const na = nodes[a];
    const nb = nodes[b];
    const dx = nb.x - na.x;
    const dy = nb.y - na.y;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    const extension = dist - restLength;
    const relativeSpeed = (nb.vx - na.vx) * ux + (nb.vy - na.vy) * uy;
    const force = extension * 0.085 + relativeSpeed * 0.09;
    const fx = ux * force;
    const fy = uy * force;
    ax[a] += fx;
    ay[a] += fy;
    ax[b] -= fx;
    ay[b] -= fy;
  }

  function constrainEdge(a, b, minLength, maxLength, nodes) {
    const na = nodes[a];
    const nb = nodes[b];
    const dx = nb.x - na.x;
    const dy = nb.y - na.y;
    const dist = Math.hypot(dx, dy) || 1;
    const target = Math.min(maxLength, Math.max(minLength, dist));
    if (Math.abs(target - dist) < 0.0001) return;
    const correction = ((dist - target) / dist) * 0.5;
    const ox = dx * correction;
    const oy = dy * correction;
    na.x += ox;
    na.y += oy;
    nb.x -= ox;
    nb.y -= oy;
  }

  function step(bounds, nodes) {
    state.drift += 0.005;
    state.frameCount += 1;

    const pointer = state.pointer;
    const pointerWorldX = bounds.scrollX + pointer.x;
    const pointerWorldY = bounds.scrollY + pointer.y;
    const moveLimit = Math.max(0.6, Math.min(state.spacingX, state.spacingY) * 0.08);
    const rawMoveX = pointer.x - pointer.prevX;
    const rawMoveY = pointer.y - pointer.prevY;
    const moveX = Math.max(-moveLimit, Math.min(moveLimit, rawMoveX));
    const moveY = Math.max(-moveLimit, Math.min(moveLimit, rawMoveY));
    const cellSize = Math.min(state.spacingX, state.spacingY);
    const massCoreRadius = cellSize * (pointer.engaged ? 2.8 : 2.2);
    const massHaloRadius = cellSize * (pointer.engaged ? 5.8 : 4.6);
    const plasticRadius = cellSize * 6.4;
    const ax = new Float32Array(nodes.length);
    const ay = new Float32Array(nodes.length);
    const previous = new Array(nodes.length);
    const localIndex = (row, col) => (row - bounds.minRow) * bounds.cols + (col - bounds.minCol);

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      previous[i] = { x: node.x, y: node.y };
      const restoreX = (node.bx - node.x) * 0.018;
      const restoreY = (node.by - node.y) * 0.018;
      const dragX = -node.vx * 0.17;
      const dragY = -node.vy * 0.17;
      const wave = Math.sin(state.drift * 1.5 + node.phase);
      ax[i] += restoreX + dragX + wave * 0.003;
      ay[i] += restoreY + dragY + wave * 0.012;
      node.reveal = Math.min(1, node.reveal + 0.08);
    }

    for (let row = bounds.minRow; row <= bounds.maxRow; row += 1) {
      for (let col = bounds.minCol; col <= bounds.maxCol; col += 1) {
        const i = localIndex(row, col);
        if (col + 1 <= bounds.maxCol) {
          applySpring(i, localIndex(row, col + 1), state.spacingX, ax, ay, nodes);
        }
        if (row + 1 <= bounds.maxRow) {
          applySpring(i, localIndex(row + 1, col), state.spacingY, ax, ay, nodes);
        }
      }
    }

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (pointer.active) {
        const dx = node.x - pointerWorldX;
        const dy = node.y - pointerWorldY;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance < massHaloRadius) {
          const haloPull = 1 - distance / massHaloRadius;
          const corePull = 1 - distance / massCoreRadius;
          const edgeTension = smootherstep(haloPull);
          const wellDepth = smootherstep(corePull);
          const blend = smoothstep(Math.min(1, distance / massHaloRadius));
          const driftResistance = pointer.engaged ? 2.6 : 0.7;
          const massPull = pointer.engaged ? 7.8 : 1.8;
          const rampedTension = edgeTension * (0.35 + 0.65 * (1 - blend));
          const rampedWell = wellDepth * (0.55 + 0.45 * wellDepth);

          ax[i] -= moveX * driftResistance * rampedTension;
          ay[i] -= moveY * driftResistance * rampedTension;
          ax[i] += (-dx / distance) * (rampedTension * 0.7 + rampedWell * massPull);
          ay[i] += (-dy / distance) * (rampedTension * 0.7 + rampedWell * massPull);
          node.vx *= 1 - rampedWell * 0.24;
          node.vy *= 1 - rampedWell * 0.24;
        }
      }

      node.vx += ax[i];
      node.vy += ay[i];
      node.x += node.vx;
      node.y += node.vy;
    }

    for (let iteration = 0; iteration < 2; iteration += 1) {
      for (let row = bounds.minRow; row <= bounds.maxRow; row += 1) {
        for (let col = bounds.minCol; col <= bounds.maxCol; col += 1) {
          const i = localIndex(row, col);
          if (col + 1 <= bounds.maxCol) {
            constrainEdge(i, localIndex(row, col + 1), state.spacingX * 0.75, state.spacingX * 1.35, nodes);
          }
          if (row + 1 <= bounds.maxRow) {
            constrainEdge(i, localIndex(row + 1, col), state.spacingY * 0.75, state.spacingY * 1.35, nodes);
          }
          if (col + 1 <= bounds.maxCol && row + 1 <= bounds.maxRow) {
            constrainEdge(i, localIndex(row + 1, col + 1), state.spacingDiag * 0.8, state.spacingDiag * 1.28, nodes);
          }
          if (col - 1 >= bounds.minCol && row + 1 <= bounds.maxRow) {
            constrainEdge(i, localIndex(row + 1, col - 1), state.spacingDiag * 0.8, state.spacingDiag * 1.28, nodes);
          }
        }
      }
    }

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      node.vx = (node.x - previous[i].x) * 0.88;
      node.vy = (node.y - previous[i].y) * 0.88;

      if (!pointer.engaged) continue;
      const dx = node.x - pointerWorldX;
      const dy = node.y - pointerWorldY;
      const distance = Math.hypot(dx, dy);
      if (distance > plasticRadius) continue;
      const influence = smootherstep(1 - distance / plasticRadius);
      const coreInfluence = smootherstep(1 - distance / massCoreRadius);
      const anchorPull = 0.04 + influence * 0.06;
      const driftPull = 0.04 + influence * 0.08;
      const coreSink = 0.025 + coreInfluence * 0.055;
      node.bx += (node.x - node.bx) * anchorPull - moveX * driftPull * influence - dx * coreSink;
      node.by += (node.y - node.by) * anchorPull - moveY * driftPull * influence - dy * coreSink;
    }

    pointer.prevX = pointer.x;
    pointer.prevY = pointer.y;

    if (state.frameCount % 120 === 0) {
      pruneNodes(bounds);
    }
  }

  function draw(bounds, nodes) {
    context.clearRect(0, 0, state.width, state.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, state.width, state.height);
    context.lineWidth = 1;

    const localIndex = (row, col) => (row - bounds.minRow) * bounds.cols + (col - bounds.minCol);

    for (let row = bounds.minRow; row <= bounds.maxRow; row += 1) {
      for (let col = bounds.minCol; col <= bounds.maxCol; col += 1) {
        const node = nodes[localIndex(row, col)];
        const x = node.x - bounds.scrollX;
        const y = node.y - bounds.scrollY;

        if (col + 1 <= bounds.maxCol) {
          const right = nodes[localIndex(row, col + 1)];
          context.strokeStyle = `rgba(17, 17, 17, ${(0.018 + node.reveal * 0.032).toFixed(3)})`;
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(right.x - bounds.scrollX, right.y - bounds.scrollY);
          context.stroke();
        }

        if (row + 1 <= bounds.maxRow) {
          const down = nodes[localIndex(row + 1, col)];
          context.strokeStyle = `rgba(17, 17, 17, ${(0.018 + node.reveal * 0.032).toFixed(3)})`;
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(down.x - bounds.scrollX, down.y - bounds.scrollY);
          context.stroke();
        }
      }
    }

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      const velocity = Math.min(1, Math.hypot(node.vx, node.vy) / 2.8);
      const pulse = 0.4 + 0.6 * Math.sin(state.drift * 1.8 + node.phase);
      const alpha = (0.03 + pulse * 0.025 + velocity * 0.05) * node.reveal;
      const size = 0.7 + pulse * 0.2 + velocity * 0.5;

      context.fillStyle = `rgba(17, 17, 17, ${alpha.toFixed(3)})`;
      context.beginPath();
      context.arc(node.x - bounds.scrollX, node.y - bounds.scrollY, size, 0, Math.PI * 2);
      context.fill();
    }
  }

  function frame() {
    const bounds = visibleBounds();
    const nodes = ensureVisibleNodes(bounds);
    step(bounds, nodes);
    draw(bounds, nodes);
    window.requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener(
    "mousemove",
    (event) => {
      updatePointerFromEvent(event);
    },
    { passive: true }
  );
  window.addEventListener(
    "mouseenter",
    (event) => {
      updatePointerFromEvent(event);
    },
    { passive: true }
  );
  window.addEventListener("mousedown", (event) => {
    state.pointer.engaged = true;
    updatePointerFromEvent(event);
    if (cursorDot instanceof HTMLElement) {
      cursorDot.classList.add("is-pressed");
    }
  });
  window.addEventListener("mouseup", () => {
    state.pointer.engaged = false;
    if (cursorDot instanceof HTMLElement) {
      cursorDot.classList.remove("is-pressed");
    }
  });
  window.addEventListener("mouseleave", () => {
    state.pointer.active = false;
    state.pointer.engaged = false;
    if (cursorDot instanceof HTMLElement) {
      cursorDot.style.opacity = "0";
      cursorDot.classList.remove("is-hovering", "is-pressed");
    }
  });
  window.addEventListener(
    "touchstart",
    (event) => {
      state.pointer.engaged = true;
      updatePointerFromEvent(event);
    },
    { passive: true }
  );
  window.addEventListener(
    "touchmove",
    (event) => {
      updatePointerFromEvent(event);
    },
    { passive: true }
  );
  window.addEventListener(
    "touchend",
    () => {
      state.pointer.engaged = false;
      state.pointer.active = false;
    },
    { passive: true }
  );
  window.addEventListener("blur", () => {
    if (cursorDot instanceof HTMLElement) {
      cursorDot.style.opacity = "0";
      cursorDot.classList.remove("is-hovering", "is-pressed");
    }
  });

  resizeCanvas();
  syncPointer(state.width * 0.5, state.height * 0.5);
  frame();
})();
