"use strict";

let viewMeasurement=null, armMeasurement=null, pendingPinch=null;
let lastPerformanceText="";
const pinchTimes=[];
const shotMean=new T.Vector3();
const shotDelta=new T.Vector3();
const shotResidual=new T.Vector3();
const readout=$("performanceReadout");
const mean=(sum,count)=>count ? sum/count : null;
const metric=(value,decimals)=>value===null ? "—" : value.toFixed(decimals);

function measureInference(ms) {
  if(!viewMeasurement || viewMeasurement.done || viewMeasurement.mode!==viewMode) return;
  viewMeasurement.inferenceSum+=ms;
  viewMeasurement.inferenceCount++;
}

function measurePinch() {
  if(viewMeasurement?.mode===viewMode && !viewMeasurement.done) {
    pendingPinch={at:performance.now(),closure:fingerClose};
  }
}

$("measureView").onclick=()=>{
  viewMeasurement={
    mode:viewMode, start:performance.now(), last:null, frames:0, ms:0, calls:0, triangles:0,
    inferenceSum:0, inferenceCount:0, input:handInput ? detectorDelegate : "mouse"
  };
  pinchTimes.length=0;
  pendingPinch=null;
};
$("measureArm").onclick=()=>{
  if(!workMode || !phase.endsWith("Work")) return;
  armMeasurement={settle:performance.now()+1200, phase, handInput, frames:0, sum:0};
  shotMean.set(0,0,0);
};

function measureFrame(now) {
  const panel=$("performancePanel");
  if(!panel.open) {
    viewMeasurement=null;
    armMeasurement=null;
    pendingPinch=null;
    return;
  }
  const sample=viewMeasurement;
  if(sample && !sample.done) {
    if(sample.mode!==viewMode || (handInput ? detectorDelegate : "mouse")!==sample.input) {
      sample.done=true;
      sample.interrupted=true;
    } else if(sample.last!==null) {
      const elapsed=now-sample.last;
      sample.frames++;
      sample.ms+=elapsed;
      sample.calls+=renderer.info.render.calls;
      sample.triangles+=renderer.info.render.triangles;
      sample.done=sample.ms>=8000 || document.hidden;
    }
    sample.last=now;
  }
  if(pendingPinch) {
    const elapsed=performance.now()-pendingPinch.at;
    if(!sample || sample.interrupted || elapsed>800) pendingPinch=null;
    else if(Math.abs(fingerClose-pendingPinch.closure)>=0.01) {
      pinchTimes.push(elapsed);
      pendingPinch=null;
    }
  }
  if(armMeasurement && !armMeasurement.done) {
    if(phase!==armMeasurement.phase || handInput!==armMeasurement.handInput ||
      (handInput && !handSeen && now>=armMeasurement.settle)) {
      armMeasurement.done=true;
      armMeasurement.interrupted=true;
    } else if(now>=armMeasurement.settle) {
      const count=++armMeasurement.frames;
      shotDelta.copy(claw).sub(shotMean);
      shotMean.addScaledVector(shotDelta,1/count);
      armMeasurement.sum+=shotDelta.dot(shotResidual.copy(claw).sub(shotMean));
      armMeasurement.done=now-armMeasurement.settle>=3000;
    }
  }
  if(now-lastPerformanceTextTime<250) return;
  lastPerformanceTextTime=now;
  $("measureArm").disabled=!workMode || !phase.endsWith("Work");
  const {render,memory}=renderer.info;
  const details=[
    "Carga y lectura del GLB · "+metric(exteriorLoadMs,0)+" ms",
    "Último cuadro · "+render.calls+" llamadas de dibujo · "+render.triangles.toLocaleString("es-CL")+" triángulos enviados al render",
    "Memoria actual · "+memory.geometries+" geometrías · "+memory.textures+" texturas"
  ];
  if(sample) {
    const fps=sample.ms ? sample.frames*1000/sample.ms : null;
    details.push(
      "Medición "+(sample.interrupted ? "interrumpida por cambio de vista o control" : sample.done ? "completa" : "en curso")+
        " · "+({exterior:"apertura",manipulation:"manipulación",cabin:"cabina",trap:"experimento"})[sample.mode]+
        " · "+sample.input+" · "+metric(sample.ms/1000,1)+" s",
      metric(fps,1)+" FPS · "+metric(mean(sample.calls,sample.frames),1)+" llamadas · "+metric(mean(sample.triangles,sample.frames),0)+" triángulos",
      "MediaPipe · "+metric(mean(sample.inferenceSum,sample.inferenceCount),1)+" ms por análisis · "+sample.inferenceCount+" cuadros de vídeo",
      "Pellizco detectado → primera respuesta enviada al render · "+metric(mean(pinchTimes.reduce((a,b)=>a+b,0),pinchTimes.length),1)+" ms ("+pinchTimes.length+")"
    );
  }
  if(armMeasurement) {
    const sample=armMeasurement;
    const rms=sample.frames>1 ? 100*Math.sqrt(Math.max(0,sample.sum)/sample.frames) : null;
    details.push(sample.interrupted ? "Prueba de estabilidad interrumpida. Mantén la mano visible." :
      sample.frames ? "Variación RMS de la punta · "+metric(rms,2)+" cm"+(sample.done ? "" : " · midiendo") :
        "Mantén el cursor quieto · preparando medición");
  }
  const label=details.join("\n");
  if(label!==lastPerformanceText) readout.textContent=lastPerformanceText=label;
}
let lastPerformanceTextTime=-Infinity;
