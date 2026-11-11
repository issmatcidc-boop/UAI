/* Ruta de la Máquina del Misterio y subniveles del Caso 01. */
(() => {
  if (window.__mansionSublevelMap) return;
  window.__mansionSublevelMap = true;

  const segments = window.MANSION_SUBLEVELS;
  let activeStage = 0, selectedStage = 0, highestUnlocked = 0, pendingLightPulse = -1;
  let selectedRouteAction = -1;
  const completedStages = new Set();
  const hidden = element => element.classList.contains("hidden");
  const mapOverlay = document.createElement("div");
  mapOverlay.id = "mansion-map"; mapOverlay.className = "mansion-map-overlay hidden";
  mapOverlay.innerHTML = `
    <section class="route-panel" role="dialog" aria-modal="true" aria-labelledby="route-heading">
      <header class="route-header"><div><small>CASO 01 · MANSIÓN BRUMOSA</small><h2 id="route-heading">MAPA DE LA INVESTIGACIÓN</h2></div><span class="route-stamp">EXPEDIENTE ABIERTO</span></header>
      <p class="route-copy">Cada puerta termina el subnivel y devuelve a la Máquina del Misterio a esta ruta.</p>
      <div class="route-map" aria-label="Mapa ilustrado de los seis subniveles de la mansión">
        <img class="route-map-art" src="assets/definitivos_pixelart/mapa_v3/fondo_mapa_mansion_pixelart_v3.png" alt="Mapa pixel art de la Mansión Brumosa con un camino continuo entre seis zonas"/>
        <img id="route-van" src="assets/definitivos_pixelart/mapa_v3/camioneta_mapa_v4.png" alt="Camioneta turquesa del inicio con franja verde y flores naranjas"/>
        <div id="route-labels" class="route-labels" aria-hidden="true"></div>
        <div id="route-stops" class="route-stops"></div>
      </div>
      <nav class="route-actions" aria-label="Volver desde el mapa">
        <button type="button" class="btn dark" data-route-screen="levels">NIVELES</button>
        <button type="button" class="btn dark" data-route-screen="characters">PERSONAJES</button>
        <button type="button" class="btn dark" data-route-screen="home">INICIO</button>
      </nav>
      <div class="route-detail"><div><small id="route-step">DESTINO 01 / 06</small><h3 id="route-name"></h3><p id="route-subtitle"></p><p id="route-clue"></p></div><button id="route-enter" class="btn route-enter">IR A ESTE SUBNIVEL <b>BOTÓN ROJO</b></button></div>
      <footer id="route-controls" class="route-footer">← → DESTINO · ↑ OPCIONES · ROJO CONFIRMAR</footer>
    </section>`;
  document.querySelector("#game .canvas-wrap").appendChild(mapOverlay);

  const clearOverlay = document.createElement("div");
  clearOverlay.id = "sublevel-clear"; clearOverlay.className = "mansion-map-overlay hidden";
  clearOverlay.innerHTML = '<section class="route-panel clear-panel" role="dialog" aria-modal="true" aria-labelledby="clear-heading"><small>PUERTA CRUZADA · SUBNIVEL COMPLETADO</small><h2 id="clear-heading">ZONA SUPERADA</h2><p id="clear-copy"></p><div class="clear-mark">SIGUIENTE DESTINO</div><button id="clear-map" class="btn route-enter">VOLVER A LA RUTA · MAPA</button><p class="route-footer">ROJO · CONTINUAR AL MAPA</p></section>';
  document.querySelector("#game .canvas-wrap").appendChild(clearOverlay);

  const style = document.createElement("style");
  style.textContent = `
    .mansion-map-overlay{position:absolute;z-index:25;inset:0;display:block;padding:0;background:#090e19}.mansion-map-overlay.hidden{display:none}
    .route-panel{position:relative;width:100%;height:100%;max-height:100%;overflow:hidden;padding:0;background:#101827;border:0;box-shadow:none;color:#fff1c6}
    .route-header{position:absolute;z-index:3;top:10px;left:10px;display:none;align-items:center;justify-content:space-between}.route-header small,.route-panel>small,#route-step{font:9px var(--px);letter-spacing:.09em;color:#92eed6}.route-header h2,.route-panel h2{margin:8px 0 0;font:17px var(--px);line-height:1.5;color:#ffe26a;text-shadow:3px 3px #43294d}.route-stamp{padding:7px;border:1px solid #8e79b2;color:#cfb9ec;font:8px var(--px)}
    .route-copy{display:none}.route-map{position:absolute;inset:0;width:100%;height:100%;margin:0;overflow:hidden;background:#171829;image-rendering:pixelated}.route-map-art{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;image-rendering:pixelated}.route-labels{position:absolute;inset:0;pointer-events:none}.route-map-label{position:absolute;transform:translate(-50%,-50%);max-width:clamp(92px,15vw,205px);padding:5px 8px;background:#201a2cee;border:2px solid #f1cd72;box-shadow:inset 0 0 0 2px #563c46,2px 3px #0a0d16;color:#fff1c6;text-align:center;font:clamp(8px,.72vw,12px) var(--px);letter-spacing:.02em;line-height:1.45;text-shadow:1px 2px #39233f;white-space:normal}.route-map-label.is-locked{background:#111521f2;border-color:#55515e;box-shadow:inset 0 0 0 2px #292b37,2px 3px #0a0d16;color:#c7c3d0;text-shadow:1px 2px #191923}
    .route-stops{position:absolute;inset:0}.route-stop{position:absolute;z-index:4;transform:translate(-50%,-50%);width:clamp(26px,3vw,46px);height:clamp(26px,3vw,46px);display:grid;place-items:center;padding:0;border-radius:50%;background:#24232d;border:3px solid #655b57;color:#88818a;font:clamp(7px,.65vw,10px) var(--px);box-shadow:inset 0 0 0 3px #111522,1px 3px #070a12;filter:grayscale(.75) brightness(.58)}.route-stop.available{background:#f1c95c;border-color:#fff2a4;color:#342039;filter:none;text-shadow:0 1px #fff0a3;box-shadow:0 0 0 4px #ffe37a48,0 0 11px 5px #ffcb54d4,0 0 28px 12px #ffcf5740, inset 0 0 0 3px #9c692d,1px 3px #070a12}.route-stop.complete{background:#ffe277;border-color:#fff9d4;color:#2a1831;filter:none;text-shadow:0 1px #fff6bd;box-shadow:0 0 0 5px #ffe37a65,0 0 15px 7px #ffd25bea,0 0 34px 14px #ffd25b4d,inset 0 0 0 3px #ba8835,1px 3px #070a12}.route-stop.current{outline:3px solid #fff8d4;outline-offset:4px}.route-stop.locked{opacity:1;filter:none;background:#151824;border-color:#4a4d5b;color:#898591;box-shadow:0 0 0 7px #151824f2,0 0 15px 11px #11131eeb,inset 0 0 0 3px #111522,1px 3px #070a12}.route-stop.pending{border-style:dashed}.route-stop.just-lit{animation:stage-lamp-on .9s steps(5,end) both}@keyframes stage-lamp-on{0%{transform:translate(-50%,-50%) scale(.65);filter:brightness(.35);box-shadow:0 0 0 2px #ffe37a20}42%{transform:translate(-50%,-50%) scale(1.24);filter:brightness(1.8);box-shadow:0 0 0 9px #ffe37a85,0 0 32px 16px #ffd25bba}100%{transform:translate(-50%,-50%) scale(1);filter:none}}
    #route-van{position:absolute;z-index:5;width:clamp(88px,10vw,144px);height:auto;left:19%;top:80%;transform:translate(-50%,-100%);transition:left .55s cubic-bezier(.2,.8,.2,1),top .55s cubic-bezier(.2,.8,.2,1);image-rendering:pixelated;filter:drop-shadow(0 4px 0 #06050b)}
    .route-detail{position:absolute;z-index:6;right:14px;bottom:54px;width:min(370px,38vw);display:flex;justify-content:space-between;gap:12px;align-items:center;padding:10px 12px;background:#10182aed;border:2px solid #f1cd72;box-shadow:4px 5px #070a12}.route-detail h3{margin:5px 0;color:#fff2cb;font:clamp(9px,.82vw,12px) var(--px);line-height:1.6}.route-detail p{margin:4px 0;color:#e0dce7;font:12px/1.4 system-ui,sans-serif}.route-detail #route-clue{color:#9ae5d2;font-size:10px}.route-enter{min-width:152px;padding:9px 10px!important;background:#ffe16b!important;color:#231638!important;border:2px solid #fff4b4!important;font:8px var(--px)!important;line-height:1.7;box-shadow:3px 4px #885c2c}.route-enter b{margin-left:6px;color:#a43f38}.route-enter:disabled{cursor:not-allowed;filter:grayscale(.8);opacity:.58;box-shadow:none}.route-footer{position:absolute;z-index:6;left:12px;bottom:10px;max-width:58%;padding:7px 9px;text-align:left;color:#fff1c6;background:#10182ae8;border:1px solid #ffe27a;font:clamp(6px,.55vw,8px) var(--px);line-height:1.8}
    .clear-panel{text-align:center;max-width:540px}.clear-panel h2{margin:15px 0}.clear-panel p{color:#e6e1ec;font:13px/1.5 system-ui,sans-serif}.clear-mark{width:max-content;margin:20px auto;padding:9px 14px;border:1px solid #8de2cd;color:#9af1d9;font:9px var(--px);background:#142a2d}.clear-panel .route-enter{margin:8px auto}
    .route-actions{position:absolute;z-index:6;top:14px;left:14px;display:flex;flex-wrap:wrap;gap:8px;max-width:calc(100% - 28px)}
    .route-actions .menu-selected{outline:3px solid #9cf2d8;outline-offset:2px}
    .route-actions-active .route-stop.current{outline:none}
    @media(max-width:700px){.route-detail{right:6px;bottom:52px;width:min(295px,57vw);display:block;padding:8px}.route-enter{width:100%;margin-top:5px}.route-footer{left:6px;bottom:5px;max-width:40%;font-size:6px}.route-stop{width:26px;height:26px}.route-detail p{font-size:10px}}
  `;
  document.head.appendChild(style);

  const coords = [19.11, 31.61, 51.44, 69.71, 66.71, 87.20];
  const vertical = [88.36, 49.14, 82.76, 29.42, 56.98, 34.48];
  const labelCoords = [[11.78,87.61],[31.61,44.07],[51.44,87.93],[79.45,24.57],[57.5,56.5],[93.03,42.24]];
  const labels = document.getElementById("route-labels");
  const stops = document.getElementById("route-stops");
  const van = document.getElementById("route-van");
  const enter = document.getElementById("route-enter");
  const routeActions = [...mapOverlay.querySelectorAll("[data-route-screen]")];
  const routeControls = document.getElementById("route-controls");

  function selectRouteAction(index) {
    selectedRouteAction = index;
    const inActions = index >= 0;
    mapOverlay.classList.toggle("route-actions-active", inActions);
    routeActions.forEach((button, i) => button.classList.toggle("menu-selected", i === index));
    routeControls.textContent = inActions
      ? "← → ELEGIR OPCIÓN · ↓ VOLVER AL MAPA · ROJO CONFIRMAR"
      : "← → DESTINO · ↑ OPCIONES · ROJO CONFIRMAR";
  }

  function leaveRoute(screen) {
    mapOverlay.classList.add("hidden");
    clearOverlay.classList.add("hidden");
    game.running = false;
    game.paused = false;
    syncVestibuleHud();
    go(screen);
  }

  routeActions.forEach(button => {
    button.onclick = () => leaveRoute(button.dataset.routeScreen);
  });

  function drawMap() {
    stops.innerHTML = "";
    labels.innerHTML = "";
    segments.forEach((segment, index) => {
      const unlocked = index <= highestUnlocked;
      const label = document.createElement("div");
      label.className = "route-map-label " + (unlocked ? "is-unlocked" : "is-locked");
      label.style.left = labelCoords[index][0] + "%";
      label.style.top = labelCoords[index][1] + "%";
      label.textContent = String(index + 1).padStart(2, "0") + " · " + segment.name;
      labels.appendChild(label);
      const node = document.createElement(unlocked ? "button" : "div");
      node.className = "route-stop" + (unlocked ? " available" : " locked") + (completedStages.has(index) ? " complete" : "") + (index === selectedStage ? " current" : "") + (!segment.playable ? " pending" : "") + (index === pendingLightPulse ? " just-lit" : "");
      node.style.left = coords[index] + "%"; node.style.top = vertical[index] + "%";
      node.textContent = completedStages.has(index) ? "✓" : String(index + 1).padStart(2, "0");
      node.setAttribute("aria-label", unlocked ? segment.name + (segment.playable ? " · desbloqueado" : " · desbloqueado, contenido en preparación") : "Subnivel " + String(index + 1).padStart(2, "0") + " bloqueado");
      if (unlocked) { node.type = "button"; node.onclick = () => chooseStage(index); }
      stops.appendChild(node);
    });
    van.style.left = coords[selectedStage] + "%"; van.style.top = Math.max(9, vertical[selectedStage] - 5) + "%";
    const stage = segments[selectedStage], unlocked = selectedStage <= highestUnlocked;
    document.getElementById("route-step").textContent = "DESTINO " + String(selectedStage + 1).padStart(2,"0") + " / " + String(segments.length).padStart(2,"0") + (completedStages.has(selectedStage) ? " · COMPLETADO" : unlocked && !stage.playable ? " · EN PREPARACIÓN" : "");
    document.getElementById("route-name").textContent = segments[selectedStage].name;
    document.getElementById("route-subtitle").textContent = segments[selectedStage].subtitle;
    const clue = stage.clue;
    document.getElementById("route-clue").textContent = !unlocked ? "UBICACIÓN APAGADA · SUBNIVEL BLOQUEADO" : !stage.playable ? "LUZ ENCENDIDA · CONTENIDO EN PREPARACIÓN" : "PISTA · " + clue;
    enter.disabled = !unlocked || !stage.playable;
    enter.innerHTML = !unlocked ? "SUBNIVEL BLOQUEADO" : !stage.playable ? "PRÓXIMAMENTE" : "IR A ESTE SUBNIVEL <b>BOTÓN ROJO</b>";
  }
  function chooseStage(index) {
    if (index > highestUnlocked) return;
    selectRouteAction(-1);
    selectedStage = index; drawMap();
  }
  function showRoute() {
    selectRouteAction(-1);
    clearOverlay.classList.add("hidden"); mapOverlay.classList.remove("hidden"); drawMap();
    if (pendingLightPulse >= 0) window.setTimeout(() => { pendingLightPulse = -1; drawMap(); }, 950);
  }
  function enterStage() {
    if (selectedStage > highestUnlocked || !segments[selectedStage].playable) return;
    activeStage = selectedStage;
    const stage = segments[activeStage], p = game.player;
    mapOverlay.classList.add("hidden"); clearOverlay.classList.add("hidden");
    document.getElementById("intro").classList.add("hidden"); document.getElementById("pause").classList.add("hidden");
    document.getElementById("win").classList.add("hidden"); document.getElementById("gameover").classList.add("hidden");
    p.x = stage.start + 38; p.y = GROUND - p.h - 2; p.vx = 0; p.vy = 0; p.onGround = true; p.invuln = .8;
    game.cam = stage.start; game.safe = p.x; game.room = stage.name; game.banner = 2.2; game.t = 0; game.noise = .15;
    game.ghost.x = Math.min(stage.end - 190, stage.start + 440); game.ghost.st = "patrol"; game.ghost.stun = 0; game.ghost.alert = 0; game.ghost.patrol = 1;
    game.running = true; game.paused = false;
    game.vestibule = activeStage === 0 ? createVestibuleState() : null;
    game.hazard = createMansionHazard(stage);
    doorHintAt = -Infinity;
    window.mansionCaseStage = activeStage; window.mansionCaseStageEnd = stage.end;
    syncHud();
  }
  enter.onclick = enterStage;
  document.querySelector("#gameover .btn").onclick = () => {
    if (!isVestibule()) { startLevel(); return; }
    const reachedStation = game.vestibule.checkpoint || clues[0].found;
    game.player.lives = 3;
    game.cd = game.boost = game.sniff = game.reveal = 0;
    game.decoy = game.trap = null;
    enterStage();
    if (reachedStation) {
      const x = VESTIBULE.station - 30;
      game.player.x = game.safe = x;
      game.cam = x - W * .36;
      game.vestibule.checkpoint = true;
      showToast("REINTENTO EN LA ESTACIÓN");
    }
    syncHud();
  };
  document.getElementById("clear-map").onclick = showRoute;

  const baseStartLevel = startLevel;
  startLevel = function () {
    activeStage = 0; selectedStage = 0; highestUnlocked = 0; completedStages.clear();
    window.mansionCaseStage = 0; window.mansionCaseStageEnd = segments[0].end;
    baseStartLevel();
    document.getElementById("sublevel-clear").classList.add("hidden");
    if (window.__startingMansionTutorial) {
      mapOverlay.classList.add("hidden");
      game.running = false; game.paused = false;
      return;
    }
    document.getElementById("intro").classList.add("hidden"); game.running = false; game.paused = true;
    showRoute();
  };

  function completeSublevel(index) {
    completedStages.add(index);
    const previousHighest = highestUnlocked;
    highestUnlocked = Math.max(highestUnlocked, Math.min(segments.length - 1, index + 1));
    if (highestUnlocked > previousHighest) pendingLightPulse = highestUnlocked;
    game.running = false; game.paused = true; selectedStage = highestUnlocked;
    syncVestibuleHud();
    const next = segments[highestUnlocked];
    document.getElementById("clear-heading").textContent = index === segments.length - 1 ? "ÁTICO EXPLORADO" : "ZONA SUPERADA";
    document.getElementById("clear-copy").textContent = index === segments.length - 1
      ? "Aún faltan pruebas para una acusación sólida. Vuelve a la ruta y revisa las zonas anteriores; la Máquina del Misterio te llevará de vuelta."
      : "Cruzaste la puerta de " + segments[index].name + ". La Máquina del Misterio ya tiene el siguiente destino: " + next.name + ".";
    document.getElementById("sublevel-clear").classList.remove("hidden"); drawMap();
  }

  const baseUpdate = update;
  let doorHintAt = -Infinity;
  update = function (dt) {
    if (!hidden(mapOverlay) || !hidden(clearOverlay)) return;
    const stage = segments[activeStage], p = game.player;
    if (game.running && !game.tutorial && p && p.x >= stage.end - 80) {
      if (activeStage === 0 && !clues[0].found) {
        p.x = stage.end - 85;
        baseUpdate(dt);
        if (game.t - doorHintAt > 2) {
          showToast("PUERTA CERRADA · VUELVE A LA BROCHA PARA REVELAR LA HUELLA");
          doorHintAt = game.t;
        }
        return;
      }
      p.x = stage.end - 80; p.y = GROUND - p.h - 2; p.vx = 0; p.vy = 0; p.onGround = true;
      if (activeStage === segments.length - 1 && clues.every(clue => clue.found)) {
        p.x = WORLD - 40;
        baseUpdate(dt);
      } else {
        completeSublevel(activeStage);
      }
      return;
    }
    baseUpdate(dt);
  };

  const baseRender = render;
  render = function (now) {
    baseRender(now);
    if (currentScreen !== "game" || game.tutorial || !hidden(mapOverlay) || !hidden(clearOverlay)) return;
    const gateX = segments[activeStage].end - 80 - game.cam;
    if (gateX < -60 || gateX > W + 60) return;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    const x = Math.round(gateX), y = GROUND - 61;
    ctx.fillStyle = "#100d1b"; ctx.fillRect(x - 5, y - 3, 49, 65);
    ctx.fillStyle = "#866846"; ctx.fillRect(x, y, 39, 60);
    ctx.fillStyle = "#271b31"; ctx.fillRect(x + 4, y + 4, 31, 56);
    ctx.fillStyle = "#52394b"; ctx.fillRect(x + 8, y + 7, 23, 53);
    ctx.fillStyle = "#d1aa58"; ctx.fillRect(x + 18, y + 17, 3, 37);
    ctx.fillRect(x + 13, y + 17, 3, 3); ctx.fillRect(x + 23, y + 17, 3, 3);
    const locked = activeStage === 0 && !clues[0].found;
    ctx.fillStyle = locked ? "#d88973" : "#f4d66a"; ctx.fillRect(x - 6, y - 4, 51, 3); ctx.fillRect(x - 6, y + 59, 51, 4);
    ctx.font = "6px monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#fff0bb";
    ctx.fillText(locked ? "FALTA LA HUELLA" : "PUERTA", x + 19, y - 10);
    ctx.restore();
  };

  const baseNavMove = navMove;
  navMove = function (direction) {
    if (currentScreen === "game" && !hidden(mapOverlay)) {
      if (selectedRouteAction >= 0) {
        const count = routeActions.length;
        selectRouteAction((selectedRouteAction + direction + count) % count);
      } else {
        const count = highestUnlocked + 1;
        chooseStage((selectedStage + direction + count) % count);
      }
      return;
    }
    baseNavMove(direction);
  };
  const baseNavVertical = navVertical;
  navVertical = function (direction) {
    if (currentScreen === "game" && !hidden(mapOverlay)) {
      if (direction < 0 && selectedRouteAction < 0) selectRouteAction(0);
      if (direction > 0 && selectedRouteAction >= 0) selectRouteAction(-1);
      return;
    }
    baseNavVertical(direction);
  };
  const baseActivateRed = activateRedEdge;
  activateRedEdge = function () {
    if (currentScreen === "game" && !hidden(mapOverlay)) {
      if (selectedRouteAction >= 0) routeActions[selectedRouteAction].click();
      else enterStage();
      return;
    }
    if (currentScreen === "game" && !hidden(clearOverlay)) { showRoute(); return; }
    baseActivateRed();
  };
  window.mansionRouteActive = () => currentScreen === "game" && (!hidden(mapOverlay) || !hidden(clearOverlay));
  window.handleMansionRouteKey = event => {
    if (!window.mansionRouteActive()) return false;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.code)) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (!hidden(mapOverlay) && !event.repeat) {
        if (event.code === "ArrowLeft" || event.code === "ArrowRight") navMove(event.code === "ArrowLeft" ? -1 : 1);
        else navVertical(event.code === "ArrowUp" ? -1 : 1);
      }
      return true;
    }
    if (["Enter", "Space", "KeyF", "KeyX", "Escape"].includes(event.code)) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (!event.repeat) {
        if (event.code === "Escape" && !hidden(mapOverlay)) leaveRoute("levels");
        else activateRedEdge();
      }
      return true;
    }
    return false;
  };
  drawMap();
})();
