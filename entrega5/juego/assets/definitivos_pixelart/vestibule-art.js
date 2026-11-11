/* Geometría de los fotogramas exportada desde objetos_vestibulo/atlas_objetos.json. */
const VESTIBULE_ART_ROOT = "assets/definitivos_pixelart/objetos_vestibulo/";
const VESTIBULE_ART = {
  caja_servicio_4f: {"file":"caja_servicio_4f.png","frames":[[[0,0,724,543],[364,432]],[[724,0,724,543],[364,432]],[[0,543,724,543],[364,433]],[[724,543,724,543],[364,433]]]},
  astillas_madera_4f: {"file":"astillas_madera_4f.png","frames":[[[0,0,608,646],[304,330]],[[608,0,609,646],[304,330]],[[0,646,608,647],[304,330]],[[608,646,609,647],[304,330]]]},
  reja_servicio_4f: {"file":"reja_servicio_4f.png","frames":[[[0,0,724,543],[358,510]],[[724,0,724,543],[348,510]],[[0,543,724,543],[360,511]],[[724,543,724,543],[348,511]]]},
  tablas_crujientes_4f: {"file":"tablas_crujientes_4f.png","frames":[[[0,0,839,468],[420,234]],[[839,0,840,468],[420,234]],[[0,468,839,469],[420,205]],[[839,468,840,469],[420,205]]]},
  lampara_registro_4f: {"file":"lampara_registro_4f.png","frames":[[[0,0,599,656],[258,571]],[[599,0,600,656],[232,571]],[[0,656,599,656],[258,571]],[[599,656,600,656],[232,571]]]},
  llave_servicio: {"file":"llave_servicio.png","visibleBounds":[232,231,685,820]},
  icono_llave_hud: {"file":"icono_llave_hud.png","visibleBounds":[167,160,921,932]},
  pagina_registro: {"file":"pagina_registro.png","visibleBounds":[113,42,1310,952],"marginNote":{"file":"nota_margen.svg","left":0.527,"top":0.631,"width":0.333}},
  libreta_anotaciones: {"file":"libreta_anotaciones.png","visibleBounds":[81,31,1439,956]},
  hoja_giro_6f: {"file":"hoja_giro_6f.png","frames":[[[0,0,512,512],[255,264]],[[512,0,512,512],[255,264]],[[1024,0,512,512],[255,264]],[[0,512,512,512],[255,264]],[[512,512,512,512],[255,264]],[[1024,512,512,512],[255,264]]]}
};

for (const asset of Object.values(VESTIBULE_ART)) {
  asset.image = new Image();
  asset.image.src = VESTIBULE_ART_ROOT + asset.file;
}

function drawVestibuleArt(context, name, frame, x, y, scale) {
  const asset = VESTIBULE_ART[name];
  if (!asset.image.naturalWidth) return false;
  const [source, anchor] = asset.frames ? asset.frames[frame] : [asset.visibleBounds, [asset.visibleBounds[2] / 2, asset.visibleBounds[3] / 2]];
  const [sx, sy, w, h] = source;
  context.drawImage(asset.image, sx, sy, w, h,
    Math.round(x - anchor[0] * scale), Math.round(y - anchor[1] * scale),
    Math.round(w * scale), Math.round(h * scale));
  return true;
}

