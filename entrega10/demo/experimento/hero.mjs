import * as T from "three";
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const smooth=T.MathUtils.smoothstep;
const clamp=T.MathUtils.clamp;

export function driveHero(asset,parent,site,ground,footprint){
  const actor=asset.root, mesh=actor.getObjectByName("Anfipodo_Malla");
  const mixer=new T.AnimationMixer(asset.scene);
  const actions=Object.fromEntries(asset.animations.map(c=>[c.name,mixer.clipAction(c).play()]));
  const pos=mesh.geometry.attributes.position;
  const soles=new Map();
  let mouth=0,best=Infinity;
  const vertex=V(), basis=new T.Matrix4(), inv=new T.Matrix4();
  for(let i=0;i<pos.count;i++){
    vertex.fromBufferAttribute(pos,i);
    // Ventral surface of the cephalon, between the antenna roots.
    const distance=vertex.distanceToSquared({x:-.045,y:-.071,z:.918});
    if(distance<best){best=distance;mouth=i;}
    const key=Math.floor(vertex.z*12)*2+Number(vertex.x>0);
    if(!soles.has(key)||vertex.y<pos.getY(soles.get(key)))soles.set(key,i);
  }
  const facing=V(-1,0,0), delta=V(), mouthLocal=V(), mouthPoint=V(), dir=V();
  const angles=parent.rotation.clone(), turn=new T.Quaternion(),landing=new T.Quaternion().setFromEuler(angles.set(0,-.16,.54,"YXZ"));
  const normal=site.hero.n, food=site.hero.p;
  const modelToParent=()=>{
    parent.updateWorldMatrix(true,false); parent.updateMatrixWorld(true);
    basis.copy(inv.copy(parent.matrixWorld).invert()).multiply(mesh.matrixWorld);
  };
  function pose(weights,time){
    for(const [name,action] of Object.entries(actions))action.setEffectiveWeight(weights[name]||0);
    mixer.setTime(time);
    modelToParent();
  }
  pose({Alimentacion:1},0);
  mesh.getVertexPosition(mouth,mouthLocal).applyMatrix4(basis);
  const end=food.clone().addScaledVector(normal,.00045).sub(mouthLocal.clone().applyQuaternion(landing));
  const curve=new T.CubicBezierCurve3(V(.035,.31,-.066),V(.18,.318,-.106),
    end.clone().add(V(.135,.074,.044)),end);
  // These offsets are evaluated on the actual posed mesh, in metres.
  const status={state:"",gap:Infinity,alignment:0,clearance:0,weight:0};
  const curvePos=V(),heading=V(),foot=V(),temp=V();
  const update=(time)=>{
    const t=clamp(time/7.2,0,1);
    const pulse=t+.022*Math.sin(2*Math.PI*time/1.5)*Math.sin(Math.PI*t)**2;
    const u=smooth(pulse,0,1);
    curve.getPointAt(u,curvePos);
    curve.getTangentAt(u,heading);
    turn.setFromEuler(angles.set(0,Math.atan2(heading.z,-heading.x),-Math.asin(clamp(heading.y,-1,1)),"YXZ"));
    parent.quaternion.copy(turn).slerp(landing,smooth(u,.55,.96));
    parent.position.copy(curvePos);
    const settled=smooth(u,.70,.996);
    pose({Natacion:1-settled,Reposo:settled},time);
    mesh.getVertexPosition(mouth,mouthLocal).applyMatrix4(basis);
    // The approach ends on the photographed bait mesh. Allow only millimetric
    // postural adjustment as the moving cephalon transitions to contact.
    delta.copy(food).addScaledVector(normal,.00045).sub(temp.copy(mouthLocal).applyQuaternion(parent.quaternion)).sub(end);
    parent.position.addScaledVector(delta,settled);
    function landmarks(){
      mesh.getVertexPosition(mouth,mouthPoint).applyMatrix4(basis).applyQuaternion(parent.quaternion).add(parent.position);
      dir.copy(facing).applyQuaternion(parent.quaternion);
      status.gap=mouthPoint.distanceTo(food);
      status.alignment=-dir.dot(normal);
      status.clearance=Infinity;
      // Check the bait height under abdomen and thorax along the approach.
      for(const offset of [.001,.026,.050]){
        temp.set(offset,.027,0).applyQuaternion(parent.quaternion).add(parent.position);
        let top=-Infinity;
        for(const {p} of site.points) if(Math.abs(p.x-temp.x)<.012 && Math.abs(p.z-temp.z)<.015)top=Math.max(top,p.y);
        status.clearance=Math.min(status.clearance,temp.y-top,temp.y-ground(temp.x,temp.z));
      }
    }
    landmarks();
    const gate=dir.y<-.16 && status.alignment>.17 && status.clearance>.002 && settled>.96;
    const meal=gate ? 1-smooth(status.gap,.0007,.006) : 0;
    if(meal>0){
      pose({Natacion:1-settled,Reposo:settled*(1-meal),Alimentacion:settled*meal},time);
      mesh.getVertexPosition(mouth,temp).applyMatrix4(basis);
      parent.position.addScaledVector(mouthLocal.sub(temp).applyQuaternion(parent.quaternion),1);
      landmarks();
    }
    status.weight=meal;
    status.state=meal>.9?"alimentacion":settled>.1?"aproximacion":"natacion";
    footprint.visible=false;
  };
  function crawl(time,startX=.30,z=.39){
    pose({Marcha:1},time);
    const x=startX-.034*time;
    parent.quaternion.identity();
    parent.position.set(x,ground(x,z),z);
    let lift=-Infinity;
    for(const idx of soles.values()){
      mesh.getVertexPosition(idx,foot).applyMatrix4(basis);
      lift=Math.max(lift,ground(x+foot.x,z+foot.z)-parent.position.y-foot.y);
    }
    parent.position.y+=lift+.0005;
    footprint.visible=true;
  }
  return {update,crawl,status,food};
}

