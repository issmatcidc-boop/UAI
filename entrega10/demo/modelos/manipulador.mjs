import * as T from "../vendor/three/context.mjs";

// The lengths come from the Blender pivot offsets, in metres.
export function montarManipulador(root, mount) {
  function node(name) {
    const result = root.getObjectByName(name);
    if (!result) throw new Error("Falta la articulación " + name);
    return result;
  }
  const shoulder = node("Hombro"), elbow = node("Codo"), wrist = node("Muneca");
  const left = node("Dedo_I"), right = node("Dedo_D"), grip = node("Centro_de_prension");
  const upper = elbow.position.length(), lower = wrist.position.length();
  const end = new T.Vector3(), axis = new T.Vector3(), pole = new T.Vector3();
  const joint = new T.Vector3(), hinge = new T.Vector3(), along = new T.Vector3(), normal = new T.Vector3();
  const basis = new T.Matrix4(), upperQ = new T.Quaternion(), lowerQ = new T.Quaternion();
  const palm = new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0), .28);
  const lastAxis=new T.Vector3(0,1,0), lastPole=new T.Vector3(0,0,1);
  const wristOffset = grip.position.clone().applyQuaternion(palm);
  for (const old of mount.children) old.visible = false;
  mount.add(root);
  function orient(from, to, output) {
    along.subVectors(to, from).normalize();
    normal.crossVectors(hinge, along).normalize();
    return output.setFromRotationMatrix(basis.makeBasis(hinge,along,normal));
  }
  return {
    grip,
    pose(point, closure, precision) {
      mount.worldToLocal(end.copy(point)).sub(wristOffset);
      axis.subVectors(end,shoulder.position);
      const distance = T.MathUtils.clamp(axis.length(), Math.abs(upper-lower)+.001, upper+lower-.001);
      if(axis.lengthSq()<1e-10) axis.copy(lastAxis);
      else lastAxis.copy(axis.normalize());
      end.copy(shoulder.position).addScaledVector(axis,distance);
      pole.set(.92,.52,0);
      pole.addScaledVector(axis,-pole.dot(axis));
      // At an aligned shoulder the preferred bending plane has no direction.
      // Carry the previous plane through that small cone, preserving rigid links.
      const confidence=T.MathUtils.smoothstep(pole.length(),.035,.19);
      normal.copy(lastPole).addScaledVector(axis,-lastPole.dot(axis));
      if(normal.lengthSq()<1e-8){
        normal.set(Math.abs(axis.y)<.85?0:1,Math.abs(axis.y)<.85?1:0,0);
        normal.addScaledVector(axis,-normal.dot(axis));
      }
      normal.normalize();
      if(confidence<1 && pole.dot(normal)<0)pole.negate();
      pole.normalize().lerp(normal,1-confidence).normalize();
      lastPole.copy(pole);
      const reach = (upper*upper-lower*lower+distance*distance)/(2*distance);
      joint.copy(shoulder.position).addScaledVector(axis,reach)
        .addScaledVector(pole,Math.sqrt(Math.max(0,upper*upper-reach*reach)));
      hinge.crossVectors(axis,pole).normalize();
      orient(shoulder.position,joint,upperQ);
      orient(joint,end,lowerQ);
      shoulder.quaternion.copy(upperQ);
      elbow.quaternion.copy(upperQ).invert().multiply(lowerQ);
      wrist.quaternion.copy(lowerQ).invert().multiply(palm);
      right.rotation.z=T.MathUtils.lerp(.79,precision ? -.12 : .36,closure);
      left.rotation.z=-right.rotation.z;
    }
  };
}
