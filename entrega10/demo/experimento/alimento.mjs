import * as T from "three";

const up=new T.Vector3(0,1,0);
// Called before the apparatus is mounted on the moving world transform.
// Keep triangle contacts in trap-local metres for the lifetime of the experiment.
export function foodContacts(bait){
  bait.updateWorldMatrix(true,true);
  const ray=new T.Raycaster(new T.Vector3(),new T.Vector3(0,-1,0),0,1);
  const normalMatrix=new T.Matrix3();
  const points=[];
  for(let x=-.22;x<=.18;x+=.011){
    for(let z=-.11;z<=.18;z+=.012){
      ray.ray.origin.set(x,.8,z);
      const hit=ray.intersectObject(bait,true)[0];
      if(!hit) continue;
      const n=hit.face.normal.clone().applyNormalMatrix(normalMatrix.getNormalMatrix(hit.object.matrixWorld));
      if(n.dot(up)>.45) points.push({p:hit.point,n});
    }
  }
  if(!points.length) throw Error("No se encontró superficie expuesta del jurel");
  // Exposed crest, with clear water immediately behind the animal.
  const score=c=>c.p.y+1.5*c.p.x+.022*c.n.x;
  const hero=points.reduce((a,b)=>score(a)>score(b)?a:b);
  const other=[];
  for(const c of points.slice().sort((a,b)=>b.p.y-a.p.y)){
    if(c.p.distanceTo(hero.p)<.081 || other.some(q=>q.p.distanceTo(c.p)<.048)) continue;
    other.push(c);
    if(other.length===9)break;
  }
  return {hero,other,points};
}

