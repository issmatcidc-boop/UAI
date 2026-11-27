import * as T from "three";

// Sample a single Crowd animation once. Each phase shares one geometry and one draw call.
export function bakeCrowdPoses(root,mesh,clip,poseCount=8) {
  const mixer=new T.AnimationMixer(root);
  mixer.clipAction(clip).play();
  const position=new T.Vector3();
  try {
    return Array.from({length:poseCount},(_,pose)=>{
      mixer.setTime(clip.duration*pose/poseCount);
      root.updateMatrixWorld(true);
      const source=mesh.geometry;
      const geometry=new T.BufferGeometry();
      geometry.setIndex(source.index.clone());
      const points=new Float32Array(source.attributes.position.count*3);
      for(let i=0;i<source.attributes.position.count;i++){
        mesh.getVertexPosition(i,position).applyMatrix4(mesh.matrixWorld).toArray(points,i*3);
      }
      geometry.setAttribute("position",new T.BufferAttribute(points,3));
      for(const name of ["uv","color"]) {
        if(source.attributes[name]) geometry.setAttribute(name,source.attributes[name].clone());
      }
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      geometry.translate(0,-geometry.boundingBox.min.y,0);
      geometry.computeBoundingSphere();
      return geometry;
    });
  } finally {
    mixer.stopAllAction();
    root.updateMatrixWorld(true);
  }
}

export function createCrowdInstances(poses,material,individuals) {
  if(poses.length===0) throw Error("La población requiere al menos una pose");
  const group=new T.Group();
  group.name="Amphipod_Crowd_Instances";
  const buckets=poses.map((geometry,i)=>{
    const bucket=new T.InstancedMesh(geometry,material,individuals.length);
    bucket.name="Amphipod_Crowd_Fase_"+i;
    bucket.instanceMatrix.setUsage(T.DynamicDrawUsage);
    // Phase membership changes during playback. The small population is drawn as a unit.
    bucket.frustumCulled=false;
    group.add(bucket);
    return bucket;
  });
  const counts=new Uint32Array(poses.length);
  function update(seconds){
    counts.fill(0);
    for(const individual of individuals){
      const cycle=seconds*individual.speed+individual.phase;
      const index=individual.firstPose+Math.floor((cycle-Math.floor(cycle))*individual.poseCount);
      const bucket=buckets[index];
      const instance=counts[index]++;
      bucket.setMatrixAt(instance,individual.matrix);
      bucket.setColorAt(instance,individual.color);
    }
    buckets.forEach((bucket,i)=>{
      bucket.count=counts[i];
      bucket.visible=bucket.count>0;
      if(!bucket.visible) return;
      bucket.instanceMatrix.needsUpdate=true;
      bucket.instanceColor.needsUpdate=true;
    });
  }
  update(0);
  return {group,update};
}
