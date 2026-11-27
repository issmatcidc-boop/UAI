import * as T from "three";
import {loadAsset} from "../modelos/carga.mjs";
import {createTrapFrame} from "./trampa.mjs";
import {createColony} from "./colonia.mjs";
import {foodContacts} from "./alimento.mjs";
import {driveHero} from "./hero.mjs";

const v=(x,y,z)=>new T.Vector3(x,y,z);
const standOff=.0018;

function contactMaterial(){
  const canvas=Object.assign(document.createElement("canvas"),{width:128,height:128});
  const ctx=canvas.getContext("2d");
  const gradient=ctx.createRadialGradient(64,64,6,64,64,63);
  gradient.addColorStop(0,"rgba(13,17,14,.60)");
  gradient.addColorStop(.4,"rgba(13,17,14,.40)");
  gradient.addColorStop(1,"rgba(13,17,14,0)");
  ctx.fillStyle=gradient;
  ctx.fillRect(0,0,128,128);
  return new T.MeshBasicMaterial({
    map:new T.CanvasTexture(canvas),transparent:true,depthWrite:false,polygonOffset:true,
    polygonOffsetFactor:-1,polygonOffsetUnits:-1
  });
}

// The terrain is stationary. Sample only the footprint of the experiment at
// load time so locomotion never raycasts the entire seafloor per foot per frame.
function sampleFloor(groundAt){
  const step=.06,x0=-.84,z0=-.42,cols=29,rows=21;
  const h=new Float32Array(cols*rows);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)h[j*cols+i]=groundAt(x0+step*i,z0+step*j);
  return (x,z)=>{
    const u=T.MathUtils.clamp((x-x0)/step,0,cols-1),w=T.MathUtils.clamp((z-z0)/step,0,rows-1);
    const i=Math.min(cols-2,Math.floor(u)),j=Math.min(rows-2,Math.floor(w)),n=j*cols+i;
    return T.MathUtils.lerp(T.MathUtils.lerp(h[n],h[n+1],u-i),
      T.MathUtils.lerp(h[n+cols],h[n+cols+1],u-i),w-j);
  };
}

export async function loadExperiment(loader,groundAt) {
  const ground=sampleFloor(groundAt);
  const [beforeAsset,afterAsset,trapAsset,heroAsset,crowdFile]=await Promise.all([
    loadAsset(loader,"jurel-antes",.34),
    loadAsset(loader,"jurel-despues",.33),
    loadAsset(loader,"trampa"),
    loadAsset(loader,"biologia/anfipodo",.135,-Math.PI/2),
    loadAsset(loader,"biologia/anfipodo-multitud",.079,-Math.PI/2)
  ]);
  const animal=heroAsset.root;
  const frame=createTrapFrame(trapAsset.root);
  const {root,before,after,fullAnchor,consumedAnchor,target}=frame;
  fullAnchor.add(beforeAsset.root);
  consumedAnchor.add(afterAsset.root);
  for(const bait of [beforeAsset.root,afterAsset.root]){
    bait.traverse(object=>{
      if(!object.isMesh) return;
      object.material.color.multiply(new T.Color(.82,.70,.72));
      object.material.metalness=.16;
      object.material.roughness=.86;
    });
  }
  fullAnchor.rotation.y=.06;
  consumedAnchor.rotation.y=.35;
  // Seat each original piece on the tray with enough separation to read its cut.
  const pieceBounds=new T.Box3(), pieceCenter=v(0,0,0);
  const offsets=[[-.109,-.024],[.019,.016],[.129,.089]];
  before.updateWorldMatrix(true,true);
  ["grande","mediano","pequeño"].forEach((size,i)=>{
    const piece=beforeAsset.root.getObjectByName("Trozo_"+size);
    if(!piece) return;
    if(size==="pequeño") piece.rotateY(.47);
    pieceBounds.setFromObject(piece);
    pieceBounds.getCenter(pieceCenter);
    pieceCenter.y=pieceBounds.min.y;
    const [x,z]=offsets[i];
    const seat=fullAnchor.localToWorld(v(x,-.004,z));
    piece.position.add(piece.parent.worldToLocal(seat).sub(piece.parent.worldToLocal(pieceCenter)));
  });
  const contact=contactMaterial();
  const footprint=new T.PlaneGeometry(1.48,.76,18,10).rotateX(-Math.PI/2);
  const points=footprint.attributes.position;
  for(let i=0;i<points.count;i++) points.setY(i,ground(points.getX(i),points.getZ(i))+standOff);
  const trapShade=new T.Mesh(footprint,contact);
  root.add(trapShade);
  const contactStrip=new T.PlaneGeometry(1.21,.26,16,4).rotateX(-Math.PI/2);
  const stripVertices=contactStrip.attributes.position;
  for(let i=0;i<stripVertices.count;i++){
    stripVertices.setY(i,ground(stripVertices.getX(i),stripVertices.getZ(i))+standOff+.001);
  }
  root.add(new T.Mesh(contactStrip,contact));
  const food=foodContacts(afterAsset.root);
  const populations=createColony(frame,crowdFile,ground,food);

  const heroParent=new T.Group();
  heroParent.name="HeroForegroundPath";
  heroParent.add(animal);
  const heroShade=new T.Mesh(new T.PlaneGeometry(.104,.052),contact);
  heroShade.rotation.x=-Math.PI/2;
  heroShade.position.y=standOff;
  heroParent.add(heroShade);
  root.add(heroParent);
  const behavior=driveHero(heroAsset,heroParent,food,ground,heroShade);
  const heroPosition=heroParent.position;
  const look=v(0,0,0),eye=v(0,0,0),targetOffset=v(-.005,-.041,.225);
  // Put the closest portion of the crossing over the phrase that names the amphipods.
  function frameAt(phase,seconds,camera,moveCamera=true) {
    const late=phase==="trapAfter";
    before.visible=!late;
    after.visible=late;
    const progress=T.MathUtils.smoothstep(seconds,0,4.7);
    heroParent.visible=true;
    if(late) behavior.update(seconds);
    else behavior.crawl(Math.min(seconds,7),.42,.39);
    populations.update(seconds,late);

    if(moveCamera){
      const aspect=Math.max(.8,camera.aspect);
      const fov=T.MathUtils.degToRad(47)*.5;
      camera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(fov)*Math.max(1,1.61/aspect)));
      camera.updateProjectionMatrix();
      eye.set(-.345+.058*progress,.609-.038*progress,1.325-.056*progress);
      look.copy(target.position).add(targetOffset);
      if(late){
        const focus=T.MathUtils.smoothstep(seconds,.65,2.15)*(1-T.MathUtils.smoothstep(seconds,9.05,11.65));
        const body=heroPosition.clone(); body.y+=animal.userData.height*.49;
        look.lerp(body,focus);
        eye.lerp(body.add(v(-.095,.182,.345)),focus);
      }
      root.localToWorld(eye);
      root.localToWorld(look);
      camera.position.copy(eye);
      camera.lookAt(look);
    }
  }
  return {...frame,...populations,hero:animal,heroParent,behavior,frameAt};
}
