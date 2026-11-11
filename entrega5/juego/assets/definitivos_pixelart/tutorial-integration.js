/* Integración de las prácticas interactivas con el mando físico. */
(() => {
  if (window.__misteriosTutorialAssets) return;
  window.__misteriosTutorialAssets = true;

  const assetRoot = location.pathname.includes("/misterios_por_todas_partes_v3/")
    ? "../assets/definitivos_pixelart/"
    : "assets/definitivos_pixelart/";
  const asset = (group, file) => assetRoot + group + "/" + file;
  const mansionGhosts = [
    new Image(), new Image(), new Image()
  ];
  [
    "fantasma_dama_vitral_sprite.png",
    "fantasma_caballero_armadura_sprite.png",
    "fantasma_sombra_retrato_sprite.png"
  ].forEach((file, index) => { mansionGhosts[index].src = asset("fantasmas", file); });
  const practiceGhost = new Image();
  practiceGhost.src = asset("fantasmas", "fantasma_tutorial_16frames.png");
  const previousDrawGhost = drawGhost;
  let ghostDialogue;
  drawGhost = function (cam, now, ghost = game.ghost) {
    const screenX = ghost.x - cam;
    if (screenX < -64 || screenX > W + 64) return;

    let sprite, cellSize, height;
    if (game.tutorial) {
      sprite = practiceGhost;
      cellSize = practiceGhost.naturalWidth / 4;
      height = 54;
    } else {
      const distance = ghost.x - stages[0].end;
      const ghostRoom = ghost.sprite ?? (distance < 150 ? 2 : distance < 1100 ? 1 : distance < 2100 ? 0 : distance < 3100 ? 2 : 1);
      sprite = mansionGhosts[ghostRoom];
      cellSize = 315;
      // Mantiene la diferencia de escala entre la dama alta, el caballero y la sombra.
      height = [64, 59, 55][ghostRoom];
    }
    if (!sprite.complete || !sprite.naturalWidth) {
      previousDrawGhost(cam, now, ghost);
      return;
    }

    const state = ghost.st;
    const row = state === "guide" ? 0 : state === "stun" ? 3 : state === "chase" ? 2 : state === "suspect" ? 0 : 1;
    const frameMs = state === "guide" ? 520 : state === "chase" ? 105 : state === "stun" ? 145 : 190;
    const frame = Math.floor(now / frameMs) % 4;
    const size = height;
    const x = Math.round(screenX - size / 2);
    const floor = ghost.kind ? vestibuleGhostBottom(ghost) : GROUND;
    const y = Math.round(floor - height + 2 + Math.sin(now / 180) * 1.5);
    const sourceX = frame * cellSize;
    const sourceY = row * cellSize;

    ctx.globalAlpha = .18;
    ctx.fillStyle = game.tutorial ? "#7ff7ee" : "#8bded5";
    ctx.beginPath();
    ctx.ellipse(screenX, (ghost.floor ?? GROUND) - 1, Math.round(height * .36), 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = state === "stun" ? .82 : .98;
    ctx.save();
    if (ghost.kind ? ghost.dir < 0 : game.player.x < ghost.x) {
      ctx.translate(Math.round(screenX * 2), 0);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, sourceX, sourceY, cellSize, cellSize, x, y, size, height);
    } else {
      ctx.drawImage(sprite, sourceX, sourceY, cellSize, cellSize, x, y, size, height);
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    if (game.tutorial) return;
    if (state === "chase") txt("!", screenX, y - 5, "#ff6b58", 12, "center");
    else if (state === "suspect" || state === "warn") txt(state === "warn" ? "!" : "?", screenX, y - 5, "#ffe45d", 12, "center");
    else if (state === "lure") txt("♥", screenX, y - 5, "#ff8ac0", 10, "center");
  };
  const byId = id => document.getElementById(id);
  const baseUpdateTraining = updateTraining;
  const baseUpdateGame = update;
  const baseTutorialStep = tutorialStep;
  const baseAdvanceTutorial = advanceTutorial;
  const baseStartLevel = startLevel;
  const baseTogglePause = togglePause;
  const gameCanvasWrap = document.querySelector("#game .canvas-wrap");
  const gameShell = document.querySelector("#game .game-shell");
  if (!gameShell || !gameCanvasWrap) return;
  const sliderGauge = gameShell.querySelector(".slider-gauge");
  const sceneCanvas = byId("scene");
  const tutorialPad = byId("tutorial-pad");

  const stageFrame = document.createElement("div");
  stageFrame.className = "tutorial-stage";
  sceneCanvas.before(stageFrame);
  stageFrame.append(sceneCanvas);

  const tutorialSide = document.createElement("aside");
  tutorialSide.className = "tutorial-side";
  tutorialSide.setAttribute("aria-label", "Mando y práctica");
  const tutorialConsole = document.createElement("div");
  tutorialConsole.className = "tutorial-console";
  tutorialConsole.append(tutorialPad, sliderGauge);
  sliderGauge.append(tutorialPad.querySelector(".pad-slider"));
  tutorialSide.append(tutorialConsole);
  gameCanvasWrap.append(tutorialSide);

  function alignSliderGauge() {
    const bounds = gameCanvasWrap.getBoundingClientRect();
    const ratio = sceneCanvas.width / sceneCanvas.height;
    const renderedWidth = Math.min(bounds.width, bounds.height * ratio);
    sliderGauge.style.left = Math.max(0, (bounds.width - renderedWidth) / 2) + 10 + "px";
  }
  alignSliderGauge();
  window.addEventListener("resize", alignSliderGauge);

  const style = document.createElement("style");
  style.textContent = `
    .training-activity.hidden{display:none}.activity-heading{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#9cf2d8;font:9px var(--px);line-height:1.5}.activity-heading b{color:#ffe26a;text-align:right}
    .activity-stage{position:relative;width:100%;aspect-ratio:3/2;overflow:hidden;background:#111827;border:1px solid #536879;image-rendering:pixelated}
    .activity-stage.memory{aspect-ratio:2/1}.activity-stage img{image-rendering:pixelated;object-fit:fill;user-select:none;-webkit-user-drag:none}
    .activity-memory-label{position:absolute;left:0;right:0;bottom:3%;text-align:center;color:#fff0b2;font:7px var(--px);text-shadow:2px 2px #10121c;pointer-events:none}
    .activity-base,.activity-layer{position:absolute;inset:0;width:100%;height:100%}.activity-stage .memory-slider{position:absolute;inset:0;width:100%;height:100%;object-fit:fill}
    .radio-needle {
      position: absolute;
      top: 44%;
      height: 6%;
      width: clamp(2px, .5%, 4px);
      transform: translateX(-50%);
      background: #fff6d2;
      box-shadow: 0 0 5px #fff6d2;
    }
    .radio-needle.tuned { background: #9cf2d8; box-shadow: 0 0 6px #9cf2d8; }
    .activity-stage .brush-sprite{position:absolute;width:12%;height:24%;object-fit:contain;transform:translate(-50%,-50%);filter:drop-shadow(2px 2px #090914)}
    .powder-sprite{position:absolute;right:6%;top:5%;width:42px;height:42px;background-size:400% 100%;image-rendering:pixelated}
    .activity-progress{height:6px;margin-top:6px;border:1px solid #617382;background:#172230}.activity-progress i{display:block;width:0;height:100%;background:linear-gradient(90deg,#62d8c7,#ffe26a);transition:width .15s}
    .activity-status{min-height:14px;margin-top:5px;color:#fff0b2;font:9px var(--px);line-height:1.6}
    .clue-paper{position:absolute;inset:0;overflow:hidden}.clue-paper>img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;image-rendering:pixelated}
    .magnifier-lens{position:absolute;z-index:3;width:22%;aspect-ratio:1;border:0;border-radius:50%;transform:translate(-50%,-50%);overflow:hidden;background:#d8c29a;box-shadow:0 0 0 2px #0a0b12,0 0 0 5px #f5bd4b,0 0 18px #ffe26a99}
    .magnifier-lens .magnifier-view{position:absolute;z-index:1;max-width:none;width:100%;height:100%;object-fit:fill;image-rendering:pixelated;pointer-events:none}
    .magnifier-frame{position:absolute;z-index:2;inset:-13%;background-repeat:no-repeat;background-size:400% 100%;image-rendering:pixelated;pointer-events:none}
    .lock b{display:none!important}.lock-mark{position:relative;display:block;width:18px;height:14px;margin:0 auto 5px;background:#d6bd70;border:2px solid #e5d49f;box-shadow:2px 2px #080613}
    .lock-mark:before{content:"";position:absolute;width:8px;height:8px;left:3px;top:-10px;border:2px solid #d9cbe9;border-bottom:0;border-radius:7px 7px 0 0}.lock-mark:after{content:"";position:absolute;width:3px;height:5px;left:5px;top:3px;background:#75536d}
    #game.tutorial-active .tutorial-guide{display:none!important}
    .tutorial-stage, .tutorial-side, .tutorial-console { display: contents; }
    .slider-gauge .pad-slider { display: none; }
    /* Selector de niveles: paleta nocturna sobria y rótulos siempre legibles. */
    #levels{background:radial-gradient(ellipse at 14% 18%,#72838d20,transparent 42%),radial-gradient(ellipse at 86% 82%,#8b80651a,transparent 44%),repeating-linear-gradient(0deg,transparent 0 31px,#9aa8ad0a 32px),repeating-linear-gradient(90deg,transparent 0 31px,#9aa8ad0a 32px),linear-gradient(180deg,#18212a,#11171e)!important}
    #levels:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,#0d131944,transparent 24%,transparent 76%,#0d131944)}
    #levels .level-shell{position:relative;z-index:1}
    #levels .level-heading p{color:#cbd2ce}
    #levels .case{border-color:#637178;background:#202a32;color:#e6e0d2;box-shadow:0 4px #0b1116}
    #levels .case:before{filter:saturate(.62) brightness(.64);transform:none}
    #levels .case:after{background:linear-gradient(0deg,#11171fed 0%,#11171e9c 48%,#11171e20 100%)}
    #levels .case.open{border-color:#d6bd70;box-shadow:0 0 0 1px #d6bd7040,0 4px #564a31}
    #levels .case.open:before{filter:saturate(.76) brightness(.82)}
    #levels .case.open:after{background:linear-gradient(0deg,#11171edc 0%,#11171e5c 43%,#11171e00 78%)}
    #levels .case.locked:before{filter:blur(2px) grayscale(.78) saturate(.45) brightness(.58);transform:scale(1.04)}
    #levels .case.locked .case-inner{filter:none;opacity:.86}
    #levels .case.locked .case-id{color:#a9c1bb}
    #levels .case.locked .case-name{color:#dedbd0;text-shadow:1px 2px #11171e}
    #levels .case.locked .case-sub{color:#b7c1c0}
    #levels .case.sel{outline:3px solid #a9c9bf;outline-offset:2px;transform:translateY(-2px)}
    #levels .case.locked.sel .lock{background:#11171e66}
    #levels .lock{background:#11171e55;color:#ebdfbd;text-shadow:1px 2px #10151a}
    #levels .level-foot{background:#172129;border-color:#68767b;box-shadow:0 4px #0b1116}
    #levels .level-foot small{color:#c4cbc7}
    #levels .level-controls{color:#c1cbc8}
    #levels .level-actions .btn.dark{background:#242c32;color:#e6d9b6;border-color:#9c8b61;box-shadow:0 4px #0b1116}
    #levels .level-actions .btn:not(.dark){background:#e6cb72;border-color:#f2e7bd;box-shadow:0 4px #806944}
    .tutorial-pad .pad-key small{max-width:64px;text-align:center;white-space:normal;line-height:1.2}
    .tutorial-pad .pad-key{cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none}
    .tutorial-guide{padding-bottom:38px}
    .tutorial-skip{position:absolute;right:10px;bottom:8px;padding:5px 8px;background:#25183f;border:1px solid #ffe26a;color:#ffe26a;font:7px var(--px);cursor:pointer;box-shadow:2px 2px #050812}
    .tutorial-skip:hover{background:#ffe26a;color:#17102b}
    @media(max-height:620px){.tutorial-guide{padding-bottom:34px}.tutorial-skip{bottom:5px;padding:4px 6px;font-size:6px}}
    /* Tutorial: the stage and the console have separate space in the same row. */
    #game.tutorial-active .canvas-wrap {
      display: grid;
      grid-template-columns: minmax(0, 1fr) clamp(218px, 19vw, 290px);
      grid-template-rows: minmax(0, 1fr);
      background: #101522;
    }
    #game.tutorial-active .tutorial-stage {
      display: block;
      position: relative;
      container: tutorial-stage / size;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      background: #141020;
    }
    @container tutorial-stage (min-aspect-ratio: 16/9) {
      #game.tutorial-active #scene {
        object-fit: cover;
        object-position: center 70%;
      }
    }
    #game.tutorial-active .tutorial-side {
      display: grid;
      grid-template-rows: auto;
      align-content: center;
      gap: 10px;
      min-width: 0;
      min-height: 0;
      padding: clamp(8px, 1.1vw, 18px);
      overflow: auto;
      border-left: 2px solid #414361;
      background: repeating-linear-gradient(0deg, #ffffff04 0 1px, transparent 1px 16px),
                  linear-gradient(160deg, #25223a, #101522 72%);
    }
    #game.tutorial-active .tutorial-console {
      display: block;
      padding: 10px;
      border: 1px solid #576478;
      background: #101925;
    }
    #game.tutorial-active .tutorial-pad:not(.hidden) {
      position: static;
      width: auto;
      padding: 0;
      border: 0;
      box-shadow: none;
      background: transparent;
    }
    #game.tutorial-active .pad-title { font: 8px/1.5 var(--px); }
    #game.tutorial-active .pad-buttons {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-areas: ". jump ." "left . right" ". down red";
      margin: 8px 0 5px;
    }
    #game.tutorial-active .pad-key[data-input="jump"] { grid-area: jump; }
    #game.tutorial-active .pad-key[data-input="left"] { grid-area: left; }
    #game.tutorial-active .pad-key[data-input="right"] { grid-area: right; }
    #game.tutorial-active .pad-key[data-input="skill"] { grid-area: down; }
    #game.tutorial-active .pad-key[data-input="red"] { grid-area: red; }
    #game.tutorial-active .pad-key {
      min-height: 34px;
      padding: 3px;
    }
    #game.tutorial-active .pad-key small {
      font: 700 9px/1.1 ui-monospace, Consolas, monospace;
    }
    #game.tutorial-active #pad-source { margin: 4px 0 0; }
    #game.tutorial-active .tutorial-pad > small:last-child { display: none; }
    #game.tutorial-active .game-footer { display: none; }

    /* The visible track also serves as the pointer input for the existing range. */
    #game.tutorial-active .slider-gauge {
      position: static;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      grid-template-rows: auto 22px auto;
      width: auto;
      margin-top: 8px;
      padding: 8px 0 0 !important;
      border: 0;
      border-top: 1px solid #424f62;
      background: transparent !important;
      transform: none;
    }
    #game.tutorial-active .slider-gauge .pad-slider { display: contents; }
    #game.tutorial-active .pad-slider > span:nth-of-type(2),
    #game.tutorial-active #pace-fx { display: none; }
    #game.tutorial-active #pad-slider-mode {
      grid-area: 1 / 1 / 2 / 3;
      justify-self: start;
    }
    #game.tutorial-active .pad-slider > span:last-child {
      grid-area: 1 / 3;
      justify-self: end;
    }
    #game.tutorial-active .pad-slider i,
    #game.tutorial-active #pace {
      grid-area: 2 / 1 / 3 / 4;
      width: 100%;
      margin: 0;
    }
    #game.tutorial-active #pace {
      opacity: 0;
      z-index: 1;
      cursor: ew-resize;
    }
    #game.tutorial-active .slider-guided .pad-slider i::after { opacity: 1; }
    #game.tutorial-active .slider-gauge .dn { grid-area: 3 / 1; justify-self: start; }
    #game.tutorial-active .slider-gauge .up { grid-area: 3 / 3; justify-self: end; }
    #game.tutorial-active #pace-mode { grid-area: 3 / 2; }
    #game.tutorial-active .slider-gauge b,
    #game.tutorial-active #pace-mode { font-size: 7px; }

    #game.tutorial-active .training-activity {
      --activity-ratio: 1.5;
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 4;
      width: min(760px, calc(100cqw - 24px), max(0px, calc((100cqh - 96px) * var(--activity-ratio))));
      padding: clamp(8px, 1vw, 14px);
      transform: translate(-50%, -50%);
      background: #101a28;
      border: 2px solid #9cf2d8;
      box-shadow: 0 12px 32px #050812cc, 0 0 0 100vmax #09081580;
      pointer-events: none;
    }
    #game.tutorial-active .training-activity.memory-task {
      --activity-ratio: 2;
    }
    #game.tutorial-active #status-toast { top: 12px; }

    .tutorial-ghost-dialogue:not(.hidden) {
      position: relative;
      display: grid;
      grid-template-columns: 60px minmax(0, 1fr) auto;
      flex: none;
      align-items: center;
      gap: 14px;
      padding: 10px clamp(12px, 2vw, 30px);
      background: linear-gradient(180deg, #152633, #101925);
      border-top: 2px solid #68cfc1;
      color: #f4efdc;
    }
    .tutorial-ghost-dialogue.hidden { display: none; }
    #tutorial-lesson-intro {
      padding: clamp(12px, 3vw, 32px);
      background: #080712b3;
    }
    #tutorial-lesson-intro .tutorial-ghost-dialogue {
      grid-template-columns: 72px minmax(0, 1fr);
      width: min(780px, 100%);
      max-height: 100%;
      overflow: auto;
      padding: clamp(14px, 2vw, 24px);
      border: 2px solid #68cfc1;
      border-bottom: 4px solid #287f79;
      box-shadow: 0 8px 0 #050712;
    }
    #tutorial-lesson-intro .ghost-dialogue-portrait { width: 72px; height: 72px; }
    #tutorial-lesson-intro .ghost-dialogue-text {
      font-size: clamp(15px, 1.45vw, 21px);
      line-height: 1.55;
    }
    .ghost-lesson-title { display: none; }
    #tutorial-lesson-intro .ghost-lesson-title { display: block; margin: 8px 0 10px; }
    .tutorial-lesson-continue { grid-column: 2; justify-self: end; }
    .tutorial-dialogue-actions[hidden], .tutorial-lesson-continue[hidden] { display: none; }
    .ghost-dialogue-portrait {
      width: 60px;
      height: 60px;
      background: #16252f no-repeat center bottom / contain;
      border: 2px solid #d6bd70;
      image-rendering: pixelated;
    }
    .ghost-dialogue-copy { min-width: 0; }
    .ghost-dialogue-heading {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 5px 12px;
      margin-bottom: 5px;
      color: #8de9d6;
      font: 9px/1.5 var(--px);
    }
    .ghost-dialogue-step { color: #ffe26a; font-size: 8px; }
    .ghost-dialogue-text {
      margin: 0;
      color: #f4efdc;
      font: 500 clamp(13px, 1.08vw, 17px)/1.45 system-ui, sans-serif;
    }
    .ghost-dialogue-cues { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
    .ghost-dialogue-cues kbd {
      padding: 2px 5px;
      border: 1px solid #486d75;
      background: #1b303e;
      color: #b5eee2;
      font: 700 10px/1.3 ui-monospace, Consolas, monospace;
    }
    .ghost-dialogue-cues kbd[data-complete="true"] {
      border-color: #68cfc1;
      color: #bff5d6;
    }
    .tutorial-dialogue-skip {
      padding: 7px 8px;
      border: 1px solid #ab9253;
      background: #202435;
      color: #ffe68c;
      font: 7px/1.45 var(--px);
      cursor: pointer;
    }
    .tutorial-dialogue-skip:hover { background: #ffe26a; color: #17102b; }
    .tutorial-dialogue-actions {
      display: grid;
      justify-items: center;
      gap: 5px;
      color: #b5eee2;
      font-size: 10px;
    }
    #pause .tutorial-pause-skip[hidden] { display: none; }

    @media (max-height: 620px) {
      #game.tutorial-active .tutorial-side { gap: 5px; padding: 6px; }
      #game.tutorial-active .tutorial-console { padding: 6px; }
      #game.tutorial-active .pad-key { min-height: 26px; }
      #game.tutorial-active .pad-buttons { margin-block: 5px 3px; }
      .tutorial-ghost-dialogue:not(.hidden) { padding-block: 6px; }
    }
    @media (max-width: 720px) and (orientation: portrait) {
      #game.tutorial-active .canvas-wrap {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: minmax(0, 1fr) minmax(0, auto);
      }
      #game.tutorial-active .tutorial-side {
        max-height: 40dvh;
        border-top: 1px solid #414361;
        border-left: 0;
      }
      .tutorial-ghost-dialogue:not(.hidden) {
        grid-template-columns: 40px minmax(0, 1fr);
        gap: 6px 8px;
        padding: 7px;
      }
      .ghost-dialogue-portrait { width: 40px; height: 40px; }
      .ghost-dialogue-heading, .ghost-dialogue-step { font-size: 7px; }
      .tutorial-dialogue-actions { grid-column: 2; justify-self: start; justify-items: start; }
      #tutorial-lesson-intro .tutorial-ghost-dialogue { grid-template-columns: 42px minmax(0, 1fr); }
      #tutorial-lesson-intro .ghost-dialogue-portrait { width: 42px; height: 42px; }
    }
  `;
  document.head.appendChild(style);

  ghostDialogue = document.createElement("section");
  ghostDialogue.id = "tutorial-ghost-dialogue";
  ghostDialogue.className = "tutorial-ghost-dialogue hidden";
  ghostDialogue.setAttribute("aria-live", "polite");
  ghostDialogue.innerHTML = '<div class="ghost-dialogue-portrait" aria-hidden="true"></div><div class="ghost-dialogue-copy"><div class="ghost-dialogue-heading"><span class="ghost-dialogue-name">FANTASMA AMIGO · TU GUÍA</span><span class="ghost-dialogue-step"></span></div><h2 id="ghost-lesson-title" class="ghost-lesson-title"></h2><p class="ghost-dialogue-text"></p><div class="ghost-dialogue-cues" aria-hidden="true"></div></div>';
  ghostDialogue.querySelector(".ghost-dialogue-portrait").style.backgroundImage = 'url("' + asset('retratos_dialogo', 'fantasma_guia.png') + '")';
  const gameFooter = gameShell.querySelector(".game-footer");
  gameShell.insertBefore(ghostDialogue, gameFooter);

  const lessonIntro = document.createElement("div");
  lessonIntro.id = "tutorial-lesson-intro";
  lessonIntro.className = "overlay hidden";
  lessonIntro.setAttribute("role", "dialog");
  lessonIntro.setAttribute("aria-modal", "true");
  lessonIntro.setAttribute("aria-labelledby", "ghost-lesson-title");
  gameCanvasWrap.append(lessonIntro);

  const lessonContinue = document.createElement("button");
  lessonContinue.type = "button";
  lessonContinue.className = "btn tutorial-lesson-continue";
  lessonContinue.textContent = "ROJO · CONTINUAR";
  lessonContinue.hidden = true;
  lessonContinue.addEventListener("click", () => {
    if (currentScreen !== "game" || !game.tutorial?.reading) return;
    game.tutorial.reading = false;
    syncTutorialInputEdges();
    acc = 0;
    placeLessonDialogue(false);
    paintActivity();
  });
  const dialogueActions = document.createElement("div");
  dialogueActions.className = "tutorial-dialogue-actions";
  const dialogueSkip = document.createElement("button");
  dialogueSkip.type = "button";
  dialogueSkip.className = "tutorial-dialogue-skip";
  dialogueSkip.textContent = "SALTAR LECCIÓN →";
  dialogueSkip.setAttribute("aria-label", "Saltar esta lección del entrenamiento");
  dialogueSkip.addEventListener("click", skipTutorialLesson);
  const skipHint = document.createElement("small");
  skipHint.textContent = "Mando · Rojo → Abajo → Rojo";
  dialogueActions.append(dialogueSkip, skipHint);
  ghostDialogue.append(dialogueActions, lessonContinue);

  function placeLessonDialogue(centered) {
    lessonIntro.classList.toggle("hidden", !centered);
    dialogueActions.hidden = centered;
    lessonContinue.hidden = !centered;
    if (centered) lessonIntro.append(ghostDialogue);
    else gameShell.insertBefore(ghostDialogue, gameFooter);
    paintMenu();
  }

  const pauseSkip = document.createElement("button");
  pauseSkip.type = "button";
  pauseSkip.className = "btn dark tutorial-pause-skip";
  pauseSkip.textContent = "SALTAR LECCIÓN";
  pauseSkip.hidden = true;
  pauseSkip.addEventListener("click", skipTutorialLesson);
  byId("pause").querySelector(".buttons").firstElementChild.after(pauseSkip);

  function syncTutorialInputEdges() {
    pL = keys.left || ser.left;
    pR = keys.right || ser.right;
    pJ = keys.jump || ser.jump;
    pS = keys.skill || ser.skill;
  }

  function skipTutorialLesson() {
    if (currentScreen !== "game" || !game.tutorial || !game.running || game.tutorial.reading) return;
    if (game.paused) {
      syncTutorialInputEdges();
      baseTogglePause();
    }
    advanceTutorial();
  }
  const ghostLessons = [
    "¡Hola, detective! Soy tu fantasma guía y te acompañaré en cada práctica. Pulsa IZQUIERDA y DERECHA por separado; verás al personaje moverse y el panel del mando confirmará cada pulsación.",
    "El deslizador se mueve de lado a lado. Prueba sus tres zonas: IZQUIERDA = sigilo, CENTRO = caminar y DERECHA = correr. Mantén cada posición un instante; correr te acelera, pero también hace más ruido.",
    "Avanza con el botón DERECHO hasta la marca amarilla. Pulsa ARRIBA una vez para saltar y deja que el personaje aterrice en la repisa. Si te caes, inténtalo otra vez: en esta práctica no pierdes vidas.",
    [
      "Pulsa ABAJO y Scooby olfateará la zona: sus rastros te ayudan a localizar pistas y galletas escondidas.",
      "Pulsa ABAJO para que Shaggy lance una galleta. El señuelo distrae al fantasma y crea una oportunidad para avanzar.",
      "Pulsa ABAJO para que Vilma examine la escena con su lupa. La pista tenue brillará por unos segundos: obsérvala antes de que se desvanezca.",
      "Pulsa ABAJO cuando el fantasma esté cerca. Daphne dará una patada y lo aturdirá un momento para que puedas escapar.",
      "Pulsa ABAJO para que Fred coloque una trampa. El fantasma debe pasar junto a ella para quedar atrapado; úsala cuando se acerque."
    ],
    "Pulsa ABAJO para encender la radio. Desliza de IZQUIERDA a DERECHA hasta que el indicador entre en la franja amarilla y mantenlo quieto. Mira cómo la señal crece; si sale de la franja, vuelve a sintonizar.",
    "Primero observa la secuencia completa y fíjate en cada señal. Luego repítela exactamente en el mismo orden con las cuatro direcciones y las posiciones IZQUIERDA/DERECHA del deslizador. Si te equivocas, la secuencia se reinicia y puedes volver a mirar.",
    "Desplaza la brocha por la tarjeta usando los cuatro botones de dirección. Mueve también el deslizador de IZQUIERDA a DERECHA para esparcir el polvo: la huella aparecerá poco a poco. Cubre las zonas hasta completar la revelación.",
    "Pulsa cada dirección para colocar un anclaje en la trampa; verás cómo se completa el dibujo. Cuando los cuatro estén puestos, lleva el deslizador al CENTRO y mantenlo ahí para tensar la red.",
    "Busca el detalle marcado en el documento. Mueve la lupa con los cuatro botones; desliza a la IZQUIERDA para alejar el zoom y a la DERECHA para acercarlo. Cuando la pista quede dentro del lente, mantén el zoom hasta enfocarla.",
    "Practica cómo escapar. Avanza en sigilo con el deslizador a la IZQUIERDA y luego corre con él a la DERECHA. Pulsa ARRIBA para saltar el hueco y ABAJO para usar tu habilidad. Si caes sobre mi cabeza, me aturdes. Cuando estén marcadas las cuatro acciones, cruza la puerta.",
    "Camina sobre el lazo para practicar. Cuando te atrape, alterna los botones IZQUIERDA y DERECHA. Por ejemplo, ← → ←. Con tres pulsaciones te puedes soltar de la soga, la red o el cepo.",
    "¡Lo conseguiste! Pulsa el botón ROJO para pausar y abrir los ajustes, y púlsalo otra vez para continuar."
  ];
  const ghostCues = [
    ["◀ BOTÓN IZQUIERDO", "BOTÓN DERECHO ▶"],
    ["← SIGILO", "CENTRO · CAMINAR", "CORRER →"],
    ["BOTÓN DERECHO ▶", "↑ BOTÓN ARRIBA · SALTAR"],
    ["↓ BOTÓN ABAJO · HABILIDAD"],
    ["↓ BOTÓN ABAJO · RADIO", "DESLIZADOR ← · → SINTONÍA"],
    ["4 BOTONES DE DIRECCIÓN", "DESLIZADOR · IZQUIERDA / DERECHA"],
    ["BROCHA · ← → ↑ ↓", "POLVO · DESLIZADOR ← ↔ →"],
    ["ANCLAJES · ← → ↑ ↓", "TENSIÓN · DESLIZADOR AL CENTRO"],
    ["MOVER LUPA · ← → ↑ ↓", "ZOOM · ← ALEJA · → ACERCA"],
    [],
    ["DERECHA · ACÉRCATE AL LAZO", "← → ← · TRES PULSACIONES ALTERNADAS"],
    ["BOTÓN ROJO · PAUSAR / CONTINUAR"]
  ];
  const chaseObjectives = [
    ["chaseLow", "SIGILO"],
    ["chaseHigh", "CARRERA"],
    ["chaseJump", "SALTO DEL HUECO"],
    ["chaseSkill", "HABILIDAD"]
  ];
  function updateGhostDialogue() {
    if (!ghostDialogue) return;
    const finishPanel = byId("tutorial-finish");
    const visible = !!game.tutorial && game.tutorial.step >= 0 && game.tutorial.step < tutorialSteps.length && (!finishPanel || finishPanel.classList.contains("hidden"));
    ghostDialogue.classList.toggle("hidden", !visible);
    if (!visible) return;
    const step = game.tutorial.step;
    const chaseProgress = step === 9 ? chaseObjectives.map(([key]) => Number(!!game.tutorial[key])).join("") : "";
    const messageKey = step + ":" + character + ":" + chaseProgress;
    if (ghostDialogue.dataset.message === messageKey) return;
    ghostDialogue.dataset.message = messageKey;
    ghostDialogue.querySelector(".ghost-dialogue-name").textContent = "FANTASMA AMIGO · TU GUÍA";
    ghostDialogue.querySelector(".ghost-dialogue-step").textContent = "LECCIÓN " + String(step + 1).padStart(2, "0") + " / " + String(tutorialSteps.length).padStart(2, "0");
    byId("ghost-lesson-title").textContent = tutorialSteps[step].title;
    const text = Array.isArray(ghostLessons[step]) ? ghostLessons[step][character] : ghostLessons[step];
    ghostDialogue.querySelector(".ghost-dialogue-text").textContent = text;
    const cues = ghostDialogue.querySelector(".ghost-dialogue-cues");
    cues.setAttribute("aria-hidden", String(step !== 9));
    cues.innerHTML = step === 9
      ? chaseObjectives.map(([key, label]) => {
        const complete = !!game.tutorial[key];
        return '<kbd data-complete="' + complete + '">' + (complete ? "✓ " : "○ ") + label + "</kbd>";
      }).join("")
      : (ghostCues[step] || []).map(label => "<kbd>" + label + "</kbd>").join("");
  }
  window.addEventListener("keydown", event => {
    if (currentScreen === "game" && game.tutorial && event.code === "KeyN") {
      event.preventDefault();
      if (!event.repeat) skipTutorialLesson();
    }
  }, true);

  const activity = document.createElement("aside");
  activity.id = "training-activity";
  activity.className = "training-activity hidden";
  activity.setAttribute("aria-live", "polite");
  activity.innerHTML = '<div class="activity-heading"><span id="activity-kicker">PRÁCTICA</span><b id="activity-title"></b></div><div id="activity-stage" class="activity-stage"></div><div class="activity-progress"><i id="activity-fill"></i></div><div id="activity-status" class="activity-status"></div>';
  stageFrame.append(activity);
  document.querySelectorAll("#tutorial-pad .pad-key[data-input]").forEach(button => {
    const input = button.dataset.input;
    button.setAttribute("role", "button");
    button.tabIndex = 0;
      button.setAttribute("aria-label", input === "skill" ? "Botón abajo" : input === "left" ? "Botón izquierdo" : input === "right" ? "Botón derecho" : input === "jump" ? "Botón arriba" : "Botón rojo");
    const press = event => {
      event.preventDefault();
      if (event.pointerId != null) button.setPointerCapture?.(event.pointerId);
      if (input === "red") { activateRedEdge(); button.classList.add("on"); return; }
      keys[input] = true;
      button.classList.add("on");
      paintTutorialPad();
    };
    const release = () => {
      if (input !== "red") keys[input] = false;
      button.classList.remove("on");
      paintTutorialPad();
    };
    button.addEventListener("pointerdown", press);
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => button.addEventListener(type, release));
    button.addEventListener("keydown", event => {
      if ((event.code === "Space" || event.code === "Enter") && !event.repeat) press(event);
    });
    button.addEventListener("keyup", event => {
      if (event.code === "Space" || event.code === "Enter") release();
    });
  });

  drawCases = function () {
    const host = byId("level-grid");
    host.innerHTML = cases.map((c, i) => '<button ' + (i === 0 ? '' : 'disabled') + ' class="case ' + (i === 0 ? 'open' : 'locked') + '" style="--bg:' + c.bg + '"><div class="case-inner"><span class="case-id">CASO 0' + (i + 1) + '</span><div><span class="case-name">' + c.name + '</span><small class="case-sub">' + c.sub + '</small></div></div>' + (i === 0 ? '' : '<span class="lock"><i class="lock-mark" aria-hidden="true"></i>PRÓXIMAMENTE</span>') + '</button>').join("");
    host.querySelector(".case.open").onclick = () => { selCase = 0; paintCases(); };
  };
  drawCases();

  tutorialSteps.splice(6, 0,
    { title: "REVELA LA HUELLA", copy: "Mueve la brocha con los cuatro botones. Alterna el deslizador entre izquierda y derecha: cada pasada de polvo revela un poco más la huella." },
    { title: "ARMA LA TRAMPA DE FRED", copy: "Activa los cuatro anclajes con cada botón. Después mueve el deslizador a la zona amarilla y mantenlo para tensar la red." },
    { title: "BUSCA CON LA LUPA", copy: "Desplaza la lupa por el documento con los botones y usa el deslizador para acercar. Encuentra el detalle resaltado y mantén el zoom." }
  );
  memoryPattern.splice(0, memoryPattern.length, "left", "low", "right", "jump", "high", "skill");

  const clueDocs = [
    { file: "clue_mansion_map.png", title: "PLANO · MARCA EN EL PASILLO", x: .60, y: .52 },
    { file: "clue_cipher_note.png", title: "CIFRADO · CASA DEL CERRO", x: .70, y: .31 },
    { file: "clue_footprints.png", title: "RASTROS · HUELLA GRANDE", x: .55, y: .50 },
    { file: "clue_costume_fibers.png", title: "TELAS · FIBRA VIOLETA", x: .55, y: .29 }
  ];
  const kindForStep = { 4: "radio", 5: "memory", 6: "fingerprint", 7: "trap", 8: "magnifier" };
  const headingFor = { radio: "SINTONÍA EN VIVO", memory: "SECUENCIA DEL ECO", fingerprint: "POLVO DE DETECCIÓN", trap: "RED DE FRED", magnifier: "ARCHIVO DE PISTAS" };
  const activityKinds = Object.keys(headingFor);

  function imageTag(id, className) { return '<img id="' + id + '" class="' + className + '" alt="" draggable="false">'; }
  function buildActivity(kind) {
    const stage = byId("activity-stage");
    stage.className = "activity-stage " + (kind === "memory" ? "memory" : kind);
    if (kind === "radio") {
      stage.innerHTML = imageTag("act-base", "activity-base") + imageTag("act-frame", "activity-layer")
        + '<span id="act-radio-needle" class="radio-needle" aria-hidden="true" hidden></span>';
    }
    if (kind === "memory") stage.innerHTML = imageTag("act-base", "activity-base") + imageTag("act-button", "activity-layer") + imageTag("act-slider", "memory-slider") + '<span id="act-memory-label" class="activity-memory-label"></span>';
    if (kind === "fingerprint") stage.innerHTML = imageTag("act-base", "activity-base") + imageTag("act-frame", "activity-layer") + '<div id="act-powder" class="powder-sprite"></div>' + imageTag("act-brush", "brush-sprite");
    if (kind === "trap") stage.innerHTML = imageTag("act-base", "activity-base") + imageTag("act-deploy", "activity-layer") + imageTag("act-tension", "activity-layer");
    if (kind === "magnifier") stage.innerHTML = '<div class="clue-paper"><img id="act-paper" alt=""><div id="act-lens" class="magnifier-lens"><img id="act-lens-image" class="magnifier-view" alt=""><div id="act-mag-frame" class="magnifier-frame"></div></div></div>';
    stage.dataset.kind = kind;
  }
  function setAssetImage(id, group, file) {
    const img = byId(id);
    if (!img) return;
    const src = asset(group, file);
    if (img.dataset.asset !== src) { img.src = src; img.dataset.asset = src; }
  }
  function setProgress(value) { byId("activity-fill").style.width = (clamp(value, 0, 1) * 100) + "%"; }
  function setStatus(text) { byId("activity-status").textContent = text; }
  function setActivityVisible(show) { activity.classList.toggle("hidden", !show); }
  function zoneFor(value) { return value < 25 ? "low" : value > 75 ? "high" : "mid"; }
  const memoryFrameDuration = 1.2;
  function currentMemoryFocus(lesson) {
    if (lesson.phase !== "show") return lesson.patternIndex;
    const elapsed = game.t - (lesson.memoryStart || 0);
    return clamp(Math.floor(elapsed / memoryFrameDuration), 0, memoryPattern.length - 1);
  }
  function paintActivity() {
    if (!game.tutorial || game.tutorial.reading || !kindForStep[game.tutorial.step]) {
      setActivityVisible(false);
      return;
    }
    const lesson = game.tutorial, step = lesson.step, kind = kindForStep[step];
    if (byId("activity-stage").dataset.kind !== kind) buildActivity(kind);
    activity.classList.toggle("memory-task", kind === "memory");
    setActivityVisible(true);
    byId("activity-kicker").textContent = byId("tut-step").textContent;
    byId("activity-title").textContent = kind === "radio" && !game.radio ? "RADIO APAGADA" : headingFor[kind];
    const frame4 = n => String(clamp(n, 1, 4)).padStart(2, "0");
    if (kind === "radio") {
      setAssetImage("act-base", "radio", "radio_panel_base.png");
      const needle = byId("act-radio-needle");
      const wave = byId("act-frame");
      needle.hidden = wave.hidden = !game.radio;
      if (!game.radio) {
        setProgress(0);
        setStatus("PULSA ABAJO PARA ENCENDER LA RADIO");
        return;
      }
      const value = paceVal();
      const frequency = radioFrequency(value);
      const signal = clamp(game.radioStable / radioTuning.holdSeconds, 0, 1);
      const offset = value - radioTuning.target;
      const tuned = Math.abs(offset) <= radioTuning.tolerance;
      const hint = tuned ? "MANTÉN AHÍ" : offset < 0 ? "MUEVE A LA DERECHA →" : "← MUEVE A LA IZQUIERDA";
      // The radio artwork places 88 MHz at 30.4% and 108 MHz at 77.1%.
      needle.style.left = (30.4 + (frequency - 88) * 46.7 / 20) + "%";
      needle.classList.toggle("tuned", tuned);
      setAssetImage("act-frame", "radio", "radio_signal_frame_" + String(Math.max(1, Math.ceil(signal * 8))).padStart(2, "0") + ".svg");
      setProgress(signal);
      setStatus(frequency.toFixed(1) + " MHz · SEÑAL " + Math.round(signal * 100) + "% · " + hint);
    } else if (kind === "memory") {
      setAssetImage("act-base", "memoria", "memory_controls_base.png");
      const focus = currentMemoryFocus(lesson), event = memoryPattern[focus];
      const buttonName = { left: "left", right: "right", jump: "top", skill: "bottom" }[event];
      if (buttonName) setAssetImage("act-button", "memoria", "memory_button_" + buttonName + "_frame_" + frame4(1 + Math.floor(game.t * 7) % 4) + ".svg");
      else byId("act-button").removeAttribute("src");
      const v = lesson.phase === "show" && event === "low" ? 0 : lesson.phase === "show" && event === "high" ? 100 : paceVal();
      const sliderFrame = 13 - Math.round(v / 100 * 12);
      setAssetImage("act-slider", "memoria", "memory_slider_frame_" + String(sliderFrame).padStart(2, "0") + ".svg");
      const names = { left: "BOTÓN IZQUIERDO", right: "BOTÓN DERECHO", jump: "BOTÓN ARRIBA", skill: "BOTÓN ABAJO", low: "DESLIZADOR · IZQUIERDA", high: "DESLIZADOR · DERECHA" };
      byId("act-memory-label").textContent = lesson.phase === "show" ? "OBSERVA " + (focus + 1) + "/" + memoryPattern.length + " · " + names[event] : "REPITE " + (lesson.patternIndex + 1) + "/" + memoryPattern.length;
      setProgress(lesson.phase === "show" ? (focus + 1) / memoryPattern.length : lesson.patternIndex / memoryPattern.length);
      setStatus(lesson.phase === "show" ? "MEMORIZA LOS CUATRO BOTONES Y LAS DOS ZONAS DEL SLIDER" : "PULSA O MUEVE SOLO LA ENTRADA QUE SIGUE");
    } else if (kind === "fingerprint") {
      setAssetImage("act-base", "huella", "fingerprint_card_base.png");
      setAssetImage("act-frame", "huella", "fingerprint_reveal_frame_" + String(clamp(lesson.revealStage + 1, 1, 6)).padStart(2, "0") + ".svg");
      setAssetImage("act-brush", "huella", "fingerprint_brush_frame_" + frame4(1 + Math.floor(game.t * 9) % 4) + ".png");
      const brush = byId("act-brush");
      brush.style.left = lesson.brushX + "%"; brush.style.top = lesson.brushY + "%";
      brush.style.transform = "translate(-50%,-50%) rotate(" + (lesson.brushAngle || 0) + "deg)";
      const powder = byId("act-powder");
      powder.style.backgroundImage = "url('" + asset("huella", "fingerprint_powder_4frames.svg") + "')";
      powder.style.backgroundPosition = (Math.floor(game.t * 9) % 4 * 100 / 3) + "% 0";
      setProgress((lesson.revealStage || 0) / 6);
      setStatus("HUELLA " + (lesson.revealStage || 0) + "/6 · DIRECCIONES DE BROCHA " + ((lesson.brushDirections && lesson.brushDirections.size) || 0) + "/4");
    } else if (kind === "trap") {
      setAssetImage("act-base", "trampa", "trap_setup_base.png");
      const anchors = lesson.anchors ? lesson.anchors.size : 0;
      setAssetImage("act-deploy", "trampa", "trap_deploy_frame_" + String(Math.min(4, anchors + 1)).padStart(2, "0") + ".svg");
      setAssetImage("act-tension", "trampa", "trap_tension_frame_" + String(1 + Math.round(paceVal() / 100 * 8)).padStart(2, "0") + ".svg");
      setProgress(anchors / 4 * .72 + clamp((lesson.tensionHold || 0) / .85, 0, 1) * .28);
      setStatus("ANCLAJES " + anchors + "/4 · " + (anchors === 4 ? "TENSIÓN " + Math.round(paceVal()) + "% · MANTÉN EN 45–60%" : "ASIGNA UNO A CADA BOTÓN"));
    } else if (kind === "magnifier") {
      const doc = clueDocs[lesson.docIndex || 0], lens = byId("act-lens"), zoom = 1 + paceVal() * .02;
      setAssetImage("act-paper", "lupa_pistas", doc.file);
      setAssetImage("act-lens-image", "lupa_pistas", doc.file);
      lens.style.left = (lesson.lensX * 100) + "%"; lens.style.top = (lesson.lensY * 100) + "%";
      const lensRect = lens.getBoundingClientRect(), stageRect = byId("activity-stage").getBoundingClientRect();
      const imageWidth = zoom * stageRect.width / Math.max(1, lensRect.width) * 100;
      const imageHeight = zoom * stageRect.height / Math.max(1, lensRect.height) * 100;
      const lensImage = byId("act-lens-image");
      lensImage.style.width = imageWidth + "%"; lensImage.style.height = imageHeight + "%";
      lensImage.style.left = (50 - lesson.lensX * imageWidth) + "%";
      lensImage.style.top = (50 - lesson.lensY * imageHeight) + "%";
      const mag = byId("act-mag-frame"), frame = Math.floor(game.t * 8) % 4;
      mag.style.backgroundImage = "url('" + asset("lupa_pistas", "magnifier_4frames.svg") + "')";
      mag.style.backgroundPosition = (frame / 3 * 100) + "% 0";
      const distance = Math.hypot(lesson.lensX - doc.x, lesson.lensY - doc.y);
      const found = distance < .105 && zoom >= 2.25;
      setProgress(found ? clamp((lesson.zoomHold || 0) / .8, 0, 1) : clamp(1 - distance / .7, 0, .65));
      setStatus(found ? "DETALLE ENFOCADO · MANTÉN EL ZOOM" : doc.title + " · ZOOM " + zoom.toFixed(1) + "×");
    }
  }

  const baseUpdateUI = updateTutorialUI;
  updateTutorialUI = function () {
    if (!game.tutorial) return;
    const lesson = game.tutorial, step = lesson.step;
    byId("tut-step").textContent = "ENTRENAMIENTO · " + String(step + 1).padStart(2, "0") + " / " + String(tutorialSteps.length).padStart(2, "0");
    byId("tut-title").textContent = tutorialSteps[step].title;
    const hint = lastSerialAt === -Infinity ? " Teclado: flechas, Espacio, F, Re Pág/Av Pág; Enter pausa." : "";
    const skillCopy = step === 3
      ? (lesson.skillSeenAt != null ? "¡Bien! Activaste " + chars[character].skill + ". Observa su efecto en la escena." : skillLessonCopy[character])
      : step === 9 ? "Lee el diálogo del fantasma y practica cómo esquivarlo."
      : tutorialSteps[step].copy;
    byId("tut-copy").textContent = skillCopy + hint;
    byId("tut-progress-bar").style.width = ((step + 1) / tutorialSteps.length * 100) + "%";
    const check = value => value ? "✓" : "○";
    const prompts = [
      "IZQUIERDA " + check(lesson.left) + " · DERECHA " + check(lesson.right),
      ["1 · IZQUIERDA · SIGILO", "2 · CENTRO · CAMINAR", "3 · DERECHA · CORRER"][lesson.sliderStage],
      "BOTÓN DERECHO + BOTÓN ARRIBA · SALTA Y ATERRIZA EN LA REPISA",
      lesson.skillSeenAt != null ? "OBSERVA EL EFECTO EN LA ESCENA" : "BOTÓN ABAJO · HABILIDAD",
      game.radio ? "DESLIZADOR · BUSCA LA ZONA DE SEÑAL Y MANTÉN" : "BOTÓN ABAJO · ABRIR RADIO",
      lesson.phase === "show" ? "OBSERVA LA SECUENCIA COMPLETA" : "REPITE EL ECO · " + lesson.patternIndex + " / " + memoryPattern.length,
      "BROCHA · IZQUIERDA / DERECHA / ARRIBA / ABAJO · DESLIZADOR · ← ↔ → POLVO",
      "BOTÓN IZQUIERDO · BOTÓN DERECHO · BOTÓN ARRIBA · BOTÓN ABAJO",
      "PANEA EL PAPEL · ACERCA CON EL SLIDER · ENCUENTRA LA MARCA",
      "SIGILO " + check(lesson.chaseLow) + " · CARRERA " + check(lesson.chaseHigh) + " · SALTO " + check(lesson.chaseJump) + " · HABILIDAD " + check(lesson.chaseSkill),
      "CAMINA AL LAZO · ALTERNA IZQUIERDA Y DERECHA",
      "BOTÓN ROJO · PAUSAR → BOTÓN ROJO · CONTINUAR"
    ];
    byId("tut-prompt").textContent = prompts[step] || "CONTINÚA";
    updateGhostDialogue();
    paintActivity();
  };

  tutorialStep = function (step) {
    const lesson = game.tutorial;
    lesson.step = step;
    game.hazard = null;
    lesson.reading = true;
    placeLessonDialogue(true);
    if (step <= 5) {
      baseTutorialStep(step);
      paintActivity();
      return;
    }
    lesson.phase = "play";
    lesson.activityLast = 0;
    game.radio = false;
    game.cd = 0;
    if (step >= 6 && step <= 8) {
      moveToTrainingMark(183);
      game.decoy = game.trap = null;
      Object.assign(game.ghost, { x: 410, stun: 0, alert: 0, st: "patrol" });
      if (step === 6) Object.assign(lesson, { revealStage: 0, brushX: 50, brushY: 55, brushAngle: 0, brushDirections: new Set(), powderEnd: null });
      if (step === 7) Object.assign(lesson, { anchors: new Set(), tensionHold: 0 });
      if (step === 8) {
        const docIndex = character % clueDocs.length;
        Object.assign(lesson, { docIndex, lensX: .4, lensY: .55, zoomHold: 0, panMoves: 0 });
      }
    } else if (step === 9) {
      moveToTrainingMark(190);
      lesson.chaseGrace = game.t + 2.5;
      game.trap = game.decoy = null;
      Object.assign(lesson, { chaseLow: false, chaseHigh: false, chaseJump: false, chaseSkill: false });
      Object.assign(game.ghost, { x: 96, stun: 0, alert: 4, tx: 190, st: "chase" });
    } else if (step === 10) {
      moveToTrainingMark(148);
      game.player.invuln = 0;
      game.hazard = lesson.practiceHazard = createMansionHazard({ start: 0, hazard: { kind: "soga", offset: 254 } });
      Object.assign(game.ghost, { x: 390, stun: 0, alert: 0, st: "guide" });
    } else if (step === 11) {
      moveToTrainingMark(trainingExit - 68);
      lesson.pauseSeen = false;
      Object.assign(game.ghost, { x: 90, stun: 0, alert: 0, tx: 90, st: "patrol", patrol: 1 });
    }
    updateTutorialUI();
  };

  update = function (dt) {
    baseUpdateGame(dt);
    const lesson = game.tutorial;
    if (!lesson || lesson.step === 9) return;
    const ghost = game.ghost, player = game.player, step = lesson.step;
    const homeX = step === 3 ? 218 : step === 11 ? player.x - 112 : 390;
    ghost.x = clamp(homeX, 28, trainingFloor.w - 28);
    ghost.tx = ghost.x;
    ghost.alert = 0;
    ghost.patrol = 1;
    if (step === 3 && ghost.stun > 0) ghost.st = "stun";
    else if (step === 3 && game.decoy) ghost.st = "lure";
    else ghost.st = "guide";
    if (step !== 3) ghost.stun = 0;
  };

  showMemoryPattern = function () {
    const lesson = game.tutorial;
    lesson.phase = "show";
    lesson.patternIndex = 0;
    lesson.memoryStart = game.t;
    lesson.memoryUntil = game.t + memoryPattern.length * memoryFrameDuration;
    updateTutorialUI();
  };
  processTutorialMemory = function (input) {
    const lesson = game.tutorial;
    if (lesson.phase === "show") {
      if (game.t >= lesson.memoryUntil) { lesson.phase = "replay"; lesson.lastZone = zoneFor(paceVal()); updateTutorialUI(); }
      return;
    }
    const events = [];
    if (input.leftP) events.push("left");
    if (input.rightP) events.push("right");
    if (input.jumpP) events.push("jump");
    if (input.skillP) events.push("skill");
    const zone = zoneFor(paceVal());
    if (zone !== lesson.lastZone && zone !== "mid") events.push(zone);
    lesson.lastZone = zone;
    for (const event of events) {
      if (event !== memoryPattern[lesson.patternIndex]) { showToast("SECUENCIA INCORRECTA · OBSERVA DE NUEVO"); showMemoryPattern(); return; }
      lesson.patternIndex++;
      if (lesson.patternIndex >= memoryPattern.length) { showToast("¡ECO DEL FANTASMA RESUELTO!"); advanceTutorial(); return; }
      beep(540 + lesson.patternIndex * 90, .08, "triangle");
    }
    if (events.length) updateTutorialUI();
  };

  updateTraining = function (input, direction, dt, landed, launched) {
    const lesson = game.tutorial, step = lesson.step, value = paceVal();
    if (step <= 5) return baseUpdateTraining(input, direction, dt, landed, launched);
    if (step === 6) {
      if (input.leftP) { lesson.brushX = clamp(lesson.brushX - 8, 18, 82); lesson.brushAngle = 180; lesson.brushDirections.add("left"); }
      if (input.rightP) { lesson.brushX = clamp(lesson.brushX + 8, 18, 82); lesson.brushAngle = 0; lesson.brushDirections.add("right"); }
      if (input.jumpP) { lesson.brushY = clamp(lesson.brushY - 8, 22, 78); lesson.brushAngle = -90; lesson.brushDirections.add("up"); }
      if (input.skillP) { lesson.brushY = clamp(lesson.brushY + 8, 22, 78); lesson.brushAngle = 90; lesson.brushDirections.add("down"); }
      const zone = zoneFor(value);
      if (zone !== "mid" && zone !== lesson.powderEnd) {
        lesson.powderEnd = zone;
        lesson.revealStage = Math.min(6, lesson.revealStage + 1);
        beep(400 + lesson.revealStage * 80, .06, "triangle");
      }
      updateTutorialUI();
      if (lesson.revealStage >= 6 && lesson.brushDirections.size === 4) { showToast("¡HUELLA REVELADA!"); advanceTutorial(); }
      return;
    }
    if (step === 7) {
      const anchors = [[input.leftP, "left"], [input.rightP, "right"], [input.jumpP, "up"], [input.skillP, "down"]];
      anchors.forEach(([pressed, name]) => { if (pressed) lesson.anchors.add(name); });
      if (lesson.anchors.size === 4 && value >= 45 && value <= 60) lesson.tensionHold += dt; else lesson.tensionHold = 0;
      updateTutorialUI();
      if (lesson.anchors.size === 4 && lesson.tensionHold >= .85) { showToast("¡TRAMPA TENSADA!"); advanceTutorial(); }
      return;
    }
    if (step === 8) {
      const stepSize = .075;
      if (input.leftP) { lesson.lensX = clamp(lesson.lensX - stepSize, .13, .87); lesson.panMoves++; }
      if (input.rightP) { lesson.lensX = clamp(lesson.lensX + stepSize, .13, .87); lesson.panMoves++; }
      if (input.jumpP) { lesson.lensY = clamp(lesson.lensY - stepSize, .13, .87); lesson.panMoves++; }
      if (input.skillP) { lesson.lensY = clamp(lesson.lensY + stepSize, .13, .87); lesson.panMoves++; }
      const doc = clueDocs[lesson.docIndex], close = Math.hypot(lesson.lensX - doc.x, lesson.lensY - doc.y) < .105;
      if (close && 1 + value * .02 >= 2.25) lesson.zoomHold += dt; else lesson.zoomHold = 0;
      updateTutorialUI();
      if (lesson.zoomHold >= .8) { showToast("¡DETALLE DE LA PISTA ENCONTRADO!"); advanceTutorial(); }
      return;
    }
    if (step === 9) {
      const mode = movementMode(value);
      const checks = {
        chaseLow: direction > 0 && mode === "SIGILO",
        chaseHigh: direction > 0 && mode === "CORRER",
        chaseJump: landed === trainingChase[1],
        chaseSkill: input.skillUsed
      };
      let changed = false;
      for (const [key, done] of Object.entries(checks)) if (done && !lesson[key]) { lesson[key] = true; changed = true; }
      const player = game.player;
      const reachedExit = player.onGround && player.x + player.w / 2 >= trainingExit;
      if (reachedExit && Object.keys(checks).every(key => lesson[key])) advanceTutorial();
      else if (changed) updateTutorialUI();
    }
    if (step === 10 && game.hazard.phase === "spent" && game.player.onGround) advanceTutorial();
  };

  paintTutorialPad = function () {
    if (!game.tutorial) return;
    const step = game.tutorial.step, mode = game.radio ? "radio" : step === 5 ? "memory" : ({ 6: "powder", 7: "tension", 8: "zoom" }[step] || "pace");
    if (mode === "pace" || mode === "radio" || mode === "memory") setSliderLabels(mode);
    else {
      const labels = { powder: ["POLVO →", "← POLVO", "POLVO"], tension: ["TENSAR →", "← AFLOJAR", "TENSIÓN"], zoom: ["ACERCAR →", "← ALEJAR", "ZOOM"] }[mode];
      setSliderLabels.active = mode;
      byId("pace-upper").textContent = labels[0]; byId("pace-lower").textContent = labels[1];
      byId("pad-slider-mode").textContent = "DESLIZADOR · " + labels[2]; byId("pace-mode").textContent = labels[2];
      byId("pace-fx").textContent = Math.round(paceVal()) + "%";
    }
    if (mode === "memory") byId("pace-mode").textContent = "ECO";
    if (mode === "radio") byId("pace-mode").textContent = "SINTONÍA";
    const active = { left: keys.left || ser.left, right: keys.right || ser.right, jump: keys.jump || ser.jump, skill: keys.skill || ser.skill, red: ser.red || performance.now() < redFlashUntil };
    let expected = [], target = null;
    if (step === 0) expected = ["left", "right"];
    if (step === 1) target = [[0, 25], [40, 20], [75, 25]][game.tutorial.sliderStage];
    if (step === 2) expected = ["right", "jump"];
    if (step === 3) expected = ["skill"];
    if (step === 4) {
      if (game.radio) target = [radioTuning.target - radioTuning.tolerance, 2 * radioTuning.tolerance];
      else expected = ["skill"];
    }
    if (step === 5 && game.tutorial.phase === "replay") {
      const next = memoryPattern[game.tutorial.patternIndex];
      if (next === "left") expected = ["left"];
      else if (next === "right") expected = ["right"];
      else if (next === "jump") expected = ["jump"];
      else if (next === "skill") expected = ["skill"];
      else target = next === "low" ? [0, 25] : [75, 25];
    }
    if (step === 6) expected = ["left", "right", "jump", "skill"].filter((_, i) => !game.tutorial.brushDirections.has(["left", "right", "up", "down"][i]));
    if (step === 7) {
      expected = Array.from(["left", "right", "jump", "skill"].filter((_, i) => !game.tutorial.anchors.has(["left", "right", "up", "down"][i])));
      if (game.tutorial.anchors.size === 4) target = [45, 16];
    }
    if (step === 8) { expected = ["left", "right", "jump", "skill"]; target = [62, 35]; }
    if (step === 9) {
      if (!game.tutorial.chaseLow) { expected = ["right"]; target = [0, movementPaceZones.sneakEnd]; }
      else if (!game.tutorial.chaseHigh) { expected = ["right"]; target = [movementPaceZones.runStart, 100 - movementPaceZones.runStart]; }
      else if (!game.tutorial.chaseJump) expected = ["right", "jump"];
      else if (!game.tutorial.chaseSkill) expected = ["skill"];
      else expected = ["right"];
    }
    if (step === 10) {
      const hazard = game.hazard;
      if (hazard.phase === "ready") expected = [game.player.x + game.player.w / 2 < hazard.x ? "right" : "left"];
      else if (mansionHazardCaptive() && hazard.age >= mansionRopeLift) {
        expected = hazard.lastSide ? [hazard.lastSide === "left" ? "right" : "left"] : ["left", "right"];
      }
    }
    if (step === 11) expected = ["red"];
    const names = step >= 6 && step <= 8 ? { left: "IZQUIERDA", right: "DERECHA", jump: "ARRIBA", skill: "ABAJO", red: "ROJO" }
      : step === 5 ? { left: "IZQUIERDA", right: "DERECHA", jump: "ARRIBA", skill: "ABAJO", red: "ROJO" }
      : step === 4 ? { left: "IZQUIERDA", right: "DERECHA", jump: "ARRIBA", skill: game.radio ? "ABAJO" : "ABAJO · RADIO", red: "ROJO" }
      : { left: "IZQUIERDA", right: "DERECHA", jump: "ARRIBA · SALTO", skill: "ABAJO", red: "ROJO" };
    document.querySelectorAll(".pad-key").forEach(button => {
      const key = button.dataset.input;
      const label = button.querySelector("small");
      if (label.textContent !== names[key]) label.textContent = names[key];
      button.classList.toggle("on", !!active[key]); button.classList.toggle("expected", expected.includes(key));
    });
    sliderGauge.classList.toggle("slider-guided", !!target);
    if (target) {
      sliderGauge.style.setProperty("--target-left", target[0] + "%");
      sliderGauge.style.setProperty("--target-width", target[1] + "%");
    }
    byId("pad-slider-mark").style.left = paceVal() + "%";
    const sliderValue = String(Math.round(paceVal())), status = serialStatus();
    if (byId("pad-slider-value").textContent !== sliderValue) byId("pad-slider-value").textContent = sliderValue;
    if (byId("pad-source").textContent !== status) byId("pad-source").textContent = status;
    const elapsed = Math.floor(game.t), time = Math.floor(elapsed / 60) + ":" + String(elapsed % 60).padStart(2, "0");
    byId("tut-time").textContent = time;
    paintActivity();
  };

  togglePause = function () {
    if (game.tutorial?.reading) return;
    pauseSkip.hidden = !game.tutorial;
    if (game.tutorial && game.tutorial.step === 11 && !game.paused) game.tutorial.pauseSeen = true;
    baseTogglePause();
    if (game.tutorial && game.tutorial.step === 11 && !game.paused && game.tutorial.pauseSeen) advanceTutorial();
  };
  advanceTutorial = function () {
    const last = game.tutorial && game.tutorial.step === tutorialSteps.length - 1;
    game.radio = false;
    baseAdvanceTutorial();
    if (last) { setActivityVisible(false); ghostDialogue.classList.add("hidden"); }
  };
  startLevel = function () {
    setActivityVisible(false);
    ghostDialogue.classList.add("hidden");
    placeLessonDialogue(false);
    baseStartLevel();
    alignSliderGauge();
  };

  const skillAssetNames = ["scooby_olfato_4frames.svg", "shaggy_galleta_4frames.svg", "vilma_lupa_4frames.svg", "daphne_patada_4frames.svg", "fred_trampa_4frames.svg"];
  const skillImages = skillAssetNames.map(file => { const image = new Image(); image.src = asset("habilidades", file); return image; });
  let activeSkillFx = null;
  const baseUseSkill = useSkill;
  useSkill = function () {
    if (game.tutorial?.reading) return false;
    const activated = baseUseSkill();
    if (activated) activeSkillFx = { character, started: performance.now() };
    return activated;
  };
  const baseRender = render;
  render = function (now) {
    updateGhostDialogue();
    baseRender(now);
    if (!activeSkillFx) return;
    const elapsed = now - activeSkillFx.started;
    if (elapsed >= 680) { activeSkillFx = null; return; }
    const image = skillImages[activeSkillFx.character];
    if (!image.complete || !image.naturalWidth) return;
    const player = game.player, size = 76, direction = player.dir || 1;
    let worldX = player.x + player.w / 2 + direction * 34, worldY = player.y + 20;
    if (activeSkillFx.character === 1 && game.decoy) { worldX = game.decoy.x; worldY = (isVestibule() ? game.decoy.y : GROUND) - 55; }
    if (activeSkillFx.character === 3) { worldX = player.x + player.w / 2 + direction * 50; worldY = GROUND - 54; }
    if (activeSkillFx.character === 4 && game.trap) { worldX = game.trap.x; worldY = (isVestibule() ? game.trap.y : GROUND) - 49; }
    const frame = Math.min(3, Math.floor(elapsed / 170));
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = Math.min(1, (680 - elapsed) / 120 + .35);
    ctx.drawImage(image, frame * 128, 0, 128, 128, Math.round(worldX - game.cam - size / 2), Math.round(worldY - size / 2), size, size);
    ctx.restore();
  };

  const namesByMode = { left: "IZQUIERDA", right: "DERECHA", jump: "ARRIBA", skill: "ABAJO" };
  document.querySelectorAll("[data-k]").forEach(button => {
    if (button.dataset.k === "skill") button.textContent = "↓ ABAJO · HABILIDAD / INTERACTUAR";
  });
  document.querySelectorAll(".pad-key[data-input='skill'] small").forEach(label => { label.textContent = namesByMode.skill; });

  if (currentScreen === "levels") drawCases();
})();
