"use strict";

let cabinInstalled=false;
let cabinEye, cabinPorts;
let systemsCanvas, systemsTexture;
let nextPortFrame=0, nextInstrumentFrame=0;
let instrumentCamera, instrumentFeed;
let instrumentSubject=null;
const cabinOrigin=new T.Vector3();
const cabinTarget=new T.Vector3();
const cabinSweep=new T.Vector3();

function finishCabinPanels(model){
  // Fine machining marks modulate roughness while preserving the GLB's base colours.
  const grain=new Uint8Array(64*64*4);
  let seed=127;
  for(let y=0;y<64;y++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const row=216+(seed>>>28);
    for(let x=0;x<64;x++){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const k=4*(y*64+x);
      grain[k]=grain[k+1]=grain[k+2]=row+(seed>>>28);grain[k+3]=255;
    }
  }
  const finish=new T.DataTexture(grain,64,64);
  finish.wrapS=finish.wrapT=T.RepeatWrapping;finish.repeat.set(3,8);
  finish.generateMipmaps=true;finish.minFilter=T.LinearMipmapLinearFilter;
  finish.magFilter=T.LinearFilter;finish.needsUpdate=true;
  model.traverse(object=>{
    if(!object.isMesh) return;
    const mat=object.material;
    mat.fog=false;
    if(/aluminio|anodizado|esmalte|paramentos/i.test(mat.name)) mat.roughnessMap=finish;
  });
}

function installCabin(model){
  cockpit.clear();
  cabinCamera.remove(cockpit);
  cockpit.position.copy(cabinCamera.position);
  cockpit.quaternion.copy(cabinHeading);
  model.position.z=-1.70;
  cockpit.add(model);
  scene.add(cockpit);
  finishCabinPanels(model);
  const lamp=new T.PointLight(0xffe6cb,4.5,4,1.7);
  lamp.position.set(-.55,.63,-.90);
  const instrumentLamp=new T.PointLight(0xc5eaec,1.9,3,2);
  instrumentLamp.position.set(.54,.16,-.98);
  cockpit.add(lamp,instrumentLamp);

  // Recessed ceiling luminaire and the seal hardware on the three pressure ports.
  const alloy=new T.MeshStandardMaterial({color:0x66706e,roughness:.48,metalness:.48,fog:false});
  const gasket=new T.MeshStandardMaterial({color:0x273334,roughness:.85,fog:false});
  const block=new T.BoxGeometry(1,1,1);
  const hood=new T.Mesh(block,gasket);
  hood.position.set(0,.605,.012);hood.scale.set(1.23,.074,.085);model.add(hood);
  const diffuser=new T.Mesh(block,new T.MeshBasicMaterial({color:0xf3e5cc,toneMapped:false,fog:false}));
  diffuser.position.set(0,.592,.057);diffuser.scale.set(1.13,.016,.009);model.add(diffuser);
  const fasteners=new T.InstancedMesh(new T.CylinderGeometry(.011,.012,.012,6),alloy,24);
  // Two cable looms follow the instrument rack and turn into the starboard console.
  for(const offset of [0,.028]){
    const points=[[1.12,.57,.19],[1.12,.48,.22],[1.11,.39,.24],[1.10,.28,.24],
      [1.10,-.18,.24],[1.09,-.27,.25],[1.03,-.33,.27],[.99,-.39,.28]];
    const conduit=new T.CatmullRomCurve3(points.map(([x,y,z])=>new T.Vector3(x+offset,y,z)));
    model.add(new T.Mesh(new T.TubeGeometry(conduit,24,.009,8,false),gasket));
  }
  for(const y of [.31,.04,-.17]){
    const clip=new T.Mesh(block,alloy);clip.position.set(1.116,y,.249);
    clip.scale.set(.067,.016,.016);model.add(clip);
  }
  const bolt=new T.Object3D();bolt.rotation.x=Math.PI/2;
  let boltIndex=0;

  cabinEye=new T.PerspectiveCamera(39,1,.06,24);
  cabinPorts=[[-.67,.175,.204,-.64],[0,.205,.263,0],[.67,.175,.204,.64]].map(([x,y,r,side])=>{
    const seal=new T.Mesh(new T.TorusGeometry(r+.010,.010,8,64),gasket);
    seal.position.set(x,y,-.042);model.add(seal);
    for(let i=0;i<8;i++){
      const angle=(i+.5)*Math.PI/4;
      bolt.position.set(x+(r+.038)*Math.cos(angle),y+(r+.038)*Math.sin(angle),-.039);
      bolt.updateMatrix();fasteners.setMatrixAt(boltIndex++,bolt.matrix);
    }
    const target=new T.WebGLRenderTarget(192,192,{depthBuffer:true});
    // A circular aperture with a rendered view of the actual seabed.
    const lens=new T.Mesh(new T.CircleGeometry(r,48),new T.MeshBasicMaterial({map:target.texture,fog:false}));
    lens.position.set(x,y,-.051);
    model.add(lens);
    const reflection=new T.Mesh(new T.TorusGeometry(r*.90,.003,4,24,.9),
      new T.MeshBasicMaterial({color:0x91bbaa,transparent:true,opacity:.26,fog:false}));
    reflection.rotation.z=1.73;
    reflection.position.set(x,y,-.047);
    model.add(reflection);
    return {target,side};
  });
  model.add(fasteners);
  workMonitor=new T.Mesh(new T.PlaneGeometry(.49,.291), new T.MeshBasicMaterial({map:displayTexture,fog:false}));
  workMonitor.position.set(.54,-.34,.282);
  model.add(workMonitor);
  monitorSize.set(.49,.291);
  // The pilot's display receives an optical view from the actual manipulator mount.
  instrumentFeed=new T.WebGLRenderTarget(288,100);
  instrumentFeed.texture.colorSpace=T.SRGBColorSpace;
  instrumentCamera=new T.PerspectiveCamera(29,2.88,.025,32);
  // Exclude the housing around the optical head from its own feed.
  const feed=new T.Mesh(new T.PlaneGeometry(.443,.154),
    new T.MeshBasicMaterial({map:instrumentFeed.texture,fog:false,toneMapped:false}));
  feed.position.set(0,.002,.0015);
  workMonitor.add(feed);

  const bezel=new T.MeshStandardMaterial({color:0x263534,metalness:.46,roughness:.42,fog:false});
  for(const [x,y,w,h] of [[-.256,0,.014,.318],[.256,0,.014,.318],[0,.156,.525,.013],[0,-.156,.525,.013]]){
    const edge=new T.Mesh(block,bezel);edge.position.set(x,y,-.003);edge.scale.set(w,h,.020);workMonitor.add(edge);
  }
  systemsCanvas=Object.assign(document.createElement("canvas"),{width:300,height:174});
  systemsTexture=new T.CanvasTexture(systemsCanvas);
  systemsTexture.colorSpace=T.SRGBColorSpace;
  const systems=new T.Mesh(new T.PlaneGeometry(.31,.185),new T.MeshBasicMaterial({map:systemsTexture,fog:false}));
  systems.position.set(-.27,-.355,.282);
  model.add(systems);
  cabinInstalled=true;
  $("activate").classList.add("opticalMonitor");
  resizeCabin();
}

function resizeCabin(){
  if(!cabinInstalled) return;
  const horizontal=Math.tan(T.MathUtils.degToRad(cabinCamera.fov/2))*cabinCamera.aspect;
  cockpit.scale.set(Math.min(1.18,horizontal/.79),1,1);
}

function poseCabin(progress){
  if(!cabinInstalled) return;
  const lookingAtControls=phase==="entry" ? progress : 1;
  cabinCamera.translateX(.066*lookingAtControls);
  cabinCamera.translateY(-.017*lookingAtControls);
  cabinCamera.quaternion.copy(cabinHeading);
  cabinCamera.rotateY(-.155*lookingAtControls);
  cabinCamera.rotateX(-.110*lookingAtControls);
}

function updateCabinPorts(now){
  if(!cabinInstalled || !cockpit.visible || !vehicleAnchors || now<nextPortFrame) return;
  nextPortFrame=now+100;
  const saved=renderer.getRenderTarget();
  const level=ambient.intensity, roomFill=fill.intensity;
  const previousSub=sub.visible,previousArm=armAssembly.visible;
  const sway=.15*Math.sin(now*.0006);
  cabinOrigin.copy(sub.position).add(vec(4.66,2.74,0));
  cockpit.visible=false;
  try {
    // Reveal the bow lights for the three exterior feeds, keeping the hull out
    // of the interior instrument's render pass.
    sub.visible=true;
    armAssembly.visible=false;
    ambient.intensity=.079;
    fill.intensity=0;
    for(const {target,side} of cabinPorts){
      cabinEye.position.copy(cabinOrigin);
      cabinEye.position.z-=side*.34;
      cabinTarget.copy(cabinOrigin).add(cabinSweep.set(4.2,-2.30,side*2.65+sway));
      cabinEye.lookAt(cabinTarget);
      renderer.setRenderTarget(target);
      hadalWater.update(now,cabinEye,"nav",vehicleLights,beam,target.height,false);
      renderer.render(scene,cabinEye);
    }
    if(now>=nextInstrumentFrame){
      nextInstrumentFrame=now+190;
      const sample=phase==="wormPrompt"?wormRecord:rockRecord;
      vehicleAnchors.ManipulatorCameraAnchor.localToWorld(instrumentCamera.position.set(.17,.17,-.31));
      instrumentCamera.lookAt(sample.point);
      const distance=instrumentCamera.position.distanceTo(sample.point);
      const halfHeight=sample===wormRecord ? .24 : .27;
      instrumentCamera.fov=T.MathUtils.clamp(2*T.MathUtils.radToDeg(Math.atan(halfHeight/Math.max(.12,distance))),4,51);
      instrumentCamera.updateProjectionMatrix();
      // The optical channel uses the work lights, including the low level used on tissue.
      setVehicleLights(sample===wormRecord?19:126,sample===wormRecord?24:154);
      aimDeckLights(sample.point);
      renderer.setRenderTarget(instrumentFeed);
      hadalWater.update(now,instrumentCamera,"nav",vehicleLights,beam,instrumentFeed.height,false);
      renderer.render(scene,instrumentCamera);
      instrumentSubject=sample;
    }
  } finally {
    renderer.setRenderTarget(saved);
    cockpit.visible=true;
    armAssembly.visible=previousArm;
    sub.visible=previousSub;
    lightCabinExterior();
    ambient.intensity=level;
    fill.intensity=roomFill;
    hadalWater.update(now,cabinCamera,"cabin",vehicleLights,beam);
  }
}

function photographInstrument(sample){
  if(!instrumentFeed || instrumentSubject!==sample) return;
  const w=160,h=instrumentFeed.height;
  const pixels=new Uint8Array(w*h*4);
  renderer.readRenderTargetPixels(instrumentFeed,(instrumentFeed.width-w)/2,0,w,h,pixels);
  const tile=document.createElement("canvas");
  tile.width=w;tile.height=h;
  const ctx=tile.getContext("2d"), image=ctx.createImageData(w,h);
  for(let row=0;row<h;row++){
    image.data.set(pixels.subarray(row*w*4,(row+1)*w*4),(h-row-1)*w*4);
  }
  ctx.putImageData(image,0,0);
  sample.image=tile.toDataURL();
}

function drawCabinInstruments(now){
  const display=displayCanvas.getContext("2d");
  const precise=phase==="wormPrompt";
  const ready=phase==="rockPrompt" || precise;
  const monitorTitle=ready ? precise ? "POLIQUETO HADAL" : "MUESTRA GEOLÓGICA" : "OBSERVACIÓN";
  display.fillStyle="#0c2022";
  display.fillRect(0,0,384,256);
  display.fillStyle="#19373a";
  display.fillRect(0,0,384,46);
  display.font="bold 20px monospace";
  display.fillStyle="#ceefe4";
  if(!ready) display.fillText(monitorTitle,17,30);
  display.font="bold 22px monospace";
  display.fillStyle=ready?"#a8ead0":"#b8ccc8";
  if(!ready) display.fillText("CÁMARA DEL BRAZO",17,236);
  displayTexture.needsUpdate=true;

  const sys=systemsCanvas.getContext("2d");
  sys.fillStyle="#122325";
  sys.fillRect(0,0,300,174);
  sys.font="bold 28px monospace";
  sys.fillStyle="#a9dbcb";
  sys.fillText("BITÁCORA",15,40);
  sys.font="bold 49px monospace";
  sys.fillText(entries.length+" / 2",15,111);
  sys.font="22px monospace";
  sys.fillText("MUESTRAS",15,149);
  systemsTexture.needsUpdate=true;
}
