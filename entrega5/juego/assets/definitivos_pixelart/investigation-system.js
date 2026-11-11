/* Conversaciones, libreta y teorías interactivas del Caso 01. */
(() => {
  if (window.__misteriosInvestigation) return;
  window.__misteriosInvestigation = true;

  const wrap = document.querySelector("#game .canvas-wrap");
  if (!wrap) return;
  const $ = id => document.getElementById(id);
  const shell = wrap.closest(".game-shell");
  const portraitRoot = "assets/definitivos_pixelart/retratos_dialogo/";
  const portraits = {
    SCOOBY: "scooby.png", SHAGGY: "shaggy.svg", VILMA: "vilma.png", DAPHNE: "daphne.png", FRED: "fred.svg",
    ELVIRA: "elvira.png", AMALIA: "amalia.png", BRUNO: "bruno.png", CELIA: "celia.png",
    "TOMÁS": "tomas.png", "DAMIÁN": "damian.png"
  };
  const clueNotes = [
    {
      title: "HUELLA CON BARNIZ",
      note: "Barro húmedo bajo una capa de barniz fresco. La huella llegó desde el jardín, pero el barniz se añadió después, cerca del taller.",
      lines: [
        ["SCOOBY", "¡Rastro fresquito! Huele a tierra… y a taller."],
        ["VILMA", "Mira el borde. El barniz está encima del barro."],
        ["DAPHNE", "La huella pasó por dos lugares. Tomás, Bruno y Damián siguen bajo sospecha. ¿Qué seguimos primero?"]
      ],
      question: "¿Qué conviene investigar ahora?",
      options: ["Rastrear el barro al jardín", "Preguntar por el barniz del taller"],
      observation: ["El barro lleva al jardín. Conviene comparar la huella con el rastro de Tomás.", "El barniz se añadió después. Conviene preguntar quién estuvo trabajando en el taller."]
    },
    {
      title: "FIBRA VIOLETA",
      note: "Terciopelo violeta enganchado en el marco. La trama coincide con un delantal de restauración y tiene barniz fresco; el chal de Amalia usa otro tejido.",
      lines: [
        ["SHAGGY", "¿El fantasma perdió un trozo de su ropa? Espero que no vuelva a buscarlo."],
        ["FRED", "El color apunta a más de una persona. La lupa nos deja comparar el tejido, no solo el color."],
        ["VILMA", "La fibra coincide con el delantal de Damián. Falta conectar esto con el mecanismo."]
      ],
      question: "¿Qué comparación anotas?",
      options: ["El chal de Amalia no coincide", "El delantal de Damián sí coincide"],
      observation: ["Amalia llevaba violeta, pero su chal tiene otro tejido.", "El delantal de Damián coincide con la fibra y tiene restos de barniz."]
    },
    {
      title: "PLANO DEL PASADIZO",
      note: "El plano muestra una cuerda entre el retrato y la lámpara del ático. La unión tiene una muesca triangular igual a la que deja el útil de precisión de Damián.",
      lines: [
        ["CELIA", "Ese pasadizo existe. Yo lo recorría para limpiar, pero nunca encontré el mecanismo."],
        ["BRUNO", "El circuito es sencillo. La muesca triangular de esta pieza no viene de mis herramientas."],
        ["DAPHNE", "La fibra, el barniz y la muesca apuntan al taller de Damián. Ya podemos contrastar la teoría."]
      ],
      question: "¿Qué sospechoso conecta las tres pruebas?",
      options: ["Damián, por la fibra y la herramienta", "Celia, porque conoce el pasadizo"],
      observation: ["Damián trabajó el marco y su útil dejó la muesca del mecanismo.", "Celia conocía el pasadizo, pero eso no explica el barniz ni la herramienta."]
    }
  ];
  const suspects = [
    { name: "ELVIRA · CUIDADORA", motive: "Quería impedir la venta de la mansión; prestó una llave sin registrarlo.", statement: "Dice que recibió una llamada en la entrada durante un avistamiento.", check: "El libro de visitas y la llamada respaldan su coartada." },
    { name: "AMALIA · HEREDERA", motive: "Buscaba un testamento que podría devolverle parte de la colección.", statement: "Admite que entró a escondidas a la biblioteca y llevaba un chal violeta.", check: "Su tejido no coincide con la fibra del marco." },
    { name: "BRUNO · ELECTRICISTA", motive: "Tenía deudas y sabía manipular las luces y el cableado.", statement: "Reconoce que instaló las lámparas y guardó cobre sobrante.", check: "La muesca del mecanismo no coincide con sus herramientas." },
    { name: "CELIA · AMA DE LLAVES", motive: "Quería proteger su empleo y conocía los pasillos de servicio.", statement: "Admite que limpió la galería y guardó una llave antigua.", check: "Su registro explica los pasos, pero no la señal del ático." },
    { name: "TOMÁS · JARDINERO", motive: "Quería proteger el invernadero de la venta de la mansión.", statement: "Admite que entró durante la tormenta con las botas embarradas.", check: "Sus huellas terminan en el invernadero; el barniz se agregó después." },
    { name: "DAMIÁN · RESTAURADOR", motive: "Necesitaba dinero y podía sustituir el retrato original por una copia.", statement: "Niega haber trabajado de noche, aunque la fibra y el barniz lo contradicen.", check: "La fibra, el barniz y la muesca de su herramienta conectan todas las pruebas." }
  ];
  const npc = [
    { id: "elvira", name: "ELVIRA", x: VESTIBULE.elvira, file: "elvira_cuidadora.png", height: 62,
      lines: [["ELVIRA", "La luz del retrato se encendió antes de que apareciera la figura."], ["FRED", "¿Quién podía entrar a la galería?"], ["ELVIRA", "Le presté una llave al restaurador. Dejé una de repuesto en la caja con un rombo, en el almacén. El registro está en la repisa."]] },
    { id: "celia", name: "CELIA", x: window.mansionStageX(4,.30), file: "celia_ama_llaves.png", height: 62,
      lines: [["CELIA", "Conozco los pasillos de servicio. Limpié la galería esa tarde; mis pasos pueden confundirse con los del fantasma."], ["DAPHNE", "¿Por qué guardaste una llave antigua?"], ["CELIA", "La encontré tras un armario y pensaba entregársela a Elvira. Debí avisar enseguida."]] },
    { id: "damian", name: "DAMIÁN", x: window.mansionStageX(5,.53), file: "damian_restaurador.png", height: 67,
      lines: [["DAMIÁN", "El retrato es delicado. Si ven una sombra, será el reflejo de la lámpara. Puedo ayudarlos a revisarlo."], ["VILMA", "¿Trabajaste anoche?"], ["DAMIÁN", "No. Terminé antes de la cena."]] },
    { id: "amalia", name: "AMALIA", x: window.mansionStageX(1,.29), file: "amalia_heredera.png", height: 67,
      lines: [["AMALIA", "Entré a la biblioteca sin permiso. Buscaba el testamento de mi familia, no el retrato."], ["VILMA", "¿Y el chal violeta?"], ["AMALIA", "Es mío. Pueden comparar el tejido con la fibra; no les pediré que me crean sin pruebas."]] },
    { id: "bruno", name: "BRUNO", x: window.mansionStageX(2,.28), file: "bruno_electricista.png", height: 67,
      lines: [["BRUNO", "Yo instalé el cableado. Puedo explicar las luces, pero no hice que el retrato se moviera."], ["FRED", "¿Por qué guardaste cobre?"], ["BRUNO", "Era sobrante. Mi alicate deja una marca cuadrada, no triangular."]] },
    { id: "tomas", name: "TOMÁS", x: window.mansionStageX(3,.67), file: "tomas_jardinero.png", height: 76,
      lines: [["TOMÁS", "Si ven barro, probablemente sea mío. Entré por el patio para proteger una planta del temporal."], ["SHAGGY", "¿Y viste al fantasma?"], ["TOMÁS", "Vi una luz, pero estaba en el invernadero. Mis botas no tienen barniz."]] }
  ];
  const fieldActivities = [
    { id: "fingerprint", kind: "fingerprint", stage: 0, x: VESTIBULE.station, clue: 0, title: "REVELA LA HUELLA", copy: "Pasa el polvo con la brocha. Usa los cuatro botones para moverla y alterna el deslizador entre izquierda y derecha para revelar el rastro." },
    { id: "magnifier", kind: "magnifier", stage: 1, x: window.mansionStageX(1,.49), clue: 1, title: "EXAMINA LA FIBRA", copy: "Recorre la nota con la lupa. Los botones mueven la lente; mueve el deslizador a la derecha para acercar y encontrar el tejido." },
    { id: "radio", kind: "radio", stage: 2, x: window.mansionStageX(2,.49), note: "La radio captó una transmisión de mantenimiento a las 23:10. Alguien abrió el pasadizo después del cierre.", title: "SINTONIZA LA RADIO", copy: "Mueve el deslizador hasta la franja de señal y mantenlo quieto hasta que la transmisión quede clara." },
    { id: "memory", kind: "memory", stage: 3, x: window.mansionStageX(3,.49), note: "La secuencia del panel del invernadero es izquierda, zona baja, derecha, arriba, zona alta y botón inferior.", title: "RECONSTRUYE LA SECUENCIA", copy: "Memoriza los botones y las dos zonas del deslizador. Cuando termine la demostración, repite la secuencia." },
    { id: "trap", kind: "trap", stage: 4, x: window.mansionStageX(4,.49), clue: 2, title: "TIENDE LA RED DE FRED", copy: "Activa un anclaje con cada botón. Después centra el deslizador para tensar la red y descubrir el plano del pasadizo." }
  ];
  const lampActivity = {
    kind: "lamp", stage: 0, title: "ILUMINA EL REGISTRO",
    copy: "Pulsa ABAJO para encender la lámpara. Mueve el deslizador hasta la franja dorada y mantén la luz ahí para leer la nota.",
    note: "Registro de visitas, 22:40. Una persona vio encenderse el retrato mientras Elvira seguía al teléfono en la entrada."
  };
  const npcImages = new Map();
  npc.forEach(person => { const img = new Image(); img.src = "assets/definitivos_pixelart/personajes_secundarios/" + person.file; npcImages.set(person.id, img); });

  const css = document.createElement("style");
  css.textContent = `
    .mystery-book-button{position:absolute;z-index:5;right:12px;top:12px;padding:7px 10px;background:#172238f2;color:#ffe26a;border:2px solid #ffe26a;box-shadow:3px 3px #080613;font:8px var(--px);cursor:pointer}
    .mystery-book-button:hover,.mystery-panel button:hover{filter:brightness(1.2)}
    .mystery-overlay{position:absolute;z-index:30;inset:0;display:flex;align-items:center;justify-content:center;padding:12px;background:#080613d9}
    .mystery-overlay.hidden{display:none}.mystery-panel{width:min(760px,94%);max-height:92%;overflow:auto;padding:14px;background:#111b2b;border:2px solid #9cf2d8;box-shadow:6px 6px #05040b;color:#f8f0dc}
    .mystery-panel h2{margin:0 0 8px;color:#ffe26a;font:12px var(--px);line-height:1.8}.mystery-panel p{color:#e4e9eb;font:13px/1.5 system-ui,sans-serif}
    .mystery-kicker{margin-bottom:8px;color:#9cf2d8;font:8px var(--px);letter-spacing:.08em}.mystery-buttons,.mystery-tabs,.mystery-options{display:flex;flex-wrap:wrap;gap:7px;margin:9px 0}
    .mystery-panel button,.mystery-panel select{padding:8px 10px;background:#20163a;color:#fff0c0;border:1px solid #ae91e9;font:8px var(--px);cursor:pointer}
    .mystery-panel button.selected{background:#ffe26a;color:#24143b;border-color:#fff4b2}.mystery-panel button:focus-visible,.mystery-panel select:focus-visible{outline:2px solid white;outline-offset:2px}.mystery-panel button:focus{outline:2px solid #9cf2d8;outline-offset:2px}
    .mystery-hint{color:#9cf2d8!important;font:8px var(--px)!important;line-height:1.8!important}.mystery-card{margin:7px 0;padding:9px;background:#172238;border:1px solid #52677d}.mystery-card strong{color:#ffe26a;font:8px var(--px);line-height:1.8}.mystery-card p{margin:5px 0 0;font-size:12px}.mystery-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
    .mystery-field{display:block;margin:8px 0;color:#9cf2d8;font:8px var(--px)}.mystery-field select{display:block;width:100%;margin-top:5px}.mystery-check{display:block;margin:8px 0;font:12px system-ui,sans-serif;color:#f1e9d8}.mystery-check input{margin-right:7px;accent-color:#9cf2d8}
    .game-shell.story-reading .game-footer{display:none}
    .game-shell.story-reading .slider-gauge,.game-shell.story-reading .mystery-book-button{visibility:hidden}
    .story-dock:not(.hidden){position:relative;inset:auto;flex:none;display:block;padding:0;border-top:2px solid #bd9b62;background:#111a29}
    .story-dock .story-panel{display:grid;grid-template-columns:clamp(74px,12vw,128px) minmax(0,1fr);gap:clamp(10px,2vw,24px);width:min(1300px,100%);max-height:42vh;overflow:auto;padding:10px clamp(12px,3vw,36px);margin:auto;border:0;background:transparent;box-shadow:none}
    .story-portrait-frame{align-self:end;width:100%;aspect-ratio:1;display:grid;place-items:end center;overflow:hidden;background:radial-gradient(ellipse at 50% 75%,#47475f,#202839 68%);border:1px solid #bd9b62}
    .story-portrait-frame img{width:100%;height:100%;object-fit:contain;object-position:center bottom;image-rendering:pixelated}
    .story-portrait-frame [hidden]{display:none}
    .story-portrait-frame .story-paper{align-self:center;justify-self:center;padding:12% 10%;background:#ecdbb7;border:2px solid #91704c;color:#69472f;font:700 10px monospace}
    .story-paper i{display:block;height:2px;margin-top:5px;background:#a97f54}
    .story-dialogue-content{align-self:center;min-width:0}
    .story-heading-row{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:3px}
    .story-heading-row h2{margin:0;color:#f6dfa4;font:700 clamp(10px,1vw,13px) var(--px);line-height:1.5}
    .story-heading-row .mystery-kicker{margin:0}
    .story-panel .story-copy p{margin:0;color:#fff5dc;font:600 clamp(14px,1.35vw,19px)/1.42 system-ui,sans-serif}
    .story-panel .mystery-options{margin:7px 0 0}
    .story-panel .mystery-options[hidden]{display:none}
    .story-panel .mystery-options button{font:700 clamp(11px,1vw,14px)/1.25 system-ui,sans-serif}
    .story-actions{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:7px}
    .story-actions p{margin:0}
    .story-panel #story-next{border-color:#d6b46b;color:#ffe7ab;min-height:31px}
    @media(max-width:650px){.story-dock .story-panel{grid-template-columns:62px minmax(0,1fr);gap:9px}.story-actions{flex-wrap:wrap}.story-panel .mystery-options button{padding:5px 7px}.story-portrait-frame .story-paper{font-size:8px}}
    .field-panel{width:min(650px,94%);background:linear-gradient(145deg,#17263b,#101522 80%);border-color:#f2d663;box-shadow:0 0 0 4px #241a37,8px 9px #05040b}.field-panel h2{font-size:13px}.field-panel>p{margin:6px 0;color:#e4e9eb;font:13px/1.45 system-ui,sans-serif}.field-visual{position:relative;width:100%;aspect-ratio:3/2;overflow:hidden;background:#111827;border:1px solid #607384;image-rendering:pixelated}.field-visual.memory{aspect-ratio:2/1}.field-visual img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;image-rendering:pixelated;user-select:none;-webkit-user-drag:none}.field-visual .field-brush{inset:auto;width:12%;height:24%;object-fit:contain;transform:translate(-50%,-50%);filter:drop-shadow(2px 2px #090914)}.field-visual .field-powder{position:absolute;right:6%;top:5%;width:42px;height:42px;background-size:400% 100%;image-rendering:pixelated}.field-visual .field-memory-caption{position:absolute;left:0;right:0;bottom:3%;text-align:center;color:#fff0b2;font:7px var(--px);text-shadow:2px 2px #10121c;pointer-events:none}.field-visual .field-paper{position:absolute;inset:0;overflow:hidden}.field-visual .field-paper>img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill}.field-visual .field-lens{position:absolute;z-index:3;width:22%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);overflow:hidden;background:#d8c29a;box-shadow:0 0 0 2px #0a0b12,0 0 0 5px #f5bd4b,0 0 18px #ffe26a99}.field-visual .field-lens img{position:absolute;z-index:1;max-width:none;width:100%;height:100%;object-fit:fill;pointer-events:none}.field-visual .field-lens-frame{position:absolute;z-index:2;inset:-13%;background-repeat:no-repeat;background-size:400% 100%;image-rendering:pixelated;pointer-events:none}.field-progress{height:7px;margin-top:8px;border:1px solid #617382;background:#172230}.field-progress i{display:block;width:0;height:100%;background:linear-gradient(90deg,#62d8c7,#ffe26a);transition:width .12s}.field-status{min-height:20px;margin-top:6px;color:#fff0b2;font:8px var(--px);line-height:1.6}.field-slider-control{display:flex;align-items:center;gap:10px;margin-top:7px;color:#9cf2d8;font:7px var(--px)}.field-slider-control input{flex:1;min-width:100px;accent-color:#ffe26a}.field-controls{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:7px}.field-controls .mystery-hint{margin:0}.field-controls button{flex:none}
    /* Los minijuegos caben en la ventana sin barra de desplazamiento interna. */
    .field-overlay{overflow:hidden}
    .field-panel{box-sizing:border-box;max-height:calc(100% - 24px);overflow:hidden;display:flex;flex-direction:column;justify-content:center}
    .field-panel .field-visual{width:auto;height:min(28vh,280px);max-width:100%;max-height:min(28vh,280px);aspect-ratio:3/2;margin:0 auto;flex:0 1 auto;min-height:100px}
    .field-panel .field-visual.memory{aspect-ratio:2/1}
    .field-panel .field-progress,.field-panel .field-status,.field-panel .field-slider-control,.field-panel .field-controls{flex:none}
    .field-panel .field-status{min-height:16px}
    @media(max-height:760px){.field-panel{max-height:calc(100% - 12px);padding:8px}.field-panel .field-visual{height:min(23vh,180px);max-height:min(23vh,180px)}}
    @media(max-width:650px){.mystery-grid{grid-template-columns:1fr}.mystery-panel{padding:9px}.mystery-panel p{font-size:11px}.mystery-overlay{padding:5px}.field-panel{width:calc(100% - 8px);padding:9px;max-height:calc(100% - 10px)}.field-panel>p{font-size:11px}.field-panel .field-visual{height:min(25vh,200px);max-height:min(25vh,200px)}.field-status{font-size:7px}.field-controls{align-items:flex-start;flex-direction:column}.field-controls button{width:100%}}
  `;
  css.textContent += `
    .field-panel .field-visual.lamp{width:min(100%,520px);height:auto;max-height:none;aspect-ratio:2.1;display:grid;place-items:center}
    .lamp-art{display:grid;width:100%;height:100%;grid-template-columns:1fr 2.15fr;gap:6px;align-items:center;padding:6px}
    .lamp-art[hidden]{display:none}
    .lamp-art canvas{display:block;width:100%;height:auto;image-rendering:pixelated}
    .lamp-register{position:relative;aspect-ratio:3/2;width:100%}
    .lamp-register img{object-fit:contain}
    .lamp-register .lamp-note{width:33.3%;height:auto;inset:63.1% auto auto 52.7%;opacity:0}
    .lamp-wash{position:absolute;inset:0;background:#121324;opacity:.72;pointer-events:none}
    .lamp-help{display:flex;align-items:center;gap:8px;margin:4px 0 2px}
    .lamp-help[hidden]{display:none}
    .field-panel.is-lamp .field-slider-control input{appearance:none;margin:0;height:14px;background:transparent;cursor:pointer}
    .field-panel.is-lamp .field-slider-control input::-webkit-slider-runnable-track{height:10px;background:linear-gradient(90deg,#25354a 48%,#bf893e 48% 72%,#25354a 72%);border:1px solid #62748a}
    .field-panel.is-lamp .field-slider-control input::-webkit-slider-thumb{appearance:none;width:7px;height:14px;margin-top:-3px;background:#fff2ab;border:1px solid #8c621b}
    .field-panel.is-lamp .field-slider-control input::-moz-range-track{height:8px;background:linear-gradient(90deg,#25354a 48%,#bf893e 48% 72%,#25354a 72%);border:1px solid #62748a}
    .field-panel.is-lamp .field-slider-control input::-moz-range-thumb{width:5px;height:12px;background:#fff2ab;border:1px solid #8c621b;border-radius:0}
    .book-panel{width:min(890px,97%);text-align:center}
    .book-panel .mystery-tabs{justify-content:center;margin:6px 0}
    .book-spread{position:relative;margin:0 auto;width:min(100%,calc(max(175px,100dvh - 310px) * 1.5));aspect-ratio:3/2;isolation:isolate}
    .book-spread>img,.book-spread>canvas{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;pointer-events:none}
    .book-spread>img{z-index:-1}
    .book-spread>canvas{z-index:2}
    .book-paper{position:absolute;top:15%;bottom:17%;width:33%;overflow:auto;color:#342235;text-align:left;padding:1px 5px;scrollbar-color:#ab7959 transparent;scrollbar-width:thin}
    .book-paper.left{left:11.8%}.book-paper.right{left:52.4%}
    .book-paper h3{margin:0 0 4px;font:800 clamp(11px,1.35vw,16px) system-ui,sans-serif;color:#4c2b38}
    .book-paper .mystery-card{margin:4px 0;background:#eec99d;border:1px solid #aa7c5e;padding:5px}
    .book-paper .mystery-card strong,.book-paper .mystery-hint{color:#55313e!important}
    .book-paper p{margin:3px 0;color:#362333;font-size:clamp(10px,1.12vw,14px);line-height:1.28}
    .book-paper .mystery-options{margin:4px 0;gap:4px}
    .book-paper button{padding:4px;font:700 clamp(9px,1vw,12px) system-ui,sans-serif}
    .book-paper .mystery-card:focus-visible,.book-paper:focus-visible{outline:2px solid #513348;outline-offset:-2px}
    .book-paper .mystery-buttons{margin:4px 0}
    .book-panel>p:last-child{margin:4px 0 0}
    @media(max-width:580px){.book-panel .mystery-tabs button{padding:5px}.book-paper{top:13%;bottom:14%;padding:1px 3px}.book-paper .mystery-card{padding:3px}.field-panel .field-visual.lamp{height:auto;max-height:none}}
  `;
  document.head.appendChild(css);
  const bookButton = document.createElement("button");
  bookButton.className = "mystery-book-button";
  bookButton.type = "button";
  bookButton.innerHTML = "LIBRETA <span>0/3</span>";
  bookButton.setAttribute("aria-label", "Abrir libreta de investigación");
  wrap.appendChild(bookButton);
  const storyOverlay = document.createElement("div");
  storyOverlay.className = "mystery-overlay story-dock hidden";
  storyOverlay.innerHTML = '<section class="mystery-panel story-panel" role="dialog" aria-modal="true" aria-labelledby="story-heading"><div class="story-portrait-frame" id="story-frame"><img id="story-speaker-image" alt="" hidden><div class="story-paper" id="story-paper" aria-hidden="true"><b>LIBRETA</b><i></i><i></i><i></i></div></div><div class="story-dialogue-content"><div class="story-heading-row"><h2 id="story-heading"></h2><span class="mystery-kicker" id="story-speaker"></span></div><div class="story-copy" id="story-copy" aria-live="polite"></div><div id="story-options" class="mystery-options"></div><div class="story-actions"><p id="story-feedback" class="mystery-hint"></p><button type="button" id="story-next">ROJO · CONTINUAR</button></div></div></section>';
  shell.insertBefore(storyOverlay, shell.querySelector(".game-footer"));
  const bookOverlay = document.createElement("div");
  bookOverlay.className = "mystery-overlay hidden";
  bookOverlay.innerHTML = '<section class="mystery-panel book-panel" role="dialog" aria-modal="true" aria-labelledby="book-heading"><div class="mystery-kicker">ARCHIVO DEL CASO 01</div><h2 id="book-heading">LIBRETA DE INVESTIGACIÓN</h2><div class="mystery-tabs"><button type="button" data-tab="evidence">EVIDENCIAS</button><button type="button" data-tab="people">SOSPECHOSOS</button><button type="button" data-tab="theory">MI TEORÍA</button><button type="button" id="book-close">CERRAR</button></div><div class="book-spread"><img src="' + VESTIBULE_ART_ROOT + 'libreta_anotaciones.png" alt=""><div id="book-content"><article class="book-paper left" id="book-left"></article><article class="book-paper right" id="book-right"></article></div><canvas id="book-turn" width="768" height="512" hidden aria-hidden="true"></canvas></div><p class="mystery-hint">← → MOVER FOCO O LEER · ARRIBA/ABAJO ELEGIR · ROJO CERRAR</p></section>';
  wrap.appendChild(bookOverlay);
  const accusationOverlay = document.createElement("div");
  accusationOverlay.className = "mystery-overlay hidden";
  accusationOverlay.innerHTML = '<section class="mystery-panel" role="dialog" aria-modal="true" aria-labelledby="accuse-heading"><div class="mystery-kicker">ÁTICO · MOMENTO DE DEDUCIR</div><h2 id="accuse-heading">¿QUIÉN ES EL FANTASMA?</h2><p>Elige a quién acusas y conecta las pruebas que sostienen tu explicación. Si necesitas revisar algo, vuelve a la mansión y regresa cuando estés lista.</p><strong>SOSPECHOSO</strong><div id="accuse-suspects" class="mystery-options"></div><strong>PRUEBAS</strong><div id="accuse-evidence" class="mystery-options"></div><p id="accuse-feedback" class="mystery-hint">Una acusación equivocada no termina el caso.</p><div class="mystery-buttons"><button type="button" id="submit-accusation">PRESENTAR ACUSACIÓN</button><button type="button" id="return-investigation">VOLVER A INVESTIGAR</button></div><p class="mystery-hint">← → MOVERSE · BOTÓN ARRIBA/ABAJO ELEGIR · BOTÓN ROJO VOLVER</p></section>';
  wrap.appendChild(accusationOverlay);
  const fieldOverlay = document.createElement("div");
  fieldOverlay.className = "mystery-overlay field-overlay hidden";
  fieldOverlay.innerHTML = '<section class="mystery-panel field-panel" role="dialog" aria-modal="true" aria-labelledby="field-title"><div class="mystery-kicker" id="field-kicker">MANSIÓN BRUMOSA · INTERACCIÓN</div><h2 id="field-title"></h2><p id="field-copy"></p><div id="field-visual" class="field-visual"><img id="field-base" alt=""/><img id="field-layer" alt=""/><img id="field-secondary" alt=""/><img id="field-brush" class="field-brush" alt=""/><div id="field-powder" class="field-powder"></div><div id="field-paper" class="field-paper"><img id="field-paper-image" alt=""/><div id="field-lens" class="field-lens"><img id="field-lens-image" alt=""/><div id="field-lens-frame" class="field-lens-frame"></div></div></div><span id="field-memory-caption" class="field-memory-caption"></span><div class="lamp-art" id="field-lamp-art" hidden><canvas id="field-lamp" width="182" height="192" aria-label="Lámpara del registro"></canvas><div class="lamp-register"><img src="' + VESTIBULE_ART_ROOT + 'pagina_registro.png" alt="Registro de visitas"><div id="lamp-wash" class="lamp-wash"></div><img id="lamp-note" class="lamp-note" src="' + VESTIBULE_ART_ROOT + 'nota_margen.svg" alt="" aria-hidden="true"></div></div></div><div class="field-progress"><i id="field-progress-fill"></i></div><div id="field-status" class="field-status" aria-live="polite"></div><label class="field-slider-control">DESLIZADOR<input id="field-slider-control" type="range" min="0" max="100" value="50" aria-label="Deslizador del minijuego"/></label><div class="lamp-help" id="lamp-help" hidden><button type="button" id="lamp-power">ENCENDER</button></div><div class="field-controls"><p id="field-hint" class="mystery-hint">← IZQUIERDA · DERECHA → · ↑ ARRIBA · ABAJO ↓ · DESLIZADOR · BOTÓN ROJO SALIR</p><button type="button" id="field-cancel">BOTÓN ROJO · SALIR</button></div></section>';
  wrap.appendChild(fieldOverlay);
  const pauseButtons = document.querySelector("#pause .buttons");
  if (pauseButtons) {
    const pauseBookButtons = [...pauseButtons.querySelectorAll("button")].filter(button => /ABRIR LIBRETA/i.test(button.textContent));
    let pauseBook = pauseBookButtons.shift();
    if (!pauseBook) {
      pauseBook = document.createElement("button");
      pauseBook.type = "button"; pauseBook.className = "btn dark";
      pauseBook.textContent = "ABRIR LIBRETA"; pauseButtons.appendChild(pauseBook);
    }
    pauseBook.id = "open-case-book"; pauseBook.onclick = openBook;
    pauseBookButtons.forEach(button => button.remove());
  }

  const evidenceFound = [false, false, false];
  const playerNotes = [];
  const interviewed = new Set();
  let dialog = null, dialogIndex = 0, selectedOption = 0, selectedTab = "evidence", bookReturnFocus = null;
  let bookTurn = null;
  const bookTabs = ["evidence", "people", "theory"];
  let theorySuspect = 0;
  const theoryEvidence = new Set();
  const savedTheories = [];
  let accusationSuspect = 0;
  const accusationEvidence = new Set();
  let accusationShown = false;
  let activeActivity = null, fieldState = null, fieldLastPaint = 0, fieldSliderZone = null;
  const finishedActivities = new Set();
  const fieldAssetRoot = location.pathname.includes("/misterios_por_todas_partes_v3/") ? "../assets/definitivos_pixelart/" : "assets/definitivos_pixelart/";
  const fieldAsset = (group, file) => fieldAssetRoot + group + "/" + file;
  const fieldZone = value => value < 25 ? "low" : value > 75 ? "high" : "mid";
  const modalOpen = () => !!activeActivity || !storyOverlay.classList.contains("hidden") || !bookOverlay.classList.contains("hidden") || !accusationOverlay.classList.contains("hidden");
  const foundCount = () => evidenceFound.filter(Boolean).length;
  const canOpenBook = () => currentScreen === "game" && game.running && !game.tutorial;
  function updateBookButton() {
    const count = foundCount() + "/3", counter = bookButton.querySelector("span");
    if (counter.textContent !== count) counter.textContent = count;
    bookButton.hidden = !canOpenBook();
  }

  function showStoryStep() {
    if (!dialog) return;
    const step = dialog.steps[dialogIndex];
    const speaker = step.speaker || "NOTA DE CAMPO";
    $("story-heading").textContent = speaker;
    $("story-speaker").textContent = (step.title || dialog.title) + " · " + (dialogIndex + 1) + "/" + dialog.steps.length;
    const image = $("story-speaker-image"), portrait = portraits[speaker];
    image.hidden = !portrait;
    $("story-paper").hidden = !!portrait;
    if (portrait && image.getAttribute("src") !== portraitRoot + portrait) image.src = portraitRoot + portrait;

    const copy = document.createElement("p");
    copy.textContent = step.text;
    $("story-copy").replaceChildren(copy);
    const options = $("story-options");
    options.replaceChildren();
    options.hidden = !step.options;
    if (step.options) {
      step.options.forEach((label, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.classList.toggle("selected", index === selectedOption);
        button.setAttribute("aria-pressed", String(index === selectedOption));
        button.onclick = () => { selectedOption = index; showStoryStep(); };
        options.appendChild(button);
      });
    }
    $("story-feedback").textContent = step.options ? "← → ELEGIR · ROJO CONFIRMAR" : "ROJO · SIGUIENTE";
    $("story-next").textContent = step.options ? "ROJO · CONFIRMAR" :
      dialogIndex === dialog.steps.length - 1 ? "ROJO · SEGUIR" : "ROJO · CONTINUAR";
    shell.classList.add("story-reading");
    storyOverlay.classList.remove("hidden");
  }

  function closeStory() {
    dialog = null;
    storyOverlay.classList.add("hidden");
    shell.classList.remove("story-reading");
    updateBookButton();
  }

  function nextStory() {
    if (!dialog) return;
    const current = dialog.steps[dialogIndex];
    const choice = current.observations?.[selectedOption];
    if (choice && !playerNotes.includes(choice)) {
      playerNotes.push(choice);
      showToast("OBSERVACIÓN GUARDADA EN LA LIBRETA");
    }
    dialogIndex++;
    selectedOption = 0;
    if (dialogIndex >= dialog.steps.length) { closeStory(); return; }
    showStoryStep();
  }
  function openClueStory(index) {
    if (index < 0 || index >= clueNotes.length) return;
    const clue = clueNotes[index];
    const steps = clue.lines.map(([speaker, text]) => ({ title: clue.title, speaker, text }));
    steps.push({ title: clue.title, speaker: "NOTA DE CAMPO · GUARDADA", text: clue.note });
    steps.push({ title: "TU DEDUCCIÓN", speaker: "ELIGE UNA IDEA", text: clue.question, options: clue.options, observations: clue.observation });
    dialog = { title: clue.title, steps }; dialogIndex = 0; selectedOption = 0;
    showStoryStep();
  }
  function openNpcConversation(person) {
    if (!interviewed.has(person.id)) {
      interviewed.add(person.id);
      playerNotes.push(person.name + ": conversación registrada en la libreta.");
    }
    const title = "CONVERSACIÓN · " + person.name;
    const steps = person.lines.map(([speaker, text]) => ({ title, speaker, text }));
    if (person.id === "elvira") {
      steps.push({
        title, speaker: "ELVIRA", text: "¿Qué quieren anotar antes de seguir?",
        options: ["La llave prestada", "La luz del retrato"],
        observations: ["Elvira prestó al restaurador una llave de la galería.", "Elvira vio que la luz del retrato se encendió antes de la aparición."]
      });
    }
    dialog = { title, steps };
    dialogIndex = 0; selectedOption = 0; showStoryStep();
  }

  const fieldMemory = ["left", "low", "right", "jump", "high", "skill"];
  const fieldMemoryNames = { left: "BOTÓN IZQUIERDO", right: "BOTÓN DERECHO", jump: "BOTÓN ARRIBA", skill: "BOTÓN ABAJO", low: "DESLIZADOR · ZONA BAJA", high: "DESLIZADOR · ZONA ALTA" };
  function setFieldImage(id, group, file) {
    const image = $(id); if (!image) return;
    if (!file) { image.removeAttribute("src"); delete image.dataset.asset; image.style.display = "none"; return; }
    const src = fieldAsset(group, file);
    if (image.dataset.asset !== src) { image.src = src; image.dataset.asset = src; }
    image.style.display = "block";
  }
  function setFieldProgress(value) { $("field-progress-fill").style.width = (Math.max(0, Math.min(1, value)) * 100) + "%"; }
  function setFieldStatus(text) {
    const status = $("field-status");
    if (status.textContent !== text) status.textContent = text;
  }
  function startFieldActivity(activity) {
    activeActivity = activity;
    const now = performance.now();
    fieldSliderZone = fieldZone(paceVal());
    fieldLastPaint = now;
    fieldState = { started: now, phase: "show", patternIndex: 0, hold: 0, anchors: new Set(), directions: new Set(), reveals: 0, brushX: 50, brushY: 55, brushAngle: 0, lensX: .4, lensY: .55, zoomHold: 0, tensionHold: 0, sliderZone: fieldSliderZone };
    $("field-kicker").textContent = "SUBNIVEL 0" + (activity.stage + 1) + " · " + ({ fingerprint: "VESTÍBULO", lamp: "REPISA DEL REGISTRO", magnifier: "GALERÍA", radio: "ALA DE SERVICIO", memory: "INVERNADERO", trap: "BIBLIOTECA" }[activity.kind]);
    $("field-title").textContent = activity.title; $("field-copy").textContent = activity.copy;
    $("field-visual").className = "field-visual " + (activity.kind === "memory" ? "memory" : activity.kind);
    ["field-base", "field-layer", "field-secondary", "field-brush"].forEach(id => setFieldImage(id, "", ""));
    $("field-powder").style.display = "none"; $("field-paper").style.display = "none"; $("field-memory-caption").style.display = "none";
    const lamp = activity.kind === "lamp";
    fieldOverlay.firstElementChild.classList.toggle("is-lamp", lamp);
    $("field-lamp-art").hidden = $("lamp-help").hidden = !lamp;
    $("field-hint").textContent = lamp ? "ABAJO · ENCENDER / APAGAR · DESLIZADOR · ROJO SALIR" :
      "← IZQUIERDA · DERECHA → · ↑ ARRIBA · ABAJO ↓ · DESLIZADOR · BOTÓN ROJO SALIR";
    if (lamp) {
      fieldState.solved = game.vestibule.progress.lampNote;
      fieldState.lampOn = fieldState.solved;
    } else if (activity.kind === "radio") {
      setFieldImage("field-base", "radio", "radio_panel_base.png"); setFieldImage("field-layer", "radio", "radio_signal_frame_01.svg");
      setFieldStatus("BUSCA 103 MHz · MANTÉN LA SEÑAL EN LA FRANJA VERDE");
    } else if (activity.kind === "memory") {
      setFieldImage("field-base", "memoria", "memory_controls_base.png");
      $("field-memory-caption").style.display = "block";
      setFieldStatus("OBSERVA LA SECUENCIA COMPLETA ANTES DE REPETIRLA");
    } else if (activity.kind === "fingerprint") {
      setFieldImage("field-base", "huella", "fingerprint_card_base.png");
      setFieldImage("field-layer", "huella", "fingerprint_reveal_frame_01.svg");
      setFieldImage("field-brush", "huella", "fingerprint_brush_frame_01.png");
      $("field-powder").style.display = "block";
      $("field-powder").style.backgroundImage = "url('" + fieldAsset("huella", "fingerprint_powder_4frames.svg") + "')";
      setFieldStatus("LA HUELLA APARECE POCO A POCO · BROCHA EN 4 DIRECCIONES · DESLIZADOR BAJO / ALTO 6 VECES");
    } else if (activity.kind === "trap") {
      setFieldImage("field-base", "trampa", "trap_setup_base.png");
      setFieldImage("field-layer", "trampa", "trap_deploy_frame_01.svg");
      setFieldImage("field-secondary", "trampa", "trap_tension_frame_01.svg");
      setFieldStatus("ANCLAJES 0/4 · USA CADA BOTÓN UNA VEZ");
    } else if (activity.kind === "magnifier") {
      $("field-paper").style.display = "block";
      setFieldImage("field-paper-image", "lupa_pistas", "clue_costume_fibers.png");
      setFieldImage("field-lens-image", "lupa_pistas", "clue_costume_fibers.png");
      setFieldStatus("BUSCA EL HILO VIOLETA · ACERCA LA LUPA PARA COMPARARLO");
    }
    $("field-slider-control").value = String(Math.round(paceVal()));
    fieldOverlay.classList.remove("hidden");
    paintFieldActivity(now);
  }
  function closeFieldActivity() {
    activeActivity = null; fieldState = null; fieldLastPaint = 0;
    fieldOverlay.classList.add("hidden");
  }
  function finishFieldActivity() {
    if (!activeActivity) return;
    const activity = activeActivity;
    finishedActivities.add(activity.id);
    if (Number.isInteger(activity.clue)) {
      const clue = clues[activity.clue];
      if (clue) clue.found = true;
      showToast("¡PRUEBA REVELADA! SE ABRE EL DIÁLOGO DEL EQUIPO");
    } else if (activity.note && !playerNotes.includes(activity.note)) {
      playerNotes.push(activity.note); showToast("NOTA DE CAMPO GUARDADA EN LA LIBRETA");
    }
    closeFieldActivity();
  }
  function acceptMemoryEvent(event) {
    if (!activeActivity || activeActivity.kind !== "memory" || fieldState.phase !== "replay") return;
    if (event !== fieldMemory[fieldState.patternIndex]) {
      fieldState.phase = "show"; fieldState.started = performance.now(); fieldState.patternIndex = 0; fieldState.sliderZone = fieldZone(paceVal());
      setFieldStatus("SECUENCIA DISTINTA · OBSERVA OTRA VEZ"); return;
    }
    fieldState.patternIndex++;
    if (fieldState.patternIndex >= fieldMemory.length) { finishFieldActivity(); return; }
    setFieldStatus("CORRECTO · REPITE " + (fieldState.patternIndex + 1) + "/" + fieldMemory.length);
  }
  function handleFieldZone(zone) {
    if (!activeActivity || !fieldState || zone === fieldSliderZone) return;
    fieldSliderZone = zone;
    if (activeActivity.kind === "fingerprint" && zone !== "mid") {
      fieldState.reveals = Math.min(6, fieldState.reveals + 1);
      if (fieldState.reveals >= 6 && fieldState.directions.size === 4) { finishFieldActivity(); return; }
    }
    if (activeActivity.kind === "memory" && fieldState.phase === "replay" && zone !== "mid") acceptMemoryEvent(zone);
  }
  function handleFieldButton(button) {
    if (!activeActivity || !fieldState) return;
    const state = fieldState, kind = activeActivity.kind;
    if (kind === "lamp" && button === "skill" && !state.solved) {
      state.lampOn = !state.lampOn;
      state.hold = 0;
      beep(state.lampOn ? 540 : 270, .09, "triangle");
    }
    if (kind === "fingerprint") {
      if (button === "left") { state.brushX = Math.max(18, state.brushX - 8); state.brushAngle = 180; state.directions.add("left"); }
      if (button === "right") { state.brushX = Math.min(82, state.brushX + 8); state.brushAngle = 0; state.directions.add("right"); }
      if (button === "jump") { state.brushY = Math.max(22, state.brushY - 8); state.brushAngle = -90; state.directions.add("up"); }
      if (button === "skill") { state.brushY = Math.min(78, state.brushY + 8); state.brushAngle = 90; state.directions.add("down"); }
    } else if (kind === "trap") {
      state.anchors.add(button);
      if (state.anchors.size < 4) setFieldStatus("ANCLAJES " + state.anchors.size + "/4 · SIGUE EL ORDEN QUE PREFIERAS");
    } else if (kind === "magnifier") {
      const step = .075;
      if (button === "left") state.lensX = Math.max(.13, state.lensX - step);
      if (button === "right") state.lensX = Math.min(.87, state.lensX + step);
      if (button === "jump") state.lensY = Math.max(.13, state.lensY - step);
      if (button === "skill") state.lensY = Math.min(.87, state.lensY + step);
    } else if (kind === "memory" && state.phase === "replay") acceptMemoryEvent(button);
  }
  function paintLamp(state, value, dt) {
    const aligned = state.lampOn && value >= 48 && value <= 72;
    if (!state.solved) {
      state.hold = aligned ? Math.min(1.15, state.hold + dt) : 0;
      if (state.hold >= 1.15) {
        state.solved = true;
        game.vestibule.progress.lampNote = true;
        if (!playerNotes.includes(lampActivity.note)) playerNotes.push(lampActivity.note);
        beep(740, .14, "triangle");
      }
    }
    const frame = state.solved ? 2 : !state.lampOn ? 0 : value < 48 ? 1 : value <= 72 ? 2 : 3;
    const lamp = $("field-lamp"), context = lamp.getContext("2d");
    context.clearRect(0, 0, lamp.width, lamp.height);
    context.imageSmoothingEnabled = false;
    drawVestibuleArt(context, "lampara_registro_4f", frame, 63, 180, .31);
    $("lamp-wash").style.opacity = [.75, .52, .12, .02][frame];
    $("lamp-note").style.opacity = state.solved ? 1 : 0;
    $("lamp-power").disabled = state.solved;
    $("lamp-power").textContent = state.solved ? "NOTA REVELADA" : state.lampOn ? "APAGAR" : "ENCENDER";
    setFieldStatus(state.solved ? "22:40 · ELVIRA SEGUÍA AL TELÉFONO · NOTA GUARDADA" :
      !state.lampOn ? "PULSA ABAJO PARA ENCENDER" :
      aligned ? "LUZ DE LECTURA · MANTÉN LA POSICIÓN" :
      value < 48 ? "LUZ TENUE · DESLIZA A LA DERECHA" : "LUZ INTENSA · DESLIZA A LA IZQUIERDA");
    return state.solved ? 1 : state.hold / 1.15;
  }

  function paintFieldActivity(now) {
    if (!activeActivity || !fieldState) return;
    const activity = activeActivity, state = fieldState, value = paceVal(), zone = fieldZone(value);
    const dt = fieldLastPaint ? Math.max(0, Math.min(.06, (now - fieldLastPaint) / 1000)) : 0;
    fieldLastPaint = now;
    if (zone !== fieldSliderZone) handleFieldZone(zone);
    if (!activeActivity) return;
    let progress = 0;
    if (activity.kind === "lamp") progress = paintLamp(state, value, dt);
    else if (activity.kind === "radio") {
      const aligned = Math.abs(value - 68) <= 5;
      state.hold = aligned ? state.hold + dt : 0;
      const signal = Math.min(1, state.hold / 1.2);
      setFieldImage("field-layer", "radio", "radio_signal_frame_" + String(Math.max(1, Math.ceil(signal * 8))).padStart(2, "0") + ".svg");
      progress = signal; setFieldStatus("FRECUENCIA " + (88 + value * .22).toFixed(1) + " MHz · SEÑAL " + Math.round(signal * 100) + "% · MANTÉN EN ZONA");
      if (state.hold >= 1.2) { finishFieldActivity(); return; }
    } else if (activity.kind === "memory") {
      const duration = fieldMemory.length * 850;
      if (state.phase === "show" && now - state.started >= duration) { state.phase = "replay"; state.patternIndex = 0; state.sliderZone = fieldZone(value); fieldSliderZone = state.sliderZone; }
      const show = state.phase === "show", index = show ? Math.min(fieldMemory.length - 1, Math.floor((now - state.started) / 850)) : state.patternIndex;
      const event = fieldMemory[index], buttonName = { left: "left", right: "right", jump: "top", skill: "bottom" }[event];
      setFieldImage("field-layer", "memoria", buttonName ? "memory_button_" + buttonName + "_frame_" + String(1 + Math.floor(now / 135) % 4).padStart(2, "0") + ".svg" : "");
      const sliderValue = show && event === "low" ? 0 : show && event === "high" ? 100 : value;
      const sliderFrame = 13 - Math.round(sliderValue / 100 * 12);
      setFieldImage("field-secondary", "memoria", "memory_slider_frame_" + String(sliderFrame).padStart(2, "0") + ".svg");
      $("field-memory-caption").textContent = (show ? "OBSERVA " + (index + 1) + "/" : "REPITE ") + fieldMemoryNames[event];
      progress = show ? index / fieldMemory.length : state.patternIndex / fieldMemory.length;
      setFieldStatus(show ? "OBSERVA LOS BOTONES Y LAS DOS ZONAS DEL DESLIZADOR" : "REPITE EN EL MISMO ORDEN · " + state.patternIndex + "/" + fieldMemory.length);
    } else if (activity.kind === "fingerprint") {
      const stage = Math.max(1, Math.min(6, state.reveals + 1));
      setFieldImage("field-layer", "huella", "fingerprint_reveal_frame_" + String(stage).padStart(2, "0") + ".svg");
      setFieldImage("field-brush", "huella", "fingerprint_brush_frame_" + String(1 + Math.floor(now / 115) % 4).padStart(2, "0") + ".png");
      const brush = $("field-brush"); brush.style.left = state.brushX + "%"; brush.style.top = state.brushY + "%"; brush.style.transform = "translate(-50%,-50%) rotate(" + state.brushAngle + "deg)";
      $("field-powder").style.backgroundPosition = (Math.floor(now / 115) % 4 * 100 / 3) + "% 0";
      progress = Math.min(1, state.reveals / 6); setFieldStatus("HUELLA " + state.reveals + "/6 · DIRECCIONES " + state.directions.size + "/4 · DESLIZADOR " + ({low:"IZQUIERDA",mid:"CENTRO",high:"DERECHA"}[zone]));
      if (state.reveals >= 6 && state.directions.size === 4) { finishFieldActivity(); return; }
    } else if (activity.kind === "trap") {
      const count = state.anchors.size;
      setFieldImage("field-layer", "trampa", "trap_deploy_frame_" + String(Math.min(4, count + 1)).padStart(2, "0") + ".svg");
      setFieldImage("field-secondary", "trampa", "trap_tension_frame_" + String(1 + Math.round(value / 100 * 8)).padStart(2, "0") + ".svg");
      if (count === 4 && value >= 45 && value <= 60) state.tensionHold += dt; else state.tensionHold = 0;
      progress = count / 4 * .72 + Math.min(1, state.tensionHold / .85) * .28;
      setFieldStatus("ANCLAJES " + count + "/4 · " + (count === 4 ? "TENSIÓN " + Math.round(value) + "% · CENTRA EL DESLIZADOR" : "USA UN BOTÓN POR ANCLAJE"));
      if (count === 4 && state.tensionHold >= .85) { finishFieldActivity(); return; }
    } else if (activity.kind === "magnifier") {
      const lens = $("field-lens"), visualRect = $("field-visual").getBoundingClientRect(), lensRect = lens.getBoundingClientRect(), zoom = 1 + value * .02;
      lens.style.left = state.lensX * 100 + "%"; lens.style.top = state.lensY * 100 + "%";
      const imageWidth = zoom * visualRect.width / Math.max(1, lensRect.width) * 100, imageHeight = zoom * visualRect.height / Math.max(1, lensRect.height) * 100;
      const lensImage = $("field-lens-image"); lensImage.style.width = imageWidth + "%"; lensImage.style.height = imageHeight + "%";
      lensImage.style.left = (50 - state.lensX * imageWidth) + "%"; lensImage.style.top = (50 - state.lensY * imageHeight) + "%";
      const frame = $("field-lens-frame"), frameIndex = Math.floor(now / 125) % 4;
      frame.style.backgroundImage = "url('" + fieldAsset("lupa_pistas", "magnifier_4frames.svg") + "')"; frame.style.backgroundPosition = (frameIndex / 3 * 100) + "% 0";
      const distance = Math.hypot(state.lensX - .55, state.lensY - .29), aligned = distance < .105 && zoom >= 2.25;
      state.zoomHold = aligned ? state.zoomHold + dt : 0; progress = aligned ? Math.min(1, state.zoomHold / .8) : Math.max(0, Math.min(.65, 1 - distance / .7));
      setFieldStatus(aligned ? "FIBRA ENFOCADA · MANTÉN EL ZOOM" : "MUEVE LA LENTE · ZOOM " + zoom.toFixed(1) + "×");
      if (state.zoomHold >= .8) { finishFieldActivity(); return; }
    }
    setFieldProgress(progress);
    const slider = $("field-slider-control"); if (document.activeElement !== slider) slider.value = String(Math.round(value));
  }

  function drawFieldStations(now) {
    if (currentScreen !== "game" || game.tutorial || !game.running) return;
    const playerX = game.player.x + game.player.w / 2;
    const stage = Number(window.mansionCaseStage || 0);
    const palette = {
      fingerprint: ["HUELLA", "#d7ad67"], magnifier: ["FIBRA", "#b88ae7"],
      radio: ["RADIO", "#8edbce"], memory: ["MEMORIA", "#e7c853"], trap: ["TRAMPA", "#d9a55c"]
    };
    for (const activity of fieldActivities) {
      if (activity.stage !== stage) continue;
      const stationWorldX = activity.x + 28;
      const screenX = Math.round(stationWorldX - game.cam);
      if (screenX < -35 || screenX > W + 35) continue;
      const [label, accent] = palette[activity.kind];
      const done = finishedActivities.has(activity.id);
      const close = Math.abs(activity.x - playerX) < 88;
      const baseY = GROUND - 16;
      ctx.save(); ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = done ? .45 : 1;
      // A small pixel station gives the player a world-space landmark before interaction.
      ctx.fillStyle = "#080a12"; ctx.fillRect(screenX - 17, baseY - 28, 34, 30);
      ctx.fillStyle = "#253147"; ctx.fillRect(screenX - 14, baseY - 25, 28, 23);
      ctx.fillStyle = accent; ctx.fillRect(screenX - 12, baseY - 23, 24, 2);
      if (activity.kind === "fingerprint") {
        ctx.fillStyle = "#efe1bb"; ctx.fillRect(screenX - 9, baseY - 18, 18, 10);
        ctx.fillStyle = "#ad8955"; ctx.fillRect(screenX - 5, baseY - 16, 2, 2); ctx.fillRect(screenX + 3, baseY - 16, 2, 2);
        ctx.fillRect(screenX - 3, baseY - 13, 6, 1); ctx.fillRect(screenX - 2, baseY - 12, 4, 1);
      } else if (activity.kind === "magnifier") {
        ctx.fillStyle = "#efe1bb"; ctx.fillRect(screenX - 9, baseY - 18, 18, 10);
        ctx.fillStyle = "#a272b9"; ctx.fillRect(screenX - 6, baseY - 16, 10, 2); ctx.fillRect(screenX - 2, baseY - 14, 8, 2);
        ctx.fillStyle = "#e8c961"; ctx.fillRect(screenX + 4, baseY - 12, 5, 2);
      } else if (activity.kind === "radio") {
        ctx.fillStyle = "#8e513b"; ctx.fillRect(screenX - 10, baseY - 19, 20, 12);
        ctx.fillStyle = "#17222a"; ctx.fillRect(screenX - 7, baseY - 17, 14, 5);
        ctx.fillStyle = "#8ee2d2"; ctx.fillRect(screenX - 4, baseY - 15, 8, 1);
        ctx.fillStyle = "#f1c65a"; ctx.fillRect(screenX + 7, baseY - 16, 2, 2); ctx.fillRect(screenX + 7, baseY - 12, 2, 2);
      } else if (activity.kind === "memory") {
        ctx.fillStyle = "#121b28"; ctx.fillRect(screenX - 9, baseY - 19, 18, 13);
        for (const [dx, dy, color] of [[0,-16,"#fff0bf"],[-4,-12,"#b77be7"],[4,-12,"#4d9ee2"],[0,-8,"#f1c65a"]]) { ctx.fillStyle = color; ctx.fillRect(screenX + dx - 1, baseY + dy - 1, 3, 3); }
      } else {
        ctx.fillStyle = "#eadcb5"; ctx.fillRect(screenX - 9, baseY - 18, 18, 10);
        ctx.fillStyle = "#a87844"; ctx.fillRect(screenX - 6, baseY - 16, 2, 6); ctx.fillRect(screenX + 4, baseY - 16, 2, 6);
        ctx.fillStyle = "#ab554b"; ctx.fillRect(screenX - 4, baseY - 11, 8, 1);
      }
      ctx.fillStyle = "#11121d"; ctx.fillRect(screenX - 18, baseY + 1, 36, 2);
      txt(done ? "LISTO" : label, screenX, baseY - 33, done ? "#9cf2d8" : accent, 5, "center");
      if (close && !done) {
        const prompt = "↓ ABAJO · INVESTIGAR", width = prompt.length * 5 + 12;
        ctx.fillStyle = "#101827ee"; ctx.fillRect(screenX - width / 2, baseY - 57, width, 14);
        ctx.strokeStyle = "#ffe26a"; ctx.strokeRect(screenX - width / 2 + .5, baseY - 56.5, width - 1, 13);
        txt(prompt, screenX, baseY - 47, "#fff1c6", 5, "center");
      }
      ctx.restore();
    }
  }

  function renderBook() {
    const left = $("book-left"), right = $("book-right");
    left.replaceChildren();
    right.replaceChildren();
    left.scrollTop = right.scrollTop = 0;
    bookOverlay.querySelectorAll("[data-tab]").forEach(button => {
      const active = button.dataset.tab === selectedTab;
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const heading = (page, title) => {
      const h = document.createElement("h3");
      h.textContent = title; page.append(h);
    };
    const entry = (page, markup) => {
      const card = document.createElement("article");
      card.className = "mystery-card";
      card.dataset.bookEntry = "";
      card.tabIndex = 0;
      card.innerHTML = markup;
      page.append(card);
    };
    if (selectedTab === "evidence") {
      heading(left, "Evidencias");
      heading(right, "Anotaciones");
      clueNotes.forEach((clue, index) => {
        entry(left, "<strong>" + (evidenceFound[index] ? clue.title : "PISTA " + (index + 1) + " · PENDIENTE") +
          "</strong><p>" + (evidenceFound[index] ? clue.note : "Explora el subnivel y busca la estación de investigación.") + "</p>");
      });
      if (!playerNotes.length) entry(right, "<p>Aún no hay observaciones del equipo.</p>");
      playerNotes.forEach(note => entry(right, "<p>" + note + "</p>"));
    } else if (selectedTab === "people") {
      heading(left, "Sospechosos · 1–3");
      heading(right, "Sospechosos · 4–6");
      suspects.forEach((suspect, index) => {
        const met = interviewed.has(["elvira","amalia","bruno","celia","tomas","damian"][index]);
        entry(index < 3 ? left : right, "<strong>" + suspect.name + "</strong><p>" +
          (met ? "<b>Motivo aparente:</b> " + suspect.motive + "</p><p><b>Declaración:</b> " + suspect.statement +
            "</p><p><b>Comprobar:</b> " + suspect.check : "Aún no has conversado con esta persona.") + "</p>");
      });
    } else {
      left.innerHTML = '<h3>Mi teoría</h3><strong>SOSPECHOSO</strong><div id="theory-suspects" class="mystery-options"></div><strong>EVIDENCIAS QUE CONECTAS</strong><div id="theory-evidence" class="mystery-options"></div>';
      right.innerHTML = '<h3>Hipótesis guardadas</h3><div class="mystery-buttons"><button type="button" id="save-theory">GUARDAR HIPÓTESIS</button></div><p id="theory-feedback" class="mystery-hint">Elige un sospechoso y al menos una pista.</p><div id="saved-theories"></div>';
      const people = $("theory-suspects");
      suspects.forEach((suspect, index) => {
        const button = document.createElement("button"); button.type = "button"; button.textContent = suspect.name;
        button.classList.toggle("selected", index === theorySuspect);
        button.onclick = () => {
          theorySuspect = index;
          people.querySelectorAll("button").forEach((item, itemIndex) => item.classList.toggle("selected", itemIndex === index));
        };
        people.appendChild(button);
      });
      const evidence = $("theory-evidence");
      clueNotes.forEach((item, index) => {
        const button = document.createElement("button"); button.type = "button";
        button.textContent = (evidenceFound[index] ? item.title : "PISTA " + (index + 1) + " · PENDIENTE");
        button.disabled = !evidenceFound[index]; button.classList.toggle("selected", theoryEvidence.has(index));
        button.onclick = () => {
          if (theoryEvidence.has(index)) theoryEvidence.delete(index); else theoryEvidence.add(index);
          button.classList.toggle("selected", theoryEvidence.has(index));
        };
        evidence.appendChild(button);
      });
      const history = $("saved-theories");
      savedTheories.forEach(note => entry(history, "<p>" + note + "</p>"));
      $("save-theory").onclick = () => {
        const suspect = suspects[theorySuspect];
        const chosen = [...theoryEvidence];
        const feedback = $("theory-feedback");
        if (!chosen.length) { feedback.textContent = "Selecciona al menos una evidencia para apoyar tu idea."; return; }
        const note = "Teoría: " + suspect.name + " · evidencias " + chosen.map(i => i + 1).join(", ") + ".";
        const fresh = !savedTheories.includes(note);
        if (fresh) savedTheories.push(note);
        if (!playerNotes.includes(note)) playerNotes.push(note);
        feedback.textContent = suspect.name.startsWith("DAMIÁN") && chosen.length === 3
          ? "LAS TRES PRUEBAS CONECTAN CON DAMIÁN. Guarda esta teoría para el ático."
          : "HIPÓTESIS GUARDADA. Revisa qué evidencia la confirma y cuál la contradice.";
        if (fresh) entry(history, "<p>" + note + "</p>");
      };
    }
  }
  function requestBookTab(tab) {
    if (tab === selectedTab || bookTurn) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !VESTIBULE_ART.hoja_giro_6f.image.naturalWidth) {
      selectedTab = tab;
      renderBook();
      return;
    }
    bookTurn = {
      tab, started: performance.now(), frame: -1,
      forward: bookTabs.indexOf(tab) > bookTabs.indexOf(selectedTab)
    };
    paintBookTurn(bookTurn.started);
  }

  function paintBookTurn(now) {
    if (!bookTurn) return;
    const canvas = $("book-turn");
    const elapsed = Math.max(0, now - bookTurn.started);
    const step = Math.min(6, Math.floor(elapsed / 58));
    if (step >= 3 && selectedTab !== bookTurn.tab) {
      selectedTab = bookTurn.tab;
      renderBook();
    }
    if (step >= 6) {
      bookTurn = null;
      canvas.hidden = true;
      return;
    }
    if (bookTurn.frame === step) return;
    bookTurn.frame = step;
    canvas.hidden = false;
    const index = bookTurn.forward ? step : 5 - step;
    const sheet = VESTIBULE_ART.hoja_giro_6f;
    const [sx, sy] = sheet.frames[index][0];
    const offset = index < 3 ? 264 : 8, width = index < 3 ? 216 : 239;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;
    context.drawImage(sheet.image, sx + offset, sy + 44, width, 424,
      Math.round((739 + (offset - 255) * 2.36) / 2), 23, Math.round(width * 2.36 / 2), 416);
  }

  function openBook() {
    if (!canOpenBook() || modalOpen()) return;
    bookReturnFocus = document.activeElement;
    selectedTab = "evidence"; renderBook(); bookOverlay.classList.remove("hidden");
    const first = bookOverlay.querySelector("[data-tab]"); if (first) first.focus();
  }
  function closeBook() {
    bookOverlay.classList.add("hidden");
    bookTurn = null;
    $("book-turn").hidden = true;
    if (bookReturnFocus && bookReturnFocus.focus) bookReturnFocus.focus();
    bookReturnFocus = null;
    updateBookButton();
  }
  function cycleFocus(direction) {
    const container = !bookOverlay.classList.contains("hidden") ? bookOverlay : accusationOverlay;
    const list = [...container.querySelectorAll("button:not([disabled]),select:not([disabled]),input:not([disabled]),[data-book-entry]")];
    if (!list.length) return;
    let at = list.indexOf(document.activeElement); at = (at + direction + list.length) % list.length; list[at].focus();
  }
  function handleStoryInput(key) {
    if (!storyOverlay.classList.contains("hidden")) {
      const step = dialog && dialog.steps[dialogIndex];
      if ((key === "left" || key === "right") && step && step.options) { selectedOption = (selectedOption + (key === "right" ? 1 : step.options.length - 1)) % step.options.length; showStoryStep(); }
      else if (key === "confirm" && !step?.options) nextStory();
      return true;
    }
    if (!bookOverlay.classList.contains("hidden")) {
      if (key === "left" || key === "right") cycleFocus(key === "right" ? 1 : -1);
      else if (key === "confirm") { if (document.activeElement && document.activeElement.click) document.activeElement.click(); }
      else if (key === "back") closeBook();
      return true;
    }
    if (!accusationOverlay.classList.contains("hidden")) {
      if (key === "left" || key === "right") cycleFocus(key === "right" ? 1 : -1);
      else if (key === "confirm") { if (document.activeElement && document.activeElement.click) document.activeElement.click(); }
      else if (key === "back") returnToInvestigation();
      return true;
    }
    return false;
  }

  bookButton.onclick = openBook;
  $("story-next").onclick = nextStory;
  $("field-cancel").onclick = closeFieldActivity;
  $("lamp-power").onclick = () => handleFieldButton("skill");
  $("field-slider-control").addEventListener("input", event => { $("pace").value = String(clamp(Number(event.target.value), 0, 100)); });
  $("book-close").onclick = closeBook;
  bookOverlay.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => requestBookTab(button.dataset.tab)));
  function showAccusation() {
    if (accusationShown) return;
    accusationShown = true; accusationSuspect = 0; accusationEvidence.clear();
    const people = $("accuse-suspects"); people.innerHTML = "";
    suspects.forEach((suspect, index) => {
      const button = document.createElement("button"); button.type = "button"; button.textContent = suspect.name;
      button.classList.toggle("selected", index === accusationSuspect);
      button.onclick = () => { accusationSuspect = index; people.querySelectorAll("button").forEach((item, itemIndex) => item.classList.toggle("selected", itemIndex === index)); };
      people.appendChild(button);
    });
    const evidence = $("accuse-evidence"); evidence.innerHTML = "";
    clueNotes.forEach((clue, index) => {
      const button = document.createElement("button"); button.type = "button"; button.textContent = clue.title;
      button.onclick = () => { if (accusationEvidence.has(index)) accusationEvidence.delete(index); else accusationEvidence.add(index); button.classList.toggle("selected", accusationEvidence.has(index)); };
      evidence.appendChild(button);
    });
    accusationOverlay.classList.remove("hidden");
    const first = people.querySelector("button"); if (first) first.focus();
  }
  function returnToInvestigation() {
    accusationOverlay.classList.add("hidden"); accusationShown = false;
    game.player.x = Math.min(game.player.x, WORLD - 160); game.running = true; game.paused = false;
    showToast("VUELVE A REVISAR LAS PRUEBAS Y REGRESA AL ÁTICO");
  }
  $("return-investigation").onclick = returnToInvestigation;
  $("submit-accusation").onclick = () => {
    const feedback = $("accuse-feedback");
    if (accusationEvidence.size < 2) { feedback.textContent = "Conecta al menos dos pruebas antes de acusar."; return; }
    const evidenceSupports = [[2,4,5],[5],[5]];
    const supportCount = [...accusationEvidence].filter(index => evidenceSupports[index]?.includes(accusationSuspect)).length;
    if (supportCount < 2) {
      const suspect = suspects[accusationSuspect];
      feedback.textContent = suspect.name + ": " + suspect.check + " Las pruebas marcadas solo sostienen " + supportCount + " conexión(es); reúne dos que apunten a la misma persona.";
      return;
    }
    const selectedTitles = [...accusationEvidence].map(index => clueNotes[index].title.toLowerCase());
    const resolution = selectedTitles.length === 3
      ? "La fibra violeta, el barniz y la muesca triangular conectan a Damián con el retrato y el pasadizo. Su plan era sustituir el original por una copia y venderlo."
      : "Las pruebas de " + selectedTitles.join(" y ") + " conectan a Damián con el retrato y el pasadizo. Su plan era sustituir el original por una copia y venderlo.";
    $("win").querySelector("p").textContent = resolution;
    accusationOverlay.classList.add("hidden"); accusationShown = false;
    $("win").classList.remove("hidden");
  };
  window.openMansionNotebook = openBook;
  window.handleMansionModalKey = event => {
    if (!modalOpen()) return false;
    if (event.code === "Tab") return false;
    const direction = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "jump", ArrowDown: "skill", Space: "jump", KeyF: "skill", KeyX: "skill", KeyE: "skill" }[event.code];
    if (event.repeat && (event.code === "Escape" || event.code === "Enter" || (!activeActivity && (direction === "jump" || direction === "skill")))) {
      event.preventDefault(); event.stopImmediatePropagation(); return true;
    }
    if (activeActivity) {
      if (event.code === "Escape" || event.code === "Enter") closeFieldActivity();
      else if (event.code === "PageUp" || event.code === "PageDown") {
        if (lastSerialAt === -Infinity) $("pace").value = String(clamp(Number($("pace").value) + (event.code === "PageUp" ? 5 : -5), 0, 100));
      } else if (direction) handleFieldButton(direction);
      else return false;
      event.preventDefault(); event.stopImmediatePropagation(); return true;
    }
    if (event.code === "Escape") {
      if (!storyOverlay.classList.contains("hidden")) nextStory();
      else if (!bookOverlay.classList.contains("hidden")) closeBook();
      else returnToInvestigation();
    } else if (!storyOverlay.classList.contains("hidden")) {
      if (event.code === "ArrowLeft" || event.code === "ArrowRight") handleStoryInput(direction);
      else if (event.code === "Enter") nextStory();
      else if (direction === "jump" || direction === "skill") handleStoryInput("confirm");
      else return false;
    } else if (!bookOverlay.classList.contains("hidden") || !accusationOverlay.classList.contains("hidden")) {
      if (event.code === "ArrowLeft" || event.code === "ArrowRight") cycleFocus(event.code === "ArrowRight" ? 1 : -1);
      else if (direction === "jump" || direction === "skill" || event.code === "Enter") handleStoryInput("confirm");
      else return false;
    } else return false;
    event.preventDefault(); event.stopImmediatePropagation(); return true;
  };
  window.addEventListener("keydown", event => {
    if (event.code === "KeyJ" && !event.repeat && canOpenBook() && !modalOpen()) { event.preventDefault(); openBook(); }
  }, true);
  window.mansionInvestigationOpen = modalOpen;
  window.handleMansionModalSerial = pressed => {
    if (!modalOpen()) return false;
    if (activeActivity) {
      if (pressed.left) handleFieldButton("left");
      if (pressed.right) handleFieldButton("right");
      if (pressed.jump) handleFieldButton("jump");
      if (pressed.skill) handleFieldButton("skill");
      if (pressed.red) closeFieldActivity();
    } else if (pressed.red) {
      if (!bookOverlay.classList.contains("hidden")) closeBook();
      else if (!storyOverlay.classList.contains("hidden")) nextStory();
      else returnToInvestigation();
    } else {
      if (pressed.left) handleStoryInput("left");
      if (pressed.right) handleStoryInput("right");
      if (pressed.jump || pressed.skill) handleStoryInput("confirm");
    }
    return true;
  };

  const originalActivateRed = activateRedEdge;
  activateRedEdge = function () {
    if (!window.handleMansionModalSerial({ red: true })) originalActivateRed();
  };

  const originalUseSkill = useSkill;
  useSkill = function () {
    if (mansionHazardCaptive()) return false;
    if (currentScreen === "game" && game.running && !game.tutorial && !modalOpen()) {
      const px = game.player.x + game.player.w / 2;
      const stage = Number(window.mansionCaseStage || 0);
      const player = game.player, record = VESTIBULE.record;
      if (isVestibule() && Math.abs(px - record.x) < 45 && Math.abs(player.y + player.h - record.y) < 12) {
        startFieldActivity(lampActivity);
        return false;
      }
      if (isVestibule() && interactVestibuleObjects(player)) return false;
      const activity = fieldActivities.filter(item => item.stage === stage && !finishedActivities.has(item.id))
        .map(item => ({ item, distance: Math.abs(item.x - px) })).sort((a, b) => a.distance - b.distance)[0];
      if (activity && activity.distance < 78 && (!isVestibule() || player.y + player.h > GROUND - 20)) {
        startFieldActivity(activity.item); return false;
      }
      const nearby = npc.map(person => ({ person, distance: Math.abs(person.x - px) })).sort((a, b) => a.distance - b.distance)[0];
      if (nearby && nearby.distance < 68) { openNpcConversation(nearby.person); return false; }
    }
    return originalUseSkill();
  };
  const originalUpdate = update;
  update = function (dt) {
    if (modalOpen()) return;
    originalUpdate(dt);
    if (currentScreen === "game" && !game.tutorial && !game.running && !$("win").classList.contains("hidden") && clues.every(clue => clue.found)) {
      $("win").classList.add("hidden"); showAccusation(); return;
    }
    if (currentScreen !== "game" || game.tutorial || !game.running) return;
    clues.forEach((clue, index) => {
      if (clue.found && !evidenceFound[index]) { evidenceFound[index] = true; openClueStory(index); }
    });
  };
  const originalStartLevel = startLevel;
  startLevel = function () {
    closeStory(); closeBook(); accusationOverlay.classList.add("hidden"); accusationShown = false;
    closeFieldActivity(); finishedActivities.clear();
    evidenceFound.fill(false); playerNotes.length = 0; interviewed.clear();
    savedTheories.length = 0; theoryEvidence.clear(); accusationEvidence.clear();
    originalStartLevel(); updateBookButton();
  };

  const originalRender = render;
  render = function (now) {
    originalRender(now);
    if (activeActivity) paintFieldActivity(now);
    paintBookTurn(now);
    drawFieldStations(now);
    if (currentScreen !== "game" || game.tutorial) { bookButton.hidden = true; return; }
    updateBookButton();
    const playerX = game.player.x + game.player.w / 2;
    npc.forEach(person => {
      const image = npcImages.get(person.id), screenX = person.x - game.cam;
      if (!image || !image.complete || !image.naturalWidth || screenX < -90 || screenX > W + 90) return;
      const width = person.height * image.naturalWidth / image.naturalHeight;
      const bob = Math.sin(now / 370 + person.x) * 1.5;
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = .96;
      if (person.id === "bruno" || person.id === "tomas") { ctx.translate(screenX * 2, 0); ctx.scale(-1, 1); }
      ctx.drawImage(image, screenX - width / 2, GROUND - person.height + bob, width, person.height);
      ctx.restore();
      if (Math.abs(person.x - playerX) < 68) txt("↓ ABAJO · HABLAR", screenX, GROUND - person.height - 8, "#ffe26a", 5, "center");
    });
  };
  updateBookButton();
})();
