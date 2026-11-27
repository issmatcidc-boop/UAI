
const introCamera=new T.PerspectiveCamera(46,1,0.08,70);
const routeCamera=new T.PerspectiveCamera(49,1,.018,55);
const trapCamera=new T.PerspectiveCamera(47,1,0.04,70);
const baseSub=sub.position.clone();
const baseCabin=cabinCamera.position.clone();
const baseBeam=beam.position.clone();
const baseBeamTarget=beam.target.position.clone();
const baseBeamColor=beam.color.clone();
const trap=new T.Group();
trap.position.set(6.8,0,-3.4);
trap.visible=false;
scene.add(trap);
let experiment=null;
let phase="idle",phaseAt=0,trapSeen=false,securedWorm=false;
let phaseDuration=0, startedAt=0;
const narrationFiles={
  intro:"01_intro",rockWork:"02_roca",trapApproach:"03_transicion_trampa",
  trapBefore:"04_pregunta_trampa",trapAfter:"05_resultado_90min",
  trapDepart:"06_transicion_poliqueto_1",wormMacro:"07_transicion_poliqueto_2",
  wormWork:"08_poliqueto",ending:"09_cierre"
};
const narrationAudio=new Audio();
narrationAudio.preload="auto";
narrationAudio.preservesPitch=true;
narrationAudio.src="./narracion/"+narrationFiles.intro+".mp3";
// Cue times are seconds in the original nine recordings. The audio clock also
// keeps the text aligned with playback across phases and manual actions.
const captions={
  intro:[[0,"En 2026, científicos chilenos y chinos exploraron la Fosa de Atacama..."],[5.76,"a casi ocho mil metros de profundidad."]],
  rockWork:[[0,"Cada muestra del fondo nos ayuda a comprender su historia."]],
  trapApproach:[[0,"Pero algunas preguntas solo pueden responderse aquí abajo."]],
  trapBefore:[[0,"¿Qué ocurre cuando llega alimento a un lugar donde tanto escasea?"]],
  trapAfter:[[0,"En apenas noventa minutos..."],[2.86,"los anfípodos consumieron cerca de un kilo y medio de jurel."]],
  trapDepart:[[0,"Y entre los sedimentos..."],[2.04,"todavía hay más vida por descubrir."]],
  wormMacro:[[0,"Algunos organismos son tan delicados que recogerlos exige precisión."]],
  wormWork:[[0,"Los brazos robóticos nos permiten estudiar incluso la vida más frágil."]],
  ending:[[0,"Cada inmersión nos acerca a un mundo que aún estamos descubriendo."]]
};
let narrationPending=false,narrationRequest=0;
let voiceScene="",lastAudioTime=0,lastProgressAt=0,captionHoldUntil=0;
function setCaption(text){
  if($("narration").textContent!==text) $("narration").textContent=text;
}
function stopNarration(){
  ++narrationRequest;
  narrationAudio.pause();
  narrationPending=false;
  voiceScene="";
  captionHoldUntil=0;
  setCaption("");
}
function showTranscript(now){
  const transcript=captions[voiceScene].map(cue=>cue[1]).join(" ");
  narrationAudio.pause();
  narrationPending=false;
  setCaption(transcript);
  captionHoldUntil=now+Math.max(2500,transcript.length*53);
}
function playNarration(phaseName) {
  const file=narrationFiles[phaseName];
  if(!file) return;
  if(expeditionSound.voice){
    // Fixed trims from the integrated loudness of the selected takes. No compression.
    const trim={intro:3.3,rockWork:3,trapApproach:5.8,trapBefore:4.5,trapAfter:4,trapDepart:5.5,wormMacro:4,wormWork:5.8,ending:4.7};
    expeditionSound.voice.gain.setTargetAtTime(10**(trim[phaseName]/20),expeditionSound.context.currentTime,.025);
  }
  const request=++narrationRequest;
  const src=new URL("./narracion/"+file+".mp3",location.href).href;
  if(narrationAudio.src!==src) narrationAudio.src=src;
  else narrationAudio.currentTime=0;
  narrationAudio.playbackRate=1;
  voiceScene=phaseName;
  narrationPending=true;
  lastAudioTime=0;
  lastProgressAt=performance.now();
  captionHoldUntil=0;
  setCaption(captions[phaseName][0][1]);
  narrationAudio.play().catch(error=>{
    if(request!==narrationRequest || !narrationPending) return;
    showTranscript(performance.now());
    console.warn("No se pudo reproducir la narración",error);
  });
}
narrationAudio.addEventListener("ended",()=>{
  if(!narrationPending || !narrationAudio.ended) return;
  narrationPending=false;
  captionHoldUntil=0;
  setCaption("");
});
function narrationFinished(now) {
  if(narrationPending){
    const t=narrationAudio.currentTime;
    if(t!==lastAudioTime){lastAudioTime=t;lastProgressAt=now;}
    if(narrationAudio.error || now-lastProgressAt>6500) showTranscript(now);
    else {
      const cue=captions[voiceScene].findLast(part=>part[0]<=t);
      if(cue) setCaption(cue[1]);
    }
  }
  if(narrationPending || now<captionHoldUntil) return false;
  if(voiceScene){voiceScene="";setCaption("");}
  return true;
}
const phases={
  intro:{view:"exterior",ms:8500,next:"entry"},
  entry:{view:"cabin",ms:1100,next:"rockPrompt"},
  rockPrompt:{view:"cabin",ms:1050,next:"rockWork"},
  rockWork:{view:"manipulation"},
  rockRetract:{view:"manipulation",ms:1150,next:"trapApproach"},
  trapApproach:{view:"nav",ms:4600,next:"trapBefore"},
  trapBefore:{view:"trap",ms:4500,next:"trapJump"},
  trapJump:{view:"trap",ms:1050,next:"trapAfter"},
  trapAfter:{view:"trap",ms:12200,next:"trapDepart"},
  trapDepart:{view:"nav",ms:4500,next:"wormDetected"},
  wormPrompt:{view:"cabin",ms:1000,next:"wormWork"},
  wormDetected:{view:"nav",ms:1050,next:"wormMacro"},
  wormMacro:{view:"macro",ms:4620,next:"wormPrompt"},
  wormWork:{view:"manipulation"},
  wormRetract:{view:"manipulation",ms:2200,next:"ending"},
  ending:{view:"exterior",ms:5200}
};
function sampleRecord() { return phase.startsWith("worm") ? wormRecord : rockRecord; }
function assistLevel() {
  if(mode!=="exhibition" || !phase.endsWith("Work")) return 0;
  return T.MathUtils.clamp(Math.floor((performance.now()-phaseAt-3500)/1750)+1,0,3);
}
function automaticWork() {
  return mode==="exhibition" && phase.endsWith("Work") &&
    performance.now()-phaseAt>=510;
}
function enterPhase(next) {
  const state=phases[next];
  if(phase==="rockPrompt" && next==="rockWork") photographInstrument(rockRecord);
  if(phase==="wormPrompt" && next==="wormWork") photographInstrument(wormRecord);
  if(next==="trapApproach" || next==="trapDepart") beginCruise(next);
  const feedChanges=viewMode!==state.view && next!=="intro";
  if(feedChanges && !["trapBefore","trapDepart","wormMacro"].includes(next)) captureFeed(next);
  phase=next;
  $("scienceFact").hidden=true;
  phaseAt=performance.now();
  if(next==="intro") startedAt=phaseAt;
  playNarration(next);
  phaseDuration=state.ms;
  selectView(state.view);
  // Prime the incoming feed before this same frame is presented. Its pose and
  // its lamps must already be valid even on a direct developer-scene jump.
  if(next==="ending"){
    sub.position.copy(baseSub);
    departureCamera();
    setVehicleLights(118,155);
  }else if(state.view==="cabin"){
    cabinCamera.position.copy(baseCabin);
    cabinCamera.quaternion.copy(cabinHeading);
    if(cabinInstalled)poseCabin(0);
    lightCabinExterior();
  }else if(state.view==="trap"){
    sub.position.copy(trap.position).add(cameraOffset.set(-6.05,.24,1.68));
    experiment.frameAt(next,next==="trapJump" ? 4.7 : 0,trapCamera);
    directSurveyLamp();
    aimDeckLights(deckTarget.copy(trap.position).add(cameraOffset.set(-.04,.14,.14)));
  }else if(state.view==="nav"){
    directSurveyLamp();
    trackStation(next==="wormDetected" ? 1 : 0);
  }else if(state.view==="macro"){
    sub.position.copy(baseSub);
    macroPose(routeCamera,0);
    directSurveyLamp();
    aimDeckLights(wormRecord.point);
  }
  if(next.endsWith("Work")) {
    expeditionSound.signal(next==="wormWork"?365:295,.14,.038);
    switchUntil=phaseAt+400;
    if(mode==="free") announce(next==="rockWork" ? "Recoge la muestra geológica" :
      "Modo precisión",1350);
  }
  $("chapter").textContent=next==="intro" ? "FOSA DE ATACAMA · JCATE 2026" :
    next==="trapBefore" ? "EXPERIMENTO IN SITU · ENSAYO DE ALIMENTACIÓN" :
    next==="wormDetected" ? "DETECCIÓN CONFIRMADA · POLIQUETO HADAL" :
    next==="wormMacro" ? "POLIQUETO HADAL · OBSERVACIÓN CIENTÍFICA" :
    next==="trapApproach" ? "NAVEGACIÓN · ESTACIÓN DE ALIMENTACIÓN" :
    next==="trapDepart" ? "SONAR · BÚSQUEDA EN EL SEDIMENTO" :
    next==="ending" ? "FOSA DE ATACAMA · EXPLORACIÓN HADAL" : "";
  if(next==="intro") {
    sub.position.copy(baseSub);
    trap.visible=false;
  }

  if(next==="trapJump") $("timeJump").hidden=false;
  if(next==="trapAfter") {
    $("timeJump").hidden=true;
    trapSeen=true;
    if(mode==="exhibition"){
      experiment.setCutaway(true);
      $("trapCutaway").setAttribute("aria-pressed","true");
    }
  }
  if(next==="rockWork" || next==="wormWork") {
    syncVehicle();
    claw.copy(parkedClaw);
    cabinCamera.position.copy(baseCabin);
  }
  updateUI();
}
function tickTimeline(now) {
  const voiceDone=narrationFinished(now);
  const elapsed=now-phaseAt;
  const progress=phaseDuration ? T.MathUtils.clamp(elapsed/phaseDuration,0,1) : 0;
  const eased=T.MathUtils.smoothstep(progress,0,1);
  const state=phases[phase];
  trap.visible=true;
  beam.position.copy(baseBeam);
  beam.target.position.copy(baseBeamTarget);
  beam.intensity=0;
  beam.angle=.87;
  beam.color.copy(baseBeamColor);
  ambient.intensity=viewMode==="cabin" ? .68 : .079;
  fill.intensity=viewMode==="cabin" ? .45 : 0;
  if(phase==="intro") {
    sub.position.copy(baseSub).y+=7.15*(1-eased);
    sub.position.x-=1.15*(1-eased);
    descentCamera(eased);
    const first=T.MathUtils.smoothstep(elapsed,200,1800);
    const second=T.MathUtils.smoothstep(elapsed,720,2400);
    setVehicleLights(55+78*first,42+114*second);
    // Tilt the paired searchlights toward the approaching bottom, in world metres.
    surveyAim.copy(sub.position).add(cameraOffset.set(7.4,-2.8-.38*sub.position.y,.38));
    aimDeckLights(surveyAim);
    for(const lamp of vehicleLights) lamp.angle=.53+.07*eased;

    $("chapter").style.visibility=elapsed>2700 ? "visible" : "hidden";
  } else {
    $("chapter").style.visibility="visible";
  }
  if(workMode) {
    const sway=(now-startedAt)*0.001;
    sub.position.set(baseSub.x+0.025*Math.sin(sway*0.6),baseSub.y+0.034*Math.sin(sway*0.86),baseSub.z);
    beam.intensity=0;
  }
  if(phase==="entry" || phase.endsWith("Prompt")) {
    lightCabinExterior();
    cabinCamera.position.copy(baseCabin);
    cabinCamera.quaternion.copy(cabinHeading);
    if(cabinInstalled) poseCabin(eased);
    else cabinCamera.rotateY(-0.11*(phase==="entry" ? eased : 1));
  }
  if(viewMode==="nav"){
    directSurveyLamp();
    trackStation(phase==="wormDetected" ? 1 : progress);
    experiment.frameAt(phase==="trapApproach" ? "trapBefore" : "trapAfter",elapsed*.001+(phase==="trapApproach" ? 0 : phases.trapAfter.ms/1000),trapCamera,false);
  }
  if(viewMode==="macro") observeWorm(eased,elapsed);
  if(viewMode==="trap" && experiment) {
    const take=phase==="trapJump" ? 4.7 : elapsed/1000;
    experiment.frameAt(phase,take,trapCamera);
    directSurveyLamp();
    aimDeckLights(deckTarget.copy(trap.position).add(cameraOffset.set(-.04,.14,.14)));
  }
  if(phase==="ending") {
    sub.position.copy(baseSub).add(cameraOffset.set(1.75*eased,3.65*eased,-4.65*eased));
    departureCamera();
    setVehicleLights(110,146);
    aimDeckLights(sub.localToWorld(deckTarget.set(8.5,-1.32,.04)));
    if(elapsed>850 && elapsed<2550){
      $("chapter").textContent="02 MUESTRAS REGISTRADAS · EXPERIMENTO OBSERVADO";
    } else {
      $("chapter").textContent="FOSA DE ATACAMA · EXPLORACIÓN HADAL";
    }
  }
  camera.updateMatrixWorld();
  if(phase.endsWith("Prompt")) {
    const monitor=$("activate");
    monitor.disabled=elapsed<(phase==="wormPrompt" ? 680 : 480) || !voiceDone;
    const detected=phase==="rockPrompt" ? "Muestra geológica detectada" :
      "Poliqueto · activar precisión";
    const targetText=phase==="rockPrompt" && elapsed<300 ? "Escaneando…" : detected;
    const actionText=monitor.disabled ? " " :
      mode==="exhibition" ? "Activación automática" :
      phase==="wormPrompt" ? "Activar modo precisión" : "Activar manipuladores";
    if($("monitorTarget").textContent!==targetText) $("monitorTarget").textContent=targetText;
    if($("monitorState").textContent!==actionText) $("monitorState").textContent=actionText;
    if(mode==="exhibition") {
      $("activate").classList.toggle("assist",elapsed>=2000);
      if(elapsed>=phaseDuration && !monitor.disabled) enterPhase(state.next);
    }
    return;
  }
  if(depositStarted!==null) return;
  if(automaticWork()) {
    if(holding && now-heldSince>=1180 && claw.distanceTo(basket)<.025) beginRockDeposit(now);
    return;
  }
  if(phaseDuration && elapsed>=phaseDuration && voiceDone) {
    if(state.next) enterPhase(state.next);
    else end();
  }
}


function observeWorm(progress,elapsed){
  macroPose(routeCamera,progress);
  directSurveyLamp();
  aimDeckLights(wormRecord.point);
  $("scienceFact").hidden=elapsed<780;
  $("scienceFact").textContent="Cuerpo segmentado · escamas dorsales · quetas finas";
}
