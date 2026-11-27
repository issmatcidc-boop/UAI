"use strict";

const waterColor=0x061215;
const vehicleLightColor=0xc0e2e6;
const observationLightColor=0xe0e7db;

const waterDensity=.071;

// A local irradiance probe represents light scattered off the painted fairing
// and instrument housing. Only the vehicle samples it; the seabed stays dark.
function prepareHullReflection(root){
  const w=256,h=128,pixels=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const lon=2*Math.PI*((x+.5)/w-.5),lat=Math.PI*((y+.5)/h-.5);
    const panel=Math.max(0,Math.cos(lat)*Math.cos(lon-.82)*.84+Math.sin(lat)*.54);
    const light=.035+.44*panel**3+.24*panel**18;
    const i=4*(y*w+x);
    pixels.set([light*222,light*243,light*255,255],i);
  }
  const texture=new T.DataTexture(pixels,w,h);
  texture.mapping=T.EquirectangularReflectionMapping;
  texture.needsUpdate=true;
  const pmrem=new T.PMREMGenerator(renderer);
  const probe=pmrem.fromEquirectangular(texture);
  const materials=new Set();
  root.traverse(node=>{if(node.isMesh)for(const m of [].concat(node.material))materials.add(m);});
  for(const m of materials)if(m.isMeshStandardMaterial){m.envMap=probe.texture;m.envMapIntensity=m.metalness>.55 ? 1.86 : 1.66;m.needsUpdate=true;}
  texture.dispose();
  pmrem.dispose();
}
// Modulate the baked material over larger, world-space patches. This retains
// the GLB's packed maps and gives each stretch of the bottom a different mix.
function shadeHadalSurface(mesh,rock=false) {
  mesh.material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace("#include <common>",
      "#include <common>\nvarying vec3 seabedWorld;").replace("#include <begin_vertex>",
      "#include <begin_vertex>\nseabedWorld=(modelMatrix*vec4(position,1.0)).xyz;");
    shader.fragmentShader=shader.fragmentShader.replace("#include <common>",`
      #include <common>
      varying vec3 seabedWorld;
      float seabedHash(vec2 p){
        vec3 q=fract(vec3(p.xyx)*.1031);
        q+=dot(q,q.yzx+33.33);
        return fract((q.x+q.y)*q.z);
      }
      float seabedNoise(vec2 p){
        vec2 i=floor(p),u=fract(p);
        u=u*u*(3.-2.*u);
        return mix(mix(seabedHash(i),seabedHash(i+vec2(1,0)),u.x),
                   mix(seabedHash(i+vec2(0,1)),seabedHash(i+vec2(1,1)),u.x),u.y);
      }`).replace("#include <color_fragment>",`
      #include <color_fragment>
      vec2 p=seabedWorld.xz;
      float broad=seabedNoise(p*.48+vec2(3.1,-4.0));
      float patches=seabedNoise(p*2.6);
      float footprint=max(length(dFdx(p)),length(dFdy(p)));
      float tone=${rock?".66+.29*patches+.13*broad":".70+.37*broad+.24*patches"};
      if(footprint<${rock?".044":".020"}){
        float grain=seabedNoise(p*${rock?"46.0":"115.0"});
        tone+=${rock?".25":".14"}*grain*(1.-smoothstep(${rock?".018,.044":".007,.020"},footprint));
      }
      if(footprint<.0048){
        float grit=seabedNoise(p*290.);
        tone+=.17*smoothstep(.68,.90,grit)*(1.-smoothstep(.002,.0048,footprint));
      }
      float shelter=seabedNoise(p*1.24+vec2(4.1,12.3));
      float bedding=sin(dot(p,vec2(12.0,21.0))+4.3*patches+2.0*broad);
      float streaks=smoothstep(.38,.76,shelter)*(1.-smoothstep(.014,.061,footprint));
      tone+=bedding*streaks*${rock?".033":".074"};
      diffuseColor.rgb*=tone*mix(vec3(.91,.97,1.02),vec3(1.10,1.01,.94),broad);
    `).replace("#include <normal_fragment_maps>",`
      #include <normal_fragment_maps>
      vec3 dpx=dFdx(-vViewPosition), dpy=dFdy(-vViewPosition);
      vec3 r1=cross(dpy,normal), r2=cross(normal,dpx);
      float det=dot(dpx,r1);
      float h=bedding*streaks*.00085;
      if(abs(det)>1e-12) normal=normalize(normal-sign(det)*(dFdx(h)*r1+dFdy(h)*r2)/abs(det));
    `);
  };
  mesh.material.customProgramCacheKey=()=>rock ? "hadal-basalt" : "hadal-sediment";
}

function colocarFragmentos(fondo,altura) {
  const grupo=new T.Group();
  grupo.name="Fragmentos de sedimento";
  const material=new T.MeshStandardMaterial({color:0xd2cabc,roughness:.96,metalness:.015});
  const centros=[[1.8,-1.3,8],[3.9,-2.1,11],[5.92,-2.85,13],[7.48,-3.86,14],[6.59,-3.04,7],[2.28,.88,8],[.76,-1.28,7]];
  let semilla=15441;
  function azar(){semilla=(Math.imul(semilla,1664525)+1013904223)>>>0;return semilla/4294967296;}
  const formas=[[],[]];
  for(const [cx,cz,cantidad] of centros){
    const direccion=azar()*Math.PI;
    for(let i=0;i<cantidad;i++){
      const a=azar()*Math.PI*2,r=Math.sqrt(azar());
      const u=.63*r*Math.cos(a),v=.24*r*Math.sin(a);
      const x=cx+u*Math.cos(direccion)-v*Math.sin(direccion),z=cz+u*Math.sin(direccion)+v*Math.cos(direccion);
      if(Math.abs(x-trap.position.x)<.61 && Math.abs(z-trap.position.z)<.28)continue;
      const escala=.013+.047*Math.pow(azar(),2);
      formas[i%2].push({x,z,y:altura(x,z),escala,ancho:.53+azar()*.38,giro:azar()*6.28,tono:azar()});
    }
  }
  const dummy=new T.Object3D(),color=new T.Color();
  for(const [tipo,datos] of formas.entries()){
    const geo=new T.IcosahedronGeometry(1,tipo);
    const pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
      const k=.91+.15*Math.sin(x*5.4+z*2.3+y*4.1+tipo);
      pos.setXYZ(i,x*k+.12*z,y*k,z*k);
    }
    geo.computeVertexNormals();
    const piedras=new T.InstancedMesh(geo,material,datos.length);
    datos.forEach(({x,z,y,escala,ancho,giro,tono},i)=>{
      dummy.position.set(x,y+.09*escala,z);
      dummy.rotation.set(.13*Math.sin(giro),giro,.14*Math.cos(giro));
      dummy.scale.set(escala,escala*.42,escala*ancho);dummy.updateMatrix();
      piedras.setMatrixAt(i,dummy.matrix);
      color.setRGB(.16+.11*tono,.17+.10*tono,.165+.085*tono);
      piedras.setColorAt(i,color);
    });
    piedras.receiveShadow=true;piedras.castShadow=true;grupo.add(piedras);
  }
  fondo.add(grupo);
}

