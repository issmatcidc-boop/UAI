import * as T from "three";

export const radius=.247;
export const axisHeight=.253;
export const halfLength=.565;

const metal=new T.MeshStandardMaterial({color:0x303735,roughness:.82,metalness:.22});
const innerMetal=new T.MeshStandardMaterial({color:0x272e2d,roughness:.86,metalness:.15});
const v=(x,y,z)=>new T.Vector3(x,y,z);

function group(parent,name,x=0,y=0,z=0) {
  const node=new T.Group();
  node.name=name;
  node.position.set(x,y,z);
  parent.add(node);
  return node;
}

function part(parent,name,geometry,material,x=0,y=0,z=0){
  const mesh=new T.Mesh(geometry,material);
  mesh.name=name;
  mesh.position.set(x,y,z);
  parent.add(mesh);
  return mesh;
}

function tube(parent,name,points,r,material,segments=16,closed=false){
  const curve=new T.CatmullRomCurve3(points,closed);
  return part(parent,name,new T.TubeGeometry(curve,segments,r,5,closed),material);
}

export function createTrapFrame(trapMesh){
  const root=new T.Group();
  root.name="BaitTrap_Root";
  root.add(trapMesh);
  // A removable cutaway on the near wall lets the experiment camera see the bait.
  const cutaway={value:0};
  let grille;
  trapMesh.traverse(node=>{
    if(node.isMesh && node.name.startsWith("Rejilla")) grille=node;
  });
  if(!grille) throw new Error("Falta la rejilla del experimento");
  grille.material.onBeforeCompile=shader=>{
    shader.uniforms.cutaway=cutaway;
    shader.vertexShader="varying vec3 trapPosition;\n"+shader.vertexShader.replace(
      "#include <begin_vertex>","#include <begin_vertex>\ntrapPosition=position;"
    );
    shader.fragmentShader="uniform float cutaway;\nvarying vec3 trapPosition;\n"+shader.fragmentShader.replace(
      "#include <clipping_planes_fragment>",
      `#include <clipping_planes_fragment>
      if(cutaway>.5 && abs(trapPosition.x)<.34 && trapPosition.z>0. &&
         trapPosition.y>.018 && trapPosition.y<.41) discard;`
    );
  };
  const holder=group(root,"BaitHolder",-.044,.071,.036);
  const tray=part(holder,"Bandeja baja",new T.BoxGeometry(.346,.012,.256),innerMetal);
  tray.rotation.y=.08;
  tube(holder,"Sujeción frontal",[
    v(-.174,.003,.105),v(-.146,.010,.126),v(.153,.01,.122),v(.173,.001,.099)
  ],.004,metal,15);
  const before=group(root,"TrapState_Before");
  const after=group(root,"TrapState_After_90_MIN");
  const fullAnchor=group(before,"BaitFullAnchor",-.052,.084,.032);
  const consumedAnchor=group(after,"BaitConsumedAnchor",-.025,.082,.037);
  const target=group(root,"TrapCameraTarget",-.035,.23,.025);
  after.visible=false;
  return {root,before,after,fullAnchor,consumedAnchor,target,setCutaway:enabled=>{cutaway.value=Number(enabled)}};
}
