const mansionTrapImages = Object.fromEntries(Object.keys(MANSION_TRAP_ATLAS.frames).map(file => {
  const image = new Image();
  image.src = "assets/definitivos_pixelart/trampas_mansion/" + file;
  return [file, image];
}));
const mansionTrapPoses = Object.values(MANSION_TRAP_ATLAS.sequences.personajes);
const mansionTrapHeights = [52, 61, 54, 59, 62];
const mansionTrapEscapeSteps = 3;
const mansionNetWindup = .32;
const mansionNetLanding = .72;
const mansionRopeLift = .48;

function createMansionHazard(stage) {
  if (!stage.hazard) return null;
  const { kind, offset } = stage.hazard;
  return { kind, x: stage.start + offset, phase: "ready", age: 0, presses: 0, lastSide: null };
}

function mansionHazardCaptive() {
  return game.hazard?.phase === "held";
}

function updateMansionHazard(dt) {
  const hazard = game.hazard;
  if (!hazard || hazard.phase === "spent") return false;
  const player = game.player, center = player.x + player.w / 2;
  const distance = Math.abs(center - hazard.x), feet = player.y + player.h;
  if (hazard.phase === "ready") {
    if (hazard.kind === "red" && distance < 34 && feet > GROUND - 46) {
      hazard.phase = "falling";
      hazard.age = 0;
      beep(420, .1, "triangle");
      return false;
    }
    if (hazard.kind === "red" || distance >= 19 || !player.onGround || feet < GROUND - 2) return false;
  } else {
    hazard.age += dt;
    if (hazard.age < mansionNetLanding) return false;
    if (distance > 33 || feet < GROUND - 30) {
      hazard.phase = "spent";
      return false;
    }
  }
  hazard.phase = "held";
  hazard.age = 0;
  Object.assign(player, { x: hazard.x - player.w / 2, y: GROUND - player.h, vx: 0, vy: 0, coy: 0, buf: 0 });
  game.land = game.skillAnim = game.kick = 0;
  beep(210, .14, "triangle");
  if (game.tutorial) updateTutorialUI();
  return true;
}

function updateMansionEscape(input, dt) {
  const hazard = game.hazard, player = game.player;
  hazard.age += dt;
  if (hazard.kind === "soga") {
    const lift = clamp(hazard.age / mansionRopeLift, 0, 1);
    player.y = GROUND - player.h - 24 * lift;
    player.onGround = false;
  }
  const delay = hazard.kind === "soga" ? mansionRopeLift : .23;
  if (hazard.age < delay || input.left === input.right) return;
  const side = input.leftP ? "left" : input.rightP ? "right" : null;
  if (!side || side === hazard.lastSide) return;
  hazard.lastSide = side;
  hazard.presses++;
  beep(440 + hazard.presses * 100, .07, "triangle");
  if (hazard.presses === mansionTrapEscapeSteps) {
    hazard.phase = "spent";
    player.invuln = Math.max(player.invuln, .95);
    game.noise = Math.max(game.noise, .45);
    burst(hazard.x, GROUND - 10, 9, "#f4ce85");
    showToast("¡TE SOLTASTE!");
  }
  if (game.tutorial) updateTutorialUI();
}

function drawHazardSprite(reference, x, y, scale, align = "anchor", flip = false) {
  const [file, index] = reference, image = mansionTrapImages[file];
  const frame = MANSION_TRAP_ATLAS.frames[file][index];
  const [sx, sy, width, height] = frame.source;
  const [ax, ay] = frame[align];
  if (image.naturalWidth) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(Math.round(x), Math.round(y));
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(image, sx, sy, width, height, Math.round(-ax * scale), Math.round(-ay * scale),
      Math.round(width * scale), Math.round(height * scale));
    ctx.restore();
  }
  return frame;
}

function drawMansionHazard(cam) {
  const hazard = game.hazard;
  if (!hazard || (game.tutorial && hazard !== game.tutorial.practiceHazard)) return false;
  const x = hazard.x - cam, age = hazard.age;
  if (x < -100 || x > W + 100) return false;
  const held = hazard.phase === "held", ready = hazard.phase === "ready", spent = hazard.phase === "spent";
  const sequences = MANSION_TRAP_ATLAS.sequences;
  const { kind } = hazard;
  const poses = mansionTrapPoses[character][kind];
  const pose = poses[Math.floor(age * 7) % poses.length];
  const [bodyFile, bodyIndex] = mansionTrapPoses[character].cepo[0];
  const scale = mansionTrapHeights[character] / MANSION_TRAP_ATLAS.frames[bodyFile][bodyIndex].visible[3];
  const flip = game.player.dir < 0;
  let paintedHero = false;

  if (kind === "soga") {
    if (ready || held && age < .24) {
      const i = ready ? 0 : Math.min(3, 1 + Math.floor(age / .08));
      drawHazardSprite(sequences.soga.activacion[i], x, GROUND, .13);
    } else {
      const swing = held ? Math.sin(age * 5) * 2 : 0;
      const lift = clamp((age - .24) / (mansionRopeLift - .24), 0, 1);
      const ankleY = GROUND - 57 - 24 * lift;
      if (held) {
        drawHazardSprite(pose, x + swing, ankleY, scale, "attachment", flip);
        paintedHero = true;
      }
      drawHazardSprite(sequences.soga.captura[held && Math.sin(age * 5) > 0 ? 1 : 0], x + swing, ankleY, .135, "attachment");
    }
  } else if (kind === "red") {
    const ceiling = GROUND - 139;
    if (ready || hazard.phase === "falling" && age < mansionNetWindup) {
      drawHazardSprite(sequences.red.activacion[ready ? 0 : 1], x, ceiling, .16);
    } else {
      const [file, index] = sequences.red.activacion[2];
      const image = mansionTrapImages[file], frame = MANSION_TRAP_ATLAS.frames[file][index];
      const [sx, sy] = frame.source, [ax, ay] = frame.anchor;
      if (image.naturalWidth) ctx.drawImage(image, sx + ax - 54, sy + ay, 108, 106, x - 9, ceiling, 18, 17);
      const drop = held || spent ? 1 : clamp((age - mansionNetWindup) / (mansionNetLanding - mansionNetWindup), 0, 1);
      if (held) {
        drawHazardSprite(pose, x, GROUND, scale, "anchor", flip);
        paintedHero = true;
      }
      drawHazardSprite(sequences.red.captura[drop < .94 ? 0 : 1], x, ceiling + 75 + 64 * drop * drop, .20);
    }
    if (hazard.phase === "falling") {
      rect(x - 27, GROUND - 2, 54, 2, "#f3b266");
      txt("¡APÁRTATE!", x, GROUND + 13, "#ffdc9a", 6, "center");
    }
  } else {
    const i = ready ? 0 : spent || age >= .24 ? 3 : age < .10 ? 1 : 2;
    if (held) {
      drawHazardSprite(pose, x, GROUND - 5, scale, "attachment", flip);
      paintedHero = true;
    }
    drawHazardSprite(sequences.cepo.activacion[i], x, GROUND, .105);
  }
  if (held && age >= (kind === "soga" ? mansionRopeLift : .23)) {
    const prompt = (hazard.lastSide === "left" ? "DERECHA →" : hazard.lastSide === "right" ? "← IZQUIERDA" : "ALTERNA ← →")
      + " · " + hazard.presses + "/" + mansionTrapEscapeSteps;
    const y = kind === "soga" ? GROUND - 143 : GROUND - 87;
    rect(x - 68, y - 11, 136, 16, "#161524");
    txt(prompt, x, y, "#ffe2a2", 7, "center");
  }
  return paintedHero;
}
