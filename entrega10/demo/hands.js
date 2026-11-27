
const cameraButton = $("cameraToggle");
const video = $("handVideo");
const preview = $("handPreview");
const handCanvas = $("handMarks");
const handStatus = $("handStatus");
let cameraRequest=0;
const handContext = handCanvas.getContext("2d");
const detectionFrame=document.createElement("canvas");
const detectionContext=detectionFrame.getContext("2d");
let handZoneTop=0.20;
const diagnostics=document.createElement("output");
diagnostics.style.cssText="display:block;font:11px monospace;margin-top:6px";
const cropLabel=document.createElement("label");
cropLabel.style.cssText="display:block;font-size:11px;margin-top:6px";
cropLabel.append("Recorte superior ");
const cropSlider=document.createElement("input");
cropSlider.type="range";
cropSlider.min="0";
cropSlider.max="40";
cropSlider.value=String(handZoneTop*100);
cropSlider.setAttribute("aria-label","Porcentaje de recorte superior");
cropLabel.append(cropSlider);
const cameraSettings=document.createElement("div");
cameraSettings.hidden=true;
cameraSettings.append(diagnostics,cropLabel);
handStatus.after(cameraSettings);
cropSlider.oninput=()=>{
  handZoneTop=Number(cropSlider.value)/100;
  resizeDetectionFrame();
  forgetHand();
};
function resizeDetectionFrame() {
  detectionFrame.width=video.videoWidth;
  detectionFrame.height=video.videoHeight-Math.round(video.videoHeight*handZoneTop);
  preview.querySelector(".handZone").style.top=handZoneTop*100+"%";
}
const pinchClose=0.47, pinchOpen=0.61;
let lastGesture="";
const handArea = { left: 0.18, right: 0.82, top: 0.39, bottom: 0.87 };
let handDetector, detectorOptions, detectorDelegate, recovering=false, stream, enabling = false, handInput = false;
let lastVideoTime = -1, lastInference = 0;
let handSeen = false, pinchState = "unknown", pinchCandidate, pinchSince=0;
let filteredAim;
let palmReference, filteredGap=null;
let monitorReadyAt=0, lastGameError=-Infinity;
let monitorAimedAt=-Infinity, monitorWasClosed=false, monitorOpenSince=null;
function setHandStatus(message) {
  if (handStatus.textContent !== message) handStatus.textContent = message;
}
function forgetHand() {
  handSeen = false;
  gripClosed=false;
  precisionProgress=0;
  pinchState = "unknown";
  pinchCandidate = null;
  filteredGap = null;
  resetMonitorGesture();
  filteredAim = null;
  palmReference=null;
  handContext.clearRect(0, 0, handCanvas.width, handCanvas.height);
}
function stopCamera() {
  cameraRequest++;
  enabling=false;
  cameraButton.disabled=false;
  handInput = false;
  monitorReadyAt=0;
  forgetHand();
  stream?.getTracks().forEach(track => track.stop());
  stream = null;
  video.srcObject = null;
  preview.hidden = true;
  cameraSettings.hidden=true;
  $("handRoles").hidden=true;
  cameraButton.textContent = "Activar cámara";
  $("controlHelp").textContent = "Mouse o flechas para apuntar · clic o Espacio para actuar";
  setHandStatus("Control con mouse y teclado");
  refreshStartButtons();
  updateUI();
}
async function startCamera() {
  if (enabling || handInput) return;
  if (location.protocol === "file:") {
    setHandStatus("Para usar la mano, abre INICIAR DEMO.cmd desde la carpeta.");
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    setHandStatus("Abre la demo en Chrome o Edge desde INICIAR DEMO.cmd.");
    return;
  }
  enabling = true;
  const request=++cameraRequest;
  cameraButton.disabled = true;
  refreshStartButtons();
  setHandStatus("Permite el acceso a la cámara.");
  try {
    const opened = await navigator.mediaDevices.getUserMedia({
      audio: false, video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal:30 } }
    });
    if(request!==cameraRequest){
      opened.getTracks().forEach(track=>track.stop());
      return;
    }
    stream=opened;
    video.srcObject = stream;
    await video.play();
    if(request!==cameraRequest) return;
    setHandStatus("Cargando detector de manos…");
    if (!handDetector) {
      const { FilesetResolver, HandLandmarker } = await import("./mediapipe/vision_bundle.mjs");
      const files = await FilesetResolver.forVisionTasks("./mediapipe/wasm");
      detectorOptions=delegate=>HandLandmarker.createFromOptions(files,{
        baseOptions:{modelAssetPath:"./mediapipe/hand_landmarker.task",delegate},
        runningMode:"VIDEO",
        numHands:2
      });
      let detector, delegate="GPU";
      try {
        detector=await detectorOptions(delegate);
      } catch(error) {
        if(request!==cameraRequest) return;
        console.warn("MediaPipe GPU no disponible. Se usará CPU.",error);
        delegate="CPU";
        detector=await detectorOptions(delegate);
      }
      if(request!==cameraRequest){detector.close();return;}
      handDetector=detector;
      detectorDelegate=delegate;
    }
    handCanvas.width=video.videoWidth;
    handCanvas.height=video.videoHeight;
    resizeDetectionFrame();
    cameraSettings.hidden=false;
    lastVideoTime = -1;
    preview.style.aspectRatio = video.videoWidth + "/" + video.videoHeight;
    preview.hidden = false;
    $("handRoles").hidden=false;
    handInput = true;
    cameraButton.textContent = "Usar mouse";
    $("controlHelp").textContent = "Mueve la palma para apuntar · junta índice y pulgar para cerrar · sepáralos para soltar";
    setHandStatus("Muestra una mano dentro del recuadro.");
    stream.getVideoTracks()[0].addEventListener("ended", () => {
      if (!handInput) return;
      stopCamera();
      setHandStatus("Cámara desconectada. Puedes volver a activarla.");
    }, { once:true });
    keys.clear();
    updateUI();
  } catch (error) {
    if(request!==cameraRequest) return;
    stopCamera();
    const messages = {
      NotAllowedError: "Permite el acceso a la cámara en el navegador y vuelve a intentar.",
      NotFoundError: "No se encontró una cámara.",
      NotReadableError: "La cámara está ocupada. Cierra la otra aplicación y vuelve a intentar."
    };
    setHandStatus(messages[error.name] || "No se pudo iniciar el seguimiento. Puedes volver a intentar.");
    console.error("No se pudo iniciar MediaPipe", error);
  } finally {
    if(request===cameraRequest){
      enabling = false;
      cameraButton.disabled = false;
      refreshStartButtons();
    }
  }
}
cameraButton.onclick = () => handInput ? stopCamera() : startCamera();
window.addEventListener("pagehide", () => {
  stream?.getTracks().forEach(track => track.stop());
});
function handDistance(a, b) {
  return Math.hypot((a.x-b.x) * handCanvas.width / handCanvas.height, a.y-b.y);
}
function resetMonitorGesture() {
  monitorAimedAt=-Infinity;
  monitorWasClosed=false;
  monitorOpenSince=null;
}
function checkMonitorGesture(points,now,gap) {
  if(!active() || viewMode!=="cabin" || $("activate").disabled || missionDialogOpen()) {
    resetMonitorGesture();
    return;
  }
  const closed=closedFingers(points)>=3 || gap<(monitorWasClosed ? 0.55 : 0.43);
  const wasClosed=monitorWasClosed;
  monitorWasClosed=closed;
  const aimed=monitorUnderReticle(12);
  if(!closed){
    monitorOpenSince=aimed ? monitorOpenSince ?? now : null;
    monitorAimedAt=aimed ? now : -Infinity;
    return;
  }
  if(!wasClosed && monitorOpenSince!==null && now-monitorOpenSince>=240 &&
      now-monitorAimedAt<=130 && aimed && now>=monitorReadyAt){
    monitorReadyAt=now+550;
    activateSystem();
  }
  monitorOpenSince=null;
}
function closedFingers(points) {
  return [[5,6,8],[9,10,12],[13,14,16],[17,18,20]].filter(([base,middle,tip])=>{
    const firstSegment=handDistance(points[base],points[middle]);
    return firstSegment>0.008 &&
      handDistance(points[base],points[tip])<firstSegment*1.35 &&
      handDistance(points[0],points[tip])<handDistance(points[0],points[middle]);
  }).length;
}

function pinchRatio(points,pose,scale) {
  const imageGap=handDistance(points[4],points[8])/scale;
  if(!pose) return imageGap;
  const distance3D=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
  const palmLength=(distance3D(pose[0],pose[9])+distance3D(pose[5],pose[17]))*0.5;
  const worldGap=distance3D(pose[4],pose[8])/palmLength;
  // Keep a clear pinch in the image even if the inferred depth jumps.
  return palmLength>0.01 && Number.isFinite(worldGap) ? Math.min(imageGap,worldGap) : imageGap;
}
function openPalm(points) {
  return [[5,6,7,8],[9,10,11,12],[13,14,15,16],[17,18,19,20]].filter(([a,b,c,d])=>{
    const length=handDistance(points[a],points[b])+handDistance(points[b],points[c])+handDistance(points[c],points[d]);
    return length>0.02 && handDistance(points[a],points[d])>length*0.8 &&
      handDistance(points[0],points[d])>handDistance(points[0],points[b])*1.1;
  }).length>=3;
}
function handScale(points) {
  return Math.max(0.025,(handDistance(points[0],points[9])+handDistance(points[5],points[17]))*0.5);
}
function palmCenter(points) {
  const palm=[0,5,9,13,17];
  return palm.reduce((center,index)=>({
    x:center.x+(1-points[index].x)/palm.length,
    y:center.y+points[index].y/palm.length
  }),{x:0,y:0});
}
function scientificGesture(now,scale) {
  if(!active() || viewMode==="cabin" || missionDialogOpen() || now<switchUntil) {
    palmReference=null;
    return;
  }
  if(workMode) {
    if(!palmReference) palmReference=scale;
    const relative=scale/palmReference-1;
    const movement=Math.sign(relative)*Math.max(0,Math.abs(relative)-0.08);
    depth=T.MathUtils.lerp(depth,T.MathUtils.clamp(movement*1.3,-0.34,0.54),0.16);
  }
}
function processHands(result,now) {
  const hands=result.landmarks.map((points,index)=>({
    points,pose:result.worldLandmarks?.[index],
    label:(result.handedness ?? result.handednesses)?.[index]?.[0]?.categoryName,
    x:palmCenter(points).x
  })).sort((a,b)=>a.x-b.x);
  let primary, secondary;
  if(hands.length===2) {
    const right=hands.find(hand=>hand.label==="Right");
    const left=hands.find(hand=>hand.label==="Left");
    primary=right && left ? right : hands[1];
    secondary=hands.find(hand=>hand!==primary);
  } else if(hands.length===1) {
    const hand=hands[0];
    if(hand.label==="Left" || (hand.label!=="Right" && hand.x<0.5)) secondary=hand;
    else primary=hand;
  }
  const cabinHand=viewMode==="cabin" ? primary ?? secondary : primary;
  handleLandmarks(cabinHand?.points,now,cabinHand?.pose);
  diagnostics.textContent=detectorDelegate+" · Separación "+
    (primary && Number.isFinite(filteredGap) ? filteredGap.toFixed(2) : "—")+
    " · "+(primary ? ({closed:"cerrado",open:"abierto",unknown:"sin estado"})[pinchState] : "sin mano")+
    (lastGesture ? " · Último gesto: "+lastGesture : "");
  handContext.clearRect(0,0,handCanvas.width,handCanvas.height);
  if(primary) drawHand(primary.points,pinchState==="closed" ? "#ffca8a" : "#91f4d3");
  if(secondary) drawHand(secondary.points,"#9fb8ff");
  $("swipeDetected").classList.toggle("detected",Boolean(secondary));
  $("aimDetected").classList.toggle("detected",Boolean(primary));
  setHandStatus(hands.length===2 ? "Usa la mano derecha para operar" :
    primary ? "Derecha detectada · apunta" :
    secondary ? "Izquierda detectada · selecciona el monitor en cabina" :
    "Muestra una mano debajo de la línea.");
}
function drawHand(landmarks,color) {
  const w = handCanvas.width, h = handCanvas.height;
  const fingers=[[0,1,2,3,4],[0,5,6,7,8],[0,9,10,11,12],[0,13,14,15,16],[0,17,18,19,20]];
  const palmWidth=handDistance(landmarks[5],landmarks[17])*h;
  const trace=indices=>{
    handContext.beginPath();
    indices.forEach((index,i)=>{
      const point=landmarks[index];
      if(i===0) handContext.moveTo(point.x*w,point.y*h);
      else handContext.lineTo(point.x*w,point.y*h);
    });
  };
  handContext.save();
  handContext.fillStyle=handContext.strokeStyle=color;
  handContext.globalAlpha=0.64;
  trace([0,1,5,9,13,17]);
  handContext.fill();
  handContext.lineWidth=T.MathUtils.clamp(palmWidth*0.2,5,19);
  handContext.lineCap="round";
  handContext.lineJoin="round";
  for(const finger of fingers) { trace(finger); handContext.stroke(); }
  handContext.restore();
}
function handleLandmarks(landmarks, now, pose) {
  if (!landmarks) {
    if (handSeen && now-lastHandSeen < 200) return;
    forgetHand();
    setHandStatus("Muestra una mano dentro del recuadro.");
    return;
  }
  const frameTime=handSeen ? Math.min(now-lastHandSeen,90) : 33;
  handSeen = true;
  lastHandSeen = now;
  const center=palmCenter(landmarks);
  const desired = {
    x: (center.x-handArea.left)/(handArea.right-handArea.left),
    y: (center.y-handArea.top)/(handArea.bottom-handArea.top)
  };
  const scale=handScale(landmarks);
  const ratio=pinchRatio(landmarks,pose,scale);
  if(!Number.isFinite(ratio)) return;
  filteredGap=(filteredGap==null || !Number.isFinite(filteredGap)) ? ratio : T.MathUtils.lerp(filteredGap,ratio,0.72);
  if(!filteredAim) filteredAim=desired;
  else {
    const travel=Math.hypot(desired.x-filteredAim.x,desired.y-filteredAim.y);
    if(travel>0.018) {
      const response=T.MathUtils.lerp(7,27,T.MathUtils.clamp(travel/0.18,0,1));
      const weight=(1-Math.exp(-response*frameTime/1000))*(1-0.018/travel);
      filteredAim.x=T.MathUtils.lerp(filteredAim.x,desired.x,weight);
      filteredAim.y=T.MathUtils.lerp(filteredAim.y,desired.y,weight);
    }
  }
  if(!missionDialogOpen()) aim(filteredAim.x, filteredAim.y);
  checkMonitorGesture(landmarks,now,filteredGap);
  if(workMode) scientificGesture(now,scale);
  const next = filteredGap <= pinchClose ? "closed" : filteredGap >= pinchOpen ? "open" : pinchState;
  if(next===pinchState) pinchCandidate=null;
  else if(next!==pinchCandidate) {
    pinchCandidate=next;
    pinchSince=now;
  } else if(now-pinchSince>=26) {
    const previous=pinchState;
    pinchState = next;
    pinchCandidate=null;
    if (active() && !missionDialogOpen()) {
      if (next === "closed" && !holding && workMode) act();
      if (next === "open" && previous === "closed" && workMode) releaseSample();
      if(workMode) measurePinch();
    }
  }

}
let lastHandSeen = 0;
async function recoverDetector(error) {
  console.error("Error del detector de manos",error);
  if(detectorDelegate==="GPU") {
    recovering=true;
    setHandStatus("Reiniciando el detector en CPU…");
    try {
      handDetector?.close();
      handDetector=null;
      handDetector=await detectorOptions("CPU");
      detectorDelegate="CPU";
      lastVideoTime=-1;
      forgetHand();
      return;
    } catch(fallbackError) {
      console.error("Error al iniciar el detector en CPU",fallbackError);
    } finally {
      recovering=false;
    }
  }
  stopCamera();
  setHandStatus("Se interrumpió el seguimiento. Vuelve a activar la cámara.");
}
function trackHand(now) {
  if(!handInput || recovering || video.readyState<2 || video.currentTime===lastVideoTime ||
      now-lastInference<(detectorDelegate==="GPU" ? 24 : 32)) return;
  lastInference=now;
  lastVideoTime=video.currentTime;
  let result;
  const inferStarted=performance.now();
  const cropTop=video.videoHeight-detectionFrame.height;
  try {
    detectionContext.drawImage(video,0,cropTop,detectionFrame.width,detectionFrame.height,
      0,0,detectionFrame.width,detectionFrame.height);
    result=handDetector.detectForVideo(detectionFrame,performance.now());
    measureInference(performance.now()-inferStarted);
  } catch(error) {
    void recoverDetector(error);
    return;
  }
  try {
    const landmarks=result.landmarks.map(hand=>hand.map(point=>({
      ...point,y:(cropTop+point.y*detectionFrame.height)/video.videoHeight
    })));
    processHands({...result,landmarks},now);
  } catch(error) {
    if(now-lastGameError>1000) {
      lastGameError=now;
      console.error("Error al aplicar los gestos al juego",error);
    }
  }
}

