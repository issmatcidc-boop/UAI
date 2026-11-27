"use strict";

let vehicleAnchors=null, exteriorLoadMs=null, wormMixer=null;
let wormUndulation, wormResponse, responseWeight=0;
function animatePolychaete(dt){
  if(!wormMixer) return;
  let near=0;
  if(phase==="wormWork") near=1-T.MathUtils.smoothstep(claw.distanceTo(wormRecord.point),.08,.54);
  responseWeight=T.MathUtils.damp(responseWeight,near,4,dt);
  wormResponse.setEffectiveWeight(responseWeight*.8);
  wormUndulation.setEffectiveWeight(1-responseWeight*.8);
  wormMixer.update(dt);
}
const vehicleLights=[];
const introFocus=new T.Vector3();
const cameraRail=new T.Vector3();

function refreshStartButtons() {
  $("start").disabled=$("exhibition").disabled=!vehicleAnchors || enabling;
  $("prepareMission").disabled=!vehicleAnchors || enabling;
  $("coverHands").disabled=!vehicleAnchors;
  $("openDeveloperScene").disabled=!vehicleAnchors || enabling;
}

async function prepareRock(loader,loadAsset) {
  try {
    const asset=await loadAsset(loader,"muestra-geologica");
    const grip=asset.scene.getObjectByName("Punto_de_agarre");
    if(!grip) throw new Error("Falta Punto_de_agarre");
    const gripOffset=asset.root.worldToLocal(grip.getWorldPosition(new T.Vector3()));
    asset.root.position.sub(gripOffset);
    sampleRock.remove(backupRock);
    sampleRock.add(asset.root);
    sampleRock.userData.modelFile="modelos/muestra-geologica.glb";
  } catch(error) {
    console.warn("Se usó la roca provisional de respaldo.",error);
  }
  sampleRock.traverse(node=>{
    if(!node.isMesh) return;
    node.castShadow=true;
    node.receiveShadow=true;
  });
}

async function loadVehicle() {
  const status=$("vehicleStatus");
  if(location.protocol==="file:") {
    status.textContent="Abre INICIAR DEMO.cmd para cargar el sumergible.";
    return;
  }
  try {
    const [{GLTFLoader},{loadExperiment},{loadAsset}]=await Promise.all([
      import("./vendor/three/loaders/GLTFLoader.js"),import("./experimento/escena.mjs"),import("./modelos/carga.mjs")
    ]);
    const loader=new GLTFLoader();
    const cabinLoad=loader.loadAsync("./modelos/cabina.glb").catch(error=>{
      console.warn("Se usó la cabina de respaldo.",error);
    });
    try {
      const {scene:terrain}=await loader.loadAsync("./entorno/fondo.glb");
      const surface=terrain.getObjectByName("Fondo_hadal");
      if(!surface?.isMesh) throw new Error("Falta la superficie del terreno");
      terrain.traverse(node=>{if(node.isMesh) node.receiveShadow=true;});
      shadeHadalSurface(surface);
      const rocks=terrain.getObjectByName("Rocas_del_talud");
      if(rocks?.isMesh) shadeHadalSurface(rocks,true);
      seaFloor.removeFromParent();
      scene.add(terrain);
      routeStones.visible=false;
      terrain.updateMatrixWorld(true);
      seaFloor=surface;
    } catch(error) {
      // Keep the baseline floor usable if the environment has been removed or is corrupt.
      console.warn("Se usó el fondo de respaldo.",error);
    }
    const down=new T.Vector3(0,-1,0);
    const seabed=new T.Raycaster(new T.Vector3(),down,0,7);
    function groundAt(x,z) {
      seabed.ray.origin.set(x,2,z);
      return seabed.intersectObject(seaFloor,false)[0]?.point.y??0;
    }
    colocarFragmentos(scene,groundAt);
    for(const stone of routeStones.children) stone.position.y=groundAt(stone.position.x,stone.position.z)-.026;
    const floorHeight=(x,z)=>groundAt(trap.position.x+x,trap.position.z+z);
    trap.position.y=(floorHeight(-.52,0)+floorHeight(.52,0))*.5-.006;
    const started=performance.now();
    const [gltf,feedingScene,wormAsset]=await Promise.all([
      loader.loadAsync("./modelos/sumergible.glb").then(asset=>{
        exteriorLoadMs=performance.now()-started;
        return asset;
      }),
      loadExperiment(loader,(x,z)=>floorHeight(x,z)-trap.position.y),
      loadAsset(loader,"biologia/poliqueto",.46),
      prepareRock(loader,loadAsset)
    ]);
    const rockBounds=new T.Box3().setFromObject(sampleRock,true);
    const rockBottom=rockBounds.min.y-sampleRock.position.y;
    const rockSize=rockBounds.getSize(new T.Vector3());
    rockRecord.point.y=groundAt(rockRecord.point.x,rockRecord.point.z)-rockBottom-.011;
    sampleRock.position.copy(rockRecord.point);
    rockBasketSeat.y=Math.max(.10,-rockBottom+.012);
    rockRecord.gripReach=T.MathUtils.clamp(.66*Math.max(rockSize.x,rockSize.z),.22,.34);
    const exterior=gltf.scene.getObjectByName("Fendouzhe_Root");
    if(!exterior) throw new Error("Falta Fendouzhe_Root");
    const names=[
      "InteriorEntryAnchor","ManipulatorCameraAnchor","ExteriorIntroCameraTarget",
      "ExteriorLightAnchor_L","ExteriorLightAnchor_R","ArmMount_L","ArmMount_R","BasketDropPoint"
    ];
    const anchors=Object.fromEntries(names.map(name=>[name,exterior.getObjectByName(name)]));
    if(Object.values(anchors).some(anchor=>!anchor)) {
      throw new Error("Faltan anclajes de cámara o manipulación");
    }
    // Keep the interaction point at the centre of the animal, just above the sediment.
    const polychaete=wormAsset.root;
    const wormHeight=polychaete.userData.height;
    wormMixer=new T.AnimationMixer(wormAsset.scene);
    wormUndulation=wormMixer.clipAction(wormAsset.animations.find(a=>a.name==="Ondulacion")).play();
    wormResponse=wormMixer.clipAction(wormAsset.animations.find(a=>a.name==="Respuesta")).setEffectiveWeight(0).play();
    polychaete.position.y=-wormHeight/2;
    polychaete.rotation.y=1.06;
    worm.add(polychaete);
    polychaete.traverse(node=>{if(node.isMesh) node.castShadow=true;});
    wormRecord.point.y=groundAt(wormRecord.point.x,wormRecord.point.z)+wormHeight/2;
    worm.position.copy(wormRecord.point);
    // Cabin port cameras omit exterior triangles but still see the lights
    // on their child anchors, which use the default lighting layer.
    exterior.traverse(node=>{if(node.isMesh)node.layers.set(1);});
    for(const cam of [introCamera,workCamera,routeCamera,trapCamera])cam.layers.enable(1);
    prepareHullReflection(exterior);
    sub.add(exterior);
    anchors.ArmMount_R.add(armAssembly);
    try {
      const [{scene:rig},{montarManipulador}]=await Promise.all([
        loader.loadAsync("./modelos/manipulador.glb"), import("./modelos/manipulador.mjs")
      ]);
      manipulator=montarManipulador(rig,armAssembly);
    } catch(error) {
      console.warn("Se ha cargado la pinza de respaldo.",error);
    }
    anchors.ManipulatorCameraAnchor.add(workCamera);
    workCamera.position.set(0.17,0.17,-0.31);
    workCamera.lookAt(sub.localToWorld(vec(6.10,0.51,0.25)));
    // The inspection return belongs to the optical housing, even while the
    // display reframes the basket. Preserve its neutral working pose.
    anchors.ManipulatorCameraAnchor.attach(inspectionLamp);
    for(const side of ["L","R"]) {
      const spot=new T.SpotLight(side==="L" ? 0xd0e4ea : 0xf2e9d7,0,16,.59,.86,1.94);
      anchors["ExteriorLightAnchor_"+side].add(spot);
      spot.position.set(0,0,0);
      spot.target.position.set(7.6,-2.0,side==="L" ? -0.80 : 1.23);
      if(side==="R") {
        spot.shadow.mapSize.set(512,512);
        spot.shadow.camera.near=.30;
        spot.shadow.camera.far=9;
        spot.shadow.bias=-.00015;
        spot.shadow.normalBias=.026;
        spot.shadow.radius=2;
      }
      sub.add(spot.target);
      // A short-range diffuse return from the illuminated water in front
      // of each housing grazes paint and instrument rims near the bow.
      const spill=new T.PointLight(spot.color,0,6,2);
      spot.add(spill);
      spot.userData.spill=spill;
      vehicleLights.push(spot);
    }
    vehicleAnchors=anchors;
    const cabin=await cabinLoad;
    if(cabin) installCabin(cabin.scene);
    experiment=feedingScene;
    trap.add(experiment.root);
    syncVehicle();
    claw.copy(parkedClaw);
    setVehicleLights();
    hadalWater.installOptics(scene,seaFloor);
    warmSurveyCameras();
    status.hidden=true;
  } catch(error) {
    console.error("Error al cargar la escena de la misión",error);
    status.textContent="No se pudo cargar la escena. Verifica las carpetas modelos y experimento y vuelve a abrir INICIAR DEMO.cmd.";
  } finally {
    refreshStartButtons();
  }
}

function setVehicleLights(left=0,right=0) {
  if(workMode) {
    left=phase.startsWith("worm") ? 19 : 126;
    right=phase.startsWith("worm") ? 24 : 154;
  }
  if(vehicleLights.length) {
    vehicleLights[0].angle=.59;
    vehicleLights[1].angle=.59;
    vehicleLights[0].target.position.set(workMode ? 6.3 : 7.6,workMode ? -.30 : -2.0,-.80);
    vehicleLights[1].target.position.set(workMode ? 6.3 : 7.6,workMode ? -.30 : -2.0,1.23);
    vehicleLights[1].castShadow=workMode;
    vehicleLights[0].intensity=left;
    vehicleLights[1].intensity=right;
    for(const [i,spot] of vehicleLights.entries()){
      const spill=spot.userData.spill;
      spill.position.set(1.05,.20,i===0 ? -.32 : .32);
      spill.intensity=viewMode==="exterior" ? spot.intensity*.17 : 0;
    }
    vehicleLights[0].visible=left>0;
    vehicleLights[1].visible=right>0;
  }
}

function moveExteriorCamera(eased) {
  vehicleAnchors.ExteriorIntroCameraTarget.getWorldPosition(introFocus);
  // Frame the whole hull and gradually direct the eye toward the entry viewport.
  introFocus.x-=2.7-0.52*eased;
  vehicleAnchors.InteriorEntryAnchor.getWorldPosition(cameraRail);
  introFocus.lerp(cameraRail,0.73*eased**2);
  introCamera.position.copy(sub.position).add(cameraRail.set(7.5+.8*eased,1.45+1.55*eased,9.6-7.9*eased));
  introCamera.lookAt(introFocus);
}
