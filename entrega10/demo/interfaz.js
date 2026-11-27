"use strict";

const front=document.body;
const preparation=$("preparation");
const handControls=$("handControls");
const handDialog=$("handDialog");
const options=$("optionsDialog");
const coverCopy=$("overlayCopy").textContent;
const coverLabel=$("overlayLabel").textContent;
const coverTitle=$("overlayTitle").textContent;
const coverPan=new T.Vector3();
let preparingHand=false;
let lastInterfaceUpdate=0;
let objectiveUpdatedAt=0;

function missionDialogOpen() {
  return options.open || handDialog.open || $("log").open;
}

function showObjective(title,hint) {
  if($("taskTitle").textContent===title && $("taskHint").textContent===hint) return;
  $("taskTitle").textContent=title;
  $("taskHint").textContent=hint;
  objectiveUpdatedAt=performance.now();
}

function showScreen(screen) {
  front.dataset.screen=screen;
  $("reviewSamples").hidden=screen!=="end";
  $("overlay").hidden=screen!=="cover" && screen!=="end";
  preparation.hidden=screen!=="prepare";
  $("leaveMission").hidden=screen!=="mission" && screen!=="end";
  if(screen!=="mission") $("handIndicator").hidden=true;
}

function returnToCover() {
  keys.clear();
  stopNarration();
  mode="idle";
  phase="idle";
  trap.visible=false;
  holding=false;
  depositStarted=null;
  gripPointer=null;
  gripBySpace=false;
  if(handInput || enabling) stopCamera();
  document.body.classList.remove("exhibition");
  $("timeJump").hidden=true;
  $("scienceFact").hidden=true;
  $("chapter").textContent="";
  $("narration").textContent="";
  $("notice").textContent="";
  $("overlayTitle").textContent=coverTitle;
  $("overlayLabel").textContent=coverLabel;
  $("overlayCopy").textContent=coverCopy;
  $("coverSubtitle").hidden=false;
  $("prepareMission").textContent="Iniciar expedición";
  $("exhibition").textContent="Ver exposición automática";
  showScreen("cover");
  updateUI();
  $("prepareMission").focus({preventScroll:true});
}

function frameCover(now) {
  if(!vehicleAnchors) return;
  sub.position.copy(baseSub);
  sub.position.y+=3.4+.12*Math.sin(now*.00064);
  moveExteriorCamera(0);
  const tall=width<height*.86;
  const direction=Math.sin(now*.00029);
  introCamera.translateX((tall ? -.12 : -2.70)+direction*.27);
  introCamera.translateY(tall ? -1.8 : -.26);
  introCamera.translateZ(tall ? 4.35 : .65);
  introCamera.updateMatrixWorld();
  ambient.intensity=.09;
  fill.intensity=.10;
  beam.position.copy(sub.position).add(coverPan.set(4.9,3.2,5.5));
  beam.target.position.copy(sub.position).add(coverPan.set(.5,1.75,.1));
  beam.angle=.57;
  beam.intensity=123;
  setVehicleLights(95,117);
  if(viewMode!=="exterior") {
    selectView("exterior");
    setVehicleLights(95,117);
  }
}

function setInputChoice(useHand,openCamera=false) {
  preparingHand=useHand;
  $("useMouse").setAttribute("aria-pressed",String(!useHand));
  $("useHand").setAttribute("aria-pressed",String(useHand));
  $("inputGuide").textContent=useHand ?
    "Apunta con la palma derecha. Junta índice y pulgar para cerrar la pinza y sepáralos para abrirla." :
    "Apunta con el mouse. Mantén clic para cerrar la pinza y suelta para abrir.";
  if(useHand){
    $("prepCalibration").append(handControls);
    handControls.hidden=false;
    if(openCamera) void startCamera();
  } else {
    handControls.hidden=true;
    if(handInput || enabling) stopCamera();
  }
}

function openHandSettings() {
  if(options.open) options.close();
  if(front.dataset.screen==="prepare"){
    setInputChoice(true);
    $("cameraToggle").focus();
    return;
  }
  $("handCalibration").append(handControls);
  handControls.hidden=false;
  handDialog.showModal();
}
handDialog.addEventListener("close",()=>{
  if(preparation.hidden) handControls.hidden=true;
});

function updateMissionInterface(now) {
  if(now-lastInterfaceUpdate<120) return;
  lastInterfaceUpdate=now;
  const controls=$("handIndicator");
  controls.hidden=mode!=="free" || !handInput;
  controls.dataset.seen=String(handSeen);
  const label=handSeen ? "Mano detectada" : "Mano fuera de cuadro";
  if(controls.textContent!==label) controls.textContent=label;
  front.classList.toggle("short-objective",now>=objectiveUpdatedAt+4200);
  if(!$("developerTools").hidden){
    $("developerReadout").textContent=phase+" · cámara "+viewMode;
  }
  const button=$("start");
  const startLabel=front.dataset.screen==="prepare" && preparingHand && !enabling && !handInput ?
    "Continuar con mouse" : "Comenzar descenso";
  if(button.textContent!==startLabel) button.textContent=startLabel;
}

$("prepareMission").onclick=()=>{
  showScreen("prepare");
  setInputChoice(handInput);
  $("preparationTitle").focus();
};
$("backToCover").onclick=returnToCover;
$("useMouse").onclick=()=>setInputChoice(false);
$("useHand").onclick=()=>setInputChoice(true,true);
$("start").onclick=()=>start("free");
$("exhibition").onclick=()=>{
  if(handInput) stopCamera();
  start("exhibition");
};
$("helpButton").onclick=()=>$("helpDialog").showModal();
$("coverAudio").onclick=()=>$("optionsDialog").showModal();
$("missionOptions").onclick=()=>$("optionsDialog").showModal();
$("coverHands").onclick=openHandSettings;
$("configureHand").onclick=openHandSettings;
$("handIndicator").onclick=openHandSettings;
$("leaveMission").onclick=()=>{
  options.close();
  returnToCover();
};
$("creditsButton").onclick=()=>$("creditsDialog").showModal();
for(const record of records){
  const row=document.createElement("li");
  const link=document.createElement("a");
  link.href=record.source;
  link.target="_blank";
  link.rel="noopener noreferrer";
  link.textContent=record.institution+" · "+record.name;
  row.append(link);
  $("scientificSources").append(row);
}

$("voiceVolume").oninput=event=>{narrationAudio.volume=Number(event.target.value)/100;};
$("subtitles").onchange=event=>front.classList.toggle("subtitles-off",!event.target.checked);
const fullButton=$("fullscreen");
fullButton.hidden=!document.fullscreenEnabled;
fullButton.onclick=async()=>{
  try {
    if(document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch(error) {
    console.warn("Pantalla completa no disponible",error);
  }
};
document.addEventListener("fullscreenchange",()=>{
  const full=Boolean(document.fullscreenElement);
  fullButton.setAttribute("aria-pressed",String(full));
  fullButton.textContent=full ? "Salir de pantalla completa" : "Pantalla completa";
});

function toggleDeveloper(open) {
  $("developerTools").hidden=!open;
  $("presentationMode").setAttribute("aria-pressed",String(open));
  $("presentationMode").textContent=open ? "Cerrar modo desarrollo" : "Abrir modo desarrollo";
  if(open) $("developerScene").focus();
  else $("performancePanel").open=false;
}
$("presentationMode").onclick=()=>{
  options.close();
  toggleDeveloper($("developerTools").hidden);
};
$("closeDeveloper").onclick=()=>toggleDeveloper(false);
$("openDeveloperScene").onclick=()=>{
  if(!vehicleAnchors || enabling) return;
  const next=$("developerScene").value;
  start("free");
  if(next==="intro") return;
  stopNarration();
  enterPhase(next);
};

// Local synthesis for the vehicle and its instruments. One graph per page.
const expeditionSound={
  context:null,
  start(){
    if(!window.AudioContext) return;
    if(!this.context){
      const ctx=this.context=new AudioContext();
      const gain=(value,dest)=>{const node=ctx.createGain();node.gain.value=value;node.connect(dest);return node;};
      const filter=(frequency,dest)=>{const node=ctx.createBiquadFilter();node.type="lowpass";node.frequency.value=frequency;node.Q.value=.6;node.connect(dest);return node;};
      this.master=gain(.94,ctx.destination);
      this.voice=gain(1,this.master);
      ctx.createMediaElementSource(narrationAudio).connect(this.voice);
      this.fx=gain(.75,this.master);
      this.bed=gain(0,this.fx);
      this.water=filter(190,this.bed);
      const noise=ctx.createBuffer(2,Math.ceil(ctx.sampleRate*7.73),ctx.sampleRate);
      for(let channel=0;channel<2;channel++){
        const data=noise.getChannelData(channel);
        for(let i=0;i<data.length;i++) data[i]=Math.random()*2-1;
      }
      const flow=ctx.createBufferSource();flow.buffer=noise;flow.loop=true;flow.connect(this.water);flow.start();
      const motor=ctx.createOscillator();this.motor=motor;motor.frequency.value=56;
      motor.connect(gain(.15,this.bed));motor.start();
      this.arm=gain(0,this.fx);
      const servo=ctx.createOscillator();servo.type="triangle";servo.frequency.value=185;servo.connect(this.arm);servo.start();
      this.lastClaw=new T.Vector3();this.lastUpdate=0;this.closed=false;
    }
    this.context.resume().catch(()=>{});
    this.lastClaw.copy(claw);this.closed=false;
    this.fx.gain.setTargetAtTime(Number($("environmentVolume").value)/100,this.context.currentTime,.06);
  },
  tick(now){
    const ctx=this.context;
    if(!ctx || now-this.lastUpdate<80) return;
    const elapsed=Math.min(.4,Math.max(.03,(now-this.lastUpdate)/1000));
    this.lastUpdate=now;
    const playing=active(),cabin=viewMode==="cabin",transit=viewMode==="exterior" || viewMode==="nav";
    const t=ctx.currentTime,duck=narrationPending && !narrationAudio.paused && narrationAudio.volume>0 ? .46 : 1;
    const speed=this.lastClaw.distanceTo(claw)/elapsed;
    this.lastClaw.copy(claw);
    this.bed.gain.setTargetAtTime(playing?(cabin?.105:transit?.145:.09)*duck:0,t,.30);
    this.water.frequency.setTargetAtTime(cabin?135:transit?380:235,t,.50);
    this.motor.frequency.setTargetAtTime(cabin?52:transit?65:46,t,.62);
    this.arm.gain.setTargetAtTime(playing&&workMode?Math.min(.031,speed*.022)*duck:0,t,.09);
    if(playing && workMode && (fingerClose>.64)!==this.closed){
      this.closed=fingerClose>.64;this.signal(this.closed?174:228,.085,.021);
    }
    if(!workMode)this.closed=false;
  },
  signal(hz,length,level){
    const ctx=this.context;if(!ctx || ctx.state!=="running")return;
    const t=ctx.currentTime,osc=ctx.createOscillator(),amp=ctx.createGain();
    osc.frequency.setValueAtTime(hz,t);osc.frequency.exponentialRampToValueAtTime(hz*.77,t+length);
    amp.gain.setValueAtTime(.00001,t);amp.gain.exponentialRampToValueAtTime(level,t+.012);
    amp.gain.exponentialRampToValueAtTime(.00001,t+length);
    osc.connect(amp);amp.connect(this.fx);osc.onended=()=>{osc.disconnect();amp.disconnect();};
    osc.start(t);osc.stop(t+length);
  }
};
$("environmentVolume").oninput=event=>{
  const s=expeditionSound;
  if(s.context)s.fx.gain.setTargetAtTime(Number(event.target.value)/100,s.context.currentTime,.06);
};

