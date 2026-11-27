import * as T from "three";
import {bakeCrowdPoses,createCrowdInstances} from "./multitud.mjs";
import {axisHeight,radius} from "./trampa.mjs";

const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const up=V(0,1,0), palette=[0xfff4e1,0xf8c5b2,0xffd6d1];
export function createColony(frame,asset,ground,food){
  const mesh=asset.root.getObjectByName("Anfipodo_Malla");
  const poses=[], cycles={};
  for(const [key,count] of [["Marcha",10],["Alimentacion",8],["Natacion",12],["Reposo",6]]){
    const clip=asset.animations.find(c=>c.name===key);
    cycles[key]={firstPose:poses.length,poseCount:count};
    poses.push(...bakeCrowdPoses(asset.root,mesh,clip,count));
  }
  const tmp=V(),normal=V(),size=V(),q=new T.Quaternion(),yaw=new T.Quaternion();
  function create(i){
    const fraction=x=>x-Math.floor(x);
    return {matrix:new T.Matrix4(),color:new T.Color(palette[i%3]),
      phase:fraction(.17+i*.618034),speed:.54+.49*fraction(i*.4142+.31),
      size:.84+.30*fraction(i*.7321+.4),...cycles.Reposo};
  }
  const units=Array.from({length:29},(_,i)=>create(i));
  const arrivals=[create(35),create(36)];
  function place(unit,x,y,z,n,angle,action){
    Object.assign(unit,cycles[action]);
    q.setFromUnitVectors(up,n).multiply(yaw.setFromAxisAngle(up,angle));
    unit.matrix.compose(tmp.set(x,y,z),q,size.setScalar(unit.size));
  }
  // Feeding units stand on separate measured triangles. A nearby individual
  // without a food contact instead explores the outer wall.
  function tick(units,t,early=false){
    units.forEach((u,i)=>{
      const clock=t*u.speed+u.phase*8;
      if(!early && i<food.other.length){
        const {p,n}=food.other[i];
        place(u,p.x,p.y+.0008,p.z,n,Math.atan2(.035-p.z,p.x+.03),"Alimentacion");
      }else if(!early && i<18){
        const lane=i-food.other.length, angle=.22+.85*((lane*7%11)/11)+.17*Math.sin(clock*.41);
        normal.set(0,Math.cos(angle),Math.sin(angle));
        const x=-.4+.072*lane+.032*Math.sin(clock*.66);
        const speed=Math.cos(clock*.66);
        place(u,x,axisHeight+(radius+.0016)*normal.y,(radius+.0016)*normal.z,normal,
          .5+2.45*(.5+.5*Math.tanh(3*speed)),Math.abs(speed)<.36?"Reposo":"Marcha");
      }else if(!early && i>=25){
        const k=i-25, lane=T.MathUtils.smootherstep(t+u.phase*2,0,13+k);
        const start=k%2===0?.65:-.64, end=k%2===0?-.12:.17;
        const x=T.MathUtils.lerp(start,end,lane);
        const z=.37+.055*k+.086*Math.cos(Math.PI*lane+.37*k);
        const heading=Math.atan2(-.086*Math.PI*Math.sin(Math.PI*lane+.37*k),start-end);
        const bottom=ground(x,z)+.0018;
        const approach=k===0?T.MathUtils.smootherstep(lane,.35,.83):0;
        const height=(.15+.038*k+.028*Math.sin(2.6*lane+k))*(1-approach);
        place(u,x,bottom+height,z,up,heading,approach>.985?"Marcha":"Natacion");
      }else if(early || i<21){
        // Follow exterior lanes towards the bait odour. Stop at the foot of
        // the mesh. Individual arrival and exploration times differ.
        const k=early?i:i-18,sgn=k%2?1:-1;
        const tLocal=Math.max(0,t-u.phase*2.4);
        const uPath=T.MathUtils.smoothstep(tLocal,0,5.2+2*u.phase);
        const x=sgn*(.56-.34*uPath)+.035*k,z=.56-.255*uPath+.025*k;
        const angle=Math.atan2(-.255,sgn*.34);
        place(u,x,ground(x,z)+.002,z,up,angle,uPath>.98?"Reposo":"Marcha");
      }else{
        const k=early?i:i-18,sgn=k%2?1:-1;
        const angle=clock*.37+k*.31, x=sgn*(.39+.124*Math.cos(angle))+.018*k;
        const z=.34+.048*(k%3)+.058*(1+Math.sin(angle));
        const heading=Math.atan2(.058*Math.cos(angle),sgn*.124*Math.sin(angle));
        const explore=Math.abs(Math.sin(angle))<.30;
        place(u,x,ground(x,z)+.002,z,up,heading,explore?"Reposo":"Marcha");
      }
    });
  }
  tick(units,0);tick(arrivals,0,true);
  const after=createCrowdInstances(poses,mesh.material,units);
  const before=createCrowdInstances(poses,mesh.material,arrivals);
  frame.after.add(after.group);frame.before.add(before.group);
  return {count:units.length,population:after.group,arriving:before.group,update(seconds,late){
    if(late){tick(units,seconds);after.update(seconds);}
    else {tick(arrivals,seconds,true);before.update(seconds);}
  }};
}

