"use strict";

function createHadalWater(T, scene, renderer) {
  const lampPos=[new T.Vector3(),new T.Vector3(),new T.Vector3()];
  const lampDir=lampPos.map(()=>new T.Vector3(1,0,0));
  const strength=[0,0,0], cutoff=[0,0,0], reach=[1,1,1];
  const clock={value:0};
  const scale={value:300};
  const points=[], seeds=[], disturbance=[];
  const plume={value:new T.Vector3()};
  const plumeAt={value:-10};
  const plumeNow={value:-10};
  let seed=901131;
  function random(){
    seed=(Math.imul(1664525,seed)+1013904223)>>>0;
    return seed/4294967296;
  }
  for(let i=0;i<1270;i++){
    if(i<240) points.push(4.1+random()*5,.06+random()*2.6,-5.6+random()*4.5);
    else if(i<370) points.push(-2.5+random()*11,.2+random()*7,-3.4+random()*8.2);
    else points.push(-10+random()*29,.05+random()*11,-9+random()*18);
    seeds.push(random(),random());
    disturbance.push(0);
  }
  for(let i=0;i<60;i++){
    const angle=random()*Math.PI*2;
    const radius=.085+random()*.17;
    points.push(Math.cos(angle)*radius,.024+random()*.13,Math.sin(angle)*radius);
    seeds.push(random(),random());
    disturbance.push(1);
  }
  const particles=new T.BufferGeometry();
  particles.setAttribute("position",new T.Float32BufferAttribute(points,3));
  particles.setAttribute("seed",new T.Float32BufferAttribute(seeds,2));
  particles.setAttribute("disturbance",new T.Float32BufferAttribute(disturbance,1));
  const grains=new T.Points(particles,new T.ShaderMaterial({
    uniforms:{clock,scale,plume,plumeNow,plumeAt,origins:{value:lampPos}, axes:{value:lampDir},
      strength:{value:strength}, cutoff:{value:cutoff}, reach:{value:reach}},
    vertexShader:`
      attribute vec2 seed;
      attribute float disturbance;
      uniform float clock,scale;
      uniform float plumeAt,plumeNow;
      uniform vec3 plume;
      uniform vec3 origins[3],axes[3];
      uniform float strength[3],cutoff[3],reach[3];
      varying float brightness;
      varying float sediment;
      void main(){
        vec3 p=position+vec3(.26*sin(clock*(.08+.17*seed.y)+seed.x*19.+position.z*.51),
          .12*cos(clock*(.08+.10*seed.x)+seed.y*12.),.17*sin(clock*(.19+.06*seed.x)+seed.y*23.));
        float age=clamp(plumeNow-plumeAt,0.,4.1);
        if(disturbance>.5)
          p=plume+position*(.34+age*.61)+vec3(age*.049,age*.033,age*.018);
        if(disturbance<.5){
          // Low-frequency current shared by neighbouring grains, with a smaller
          // individual settling motion. All movement is in the terrain frame.
          p.z+=.22*sin(.15*clock+.37*position.y+.31*position.x);
          p.y+=.13*sin(clock*(.18+.24*seed.x)+seed.y*28.);
        }
        vec4 view=modelViewMatrix*vec4(p,1.);
        float dCamera=-view.z;
        float light=0.;
        for(int i=0;i<3;i++){
          vec3 delta=p-origins[i];
          float d=length(delta);
          float alignment=dot(delta/max(.001,d),axes[i]);
          light+=strength[i]*smoothstep(cutoff[i],mix(cutoff[i],1.,.52),alignment)*
            (1.-smoothstep(reach[i]*.60,reach[i],d))*exp(-.085*d)/(1.+.11*d*d);
        }
        float scatter=light+(disturbance>.5?0.:.009*seed.x);
        brightness=min(.79,scatter)*smoothstep(.27,.94,dCamera)*
          exp(-.065*dCamera-.004*dCamera*dCamera)*smoothstep(-.18,.17,p.y)*(.34+.66*seed.y);
        if(disturbance>.5)
          brightness*=.56*smoothstep(0.,.20,age)*(1.-smoothstep(.45,4.0,age));
        gl_PointSize=clamp(scale*(.010+.041*seed.x*seed.x)/max(.3,dCamera),1.0,4.5);
        if(disturbance>.5) gl_PointSize*=1.30+age*.29;
        sediment=disturbance;
        gl_Position=projectionMatrix*view;
      }`,
    fragmentShader:`
      varying float brightness;
      varying float sediment;
      void main(){
        vec2 p=gl_PointCoord*2.-1.;
        p.x*=1.14;
        float core=max(0.,1.-dot(p,p));
        gl_FragColor=vec4(mix(vec3(.32,.48,.50),vec3(.46,.37,.29),sediment),brightness*core*core);
        #include <colorspace_fragment>
      }`,
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  }));
  grains.frustumCulled=false;
  grains.renderOrder=3;
  scene.add(grains);

  // Two overlapping scattering regions per headlamp. Integrate only the part
  // between the eye and the visible surface. Both positions are in world metres.
  const pockets=Array.from({length:4},()=>new T.Vector4());
  const power=new T.Vector4();
  const mediumUniforms={waterPockets:{value:pockets},waterPower:{value:power},
    waterSource:{value:lampPos.slice(0,2)},waterAxis:{value:lampDir.slice(0,2)},
    waterRange:{value:new T.Vector2()},waterInstrumentLOD:{value:false}};
  const optics=`
    uniform vec4 waterPockets[4];
    uniform vec4 waterPower;
    uniform vec3 waterSource[2],waterAxis[2];
    uniform vec2 waterRange;
    float columnLight(vec3 delta,vec3 axis,vec3 ray,float nearT,float farT,float invWidth){
      // Longer along the optical axis than across it; no camera-facing plane.
      delta-=axis*(.38*dot(delta,axis));
      float along=dot(delta,ray);
      vec3 offset=(delta-along*ray)*invWidth;
      float side=dot(offset,offset);
      float front=clamp((along-nearT)*invWidth*.5+.5,0.,1.);
      float back=clamp((along-farT)*invWidth*.5+.5,0.,1.);
      // Integral of a smooth compact kernel, trimmed at the nearest opaque surface.
      return exp2(-2.85*side)*(front*front*(3.-2.*front)-back*back*(3.-2.*back));
    }
    float waterScatter(vec3 ray,float meters){
      float scattered=0.;
      for(int i=0;i<2;i++){
        vec3 axis=waterAxis[i];float axial=dot(ray,axis);
        float slope=abs(axial)<.0001 ? (axial<0.?-.0001:.0001) : axial;
        float enter=dot(waterSource[i]-cameraPosition,axis)/slope;
        float exitT=enter+waterRange[i]/slope;
        float lo=max(0.,min(enter,exitT)),hi=min(meters,max(enter,exitT));
        if(hi>lo && waterPower[i*2]>0.){
          vec3 squeezed=ray-axis*(.38*axial);
          float metric=length(squeezed);
          squeezed/=metric;
          for(int j=0;j<2;j++){
            int k=i*2+j;
            scattered+=waterPower[k]*columnLight(waterPockets[k].xyz-cameraPosition,axis,squeezed,lo*metric,hi*metric,waterPockets[k].w);
          }
        }
      }
      return scattered;
    }
    vec3 waterColour(vec3 colour,float meters,float scattered){
      vec3 transmission=exp(-meters*(vec3(.078,.040,.028)+min(meters,22.)*.0041));
      return colour*transmission + vec3(.0014,.0038,.0050)*(1.-transmission)
          + vec3(.40,.71,.78)*scattered;
    }`;
  function installOptics(root){
    const seen=new Set();
    root.traverse(obj=>{
      if(!obj.isMesh)return;
      for(const m of [].concat(obj.material)){
        if(seen.has(m)||!m.fog||!(m.isMeshStandardMaterial||m.isMeshPhongMaterial))continue;
        seen.add(m);
        const prior=m.onBeforeCompile, key=m.customProgramCacheKey();
        m.onBeforeCompile=function(shader,gl){
          prior.call(this,shader,gl);
          Object.assign(shader.uniforms,mediumUniforms);
          // On close instrument views with tracking, interpolate only the
          // broad scattering field. Keep extinction and PBR per fragment.
          const lod="uniform bool waterInstrumentLOD; varying float vertexScatter;\n";
          shader.vertexShader=optics+"\n"+lod+shader.vertexShader.replace("#include <project_vertex>",`
            #include <project_vertex>
            vertexScatter=0.;
            if(waterInstrumentLOD){
              float d=length(mvPosition.xyz);
              vertexScatter=waterScatter((mvPosition.xyz/max(.001,d))*mat3(viewMatrix),d);
            }`);
          const lamps=T.ShaderChunk.lights_pars_begin.replace(
            "light.color = spotLight.color * spotAttenuation;",
            "light.color = spotLight.color * spotAttenuation * exp(-lightDistance*vec3(.042,.022,.015));");
          shader.fragmentShader=optics+"\n"+lod+shader.fragmentShader
            .replace("#include <lights_pars_begin>",lamps)
            .replace("#include <opaque_fragment>",`
              float pathLength=length(vViewPosition);
              vec3 waterRay=(-vViewPosition/max(.001,pathLength))*mat3(viewMatrix);
              float scatter=waterInstrumentLOD ? vertexScatter : waterScatter(waterRay,pathLength);
              outgoingLight=waterColour(outgoingLight,pathLength,scatter);
              #include <opaque_fragment>`)
            .replace("#include <fog_fragment>","");
        };
        m.customProgramCacheKey=()=>key+"-hadal-column";
        m.needsUpdate=true;
      }
    });
  }
  const skyGeometry=new T.BufferGeometry();
  skyGeometry.setAttribute("position",new T.Float32BufferAttribute([-1,-1,0,3,-1,0,-1,3,0],3));
  const skyMaterial=new T.ShaderMaterial({
    uniforms:{...mediumUniforms,unproject:{value:new T.Matrix4()}},
    vertexShader:`uniform mat4 unproject;varying vec3 line;
      void main(){line=(unproject*vec4(position.xy,1.,1.)).xyz;gl_Position=vec4(position.xy,1.,1.);}`,
    fragmentShader:optics+`
      varying vec3 line;
      void main(){
        vec3 ray=normalize(line)*mat3(viewMatrix);
        gl_FragColor=vec4(waterColour(vec3(0.),50.,waterScatter(ray,50.)),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    depthWrite:false
  });
  const sky=new T.Mesh(skyGeometry,skyMaterial);
  sky.frustumCulled=false;sky.renderOrder=1;
  sky.onBeforeRender=(_r,_s,cam)=>skyMaterial.uniforms.unproject.value.copy(cam.projectionMatrixInverse);
  scene.add(sky);
  const target=new T.Vector3();
  const floorRay=new T.Raycaster(),hits=[];
  let floorMesh=null,lastFloorSample=-Infinity;
  const bottomRange=[12,12];
  function update(now,camera,view,vehicleLights,trapLight,pixelHeight=renderer.domElement.height,showHalo=true){
    const inWater=view!=="cabin";
    mediumUniforms.waterInstrumentLOD.value=handInput && (view==="trap" || view==="macro" || view==="manipulation");
    sky.visible=grains.visible=inWater;
    clock.value=plumeNow.value=now*.001;
    scale.value=pixelHeight*.66;
    const checkFloor=inWater && floorMesh && (now-lastFloorSample>130||now<lastFloorSample);
    if(checkFloor)lastFloorSample=now;
    for(let i=0;i<3;i++){
      const spot=i===2?trapLight:vehicleLights[i];
      const active=inWater && spot && spot.visible && spot.intensity>.1;
      if(!active){
        strength[i]=0;
        if(i<2){power.setComponent(2*i,0);power.setComponent(2*i+1,0);}
        continue;
      }
      const origin=spot.getWorldPosition(lampPos[i]);
      spot.target.getWorldPosition(target);
      const axis=lampDir[i].subVectors(target,origin).normalize();
      const gain=Math.min(1.25,Math.sqrt(spot.intensity/(i===2?67:124)));
      strength[i]=1.55*gain;
      cutoff[i]=Math.cos(spot.angle);
      if(i===2){reach[i]=spot.distance||13;continue;}
      if(checkFloor){
        floorRay.set(origin,axis);floorRay.near=.025;floorRay.far=12;
        hits.length=0;floorRay.intersectObject(floorMesh,false,hits);
        bottomRange[i]=hits.length?hits[0].distance:12;
      }
      const length=Math.min(9.8,bottomRange[i],spot.distance||12);
      mediumUniforms.waterRange.value.setComponent(i,length);
      reach[i]=Math.min(spot.distance||12,length+1.1);
      for(let j=0;j<2;j++){
        const index=i*2+j;
        const along=length*(j ? .53 : .20);
        const width=Math.max(.13,along*Math.tan(spot.angle)*.76);
        pockets[index].set(origin.x+axis.x*along,origin.y+axis.y*along,origin.z+axis.z*along,1/width);
        power.setComponent(index,showHalo ? gain*(j ? .014 : .031)*Math.min(1,length/2.2) : 0);
      }
    }
  }

  function disturb(point) {
    plume.value.copy(point);
    plume.value.y-=.12;
    plumeAt.value=performance.now()*.001;
  }
  return {update,disturb,installOptics(root,floor){floorMesh=floor;installOptics(root);}};
}
