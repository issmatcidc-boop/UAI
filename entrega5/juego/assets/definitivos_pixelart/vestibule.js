/* Objetos, encuentros y señales del Vestíbulo. */
const VESTIBULE = window.MANSION_VESTIBULE;

function isVestibule() {
  return !game.tutorial && window.mansionCaseStage === 0 && !!game.vestibule;
}

function createVestibuleState() {
  game.vestibuleProgress ??= { crate: false, key: false, gate: false, lampNote: false };
  return {
    progress: game.vestibuleProgress,
    checkpoint: false, crateAt: null, gateAt: null, creakUntil: 0,
    boards: VESTIBULE.boards.map(spec => ({ ...spec, pressed: false, loud: false, at: -Infinity })),
    enemies: VESTIBULE.encounters.map(spec => ({
      ...spec, floor: spec.floor ?? GROUND, st: "patrol", dir: spec.kind === "guard" ? -1 : 1,
      stun: 0, wait: 0, lift: 0
    }))
  };
}

function vestibuleGhostBottom(ghost) {
  return ghost.floor - ghost.lift;
}

function vestibuleKickTarget(player) {
  const center = player.x + player.w / 2;
  return game.vestibule.enemies
    .filter(ghost => {
      const ahead = (ghost.x - center) * player.dir;
      const bottom = vestibuleGhostBottom(ghost);
      return ghost.st !== "stun" && ahead > -10 && ahead < 75 &&
        player.y < bottom && player.y + player.h > bottom - 42;
    })
    .sort((a, b) => Math.abs(a.x - center) - Math.abs(b.x - center))[0];
}

function turnVestibuleGhost(ghost, dt) {
  if (ghost.wait > 0) {
    ghost.st = "suspect";
    ghost.wait = Math.max(0, ghost.wait - dt);
    return;
  }
  ghost.st = "patrol";
  const next = ghost.x + ghost.dir * ghost.speed * dt;
  ghost.x = clamp(next, ghost.left, ghost.right);
  if (ghost.x !== next) {
    ghost.dir *= -1;
    ghost.wait = ghost.kind === "shelf" ? .7 : .58;
  }
}

function updateVestibuleEnemies(dt, previousY, fallSpeed, pace) {
  const player = game.player;
  const center = player.x + player.w / 2;
  const feet = player.y + player.h;
  const state = game.vestibule;
  if (!state.checkpoint && state.progress.gate && player.onGround && center >= VESTIBULE.station - 35) {
    state.checkpoint = true;
    showToast("ESTACIÓN ILUMINADA · PUNTO DE REINTENTO");
  }

  for (const ghost of state.enemies) {
    const distance = center - ghost.x;
    const liftTarget = ghost.kind === "shadow" && pace.mode === "SIGILO" && Math.abs(distance) < 105 ? 70 : 0;
    ghost.lift += clamp(liftTarget - ghost.lift, -260 * dt, 260 * dt);
    const bottom = vestibuleGhostBottom(ghost);
    const top = bottom - 40;
    const sameLevel = prop => Math.abs(prop.y - ghost.floor) < 16 && ghost.lift < 26;

    if (ghost.stun > 0) {
      ghost.stun = Math.max(0, ghost.stun - dt);
      ghost.st = "stun";
      continue;
    }
    if (game.trap && sameLevel(game.trap) && Math.abs(ghost.x - game.trap.x) < 16) {
      ghost.stun = 4.5;
      ghost.st = "stun";
      game.trap = null;
      burst(ghost.x, top, 14, "#a7cc82");
      showToast("¡FRED ATRAPÓ AL FANTASMA!");
      continue;
    }
    if (game.decoy && sameLevel(game.decoy) && Math.abs(ghost.x - game.decoy.x) < 135) {
      const target = clamp(game.decoy.x, ghost.left, ghost.right);
      ghost.st = "lure";
      ghost.dir = Math.sign(target - ghost.x) || ghost.dir;
      ghost.x += clamp(target - ghost.x, -85 * dt, 85 * dt);
      if (Math.abs(ghost.x - target) < 10) {
        ghost.stun = 3.5;
        ghost.st = "stun";
        game.decoy = null;
        showToast("¡EL FANTASMA SE COME LA GALLETA!");
      }
      continue;
    }

    if (ghost.kind === "guard") {
      const inLane = center > ghost.left - 68 && center < ghost.right + 30;
      const heard = inLane && feet > GROUND - 52 &&
        (Math.abs(distance) < 55 || (game.noise > .31 && Math.abs(distance) < 96 + game.noise * 178));
      if (ghost.st === "chase" && (heard || (inLane && Math.abs(distance) < 92))) {
        ghost.dir = Math.sign(distance) || ghost.dir;
        const target = clamp(center, ghost.left, ghost.right);
        ghost.x += clamp(target - ghost.x, -99 * dt, 99 * dt);
      } else if (ghost.st === "warn" && heard) {
        ghost.wait -= dt;
        if (ghost.wait <= 0) ghost.st = "chase";
      } else if (heard) {
        ghost.st = "warn";
        ghost.wait = .55;
        ghost.dir = Math.sign(distance) || ghost.dir;
      } else {
        ghost.st = "patrol";
        ghost.x += clamp(ghost.home - ghost.x, -34 * dt, 34 * dt);
      }
    } else {
      turnVestibuleGhost(ghost, dt);
    }

    if (Math.abs(center - ghost.x) >= player.w / 2 + 13) continue;
    if (fallSpeed > 0 && previousY + player.h <= top + 3 && feet >= top) {
      Object.assign(player, { y: top - player.h, vy: -165, coy: 0, onGround: false, invuln: Math.max(player.invuln, .45) });
      Object.assign(ghost, { st: "stun", stun: 2.4, wait: 0 });
      game.shake = .14;
      burst(ghost.x, top, 12, "#ffe45d");
      showToast("¡FANTASMA ATURDIDO!");
    } else if (player.onGround && player.invuln <= 0 && feet > top && player.y < bottom) {
      hurt("¡EL FANTASMA TE ALCANZÓ!");
    }
  }
}

function vestibuleGateOpen() {
  const state = game.vestibule;
  return state.progress.gate && (state.gateAt === null || game.t - state.gateAt >= .52);
}

function vestibuleGatePosition(player, nextX) {
  if (vestibuleGateOpen()) return nextX;
  const left = VESTIBULE.gate - 9 - player.w, right = VESTIBULE.gate + 9;
  return player.x < VESTIBULE.gate - player.w / 2 ? Math.min(nextX, left) : Math.max(nextX, right);
}

function syncVestibuleHud() {
  $("vestibule-key").hidden = !(isVestibule() && game.running && game.vestibule.progress.key);
}

function interactVestibuleObjects(player) {
  const state = game.vestibule, progress = state.progress;
  const center = player.x + player.w / 2;
  if (player.y + player.h < GROUND - 21) return false;
  if (!progress.crate && Math.abs(center - VESTIBULE.crate) < 60) {
    progress.crate = true;
    state.crateAt = game.t;
    beep(175, .13, "triangle");
    showToast("CAJA ROTA · RECOGE LA LLAVE");
    return true;
  }
  if (!vestibuleGateOpen() && Math.abs(center - VESTIBULE.gate) < 72) {
    if (!progress.key) {
      showToast("BUSCA LA CAJA MARCADA EN EL ALMACÉN");
      beep(160, .12, "triangle");
    } else if (!progress.gate) {
      progress.gate = true;
      state.gateAt = game.t;
      showToast("LLAVE DE SERVICIO · REJA ABIERTA");
      beep(480, .15, "triangle");
    }
    return true;
  }
  return false;
}

function updateVestibuleObjects(pace) {
  const player = game.player, state = game.vestibule;
  const center = player.x + player.w / 2, feet = player.y + player.h;
  if (state.progress.crate && !state.progress.key && (state.crateAt === null || game.t - state.crateAt >= .38) &&
      Math.abs(center - (VESTIBULE.crate + 34)) < player.w / 2 + 13 && feet > GROUND - 24) {
    state.progress.key = true;
    syncVestibuleHud();
    beep(875, .16, "triangle");
    showToast("LLAVE DE SERVICIO CONSEGUIDA");
  }
  for (const board of state.boards) {
    const pressed = player.onGround && feet >= GROUND - 1 && Math.abs(player.vx) > 3 &&
      center >= board.x && center <= board.x + board.w;
    const loud = pressed && pace.mode === "CORRER";
    if (pressed && !board.pressed) board.at = game.t;
    if (loud && !board.loud) {
      board.at = game.t;
      state.creakUntil = game.t + .68;
      game.noise = Math.max(game.noise, .86);
      burst(center, GROUND - 3, 6, "#d9ad78");
      beep(95, .12, "triangle");
      showToast("¡CRUJIDO! · BAJA EL DESLIZADOR PARA HACER SIGILO");
    }
    board.pressed = pressed;
    board.loud = loud;
  }
  return game.t < state.creakUntil ? 1 : 0;
}

function drawVestibuleScenery(cam, now) {
  const state = game.vestibule, progress = state.progress, player = game.player;
  const center = player.x + player.w / 2;
  const light = (worldX, color) => {
    const x = Math.round(worldX - cam);
    if (x < -80 || x > W + 80) return;
    ctx.save();
    const glow = ctx.createRadialGradient(x, GROUND - 31, 2, x, GROUND - 31, 64);
    glow.addColorStop(0, color);
    glow.addColorStop(1, "#ffd48b00");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 64, GROUND - 95, 128, 96);
    ctx.restore();
  };
  light(VESTIBULE.elvira, "#ffd48b50");
  light(VESTIBULE.station, "#ffd48b66");

  for (const board of state.boards) {
    const x = board.x - cam;
    if (x > W || x + board.w < 0) continue;
    const elapsed = game.t - board.at;
    const frame = elapsed < .28 ? Math.min(3, 1 + Math.floor(elapsed / .09)) : 0;
    drawVestibuleArt(ctx, "tablas_crujientes_4f", frame, x + board.w / 2, GROUND, board.w / 701);
  }

  const crateX = VESTIBULE.crate - cam;
  if (crateX > -65 && crateX < W + 65) {
    const elapsed = state.crateAt === null ? Infinity : game.t - state.crateAt;
    const frame = progress.crate ? Math.min(3, 1 + Math.floor(elapsed / .12)) : 0;
    drawVestibuleArt(ctx, "caja_servicio_4f", frame, crateX, GROUND, .105);
    if (!progress.crate && Math.abs(center - VESTIBULE.crate) < 63 && player.y + player.h >= GROUND - 21) {
      txt("ABAJO · ROMPER CAJA", crateX, GROUND - 42, "#ffe2a0", 6, "center");
    }
    if (progress.crate && elapsed < .36) {
      drawVestibuleArt(ctx, "astillas_madera_4f", Math.min(3, Math.floor(elapsed / .09)), crateX, GROUND - 22, .095);
    }
    if (progress.crate && !progress.key && elapsed >= .38) {
      drawVestibuleArt(ctx, "llave_servicio", 0, crateX + 34, GROUND - 16 + Math.sin(now / 170) * 3, .023);
    }
  }

  const gateX = VESTIBULE.gate - cam;
  if (gateX > -70 && gateX < W + 70) {
    const frame = progress.gate ? state.gateAt === null ? 3 : Math.min(3, Math.floor((game.t - state.gateAt) / (.52 / 3))) : 0;
    const drawn = drawVestibuleArt(ctx, "reja_servicio_4f", frame, gateX, GROUND, .19);
    if (!drawn && !vestibuleGateOpen()) rect(gateX - 7, GROUND - 88, 14, 88, "#836146");
    if (!vestibuleGateOpen() && Math.abs(center - VESTIBULE.gate) < 76) {
      const label = progress.key ? "ABAJO · ABRIR REJA" : "REJA · NECESITAS LA LLAVE";
      txt(label, gateX, GROUND - 104, "#ffe2a0", 6, "center");
    }
  }

  const record = VESTIBULE.record, x = Math.round(record.x - cam), y = record.y;
  if (x < -40 || x > W + 40) return;
  rect(x - 20, y - 16, 40, 4, "#c0804c");
  rect(x - 18, y - 12, 4, 12, "#784c43");
  rect(x + 14, y - 12, 4, 12, "#784c43");
  rect(x + 1, y - 19, 13, 4, "#e9c98b");
  drawVestibuleArt(ctx, "lampara_registro_4f", progress.lampNote ? 2 : 0, x - 10, y - 16, .065);
  const nearby = Math.abs(center - record.x) < 45 && Math.abs(player.y + player.h - y) < 12;
  if (nearby || Math.sin(now / 250) > 0) {
    txt(nearby ? "ABAJO · LÁMPARA" : "REGISTRO", x, y - 54, "#ffe2a0", 5, "center");
  }
}
