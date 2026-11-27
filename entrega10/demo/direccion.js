"use strict";

// Camera positions and lamp targets below are in metres, in the terrain's frame.
// Only smooth between cameras that really share the same exterior space.
const cruise = {
  start:vec(0,0,0), berth:vec(0,0,0), startEye:vec(0,0,0),
  startHeading:new T.Quaternion(), station:new T.PerspectiveCamera(),
  end:new T.PerspectiveCamera(), startFov:47,
};
const cameraOffset=vec(0,0,0), deckTarget=vec(0,0,0), surveyAim=vec(0,0,0);
const smoothTravel=t=>t*t*t*(t*(6*t-15)+10);
function fitSurveyLens(degrees){
  return 2*T.MathUtils.radToDeg(Math.atan(Math.tan(T.MathUtils.degToRad(degrees*.5))*Math.max(1,1.61/routeCamera.aspect)));
}
function macroPose(cam,t){
  cam.position.copy(wormRecord.point).add(cameraOffset.set(-.27+.14*t,.69-.41*t,1.32-.66*t));
  cam.lookAt(surveyAim.copy(wormRecord.point).add(cameraOffset.set(0,.017,0)));
  cam.fov=fitSurveyLens(47);
  cam.updateProjectionMatrix();
}
function beginCruise(next){
  cruise.start.copy(sub.position);
  cruise.berth.copy(trap.position).add(cameraOffset.set(-6.05,.24,1.68));
  if(next==="trapApproach"){
    cruise.station.aspect=routeCamera.aspect;
    experiment.frameAt("trapBefore",0,cruise.station);
    cruise.startEye.copy(sub.position).add(cameraOffset.set(5.75,1.48,1.50));
    cruise.end.position.copy(cruise.startEye);
    cruise.end.lookAt(surveyAim.copy(trap.position).add(cameraOffset.set(-1.30,.16,.83)));
    cruise.startHeading.copy(cruise.end.quaternion);
    cruise.startFov=fitSurveyLens(47);
  }else{
    cruise.startEye.copy(trapCamera.position);
    cruise.startHeading.copy(trapCamera.quaternion);
    cruise.startFov=trapCamera.fov;
    macroPose(cruise.end,0);
  }
}
function trackStation(progress){
  const approach=phase==="trapApproach";
  const t=smoothTravel(progress), arc=Math.sin(Math.PI*t);
  const end=approach ? cruise.station : cruise.end;
  // The vehicle backs out along the open side of the cage before returning to
  // manipulator range. Both paths settle at the survey stations with zero speed.
  sub.position.lerpVectors(cruise.start,approach ? cruise.berth : baseSub,t);
  sub.position.z+=arc*(approach ? .83 : 1.05);
  sub.position.y+=arc*.22;
  routeCamera.position.lerpVectors(cruise.startEye,end.position,t);
  routeCamera.position.z+=arc*(approach ? .83 : 1.05);
  routeCamera.position.y+=arc*(approach ? .22 : .44);
  routeCamera.quaternion.slerpQuaternions(cruise.startHeading,end.quaternion,t);
  routeCamera.fov=T.MathUtils.lerp(cruise.startFov,end.fov,t);
  routeCamera.updateProjectionMatrix();
  const food=deckTarget.copy(trap.position).add(cameraOffset.set(-.04,.14,.14));
  if(approach){
    surveyAim.copy(sub.position).add(cameraOffset.set(7.8,-.13,.25)).lerp(food,t);
  }else{
    surveyAim.lerpVectors(food,wormRecord.point,t);
  }
  aimDeckLights(surveyAim);
}
function aimDeckLights(worldTarget){
  // Both lamp housings move with the bow. Servo targets are stored in ship coordinates.
  const local=sub.worldToLocal(cameraOffset.copy(worldTarget));
  for(const [i,spot] of vehicleLights.entries()){
    spot.target.position.copy(local);
    spot.target.position.z+=i===0 ? -.30 : .14;
    spot.target.updateWorldMatrix(true,false);
  }
}
function lightCabinExterior(){
  setVehicleLights(110,138);
  aimDeckLights(sub.localToWorld(deckTarget.set(8.5,.08,.10)));
  vehicleLights[0].angle=.68;
  vehicleLights[1].angle=.59;
}
function directSurveyLamp(){
  // Wide port fill plus a warmer, shadow-casting key from starboard.
  setVehicleLights(19,48);
  vehicleLights[0].angle=.70;
  vehicleLights[1].angle=.45;
  vehicleLights[1].castShadow=true;
}
function warmSurveyCameras(){
  // Compile the actual screen and port passes while the loading cover is up.
  // Otherwise the first change in light/shadow layout can stall a whole shot.
  const oldMode=viewMode, oldCamera=camera;
  trap.visible=true;
  selectView("trap");
  directSurveyLamp();
  experiment.frameAt("trapAfter",2,trapCamera);
  renderer.compile(scene,trapCamera);
  renderer.render(scene,trapCamera);
  experiment.frameAt("trapBefore",0,trapCamera);
  selectView("manipulation");
  renderer.compile(scene,workCamera);
  renderer.render(scene,workCamera);
  selectView("cabin");
  lightCabinExterior();
  if(cabinInstalled)updateCabinPorts(performance.now());
  renderer.compile(scene,cabinCamera);
  renderer.render(scene,cabinCamera);
  selectView("exterior");
  setVehicleLights(90,110);
  renderer.compile(scene,introCamera);
  trap.visible=false;
  selectView(oldMode);
  camera=oldCamera;
}
function descentCamera(t){
  const entry=vehicleAnchors.InteriorEntryAnchor.getWorldPosition(deckTarget);
  // First watch from a depth-fixed position, then approach the bow from starboard.
  const dock=T.MathUtils.smootherstep(t,.40,1);
  introCamera.position.copy(baseSub).add(cameraOffset.set(9.55-.95*t,4.3+1.0*(1-t),8.65-.55*t));
  introCamera.position.lerp(surveyAim.copy(entry).add(cameraOffset.set(2.15,.58,.67)),dock);
  const focus=vehicleAnchors.ExteriorIntroCameraTarget.getWorldPosition(surveyAim);
  focus.x-=1.35;
  focus.y-=1.45*(1-dock);
  introCamera.lookAt(focus.lerp(entry,dock));
}
function departureCamera(){
  // Another exterior observation point, held just forward of the beginning of the ascent.
  introCamera.position.copy(baseSub).add(cameraOffset.set(8.1,2.95,6.8));
  const focus=vehicleAnchors.ExteriorIntroCameraTarget.getWorldPosition(deckTarget);
  focus.x-=1.6;
  focus.y-=.48;
  introCamera.lookAt(focus);
}

