import * as T from "three";

export async function loadAsset(loader, name, length, yaw=0) {
  const {scene,animations}=await loader.loadAsync(new URL(name+".glb",import.meta.url).href);
  const root=new T.Group();
  root.name=name;
  const placement=new T.Group();
  placement.rotation.y=yaw;
  placement.add(scene);
  root.add(placement);
  root.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(placement);
  if(bounds.isEmpty()) throw new Error("El GLB no tiene geometría: "+name);
  const size=bounds.getSize(new T.Vector3());
  if(length) {
    const center=bounds.getCenter(new T.Vector3());
    root.scale.setScalar(length/size.x);
    placement.position.set(-center.x,-bounds.min.y,-center.z);
  }
  root.userData.height=size.y*root.scale.y;
  return {root, scene, animations};
}
