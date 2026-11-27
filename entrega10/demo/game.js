
"use strict";
const $ = id => document.getElementById(id);
const view = $("viewport");
const steps = [...$("steps").children];
const T = window.THREE;
let renderer;
try {
  renderer = new T.WebGLRenderer({ antialias: true, powerPreference:"high-performance" });
} catch {
  $("overlayTitle").textContent = "Visor 3D no disponible";
  $("overlayCopy").textContent = "Abre esta página en un navegador con WebGL activado.";
  $("start").hidden = $("exhibition").hidden = true;
  throw new Error("WebGL no disponible");
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
renderer.toneMapping=T.ReinhardToneMapping;
renderer.toneMappingExposure=1.11;
renderer.transmissionResolutionScale=0.65;
renderer.shadowMap.enabled=true;
view.append(renderer.domElement);
const scene = new T.Scene();
scene.background = new T.Color(waterColor);
scene.fog = new T.FogExp2(waterColor, waterDensity);
const workCamera = new T.PerspectiveCamera(50,1,0.08,70);
const cabinCamera = new T.PerspectiveCamera(54,1,0.08,70);
let camera = cabinCamera;
cabinCamera.position.set(-3.55,2.15,2.7);
cabinCamera.lookAt(1.75,0.28,-0.85);
const cabinHeading=cabinCamera.quaternion.clone();
const ambient = new T.HemisphereLight(0xa6ddec, 0x4c3c36, 1.25);
scene.add(ambient);
const beam = new T.SpotLight(vehicleLightColor, 115, 19, 0.87, 0.83, 1.50);
beam.position.set(-3, 4.8, 4);
beam.target.position.set(0.4, 0, 0);
scene.add(beam, beam.target);
const fill = new T.DirectionalLight(0x85a9be, 0.9);
fill.position.set(3, 5, -5);
scene.add(fill);
const vec = (x, y, z) => new T.Vector3(x, y, z);
const material = (color, extra = {}) => new T.MeshStandardMaterial({ color, roughness: 0.84, ...extra });
const sediment = material(0x5a605c, { vertexColors: true });
const rockMat = material(0x777f83, { flatShading: true });
const alloy = material(0xb7c9c6, { metalness: 0.31 });
const dark = material(0x213441);
const yellow = material(0xd8a451);
function mesh(geo, mat, parent, x, y, z) {
  const object = new T.Mesh(geo, mat);
  object.position.set(x, y, z);
  parent.add(object);
  return object;
}
const box = (p, m, x, y, z, w, h, d) => mesh(new T.BoxGeometry(w,h,d), m,p,x,y,z);
const sphereGeometry = new T.SphereGeometry(1,12,8);
const ball = (p,m,x,y,z,w,h,d) => {
  const object = mesh(sphereGeometry,m,p,x,y,z);
  object.scale.set(w,h,d);
  return object;
};
// Cockpit primitives live in camera space so their position follows the seated viewpoint.
const cockpit = new T.Group();
cockpit.position.z = -1.25;
scene.add(cabinCamera);
cabinCamera.add(cockpit);
const cabinMaterial = (color, emissive=0) => material(color,{ emissive, fog:false });
const bulkhead = cabinMaterial(0x253441,0x0b141c);
const lining = cabinMaterial(0x46565e,0x182329);
const consoleFace = cabinMaterial(0x162830,0x0c191e);
const bezel = cabinMaterial(0x090f14,0x05090c);
const instrument = cabinMaterial(0x285047,0x225c4c);
const lampIndicator = cabinMaterial(0x6fa996,0x234c43);
const fastener = cabinMaterial(0x657476,0x243032);
box(cockpit,bulkhead,0,0.98,0,2.5,0.25,0.22);
box(cockpit,lining,0,0.87,0.07,2.3,0.035,0.11);
box(cockpit,bulkhead,0,-0.97,0,2.5,0.40,0.3);
box(cockpit,lining,0,-0.775,0.06,2.24,0.034,0.19);
for(const side of [-1,1]) {
  const wall=box(cockpit,bulkhead,side*1.03,0,0,0.25,2.2,0.24);
  wall.rotation.z=side*0.105;
  const post=box(cockpit,lining,side*0.72,0.07,-0.02,0.045,1.81,0.10);
  post.rotation.z=side*0.13;
  for(const y of [-0.65,0.73]) ball(cockpit,fastener,side*0.81,y,0.085,0.016,0.025,0.018);
}
const desk = new T.Group();
desk.position.set(0,-0.755,0.13);
desk.rotation.x=-0.20;
cockpit.add(desk);
box(desk,consoleFace,0,0,0,1.86,0.16,0.14);
const monitorRack=new T.Group();
monitorRack.position.set(0.65,-0.23,0.13);
cockpit.add(monitorRack);
box(monitorRack,consoleFace,0.1,-0.16,-0.085,0.43,0.65,0.10);
box(monitorRack,bulkhead,0,-0.28,-0.015,0.10,0.29,0.12);
box(monitorRack,lining,0,0,0,0.55,0.42,0.13);
box(monitorRack,bezel,0,0,0.075,0.49,0.35,0.025);
let workMonitor=box(monitorRack,instrument,0,0,0.092,0.46,0.32,0.01);
const monitorSize=new T.Vector2(.46,.32);
const displayCanvas=Object.assign(document.createElement("canvas"),{width:384,height:256});
const displayTexture=new T.CanvasTexture(displayCanvas);
displayTexture.colorSpace=T.SRGBColorSpace;
workMonitor.material=new T.MeshBasicMaterial({map:displayTexture,fog:false});
let displayFrame=-1;
function updateCabinDisplay(now){
  const frame=Math.floor(now/180);
  if(!cockpit.visible || frame===displayFrame) return;
  displayFrame=frame;
  if(cabinInstalled){drawCabinInstruments(now); return;}
  const ctx=displayCanvas.getContext("2d");
  ctx.fillStyle="#071c22";ctx.fillRect(0,0,384,256);
  ctx.strokeStyle="#17424a";ctx.beginPath();
  for(let x=0;x<=384;x+=32){ctx.moveTo(x,0);ctx.lineTo(x,256);}
  for(let y=0;y<=256;y+=32){ctx.moveTo(0,y);ctx.lineTo(384,y);}
  ctx.stroke();
  ctx.font="bold 23px monospace";ctx.fillStyle="#96ede0";
  ctx.fillText("JCATE   /   SONAR",23,46);
  ctx.font="17px monospace";
  ctx.fillText(phase==="wormPrompt" ? "OBJETIVO   POLIQUETO" : "ESTADO     OPERATIVO",23,82);
  ctx.strokeStyle="#6be8cc";ctx.beginPath();
  for(let x=22;x<362;x+=4){
    const y=156+8*Math.sin(x*.12+now*.004)+18*Math.sin(x*.028+now*.002)*Math.sin(x*.014);
    if(x===22) ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.stroke();
  ctx.fillStyle="#81b6b9";ctx.fillText("CÁMARA EXTERIOR",23,221);
  displayTexture.needsUpdate=true;
}
const rails=material(0x596869,{roughness:.58,fog:false,emissive:0x0e2024});
for(const side of [-1,1]){
  const panel=box(cockpit,lining,side*.865,.14,-.025,.19,1.23,.11);
  panel.rotation.z=side*.12;
  for(let row=0;row<8;row++){
    box(panel,bezel,0,.48-row*.131,.066,.131,.062,.04);
    for(let col=0;col<3;col++) box(panel,col===0?lampIndicator:rails,(col-1)*.038,.48-row*.131,.095,.018,.022,.014);
  }
}
const portholes=new T.TorusGeometry(1,.045,9,44);
for(const x of [-.68,-.10,.47]){
  const ring=mesh(portholes,rails,cockpit,x,.18,-.12);
  ring.scale.set(.30,.52,.8);
  const gasket=mesh(portholes,bezel,cockpit,x,.18,-.099);
  gasket.scale.set(.275,.493,.62);
}
for(let i=0;i<4;i++){
  box(desk,rails,-.38+i*.099,.069,.021,.062,.019,.060);
}
for(const x of [-0.21,-0.15,0.15,0.21]) {
  box(monitorRack,lampIndicator,x,-0.185,0.069,0.024,0.016,0.012);
}
const monitorPosition = new T.Vector3();
const monitorCorners=[new T.Vector3(),new T.Vector3()];
for(let i=0;i<6;i++) {
  box(desk,i<3?lampIndicator:lining,-0.61+i*0.065,0.017,0.09,0.026,0.036,0.022);
}
for(let i=0;i<4;i++) {
  box(desk,lining,0.52+i*0.073,0.015,0.088,0.042,0.054,0.035);
}
const floorGeo = new T.PlaneGeometry(25, 25, 22, 22);
floorGeo.rotateX(-Math.PI / 2);
const positions = floorGeo.attributes.position;
const colors = [];
for (let i=0; i<positions.count; i++) {
  const x=positions.getX(i), z=positions.getZ(i);
  positions.setY(i, -0.14 + 0.10*Math.sin(x*1.6 + z*1.3) + 0.055*Math.cos(z*4 + x*3));
  const shade = 0.77 + 0.16*Math.sin(i*78.24)**2;
  colors.push(shade, shade, shade);
}
floorGeo.setAttribute("color", new T.Float32BufferAttribute(colors,3));
floorGeo.computeVertexNormals();
let seaFloor=mesh(floorGeo, sediment, scene, 0,0,0);
const pebble=new T.DodecahedronGeometry(1,0);
const hadalWater=createHadalWater(T,scene,renderer);

const routeStones=new T.Group();
routeStones.name="Piedras de la ruta";
for(const [x,z,size,turn] of [[3.06,-.83,.21,.8],[3.72,-1.66,.14,.2],[4.36,-.90,.33,1.3],
  [4.55,-1.25,.12,1.9],[5.24,-1.77,.25,2.1],[5.88,-2.56,.19,1.1]]){
  const stone=mesh(pebble,material(0x52544f,{flatShading:true}),routeStones,x,0,z);
  stone.scale.set(size*1.35,size*.58,size*.81);
  stone.rotation.y=turn;
}
scene.add(routeStones);
const sub = new T.Group();
sub.position.set(-5.25,0.14,-0.12);
scene.add(sub);
const armAssembly=new T.Group();
armAssembly.name="FunctionalArm_R";
const segmentGeometry = new T.CylinderGeometry(1,1,1,10);
const up = vec(0,1,0);
function link(object, a, b, thickness) {
  const delta=b.clone().sub(a);
  object.position.copy(a).lerp(b,0.5);
  object.quaternion.setFromUnitVectors(up,delta.clone().normalize());
  object.scale.set(thickness,delta.length(),thickness);
}
function segment(p,m) { return mesh(segmentGeometry,m,p,0,0,0); }
const upper = segment(armAssembly,yellow), fore = segment(armAssembly,alloy), hydraulic = segment(armAssembly,dark);
const elbow = ball(armAssembly,dark,0,0,0,0.142,0.142,0.142);
const wristCollar=mesh(new T.CylinderGeometry(.105,.13,.114,14),dark,armAssembly,0,0,0);
let manipulator=null, rockClosing=false;
const gripper=new T.Group();
armAssembly.add(gripper);
box(gripper,dark,0,0.16,0,0.26,0.15,0.20);
const jawAxis=new T.CylinderGeometry(.038,.038,.13,12).rotateX(Math.PI/2);
const jawPad=material(0x273836,{roughness:.7});
const fingers=[-1,1].map(sign=>{
  const pivot=new T.Group();
  pivot.position.set(sign*0.095,0.115,0);
  gripper.add(pivot);
  mesh(jawAxis,dark,pivot,0,0,0);
  const cheek=box(pivot,alloy,sign*.012,-.064,0,.078,.153,.114);
  cheek.rotation.z=sign*.09;
  const tip=box(pivot,alloy,-sign*.020,-.148,0,.114,.062,.105);
  tip.rotation.z=sign*.24;
  for(let tooth=0;tooth<3;tooth++)
    box(pivot,jawPad,-sign*(.034+tooth*.017),-.178,-.001,.012,.015,.083);
  mesh(jawAxis,alloy,pivot,0,-.07,0).scale.set(.49,.49,.91);
  return pivot;
});
const basket=new T.Vector3();
const basketCameraPosition=new T.Vector3();
const inspectionLamp=new T.PointLight(0xffedd4,0,4.8,2);
inspectionLamp.position.set(-.22,.24,-.16);
workCamera.add(inspectionLamp);
const physicalGrip=new T.Vector3();
const rockLanding=new T.Vector3(), depositOrigin=new T.Vector3(), basketFocus=new T.Vector3();
let depositStarted=null, heldSince=0, basketFraming=0;
let gripPointer=null, gripBySpace=false;

const sampleRock=new T.Group();
sampleRock.name="Muestra geológica";
sampleRock.rotation.y=-.36;
scene.add(sampleRock);
const backupRock=mesh(pebble,rockMat,sampleRock,0,0,0);
backupRock.scale.set(.28,.21,.24);
backupRock.rotation.set(.22,.83,.11);
const rockBasketSeat=vec(-.2,.14,0);
const worm = new T.Group();
scene.add(worm);
const records = [
  { name:"Muestra de roca", type:"Muestra recolectada en el juego", certainty:"Representación basada en evidencia", detail:"El basalto estilizado representa roca volcánica del entorno. La secuencia de agarre y depósito es una recreación de juego.", source:"https://www.sernageomin.cl/estudio-de-sernageomin-aporta-nuevos-antecedentes-sobre-la-geologia-de-la-fosa-de-atacama/", institution:"SERNAGEOMIN", point:vec(1.08,0.2,1.05), radius:33, label:"ROCA", object:sampleRock },
  { name:"Poliqueto hadal", type:"Muestra biológica del juego", certainty:"Representación basada en evidencia", detail:"La UV describe la precisión que exige manipular organismos delicados como los poliquetos. La figura representa al grupo sin identificar una especie.", source:"https://uv.cl/archivo-noticias-uv/28960-los-ojos-biologicos-del-abismo-la-hazana-del-doctor-eulogio-soto-en-la-fosa-de-atacama", institution:"Universidad de Valparaíso", point:vec(1.22,0.13,-0.48), radius:23, label:"POLIQUETO", object:worm },
];
const [rockRecord,wormRecord]=records;
const basketGuide={point:basket,radius:45,label:"CESTA"};
const marker=document.createElement("div");
marker.className="marker";
marker.append(document.createElement("b"));
$("markers").append(marker);
const pointer = { x:0, y:0 };
const keys = new Set();
const activePlane = new T.Plane(up,-0.22);
const ray = new T.Raycaster();
const claw = new T.Vector3();
const goal = claw.clone();
let width=1, height=1, holding=false, mode="idle", entries=[], noticeUntil=0, prev=0;
let viewMode="cabin", workMode=false;
let depth=0, gripClosed=false;
let fingerClose=0;
let precisionProgress=0;
const precisionHold=0.65;
let switchUntil=0;
const lastMove=new T.Vector3();
const parkedClaw=new T.Vector3();
const armParkPosition=vec(4.53,0.89,1.47);
const armMountPosition=new T.Vector3();
const armBase=new T.Vector3();
const armPointer=new T.Vector2();
const rayHit=new T.Vector3();
const joint=new T.Vector3();
const wrist=new T.Vector3();
const pistonStart=new T.Vector3();
const pistonEnd=new T.Vector3();

function syncVehicle() {
  if(!vehicleAnchors) return;
  vehicleAnchors.ArmMount_R.getWorldPosition(armMountPosition);
  sub.localToWorld(parkedClaw.copy(armParkPosition));
  basket.copy(rockBasketSeat).y+=.27;
  vehicleAnchors.BasketDropPoint.localToWorld(basket);
  camera.updateWorldMatrix(true,false);
}
function visibleTarget() {
  return active() && workMode && phase.endsWith("Work") ? target() : null;
}
function changeDepth(amount) { depth=T.MathUtils.clamp(depth+amount,-0.34,0.54); }
function screen(point) {
  const p=point.clone().project(camera);
  return {x:(p.x+1)*width/2,y:(1-p.y)*height/2};
}
function active() { return mode==="free" || mode==="exhibition"; }
function target() { return holding ? basketGuide : sampleRecord(); }
function reachFor(item) {
  if(item===rockRecord) return item.gripReach ?? .47;
  return item===wormRecord ? .19 : .47;
}
function targetRadius(item) { return item.radius+assistLevel()*8; }
function closeEnough(item) {
  const p=screen(item.point);
  return Math.hypot(p.x-pointer.x,p.y-pointer.y)<=targetRadius(item);
}
function monitorUnderReticle(margin=0) {
  const monitor=$("activate");
  if(monitor.disabled) return false;
  const bounds=monitor.getBoundingClientRect();
  const viewport=view.getBoundingClientRect();
  const x=pointer.x+viewport.left, y=pointer.y+viewport.top;
  return x>=bounds.left-margin && x<=bounds.right+margin &&
    y>=bounds.top-margin && y<=bounds.bottom+margin;
}
function positionMonitor() {
  const monitor=$("activate");
  if(monitor.hidden) return;
  const center=screen(workMonitor.getWorldPosition(monitorPosition));
  monitor.style.left=center.x+"px";
  monitor.style.top=center.y+"px";
  const lower=screen(workMonitor.localToWorld(monitorCorners[0].set(-monitorSize.x/2,-monitorSize.y/2,.006)));
  const upper=screen(workMonitor.localToWorld(monitorCorners[1].set(monitorSize.x/2,monitorSize.y/2,.006)));
  monitor.style.width=(upper.x-lower.x)+"px";
  monitor.style.height=(lower.y-upper.y)+"px";
  monitor.classList.toggle("aimed",monitorUnderReticle());
}
const reducedGestureMotion=matchMedia("(prefers-reduced-motion: reduce)");
function drawGestureHand(canvas,gesture,side,now) {
  const context=canvas.getContext("2d");
  const phase=reducedGestureMotion.matches ? 0.65 : (1-Math.cos(now/220))/2;
  const pinch=gesture==="pinch" ? phase : gesture==="release" ? 1-phase : 0;
  const sweep=gesture==="swipe" ? (phase-0.5)*22 : 0;
  const lift=gesture==="release" ? (1-phase)*5 : 0;
  context.clearRect(0,0,100,100);
  context.save();
  context.translate(50+sweep,50-lift);
  context.scale(side==="left" ? -1 : 1,1);
  context.translate(-50,-50);
  const blue=context.createLinearGradient(26,28,72,74);
  blue.addColorStop(0,"#bce1ff");
  blue.addColorStop(1,"#598cdb");
  context.fillStyle=context.strokeStyle=blue;
  context.lineCap=context.lineJoin="round";
  function finger(start,bend,tip,width) {
    context.beginPath();
    context.moveTo(...start);
    context.quadraticCurveTo(...bend,...tip);
    context.lineWidth=width;
    context.stroke();
  }
  const indexTip=[62+9*pinch,19+15*pinch];
  const thumbTip=[80-8*pinch,47-12*pinch];
  finger([36,59],[31,46],[28,37],10);
  finger([43,55],[39,34],[38,25],11);
  finger([51,55],[49,28],[49,16],11);
  finger([59,56],[61,35],indexTip,11);
  finger([61,69],[74,59],thumbTip,12);
  context.beginPath();
  context.moveTo(39,89);
  context.quadraticCurveTo(39,78,32,68);
  context.quadraticCurveTo(25,56,35,49);
  context.quadraticCurveTo(49,42,62,49);
  context.quadraticCurveTo(72,53,68,69);
  context.quadraticCurveTo(61,79,61,89);
  context.closePath();
  context.fill();
  if(gesture==="pinch" || gesture==="release") {
    context.fillStyle="#207bea";
    for(const tip of [indexTip,thumbTip]) {
      context.beginPath();
      context.arc(...tip,3.1,0,Math.PI*2);
      context.fill();
    }
  }
  context.restore();
}
function positionObjectiveCue(item,now) {
  const cue=$("objectiveCue");
  const monitor=$("activate");
  const useMonitor=viewMode==="cabin" && !monitor.hidden && !monitor.disabled;
  cue.hidden=!useMonitor && !item;
  if(cue.hidden) return;

  const point=useMonitor ? screen(workMonitor.getWorldPosition(monitorPosition)) : screen(item.point);
  const gap=useMonitor ? monitor.offsetHeight*0.5+4 : targetRadius(item)+3;
  const label=cue.firstElementChild;
  const [hand,side,textLabel]=[label.querySelector("canvas"),label.querySelector("small"),label.querySelector("strong")];
  const gesture=useMonitor || (workMode && !holding) ? "pinch" : holding ? "release" : "aim";
  const message=handInput ?
    (holding ? "Lleva a la cesta y abre" : gesture==="pinch" ? "Junta pulgar e índice" : "Mantén la mira") :
    (useMonitor ? "Activa el monitor" : viewMode==="cabin" ? "Observa el objetivo" :
      workMode ? (holding ? "Suelta en la cesta" : "Cierra la pinza") :
      "Mantén la mira");
  hand.hidden=side.hidden=!handInput;
  if(handInput) {
    const handSide=useMonitor && !$("aimDetected").classList.contains("detected") &&
      $("swipeDetected").classList.contains("detected") ? "left" : "right";
    side.textContent=handSide==="left" ? "Mano izquierda" : "Mano derecha";
    drawGestureHand(hand,gesture,handSide,now);
  }
  if(textLabel.textContent!==message) textLabel.textContent=message;
  const cardWidth=label.offsetWidth, cardHeight=label.offsetHeight;
  const direction=point.x>width/2 ? 1 : -1;
  const vertical=workMode || point.y-gap>=cardHeight+60 ? 1 : -1;
  const tipY=point.y-vertical*gap;
  const cardX=T.MathUtils.clamp(point.x-direction*(64+cardWidth/2),cardWidth/2+8,width-cardWidth/2-8);
  const topMargin=workMode ? 34 : 8;
  const cardY=T.MathUtils.clamp(tipY-vertical*(38+cardHeight/2),cardHeight/2+topMargin,height-cardHeight/2-8);
  label.style.left=cardX+"px";
  label.style.top=cardY+"px";

  const startX=T.MathUtils.clamp(point.x,cardX-cardWidth/2+8,cardX+cardWidth/2-8);
  const startY=cardY+vertical*(cardHeight/2+4);
  const bendX=point.x-direction*21;
  const bendY=tipY-vertical*22;
  const heading=Math.atan2(tipY-bendY,point.x-bendX);
  const wing=angle=>[point.x-11*Math.cos(angle),tipY-11*Math.sin(angle)];
  const [leftX,leftY]=wing(heading-0.57);
  const [rightX,rightY]=wing(heading+0.57);
  cue.querySelector("path").setAttribute("d",
    `M ${startX} ${startY} Q ${bendX} ${bendY} ${point.x} ${tipY} M ${leftX} ${leftY} L ${point.x} ${tipY} L ${rightX} ${rightY}`);
}
function aim(x,y) {

  pointer.x=T.MathUtils.clamp(x*width,0,width);
  pointer.y=T.MathUtils.clamp(y*height,0,height);
}
function resize() {
  const previousX=pointer.x/width, previousY=pointer.y/height;
  width=view.clientWidth; height=view.clientHeight;
  const aspect=width/Math.max(1,height);
  for(const cinematic of [introCamera,trapCamera,routeCamera]) { cinematic.aspect=aspect; cinematic.updateProjectionMatrix(); }
  workCamera.aspect=aspect;
  workCamera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(29))*Math.max(1,1.63/aspect)));
  workCamera.updateProjectionMatrix();
  workCamera.updateMatrixWorld();
  cabinCamera.aspect=aspect;
  cabinCamera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(27))*Math.max(1,1.38/aspect)));
  cabinCamera.updateProjectionMatrix();
  cabinCamera.updateMatrixWorld();
  const cabinHalfHeight=1.25*Math.tan(T.MathUtils.degToRad(cabinCamera.fov/2));
  if(cabinInstalled) resizeCabin();
  else cockpit.scale.set(cabinHalfHeight*aspect,cabinHalfHeight,1);
  renderer.setSize(width,height,false);
  pointer.x=previousX*width; pointer.y=previousY*height;
}

function status(title,hint) {
  showObjective(title,hint);
}
function updateUI() {
  $("count").textContent=entries.length;
  const prompt=active() && phase.endsWith("Prompt");
  $("activate").hidden=!prompt;
  $("activate").disabled=!prompt || performance.now()-phaseAt<650;
  $("monitorState").textContent="Activar manipuladores";
  $("monitorTarget").textContent=phase==="wormPrompt" ? "Organismo detectado" : "Muestra geológica detectada";
  $("activate").classList.toggle("assist",prompt && mode==="exhibition" && performance.now()-phaseAt>=2000);
  $("play").classList.toggle("working",workMode);
  $("workFeed").hidden=!workMode;
  $("feed").textContent=workMode ? "CÁMARA DE MANIPULACIÓN" :
    viewMode==="cabin" ? "CABINA · VISTA INTERIOR" : viewMode==="macro" ? "OBSERVACIÓN CERCANA" : viewMode==="nav" ? "CÁMARA DE NAVEGACIÓN" : viewMode==="trap" ? "CÁMARA DEL EXPERIMENTO" : "FENDOUZHE · EXTERIOR";
  $("mode").textContent=phase==="wormWork" ? "MODO PRECISIÓN" : holding ? "MUESTRA EN PINZA" : "";
  const done=[entries.includes(rockRecord),trapSeen,entries.includes(wormRecord)];
  steps[0].querySelector("div").textContent=done[0] ? "Muestra geológica depositada" : holding || depositStarted!==null ? "Depositar la roca" : "Recoger la muestra geológica";
  steps.forEach((step,index)=>{
    step.classList.toggle("done",done[index]);
    step.classList.toggle("active",active() && !done[index] && index===(phase.startsWith("worm") ? 2 : phase.startsWith("trap") ? 1 : 0));
  });
  if(!active()) return;
  if(prompt) status($("monitorTarget").textContent,"Selecciona el monitor.");
  else if(phase==="rockWork" && holding) status("Deposita en la cesta",handInput ? "Abre pulgar e índice sobre la cesta." : "Suelta el clic sobre la cesta.");
  else if(phase==="wormWork") status("Asegura el poliqueto",handInput ?
    "Centra la pinza y mantén juntos pulgar e índice hasta llenar el anillo." :
    "Centra la pinza y mantén el clic hasta llenar el anillo.");
  else if(phase==="rockWork") status("Recoge la roca",
    handInput ? "Acerca la pinza y junta pulgar e índice." : "Acerca la pinza y mantén pulsado.");
  else status(phase.startsWith("trap") ? "Experimento in situ" : "Inmersión científica","");
  $("controlHelp").textContent=workMode ? (handInput ? "Mano derecha · índice y pulgar" : "Mouse para apuntar · mantén clic para cerrar") :
    prompt ? "Selecciona el monitor con clic o gesto de pinza" : "";
}
function selectView(next) {
  viewMode=next;
  workMode=next==="manipulation";
  camera={cabin:cabinCamera,manipulation:workCamera,exterior:introCamera,trap:trapCamera,nav:routeCamera,macro:routeCamera}[next];
  $("trapCutaway").hidden=next!=="trap";
  cockpit.visible=next==="cabin";
  sub.visible=next!=="cabin";
  $("play").classList.toggle("feedingView",next==="trap");

  setVehicleLights();
  depth=0;
  gripClosed=false;
  switchUntil=0;
}
const oldFeed=document.createElement("canvas");
oldFeed.setAttribute("aria-hidden","true");
$("cameraTransition").append(oldFeed);
function captureFeed(next){
  if(!camera || !vehicleAnchors) return;
  const overlay=$("cameraTransition"); overlay.dataset.feed=next;
  const target=next==="entry" ? vehicleAnchors.InteriorEntryAnchor :
    viewMode==="cabin" ? workMonitor : null;
  const focus=target ? screen(target.getWorldPosition(new T.Vector3())) : {x:width/2,y:height/2};
  oldFeed.style.transformOrigin=100*focus.x/width+"% "+100*focus.y/height+"%";
  oldFeed.width=Math.min(960,renderer.domElement.width);
  oldFeed.height=Math.round(oldFeed.width*height/width);
  renderer.render(scene,camera);
  oldFeed.getContext("2d").drawImage(renderer.domElement,0,0,oldFeed.width,oldFeed.height);
  overlay.classList.remove("changing");
  void overlay.offsetWidth;
  overlay.classList.add("changing");
}
function activateSystem() {
  if(!active() || !phase.endsWith("Prompt") || $("activate").disabled || missionDialogOpen()) return;
  enterPhase(phase==="rockPrompt" ? "rockWork" : "wormWork");
  view.focus({preventScroll:true});
}
function start(runMode) {
  if(!vehicleAnchors || enabling) return;
  expeditionSound.start();
  experimentPhotos.before=null;
  experimentPhotos.after=null;
  mode=runMode;
  document.body.classList.toggle("exhibition",runMode==="exhibition");
  rockClosing=false;
  depositStarted=null;
  basketFraming=0;
  gripPointer=null;
  gripBySpace=false;
  experiment.setCutaway(false);
  $("trapCutaway").setAttribute("aria-pressed","false");
  $("practiceTimer").hidden=runMode!=="free";
  $("elapsedTime").textContent="00:00";
  precisionProgress=0;
  entries=[];
  holding=false;
  trapSeen=false;
  securedWorm=false;
  $("notice").textContent="";
  for(const record of records) {
    record.image=null;
    scene.add(record.object);
    record.object.position.copy(record.point);
    record.object.quaternion.copy(record.initialRotation);
  }
  fingerClose=0;
  syncVehicle();
  claw.copy(parkedClaw);
  aim(0.5,0.53);
  showScreen("mission");
  enterPhase("intro");
  view.focus({preventScroll:true});
}
function announce(message,duration=2200,tone="info") {
  $("notice").textContent=message;
  $("notice").dataset.tone=tone;
  noticeUntil=performance.now()+duration;
}
function recordImage(record) {
  renderer.render(scene,camera);
  const center=screen(record.object.getWorldPosition(new T.Vector3()));
  const source=renderer.domElement;
  const tile=document.createElement("canvas");
  tile.width=144; tile.height=120;
  const context=tile.getContext("2d");
  const ratio=source.width/width;
  const crop=Math.min(108,width/2,height/2);
  context.drawImage(source,(center.x-crop/2)*ratio,(center.y-crop/2)*ratio,crop*ratio,crop*ratio,0,0,144,120);
  return tile.toDataURL();
}
function commit(item) {
  if(!item.image) item.image=recordImage(item);
  entries.push(item);
  expeditionSound.signal(472,.16,.043);
  if(item===rockRecord) {
    announce("Muestra geológica recolectada\n+ Bitácora",1100,"success");
    enterPhase("rockRetract");
  } else {
    securedWorm=true;
    announce("Muestra biológica asegurada\nPoliqueto hadal · + Bitácora",2100,"success");
    enterPhase("wormRetract");
  }
}
function end() {
  mode="ended";
  holding=false;
  keys.clear();
  $("overlayLabel").textContent="JCATE 2026";
  $("overlayTitle").textContent="Explorando la Fosa de Atacama";
  $("overlayCopy").textContent=entries.length===2 && trapSeen ?
    "Has depositado la roca, observado el experimento del jurel y asegurado el poliqueto. Las dos muestras están en tu bitácora." :
    "Consulta en la bitácora las muestras registradas durante este recorrido.";
  $("coverSubtitle").hidden=true;
  $("prepareMission").textContent="Jugar otra vez";
  $("exhibition").textContent="Repetir exposición";
  showScreen("end");
  updateUI();
  status("Expedición completada","Puedes revisar las muestras en la bitácora.");
  if(!$("log").open) $("prepareMission").focus({preventScroll:true});
}
function beginRockDeposit(now) {
  if(depositStarted!==null || !holding) return;
  depositStarted=now;
  scene.attach(sampleRock);
  depositOrigin.copy(sampleRock.position);
  holding=false;
  gripClosed=false;
  announce("Depositando muestra",650);
}
function updateRockDeposit(now) {
  if(depositStarted===null) return;
  const t=T.MathUtils.clamp((now-depositStarted-95)/570,0,1);
  vehicleAnchors.BasketDropPoint.localToWorld(rockLanding.copy(rockBasketSeat));
  const align=T.MathUtils.smoothstep(t,0,.76);
  rockRecord.object.position.lerpVectors(depositOrigin,rockLanding,align);
  // The jaws release over the basket. Gravity accelerates the short vertical
  // descent, while the last centimetres settle into the sample seat.
  const drop=t<.82 ? t*t : T.MathUtils.lerp(.82*.82,1,T.MathUtils.smoothstep(t,.82,1));
  rockRecord.object.position.y=T.MathUtils.lerp(depositOrigin.y,rockLanding.y,drop);

  if(t===1){
    depositStarted=null;
    parkRockInBasket();
    commit(rockRecord);
  }
}
function updateBasketFraming(dt) {
  inspectionLamp.intensity=workMode ? (phase.startsWith("worm") ? .65 : 5.0) : 0;
  if(!vehicleAnchors || !workMode) return;
  const weight=1-Math.exp(-6*dt);
  basketFraming=T.MathUtils.lerp(basketFraming,(phase==="rockRetract" || holding || depositStarted!==null) ? 1 : 0,weight);
  workCamera.position.set(.17-.62*basketFraming,.17+.63*basketFraming,-.31-.40*basketFraming);
  sub.localToWorld(basketCameraPosition.set(6.05,3.30,-1.15));
  workCamera.parent.worldToLocal(basketCameraPosition);
  workCamera.position.lerp(basketCameraPosition,basketFraming);
  sub.localToWorld(basketFocus.set(6.10,.51,.25));
  basketFocus.lerp(basket,.88*basketFraming);
  if(holding) basketFocus.lerp(claw,.18);
  if(phase==="wormWork" || phase==="wormRetract"){
    basketFocus.copy(wormRecord.point);
    if(securedWorm) basketFocus.lerp(claw,.78);
    rayHit.copy(basketFocus);
    // Keep the optical head ahead of the basket as the animal lifts toward the bow.
    rayHit.x=Math.max(sub.position.x+5.75,rayHit.x+.53);
    rayHit.y+=.55;
    rayHit.z-=.91;
    workCamera.position.copy(workCamera.parent.worldToLocal(rayHit));
  }
  workCamera.lookAt(basketFocus);
}
function parkRockInBasket() {
  const rock=rockRecord.object;
  vehicleAnchors.BasketDropPoint.attach(rock);
  rock.position.copy(rockBasketSeat);
}

function releaseSample() {
  gripClosed=false;
  rockClosing=false;
  precisionProgress=0;
  if(!active() || phase!=="rockWork" || !holding || missionDialogOpen()) return;
  const jaw=manipulator?.grip ?? gripper;
  if(closeEnough(basketGuide) && jaw.getWorldPosition(physicalGrip).distanceTo(basketGuide.point)<.18) {
    beginRockDeposit(performance.now());
  } else {
    announce("Centra la pinza sobre la cesta y vuelve a soltar.");
  }
  updateUI();
}
function act() {
  if(!active() || missionDialogOpen() || performance.now()<switchUntil) return;
  if(viewMode==="cabin") {
    if(monitorUnderReticle()) activateSystem();
    return;
  }
  if(!phase.endsWith("Work") || holding || depositStarted!==null) return;
  gripClosed=true;
  const item=target();
  const tolerance=reachFor(item)+assistLevel()*0.1;
  if(!closeEnough(item) || claw.distanceTo(item.point)>tolerance) {
    announce("Ajusta la posición de la pinza",1100,"warning");
    return;
  }
  if(item===wormRecord) announce("Mantén la pinza cerrada",1000);
  else {
    rockClosing=true;
  }
}
const experimentPhotos={before:null,after:null};
function documentExperiment(now){
  const key=phase==="trapBefore" ? "before" : phase==="trapAfter" ? "after" : null;
  if(!key || experimentPhotos[key] || now-phaseAt<(key==="before"?1250:6500)) return;
  const tile=document.createElement("canvas");
  tile.width=320;tile.height=Math.round(320*height/width);
  tile.getContext("2d").drawImage(renderer.domElement,0,0,tile.width,tile.height);
  experimentPhotos[key]=tile.toDataURL();
}
function experimentEntry(){
  const article=document.createElement("article");
  article.className="experimentEntry";
  const title=document.createElement("h3"),detail=document.createElement("p");
  title.textContent="Experimento de alimentación";
  detail.textContent="Los anfípodos se reunieron alrededor de la carnada. En 90 minutos, el conjunto consumió cerca de 1,5 kg de jurel.";
  article.append(title,detail);
  const photos=document.createElement("div");photos.className="experimentPhotos";
  for(const [key,label] of [["before","Jurel al inicio"],["after","90 minutos después"]]){
    if(!experimentPhotos[key]) continue;
    const figure=document.createElement("figure"),img=new Image(),caption=document.createElement("figcaption");
    img.src=experimentPhotos[key];img.alt=key==="before"?"Carnada en la trampa del juego":"Anfípodos junto al jurel";
    caption.textContent=label;figure.append(img,caption);photos.append(figure);
  }
  article.append(photos);return article;
}
function renderLog() {
  const list=$("entries");
  list.replaceChildren();
  $("logSummary").textContent=entries.length+" de "+records.length+" muestras registradas";
  if(!entries.length && !trapSeen) {
    list.textContent="La primera ficha se abre cuando depositas la roca en la cesta. La segunda se añade al asegurar el poliqueto.";
    return;
  }
  for(const entry of entries) {
    const article=document.createElement("article");
    article.className="entry";
    const img=new Image();
    img.src=entry.image;
    img.alt="Vista del prototipo de "+entry.name.toLowerCase();
    const body=document.createElement("div");
    const title=document.createElement("h3"), badge=document.createElement("small"), copy=document.createElement("p"), source=document.createElement("a");
    title.textContent=entry===rockRecord ? "Muestra geológica" : entry.name;
    badge.textContent=entry===rockRecord ? "Depositada en la cesta" : "Asegurado con el modo precisión";
    copy.textContent=entry.detail;
    source.textContent="Fuente · "+entry.institution+" ↗";
    source.href=entry.source; source.target="_blank"; source.rel="noopener noreferrer";
    const evidence=document.createElement("small");
    evidence.className="sampleEvidence";
    evidence.textContent=entry.certainty;
    body.append(badge,title,copy,evidence,source);
    article.append(img,body);
    list.append(article);
  }
  if(trapSeen){
    const observation=experimentEntry();
    if(entries.includes(wormRecord)) list.lastElementChild.before(observation);
    else list.append(observation);
  }
}
$("trapCutaway").onclick=()=>{
  const enabled=$("trapCutaway").getAttribute("aria-pressed")!=="true";
  experiment.setCutaway(enabled);
  $("trapCutaway").setAttribute("aria-pressed",String(enabled));
};
$("activate").onclick=activateSystem;
function openLog(){
  keys.clear();
  renderLog();
  $("log").showModal();
}
$("journal").onclick=openLog;
$("reviewSamples").onclick=openLog;
function pointerAim(event) {
  const rect=view.getBoundingClientRect();
  aim((event.clientX-rect.left)/width,(event.clientY-rect.top)/height);
}
$("play").addEventListener("pointermove",event=>{ if(!handInput) pointerAim(event); });
view.addEventListener("pointerdown",event=>{
  if(handInput || !workMode || event.button!==0) return;
  pointerAim(event);
  view.focus({preventScroll:true});
  gripPointer=event.pointerId;
  view.setPointerCapture(event.pointerId);
  act();
});
view.addEventListener("pointerup",event=>{
  if(event.pointerId!==gripPointer || event.button!==0) return;
  gripPointer=null;
  if(handInput) return;
  pointerAim(event);
  releaseSample();
});
view.addEventListener("pointercancel",event=>{
  if(event.pointerId!==gripPointer) return;
  gripPointer=null;
  gripClosed=false;
});
view.addEventListener("wheel",event=>{
  if(handInput || !workMode || !active()) return;
  event.preventDefault();
  pointerAim(event);
  const direction=Math.sign(event.deltaY);
  changeDepth(-direction*0.13);
},{passive:false});
document.addEventListener("keydown",event=>{
  if(!active() || handInput || missionDialogOpen() || event.altKey || event.ctrlKey || event.metaKey) return;
  if(event.code==="KeyW" || event.code==="KeyS") {
    if(workMode) changeDepth(event.code==="KeyW" ? 0.10 : -0.10);
  } else if(event.key.startsWith("Arrow") && document.activeElement===view) {
    event.preventDefault();
    keys.add(event.key);
  } else if(event.code==="Space" && document.activeElement===view) {
    event.preventDefault();
    if(!event.repeat) {
      gripBySpace=workMode && gripPointer===null;
      if(gripPointer===null) act();
    }
  }
});
window.addEventListener("keyup",event=>{
  keys.delete(event.key);
  if(event.code==="Space" && gripBySpace){
    gripBySpace=false;
    if(!handInput) releaseSample();
  }
});
window.addEventListener("blur",()=>keys.clear());
view.addEventListener("blur",()=>keys.clear());
function armTick(dt) {
  if(!sub.visible || !vehicleAnchors) return;
  const manipulating=active() && phase.endsWith("Work") && depositStarted===null;
  if(manipulating) {
    const item=target();
    if(automaticWork() || closeEnough(item)) goal.copy(item.point);
    else {
      armPointer.set(2*pointer.x/width-1,1-2*pointer.y/height);
      ray.setFromCamera(armPointer,camera);
      if(ray.ray.intersectPlane(activePlane,rayHit)) goal.copy(rayHit);
      goal.x=T.MathUtils.clamp(goal.x,sub.position.x+4.4,1.3);
      goal.z=T.MathUtils.clamp(goal.z+depth,-0.82,1.74);
      goal.y=Math.max(0.22,0.22+depth*0.65);
    }
    if(holding && !automaticWork() && !closeEnough(basketGuide)) goal.y=0.61;
    if(holding && performance.now()-heldSince<420){
      goal.copy(rockRecord.point);
      goal.y+=.33*T.MathUtils.smoothstep(performance.now()-heldSince,0,420);
    }
  } else if(depositStarted!==null){
    goal.copy(depositOrigin);
    goal.y+=.30*T.MathUtils.smoothstep(performance.now()-depositStarted,240,720);
  } else goal.copy(parkedClaw);
  lastMove.copy(goal).sub(claw).multiplyScalar(1-Math.exp(-(phase.startsWith("worm") ? 8.8 : 13.5)*dt));
  const speed=automaticWork() ? (holding ? 1.30 : 1.55) : phase.startsWith("worm") ? 2.65 : 4.32;
  claw.add(lastMove.clampLength(0,speed*dt));
  if(!manipulator){
    wrist.copy(claw).y+=0.22;
    joint.copy(armMountPosition).lerp(wrist,0.52);
    joint.x=Math.max(joint.x,sub.position.x+4.38);
    joint.y+=0.45;
    joint.z+=0.27;
    pistonStart.copy(armMountPosition).y+=0.15;
    pistonEnd.copy(joint).y+=0.14;
    armAssembly.worldToLocal(joint);
    armAssembly.worldToLocal(wrist);
    armAssembly.worldToLocal(pistonStart);
    armAssembly.worldToLocal(pistonEnd);
    elbow.position.copy(joint);
    wristCollar.position.copy(wrist);
    link(upper,armBase,joint,0.112);
    link(fore,joint,wrist,0.088);
    link(hydraulic,pistonStart,pistonEnd,0.043);
    gripper.position.copy(claw);
    armAssembly.worldToLocal(gripper.position);
  }
  const precise=phase==="wormWork";
  const auto=automaticWork();
  const trigger=auto || (gripClosed && (!handInput || handSeen) && !missionDialogOpen());
  const contact=manipulator?.grip ?? gripper;
  const near=claw.distanceTo(target().point)<.018 &&
    contact.getWorldPosition(physicalGrip).distanceTo(target().point)<.028;
  if(!trigger) rockClosing=false;
  if(precise){
    const aligned=trigger && near && (auto || closeEnough(wormRecord));
    precisionProgress=aligned ? Math.min(precisionHold,precisionProgress+dt) : 0;
  }
  const closingRock=phase==="rockWork" && !holding && depositStarted===null &&
    trigger && (auto || rockClosing && closeEnough(rockRecord)) && near;
  const closure=precise ? precisionProgress/precisionHold : Number(holding || securedWorm || closingRock);
  fingerClose=T.MathUtils.lerp(fingerClose,closure,1-Math.exp(-(precise ? 12 : 9)*dt));
  if(manipulator) manipulator.pose(claw,fingerClose,precise || securedWorm);
  else {
    fingers[1].rotation.z=T.MathUtils.lerp(.48,precise ? .015 : .27,fingerClose);
    fingers[0].rotation.z=-fingers[1].rotation.z;
  }
  if(closingRock && fingerClose>.93){
    contact.attach(sampleRock);
    holding=true;
    rockClosing=false;
    heldSince=performance.now();
    hadalWater.disturb(rockRecord.point);
    announce("Muestra asegurada",900,"success");
    updateUI();
  }
  if(precise && precisionProgress>=precisionHold && fingerClose>.9){
    contact.attach(wormRecord.object);
    commit(wormRecord);
  }
}
function draw(now) {
  const dt=Math.min(0.05,(now-prev)/1000);
  prev=now;
  if(now>noticeUntil) $("notice").textContent="";
  syncVehicle();
  trackHand(now);
  if(mode==="free") {
    const seconds=Math.max(0,Math.floor((now-startedAt)/1000));
    const display=[Math.floor(seconds/60),seconds%60].map(value=>String(value).padStart(2,"0")).join(":");
    if($("elapsedTime").textContent!==display) $("elapsedTime").textContent=display;
  }
  if(active()) {
    tickTimeline(now);
    animatePolychaete(dt);
  } else if(mode==="idle") frameCover(now);
  updateMissionInterface(now);
  syncVehicle();
  if(active() && keys.size) {
    const speed=220*dt;
    const x=Number(keys.has("ArrowRight"))-Number(keys.has("ArrowLeft"));
    const y=Number(keys.has("ArrowDown"))-Number(keys.has("ArrowUp"));
    aim((pointer.x+x*speed)/width,(pointer.y+y*speed)/height);
  }
  updateBasketFraming(dt);
  updateRockDeposit(now);
  const item=performance.now()>=switchUntil && depositStarted===null ? visibleTarget() : null;
  const selectingMonitor=active() && phase.endsWith("Prompt");
  updateCabinDisplay(now);
  positionMonitor();
  positionObjectiveCue(item,now);
  marker.hidden=!item;
  $("reticle").hidden=(!item && !selectingMonitor) || (handInput && !handSeen);
  $("reticle").style.left=pointer.x+"px"; $("reticle").style.top=pointer.y+"px";
  if(item) {
    const point=screen(item.point);
    marker.classList.toggle("precision",item===wormRecord);
    marker.style.left=point.x+"px"; marker.style.top=point.y+"px";
    marker.style.setProperty("--size",2*targetRadius(item)+"px");
    marker.classList.toggle("ready",closeEnough(item) &&
      claw.distanceTo(item.point)<=reachFor(item)+assistLevel()*0.1);
    marker.style.setProperty("--scan",(item===wormRecord ? precisionProgress/precisionHold*360 : 0)+"deg");
    marker.firstChild.textContent=item.label;
  }
  hadalWater.update(now,camera,viewMode,vehicleLights,beam);
  updateCabinPorts(now);
  armTick(dt);
  renderer.render(scene,camera);
  if(active()) documentExperiment(now);
  expeditionSound.tick(now);
  measureFrame(now);
  requestAnimationFrame(draw);
}
for (const record of records) {
  record.object.position.copy(record.point);
  record.initialRotation=record.object.quaternion.clone();
}
document.addEventListener("DOMContentLoaded", () => {
  new ResizeObserver(resize).observe(view);
  resize();
  selectView("cabin");
  updateUI();
  requestAnimationFrame(draw);
  void loadVehicle();
}, { once:true });

