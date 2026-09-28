import type { RoleId } from '../auth/roles';

/**
 * The ALUZINA Operating System – Service Delivery Playbook v1.0 (Alejandra Guerra) as typed data (D-033).
 * Source and full transcription: `docs/knowledge/service-playbook.md` (prompt 0009). Pure data, no React:
 * pages render it, `engagements.checks` keys point into it (`${phase.id}:${itemIndex}` over `phaseItems()`),
 * `leads.status` / `projects.pipelineStatus` use `PIPELINE_STATUSES`, `revisionItems.status` uses
 * `VALIDATION_STATUSES`, `purchases.status` uses `PURCHASE_STATUSES`. English is the founder's wording;
 * Spanish is the integrator's translation (D-004), omitted where unsure (English fallback).
 */
export interface Text {
  en: string;
  es?: string;
}

/** Badge tones (`components/atom/Badge`), duplicated here so this module stays free of UI imports. */
export type StatusTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

const T = (en: string, es?: string): Text => (es ? { en, es } : { en });

/** `;`-separated parallel lists -> Text[]; a Spanish list of a different length is dropped (English fallback) so a typo never shifts items. */
function L(en: string, es?: string): Text[] {
  const e = en.split(';').map((s) => s.trim());
  const s = es?.split(';').map((x) => x.trim());
  if (s && s.length !== e.length) {
    if (import.meta.env?.DEV) console.warn(`[playbook] es list length ${s.length} != en ${e.length}: "${en.slice(0, 40)}…"`);
    return e.map((x) => T(x));
  }
  return e.map((x, i) => T(x, s?.[i]));
}

// ---------------------------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------------------------

export type ServiceCode = '01' | '02' | '03' | 'E' | '04';
export const SERVICE_CODES: readonly ServiceCode[] = ['01', '02', '03', 'E', '04'];

export interface PhaseGroup {
  group: Text;
  items: Text[];
}

export interface ServicePhase {
  /** `<code>-<n>`, e.g. `03-10`; stable key for `engagements.checks` and `currentPhaseId`. */
  id: string;
  /** The playbook's own number ("1", "01", "10"). */
  number: string;
  title: Text;
  /** Flat checklist or grouped checklist (01 phase 2 "USER / SPACE / …"). Use `phaseItems()` for the flat, indexed view. */
  items: Text[] | PhaseGroup[];
  notes?: Text[];
}

export interface Service {
  code: ServiceCode;
  slug: string;
  name: Text;
  /** Primary outcome (p. 2). */
  outcome: Text;
  /** Service ladder word (p. 16). */
  ladderWord: Text;
  centralQuestion?: Text;
  /** 03 "service promise", E "operating principle". */
  promise?: Text;
  idealFor: Text;
  /** The playbook calls them phases (01, 02, 04) or stages (03, E). */
  phaseLabel: 'phase' | 'stage';
  phases: ServicePhase[];
  /** What the client receives (the delivery phase, itemised). */
  deliveryContents: Text[];
  notIncluded?: Text[];
  nextStep?: Text;
}

export function isGrouped(items: ServicePhase['items']): items is PhaseGroup[] {
  return items.length > 0 && 'group' in (items[0] as object);
}

/** Flat, indexed checklist of a phase (grouped phases are flattened in group order); the index is the `checks` key suffix. */
export function phaseItems(phase: ServicePhase): Text[] {
  return isGrouped(phase.items) ? phase.items.flatMap((g) => g.items) : phase.items;
}

const G = (group: Text, en: string, es?: string): PhaseGroup => ({ group, items: L(en, es) });

const S01_DELIVERY = L(
  'Brief summary;Diagnosis;Concept;Moodboard;Visual references;Initial palette;Spatial direction;Lighting direction;Priority recommendations;Potential image / concept visual when applicable',
  'Resumen del brief;Diagnóstico;Concepto;Moodboard;Referencias visuales;Paleta inicial;Dirección espacial;Dirección de iluminación;Recomendaciones prioritarias;Imagen potencial / visual del concepto cuando aplique',
);
const S02_DELIVERY = L(
  '01. Current condition;02. Diagnosis;03. Mother idea;04. Creative concept;05. Moodboard;06. References;07. Spatial guidelines;08. Initial materiality;09. Initial lighting direction;10. Recommended next steps',
  '01. Estado actual;02. Diagnóstico;03. Idea madre;04. Concepto creativo;05. Moodboard;06. Referencias;07. Lineamientos espaciales;08. Materialidad inicial;09. Dirección inicial de iluminación;10. Próximos pasos recomendados',
);
const S03_DELIVERY = L(
  'Approved plans;Design documentation;Renders;Material schedule;Furniture schedule;Lighting information;Specifications and all deliverables included in the contracted scope',
  'Planos aprobados;Documentación de diseño;Renders;Cuadro de materiales;Cuadro de mobiliario;Información de iluminación;Especificaciones y todos los entregables incluidos en el alcance contratado',
);
const SE_DELIVERY = L(
  'Final photographs;Handover record;Inventory when applicable;Warranties;Operating / care information;Financial closure',
  'Fotografías finales;Acta de entrega;Inventario cuando aplique;Garantías;Información de operación / cuidado;Cierre financiero',
);
const S04_DELIVERY = L('Final photographs;Immediate recommendations;Suggested future purchases', 'Fotografías finales;Recomendaciones inmediatas;Compras futuras sugeridas');

export const SERVICES: readonly Service[] = [
  {
    code: '01',
    slug: 'creative-digital-consultation',
    name: T('Creative Digital Consultation', 'Consultoría creativa digital'),
    outcome: T('Conceptual clarity and professional direction.', 'Claridad conceptual y dirección profesional.'),
    ladderWord: T('Clarity', 'Claridad'),
    centralQuestion: T('What should I do with this space, and in what creative direction should I take it?', '¿Qué debería hacer con este espacio y en qué dirección creativa llevarlo?'),
    idealFor: T('Clients seeking conceptual clarity and professional direction before intervening in a space.', 'Clientes que buscan claridad conceptual y dirección profesional antes de intervenir un espacio.'),
    phaseLabel: 'phase',
    phases: [
      {
        id: '01-1',
        number: '1',
        title: T('Activation', 'Activación'),
        items: L(
          'Create the client folder.;Create the project record.;Send the strategic brief form.;Send the photo / video upload instructions.;Schedule the virtual session.;Set status: CONSULTATION / STARTED.',
          'Crear la carpeta del cliente.;Crear el registro del proyecto.;Enviar el formulario de brief estratégico.;Enviar las instrucciones para subir fotos / video.;Agendar la sesión virtual.;Fijar estado: CONSULTORÍA / INICIADA.',
        ),
        notes: [T('Once payment is confirmed, administration activates the project.', 'Una vez confirmado el pago, administración activa el proyecto.')],
      },
      {
        id: '01-2',
        number: '2',
        title: T('Strategic brief', 'Brief estratégico'),
        items: [
          G(T('User', 'Usuario'), 'Who uses the space;Number of people;Ages when relevant;Daily routines;Pain points;Habits and way of living', 'Quién usa el espacio;Número de personas;Edades cuando sea relevante;Rutinas diarias;Puntos de dolor;Hábitos y forma de vivir'),
          G(T('Space', 'Espacio'), 'Area and heights;Windows and orientation;Access points;Existing furniture;Current lighting;Existing materials', 'Área y alturas;Ventanas y orientación;Accesos;Mobiliario existente;Iluminación actual;Materiales existentes'),
          G(T('Aesthetic direction', 'Dirección estética'), 'References they like;References they dislike;Preferred colors;Preferred materials;Desired feelings;Hotels / homes / spaces they admire', 'Referencias que les gustan;Referencias que no les gustan;Colores preferidos;Materiales preferidos;Sensaciones deseadas;Hoteles / casas / espacios que admiran'),
          G(T('Expectation', 'Expectativa'), 'What should change?;What should the space make them feel?;What would success look like?;Non-negotiables;Investment mindset', '¿Qué debería cambiar?;¿Qué debería hacerles sentir el espacio?;¿Cómo se vería el éxito?;No negociables;Mentalidad de inversión'),
        ],
      },
      {
        id: '01-3',
        number: '3',
        title: T('Digital survey', 'Levantamiento digital'),
        items: L(
          'General photographs;One clear photograph of each wall;360-degree or continuous video;Basic measurements;Existing floor plan, if available;Ceiling height;Door and window locations;Relevant electrical points;Furniture that must remain',
          'Fotografías generales;Una fotografía clara de cada muro;Video 360 o continuo;Medidas básicas;Plano existente, si lo hay;Altura del techo;Ubicación de puertas y ventanas;Puntos eléctricos relevantes;Mobiliario que debe permanecer',
        ),
      },
      {
        id: '01-4',
        number: '4',
        title: T('ALUZINA diagnosis', 'Diagnóstico ALUZINA'),
        items: [
          G(T('Space', 'Espacio'), 'Layout;Scale;Proportion;Circulation;Voids;Spatial hierarchy', 'Distribución;Escala;Proporción;Circulación;Vacíos;Jerarquía espacial'),
          G(T('Person', 'Persona'), 'Routines;Needs;Behaviors;Desires;Functional conflicts;Emotional expectations', 'Rutinas;Necesidades;Comportamientos;Deseos;Conflictos funcionales;Expectativas emocionales'),
          G(T('Atmosphere', 'Atmósfera'), 'Natural light;Artificial light;Color;Materiality;Visual temperature;Sensory tone', 'Luz natural;Luz artificial;Color;Materialidad;Temperatura visual;Tono sensorial'),
          G(T('Potential', 'Potencial'), 'What can the space become?;What should disappear?;What deserves emphasis?;Where can one move beyond decoration?', '¿En qué puede convertirse el espacio?;¿Qué debería desaparecer?;¿Qué merece énfasis?;¿Dónde se puede ir más allá de la decoración?'),
        ],
      },
      {
        id: '01-5',
        number: '5',
        title: T('Concept', 'Concepto'),
        items: L(
          'Create one clear concept sentence.;Define keywords.;Define the intended feeling.;Set the aesthetic language.;Define preliminary materiality.;Define color direction.;Define lighting intention.;Define furniture direction.',
          'Crear una frase de concepto clara.;Definir palabras clave.;Definir la sensación buscada.;Fijar el lenguaje estético.;Definir la materialidad preliminar.;Definir la dirección de color.;Definir la intención de iluminación.;Definir la dirección del mobiliario.',
        ),
        notes: [T('Concept example: "A quiet Mediterranean refuge shaped by warm light."', 'Ejemplo de concepto: "Un refugio mediterráneo sereno moldeado por luz cálida."')],
      },
      {
        id: '01-6',
        number: '6',
        title: T('Creative direction', 'Dirección creativa'),
        items: L(
          'Moodboard;Visual references;Preliminary palette;Suggested materials;Layout ideas;Lighting treatment;Hero elements;Elements to remove;Elements worth keeping',
          'Moodboard;Referencias visuales;Paleta preliminar;Materiales sugeridos;Ideas de distribución;Tratamiento de iluminación;Elementos protagonistas;Elementos a retirar;Elementos que vale la pena conservar',
        ),
      },
      {
        id: '01-7',
        number: '7',
        title: T('Consultation session', 'Sesión de consultoría'),
        items: L(
          '10 min - Listen and reconnect with the brief.;15 min - Present the diagnosis.;20 min - Present the concept and creative direction.;20 min - Explain recommendations.;15 min - Questions, priorities and next steps.',
          '10 min - Escuchar y reconectar con el brief.;15 min - Presentar el diagnóstico.;20 min - Presentar el concepto y la dirección creativa.;20 min - Explicar las recomendaciones.;15 min - Preguntas, prioridades y próximos pasos.',
        ),
        notes: [T('Recommended duration: 60 to 90 minutes.', 'Duración recomendada: 60 a 90 minutos.')],
      },
      { id: '01-8', number: '8', title: T('Delivery', 'Entrega'), items: S01_DELIVERY },
    ],
    deliveryContents: S01_DELIVERY,
    notIncluded: L(
      'Technical drawings;Complete 3D modeling;Final photorealistic renders;Custom furniture design;Construction budget;Supplier quotation management;Site supervision;Purchasing;Construction',
      'Planos técnicos;Modelado 3D completo;Renders fotorrealistas finales;Diseño de mobiliario a medida;Presupuesto de obra;Gestión de cotizaciones con proveedores;Supervisión de obra;Compras;Construcción',
    ),
  },
  {
    code: '02',
    slug: 'in-person-consultation',
    name: T('In-Person Consultation', 'Consultoría presencial'),
    outcome: T('Immersive on-site diagnosis and a deeper creative route.', 'Diagnóstico inmersivo en sitio y una ruta creativa más profunda.'),
    ladderWord: T('Direction', 'Dirección'),
    centralQuestion: T('What does this space truly need, and what is the right path to transform it?', '¿Qué necesita realmente este espacio y cuál es el camino correcto para transformarlo?'),
    idealFor: T('An immersive on-site experience that converts direct observation into a clear creative route.', 'Una experiencia inmersiva en sitio que convierte la observación directa en una ruta creativa clara.'),
    phaseLabel: 'phase',
    phases: [
      {
        id: '02-1',
        number: '1',
        title: T('Pre-brief', 'Pre-brief'),
        items: L(
          'Client form;Current photographs;Exact project location;Existing floor plan if available;Main problem to solve;Who uses the space;Desired outcome',
          'Formulario del cliente;Fotografías actuales;Ubicación exacta del proyecto;Plano existente si lo hay;Problema principal a resolver;Quién usa el espacio;Resultado deseado',
        ),
      },
      {
        id: '02-2',
        number: '2',
        title: T('Preparation before the visit', 'Preparación antes de la visita'),
        items: L(
          'Review all submitted information.;Prepare the visit checklist.;Review available drawings.;Prepare diagnostic questions.;Bring measurement tools and documentation equipment.',
          'Revisar toda la información enviada.;Preparar la lista de chequeo de la visita.;Revisar los planos disponibles.;Preparar las preguntas de diagnóstico.;Llevar herramientas de medición y equipo de documentación.',
        ),
      },
      {
        id: '02-3',
        number: '3',
        title: T('On-site observation', 'Observación en sitio'),
        items: [
          G(T('Architecture', 'Arquitectura'), 'Heights;Geometry;Circulation;Access;Views;Interior / exterior relationship', 'Alturas;Geometría;Circulación;Acceso;Vistas;Relación interior / exterior'),
          G(T('Light', 'Luz'), 'Solar entry;Orientation;Shadows;Artificial lighting;Color temperature;Electrical points', 'Entrada solar;Orientación;Sombras;Iluminación artificial;Temperatura de color;Puntos eléctricos'),
          G(T('Materiality', 'Materialidad'), 'Floors;Walls;Ceilings;Joinery;Textures;Existing finishes', 'Pisos;Muros;Techos;Carpintería;Texturas;Acabados existentes'),
          G(T('User behavior', 'Comportamiento del usuario'), 'Movement;Habits;Comfort / discomfort;What works;What fails;What is missing', 'Movimiento;Hábitos;Confort / incomodidad;Qué funciona;Qué falla;Qué falta'),
        ],
      },
      {
        id: '02-4',
        number: '4',
        title: T('Documentation', 'Documentación'),
        items: L(
          'Photograph every wall.;Record floors and ceilings.;Capture relevant details and visible installations.;Document existing furniture and views.;Identify elements to preserve.;Identify problem areas.;Record critical dimensions.',
          'Fotografiar cada muro.;Registrar pisos y techos.;Capturar detalles relevantes e instalaciones visibles.;Documentar mobiliario existente y vistas.;Identificar elementos a preservar.;Identificar zonas problemáticas.;Registrar dimensiones críticas.',
        ),
      },
      {
        id: '02-5',
        number: '5',
        title: T('Conversation inside the space', 'Conversación dentro del espacio'),
        items: L(
          'What do you want?;What do you strongly dislike?;What must stay?;What would you transform first?;How do you imagine living, working or receiving people here?',
          '¿Qué quiere?;¿Qué le disgusta profundamente?;¿Qué debe quedarse?;¿Qué transformaría primero?;¿Cómo se imagina viviendo, trabajando o recibiendo personas aquí?',
        ),
        notes: [T('Method principle: ALUZINA does not design impulsively during the visit. First we observe. Then we process. Then we design.', 'Principio de método: ALUZINA no diseña impulsivamente durante la visita. Primero observamos. Luego procesamos. Luego diseñamos.')],
      },
      {
        id: '02-6',
        number: '6',
        title: T('Internal diagnosis', 'Diagnóstico interno'),
        items: L('Primary problem;Secondary problems;Opportunities;Restrictions;Priority interventions', 'Problema principal;Problemas secundarios;Oportunidades;Restricciones;Intervenciones prioritarias'),
      },
      {
        id: '02-7',
        number: '7',
        title: T('Concept development', 'Desarrollo del concepto'),
        items: L(
          'Mother idea;Creative concept;Moodboard;Conceptual palette;Visual references;Initial aesthetic guidelines;Lighting logic',
          'Idea madre;Concepto creativo;Moodboard;Paleta conceptual;Referencias visuales;Lineamientos estéticos iniciales;Lógica de iluminación',
        ),
      },
      { id: '02-8', number: '8', title: T('Premium delivery', 'Entrega premium'), items: S02_DELIVERY },
    ],
    deliveryContents: S02_DELIVERY,
    nextStep: T('The consultation should clearly indicate whether the project should move into Comprehensive Interior Design.', 'La consultoría debe indicar con claridad si el proyecto debe pasar a Diseño Interior Integral.'),
  },
  {
    code: '03',
    slug: 'comprehensive-interior-design',
    name: T('Comprehensive Interior Design', 'Diseño interior integral'),
    outcome: T('Full design definition before construction.', 'Definición completa del diseño antes de la construcción.'),
    ladderWord: T('Definition', 'Definición'),
    promise: T('We do not simply give ideas. We define the experience, space, light, materiality and visual language before the project is built.', 'No damos simplemente ideas. Definimos la experiencia, el espacio, la luz, la materialidad y el lenguaje visual antes de que el proyecto se construya.'),
    idealFor: T('The core ALUZINA service: complete spatial definition before construction.', 'El servicio central de ALUZINA: definición espacial completa antes de la construcción.'),
    phaseLabel: 'stage',
    phases: [
      {
        id: '03-1',
        number: '01',
        title: T('Onboarding', 'Onboarding'),
        items: L(
          'Contract signed;Initial payment received;Master schedule issued;Project folder created;Official communication channel defined;Internal and client-side responsibilities assigned;Review meetings scheduled',
          'Contrato firmado;Pago inicial recibido;Cronograma maestro emitido;Carpeta del proyecto creada;Canal oficial de comunicación definido;Responsabilidades internas y del cliente asignadas;Reuniones de revisión agendadas',
        ),
      },
      {
        id: '03-2',
        number: '02',
        title: T('Deep brief', 'Brief profundo'),
        items: L(
          'Client goals;User profile;Brand context when applicable;Routines and operational needs;Desired experience;Budget framework;Maintenance expectations;Durability requirements;Operational constraints',
          'Objetivos del cliente;Perfil del usuario;Contexto de marca cuando aplique;Rutinas y necesidades operativas;Experiencia deseada;Marco presupuestal;Expectativas de mantenimiento;Requisitos de durabilidad;Restricciones operativas',
        ),
      },
      {
        id: '03-3',
        number: '03',
        title: T('Survey and base information', 'Levantamiento e información base'),
        items: L(
          'Accurate dimensions;Heights;Doors and windows;Columns and structural constraints;Electrical points;Plumbing and networks;Ventilation;Equipment;Special site conditions',
          'Dimensiones precisas;Alturas;Puertas y ventanas;Columnas y restricciones estructurales;Puntos eléctricos;Hidrosanitario y redes;Ventilación;Equipos;Condiciones especiales del sitio',
        ),
      },
      {
        id: '03-4',
        number: '04',
        title: T('Diagnosis', 'Diagnóstico'),
        items: L(
          'Spatial problems;Opportunities;Circulation conflicts;Lighting issues;Experience gaps;Hierarchy;Relationship between spaces',
          'Problemas espaciales;Oportunidades;Conflictos de circulación;Problemas de iluminación;Vacíos de experiencia;Jerarquía;Relación entre espacios',
        ),
      },
      {
        id: '03-5',
        number: '05',
        title: T('Architectural program', 'Programa arquitectónico'),
        items: L(
          'Define every function the project requires.;Confirm quantity, capacity and relationship of each area.;Distinguish public, private, operational and service zones when applicable.',
          'Definir cada función que requiere el proyecto.;Confirmar cantidad, capacidad y relación de cada área.;Distinguir zonas públicas, privadas, operativas y de servicio cuando aplique.',
        ),
      },
      {
        id: '03-6',
        number: '06',
        title: T('Zoning', 'Zonificación'),
        items: L('Define what happens.;Define where it happens.;Define how areas relate to one another.', 'Definir qué sucede.;Definir dónde sucede.;Definir cómo se relacionan las áreas entre sí.'),
      },
      {
        id: '03-7',
        number: '07',
        title: T('Circulation and flow', 'Circulación y flujo'),
        items: L(
          'User journey;Staff flow;Service flow;Supplier / logistics flow;Operational movement;Egress considerations when applicable',
          'Recorrido del usuario;Flujo del personal;Flujo de servicio;Flujo de proveedores / logística;Movimiento operativo;Consideraciones de evacuación cuando aplique',
        ),
      },
      {
        id: '03-8',
        number: '08',
        title: T('ALUZINA concept', 'Concepto ALUZINA'),
        items: L(
          'Concept name;Core sentence;Story / narrative;Keywords;Moodboard;Atmosphere;Materiality;Color;Lighting intention;Sensory direction',
          'Nombre del concepto;Frase central;Historia / narrativa;Palabras clave;Moodboard;Atmósfera;Materialidad;Color;Intención de iluminación;Dirección sensorial',
        ),
      },
      {
        id: '03-9',
        number: '09',
        title: T('Schematic design', 'Diseño esquemático'),
        items: L('Initial spatial layout;Furniture placement;Volumes;Circulation;Hero elements;Functional relationships', 'Distribución espacial inicial;Ubicación del mobiliario;Volúmenes;Circulación;Elementos protagonistas;Relaciones funcionales'),
      },
      {
        id: '03-10',
        number: '10',
        title: T('Client validation', 'Validación con el cliente'),
        items: L(
          'Present the scheme.;Collect all comments in one revision matrix.;Avoid scattered design changes through WhatsApp.;Assign approval status: APPROVED / APPROVED WITH ADJUSTMENTS / REVISION.',
          'Presentar el esquema.;Recoger todos los comentarios en una sola matriz de revisión.;Evitar cambios de diseño dispersos por WhatsApp.;Asignar estado de aprobación: APROBADO / APROBADO CON AJUSTES / REVISIÓN.',
        ),
      },
      {
        id: '03-11',
        number: '11',
        title: T('3D development', 'Desarrollo 3D'),
        items: L(
          'Model the approved space.;Develop materiality.;Develop furniture.;Develop lighting.;Add decoration, vegetation and equipment as applicable.',
          'Modelar el espacio aprobado.;Desarrollar la materialidad.;Desarrollar el mobiliario.;Desarrollar la iluminación.;Agregar decoración, vegetación y equipos según aplique.',
        ),
      },
      {
        id: '03-12',
        number: '12',
        title: T('Emotional lighting', 'Iluminación emocional'),
        items: L(
          'General light;Functional light;Ambient light;Accent light;Decorative light;Color temperature;Direction;Hierarchy;Lighting scenes;RGB / RGBW where appropriate',
          'Luz general;Luz funcional;Luz ambiental;Luz de acento;Luz decorativa;Temperatura de color;Dirección;Jerarquía;Escenas de luz;RGB / RGBW donde corresponda',
        ),
      },
      {
        id: '03-13',
        number: '13',
        title: T('Materiality', 'Materialidad'),
        items: L('Material name;Location;Finish;Color;Format / size;Supplier;Reference;Approved alternative', 'Nombre del material;Ubicación;Acabado;Color;Formato / tamaño;Proveedor;Referencia;Alternativa aprobada'),
        notes: [T('One row per material.', 'Una fila por material.')],
      },
      {
        id: '03-14',
        number: '14',
        title: T('Enclosures', 'Cerramientos'),
        items: L('Doors;Windows;Partitions;Screens;Panels;Curtains;Dividers', 'Puertas;Ventanas;Divisiones;Celosías;Paneles;Cortinas;Separadores'),
      },
      {
        id: '03-15',
        number: '15',
        title: T('Furniture', 'Mobiliario'),
        items: L(
          'Existing furniture;New commercial furniture;Custom-designed furniture;Items to fabricate;For each piece: dimensions, material, color, reference and supplier',
          'Mobiliario existente;Mobiliario comercial nuevo;Mobiliario de diseño a medida;Piezas a fabricar;Para cada pieza: dimensiones, material, color, referencia y proveedor',
        ),
      },
      {
        id: '03-16',
        number: '16',
        title: T('Visualization', 'Visualización'),
        items: L(
          'Create renders / visualizations to verify scale, color, material, light and composition - not only to make the project look beautiful.',
          'Crear renders / visualizaciones para verificar escala, color, material, luz y composición, no solo para que el proyecto se vea bonito.',
        ),
      },
      {
        id: '03-17',
        number: '17',
        title: T('Drawing package', 'Paquete de planos'),
        items: L(
          'General plan;Demolition plan when needed;Construction plan;Furniture plan;Flooring plan;Ceiling plan;Lighting plan;Electrical coordination;Details;Joinery / millwork;Enclosures - depending on contracted scope',
          'Planta general;Planta de demolición cuando se requiera;Planta de construcción;Planta de mobiliario;Planta de pisos;Planta de techos;Planta de iluminación;Coordinación eléctrica;Detalles;Carpintería / ebanistería;Cerramientos, según el alcance contratado',
        ),
      },
      {
        id: '03-18',
        number: '18',
        title: T('Budget framework', 'Marco presupuestal'),
        items: L(
          'Convert the approved design into work packages: construction, joinery, lighting, furniture, glazing, textiles, decoration, vegetation, technology and other required disciplines.',
          'Convertir el diseño aprobado en paquetes de trabajo: construcción, carpintería, iluminación, mobiliario, vidrios, textiles, decoración, vegetación, tecnología y demás disciplinas requeridas.',
        ),
      },
      { id: '03-19', number: '19', title: T('Final design delivery', 'Entrega final de diseño'), items: S03_DELIVERY },
    ],
    deliveryContents: S03_DELIVERY,
    nextStep: T('Approval gate: construction may begin only after the client approves the final design for execution.', 'Puerta de aprobación: la construcción solo puede comenzar cuando el cliente aprueba el diseño final para ejecución.'),
  },
  {
    code: 'E',
    slug: 'execution-construction',
    name: T('Execution / Construction', 'Ejecución / Construcción'),
    outcome: T('Materialization of an approved design.', 'Materialización de un diseño aprobado.'),
    ladderWord: T('Materialization', 'Materialización'),
    promise: T('Design and construction are separate stages. Final execution pricing must be based on an approved design, not assumptions.', 'Diseño y construcción son etapas separadas. El precio final de ejecución debe basarse en un diseño aprobado, no en supuestos.'),
    idealFor: T('The materialization of an approved ALUZINA design.', 'La materialización de un diseño ALUZINA aprobado.'),
    phaseLabel: 'stage',
    phases: [
      {
        id: 'E-1',
        number: '1',
        title: T('Project breakdown', 'Desglose del proyecto'),
        items: L(
          'Civil works;Joinery;Lighting;Painting;Glazing;Furniture;Textiles;Decoration;Technology;Landscaping and any specialist package',
          'Obra civil;Carpintería;Iluminación;Pintura;Vidrios;Mobiliario;Textiles;Decoración;Tecnología;Paisajismo y cualquier paquete especializado',
        ),
      },
      {
        id: 'E-2',
        number: '2',
        title: T('Quotations', 'Cotizaciones'),
        items: L(
          'Request the required supplier options.;Compare price, quality, lead time, warranty and experience.;Normalize scope so quotations are comparable.',
          'Solicitar las opciones de proveedores requeridas.;Comparar precio, calidad, plazo de entrega, garantía y experiencia.;Normalizar el alcance para que las cotizaciones sean comparables.',
        ),
      },
      {
        id: 'E-3',
        number: '3',
        title: T('General budget', 'Presupuesto general'),
        items: L('Projected cost;Contingency;Professional fees;Purchases;Logistics;Transportation;Installation', 'Costo proyectado;Contingencia;Honorarios profesionales;Compras;Logística;Transporte;Instalación'),
      },
      {
        id: 'E-4',
        number: '4',
        title: T('Construction schedule', 'Cronograma de obra'),
        items: L('Supplier start date;Activity;Dependencies;Expected completion date;Critical milestones', 'Fecha de inicio del proveedor;Actividad;Dependencias;Fecha esperada de terminación;Hitos críticos'),
      },
      {
        id: 'E-5',
        number: '5',
        title: T('Purchasing control', 'Control de compras'),
        items: L(
          'Supplier;Reference;Quantity;Price;Date;Responsible person;Status: QUOTED / APPROVED / PAID / ORDERED / RECEIVED / INSTALLED',
          'Proveedor;Referencia;Cantidad;Precio;Fecha;Responsable;Estado: COTIZADO / APROBADO / PAGADO / PEDIDO / RECIBIDO / INSTALADO',
        ),
        notes: [T('One row per purchase (`purchases`).', 'Una fila por compra (`purchases`).')],
      },
      {
        id: 'E-6',
        number: '6',
        title: T('Execution sequence', 'Secuencia de ejecución'),
        items: L(
          'Protection;Demolition;Rough construction;MEP / installations;Ceilings;Floors;Wall finishes;Joinery;Lighting;Painting;Furniture;Textiles;Decoration;Final styling',
          'Protección;Demolición;Obra gris;Instalaciones / redes;Techos;Pisos;Acabados de muros;Carpintería;Iluminación;Pintura;Mobiliario;Textiles;Decoración;Styling final',
        ),
      },
      {
        id: 'E-7',
        number: '7',
        title: T('ALUZINA site control', 'Control de obra ALUZINA'),
        items: L('Date;Progress;Photographic record;Decisions;Problems;Responsible person;Resolution due date', 'Fecha;Avance;Registro fotográfico;Decisiones;Problemas;Responsable;Fecha límite de resolución'),
        notes: [T('One row per visit (`siteReports`).', 'Una fila por visita (`siteReports`).')],
      },
      {
        id: 'E-8',
        number: '8',
        title: T('Change control', 'Control de cambios'),
        items: L(
          'Any request after approval becomes a CHANGE ORDER.;Record description, reason, additional cost, additional time and client approval.;Do not execute unapproved changes.',
          'Toda solicitud posterior a la aprobación se convierte en una ORDEN DE CAMBIO.;Registrar descripción, motivo, costo adicional, tiempo adicional y aprobación del cliente.;No ejecutar cambios no aprobados.',
        ),
      },
      {
        id: 'E-9',
        number: '9',
        title: T('Punch list', 'Lista de pendientes'),
        items: L('Paint;Joinery;Lighting;Finishes;Furniture;Cleaning;Functionality;Final details', 'Pintura;Carpintería;Iluminación;Acabados;Mobiliario;Limpieza;Funcionalidad;Detalles finales'),
      },
      { id: 'E-10', number: '10', title: T('Handover', 'Entrega'), items: SE_DELIVERY },
    ],
    deliveryContents: SE_DELIVERY,
  },
  {
    code: '04',
    slug: 'interior-styling',
    name: T('Interior Styling', 'Styling de interiores'),
    outcome: T('Final visual composition, atmosphere and presence.', 'Composición visual final, atmósfera y presencia.'),
    ladderWord: T('Soul + Final Composition', 'Alma + composición final'),
    centralQuestion: T('How can the space feel intentional, coherent and complete using composition, objects, furniture, light and atmosphere?', '¿Cómo puede el espacio sentirse intencional, coherente y completo usando composición, objetos, mobiliario, luz y atmósfera?'),
    idealFor: T('A focused service that transforms the visual experience of an existing space without redesigning its architecture.', 'Un servicio enfocado que transforma la experiencia visual de un espacio existente sin rediseñar su arquitectura.'),
    phaseLabel: 'phase',
    phases: [
      {
        id: '04-1',
        number: '1',
        title: T('Pre-session record', 'Registro previo a la sesión'),
        items: L('Current photographs;Continuous video;Basic dimensions;Existing furniture;Existing decorative objects', 'Fotografías actuales;Video continuo;Dimensiones básicas;Mobiliario existente;Objetos decorativos existentes'),
      },
      {
        id: '04-2',
        number: '2',
        title: T('Diagnosis', 'Diagnóstico'),
        items: L(
          'What is excessive;What is missing;What is poorly positioned;What deserves emphasis;What should disappear from the visual field',
          'Qué es excesivo;Qué falta;Qué está mal ubicado;Qué merece énfasis;Qué debería desaparecer del campo visual',
        ),
      },
      {
        id: '04-3',
        number: '3',
        title: T('Curation', 'Curaduría'),
        items: L('Objects;Art;Books;Textiles;Vegetation;Decorative lighting;Accessories', 'Objetos;Arte;Libros;Textiles;Vegetación;Iluminación decorativa;Accesorios'),
      },
      {
        id: '04-4',
        number: '4',
        title: T('Composition', 'Composición'),
        items: L('Scale;Heights;Layers;Color;Texture;Negative space;Grouping;Rhythm', 'Escala;Alturas;Capas;Color;Textura;Espacio negativo;Agrupación;Ritmo'),
      },
      {
        id: '04-5',
        number: '5',
        title: T('Reorganization', 'Reorganización'),
        items: L('Reposition furniture.;Test new visual axes.;Create stronger focal points.;Improve balance and flow.', 'Reubicar el mobiliario.;Probar nuevos ejes visuales.;Crear puntos focales más fuertes.;Mejorar el equilibrio y el flujo.'),
      },
      {
        id: '04-6',
        number: '6',
        title: T('Lighting adjustment', 'Ajuste de iluminación'),
        items: L('Color temperature;Direction;Intensity;Decorative lamps;Lighting layers', 'Temperatura de color;Dirección;Intensidad;Lámparas decorativas;Capas de luz'),
      },
      {
        id: '04-7',
        number: '7',
        title: T('Final styling', 'Styling final'),
        items: L('Objects;Cushions;Art;Books;Plants;Textiles;Sculptural pieces;Personal objects', 'Objetos;Cojines;Arte;Libros;Plantas;Textiles;Piezas escultóricas;Objetos personales'),
      },
      { id: '04-8', number: '8', title: T('Documentation', 'Documentación'), items: S04_DELIVERY },
    ],
    deliveryContents: S04_DELIVERY,
  },
];

export function serviceByCode(code: string | null | undefined): Service | undefined {
  return SERVICES.find((s) => s.code === code);
}

export function phaseById(id: string): { service: Service; phase: ServicePhase } | undefined {
  for (const service of SERVICES) {
    const phase = service.phases.find((p) => p.id === id);
    if (phase) return { service, phase };
  }
  return undefined;
}

/** `checks` key for one checklist item (`engagements.checks`). */
export const checkKey = (phaseId: string, itemIndex: number): `${string}:${number}` => `${phaseId}:${itemIndex}`;

// ---------------------------------------------------------------------------------------------
// Journey, ladder, statuses
// ---------------------------------------------------------------------------------------------

export interface JourneyStep {
  id: string;
  label: Text;
}

/** Core client journey (p. 2), 10 steps. */
export const CLIENT_JOURNEY: readonly JourneyStep[] = [
  { id: 'lead', label: T('Lead', 'Lead') },
  { id: 'diagnosis', label: T('Diagnosis', 'Diagnóstico') },
  { id: 'brief', label: T('Brief', 'Brief') },
  { id: 'analysis', label: T('Analysis', 'Análisis') },
  { id: 'concept', label: T('Concept', 'Concepto') },
  { id: 'development', label: T('Development', 'Desarrollo') },
  { id: 'validation', label: T('Validation', 'Validación') },
  { id: 'delivery', label: T('Delivery', 'Entrega') },
  { id: 'closure', label: T('Closure', 'Cierre') },
  { id: 'follow-up', label: T('Follow-up', 'Seguimiento') },
];

export const SERVICE_LADDER_LOGIC: Text = T(
  'A client can enter ALUZINA through a focused service and, when appropriate, evolve into a complete design and execution relationship. Each step must generate enough clarity to justify the next - never pressure.',
  'Un cliente puede entrar a ALUZINA por un servicio enfocado y, cuando corresponda, evolucionar hacia una relación completa de diseño y ejecución. Cada paso debe generar la claridad suficiente para justificar el siguiente, nunca presión.',
);

export type PipelineGroup = 'lead' | 'sale' | 'design' | 'build' | 'close';

export type PipelineStatusId =
  | 'lead-new'
  | 'lead-qualified'
  | 'proposal-sent'
  | 'contracted'
  | 'briefing'
  | 'concept'
  | 'design-development'
  | 'client-review'
  | 'approved'
  | 'procurement'
  | 'in-construction'
  | 'punch-list'
  | 'delivered'
  | 'closed'
  | 'follow-up';

export interface PipelineStatus {
  id: PipelineStatusId;
  /** The playbook's wording ("LEAD - NEW"). */
  playbook: string;
  label: Text;
  tone: StatusTone;
  group: PipelineGroup;
}

/** Suggested status architecture (p. 17), 15 statuses in order. `leads.status` uses the first four; `projects.pipelineStatus` from `contracted` on. */
export const PIPELINE_STATUSES: readonly PipelineStatus[] = [
  { id: 'lead-new', playbook: 'LEAD - NEW', label: T('New lead', 'Lead nuevo'), tone: 'neutral', group: 'lead' },
  { id: 'lead-qualified', playbook: 'LEAD - QUALIFIED', label: T('Qualified lead', 'Lead calificado'), tone: 'info', group: 'lead' },
  { id: 'proposal-sent', playbook: 'PROPOSAL SENT', label: T('Proposal sent', 'Propuesta enviada'), tone: 'accent', group: 'sale' },
  { id: 'contracted', playbook: 'CONTRACTED', label: T('Contracted', 'Contratado'), tone: 'success', group: 'sale' },
  { id: 'briefing', playbook: 'BRIEFING', label: T('Briefing', 'Brief'), tone: 'neutral', group: 'design' },
  { id: 'concept', playbook: 'CONCEPT', label: T('Concept', 'Concepto'), tone: 'accent', group: 'design' },
  { id: 'design-development', playbook: 'DESIGN DEVELOPMENT', label: T('Design development', 'Desarrollo de diseño'), tone: 'accent', group: 'design' },
  { id: 'client-review', playbook: 'CLIENT REVIEW', label: T('Client review', 'Revisión del cliente'), tone: 'warning', group: 'design' },
  { id: 'approved', playbook: 'APPROVED', label: T('Approved', 'Aprobado'), tone: 'success', group: 'design' },
  { id: 'procurement', playbook: 'PROCUREMENT', label: T('Procurement', 'Compras'), tone: 'accent', group: 'build' },
  { id: 'in-construction', playbook: 'IN CONSTRUCTION', label: T('In construction', 'En obra'), tone: 'accent', group: 'build' },
  { id: 'punch-list', playbook: 'PUNCH LIST', label: T('Punch list', 'Lista de pendientes'), tone: 'warning', group: 'build' },
  { id: 'delivered', playbook: 'DELIVERED', label: T('Delivered', 'Entregado'), tone: 'success', group: 'close' },
  { id: 'closed', playbook: 'CLOSED', label: T('Closed', 'Cerrado'), tone: 'neutral', group: 'close' },
  { id: 'follow-up', playbook: 'FOLLOW-UP', label: T('Follow-up', 'Seguimiento'), tone: 'info', group: 'close' },
];

export const PIPELINE_STATUS_IDS: readonly PipelineStatusId[] = PIPELINE_STATUSES.map((s) => s.id);
/** Statuses a `leads` row may carry (before it becomes a project). */
export const LEAD_STATUS_IDS: readonly PipelineStatusId[] = ['lead-new', 'lead-qualified', 'proposal-sent', 'contracted'];

export function pipelineStatus(id: string | null | undefined): PipelineStatus | undefined {
  return PIPELINE_STATUSES.find((s) => s.id === id);
}

/** The next status in the architecture, or undefined at `follow-up`. */
export function nextPipelineStatus(id: string): PipelineStatus | undefined {
  const i = PIPELINE_STATUS_IDS.indexOf(id as PipelineStatusId);
  return i === -1 ? undefined : PIPELINE_STATUSES[i + 1];
}

export function isPipelineStatusId(v: unknown): v is PipelineStatusId {
  return typeof v === 'string' && (PIPELINE_STATUS_IDS as readonly string[]).includes(v);
}

export type ValidationStatusId = 'approved' | 'approved-with-adjustments' | 'revision';

export interface ValidationStatus {
  id: ValidationStatusId;
  playbook: string;
  label: Text;
  tone: StatusTone;
}

/** Stage 10 of service 03: the approval status of one item in the revision matrix. */
export const VALIDATION_STATUSES: readonly ValidationStatus[] = [
  { id: 'approved', playbook: 'APPROVED', label: T('Approved', 'Aprobado'), tone: 'success' },
  { id: 'approved-with-adjustments', playbook: 'APPROVED WITH ADJUSTMENTS', label: T('Approved with adjustments', 'Aprobado con ajustes'), tone: 'warning' },
  { id: 'revision', playbook: 'REVISION', label: T('Revision', 'Revisión'), tone: 'danger' },
];

export type PurchaseStatusId = 'quoted' | 'approved' | 'paid' | 'ordered' | 'received' | 'installed';

export interface PurchaseStatus {
  id: PurchaseStatusId;
  playbook: string;
  label: Text;
  tone: StatusTone;
}

/** Stage 5 of service E, in order: a purchase is tracked from quotation to installation (G-07). */
export const PURCHASE_STATUSES: readonly PurchaseStatus[] = [
  { id: 'quoted', playbook: 'QUOTED', label: T('Quoted', 'Cotizado'), tone: 'neutral' },
  { id: 'approved', playbook: 'APPROVED', label: T('Approved', 'Aprobado'), tone: 'info' },
  { id: 'paid', playbook: 'PAID', label: T('Paid', 'Pagado'), tone: 'accent' },
  { id: 'ordered', playbook: 'ORDERED', label: T('Ordered', 'Pedido'), tone: 'accent' },
  { id: 'received', playbook: 'RECEIVED', label: T('Received', 'Recibido'), tone: 'success' },
  { id: 'installed', playbook: 'INSTALLED', label: T('Installed', 'Instalado'), tone: 'success' },
];

export function nextPurchaseStatus(id: string): PurchaseStatus | undefined {
  const i = PURCHASE_STATUSES.findIndex((s) => s.id === id);
  return i === -1 ? undefined : PURCHASE_STATUSES[i + 1];
}

// ---------------------------------------------------------------------------------------------
// Governance
// ---------------------------------------------------------------------------------------------

export type GovernanceKind = 'mandatory' | 'commercial' | 'method' | 'gate' | 'principle' | 'change-control';

export interface GovernanceRule {
  /** `G-01..G-09` are the nine mandatory rules (p. 16); `G-10..G-14` are the other rules the playbook states in its service sections. */
  id: `G-${string}`;
  kind: GovernanceKind;
  rule: Text;
  /** Playbook page. */
  page: number;
  /** Where the product enforces or records it. */
  enforcedBy?: string;
}

export const GOVERNANCE_RULES: readonly GovernanceRule[] = [
  { id: 'G-01', kind: 'mandatory', page: 16, rule: T('Every project has one owner inside ALUZINA.', 'Cada proyecto tiene un responsable dentro de ALUZINA.'), enforcedBy: 'projects.leadDesignerId, leads.ownerId' },
  { id: 'G-02', kind: 'mandatory', page: 16, rule: T('Every project has one official folder and one source of truth.', 'Cada proyecto tiene una carpeta oficial y una única fuente de verdad.'), enforcedBy: 'project space in Spaces (K-02)' },
  { id: 'G-03', kind: 'mandatory', page: 16, rule: T('All client approvals are documented.', 'Todas las aprobaciones del cliente quedan documentadas.'), enforcedBy: 'projects.approval, revisionItems, changeOrders.approvedAt' },
  { id: 'G-04', kind: 'mandatory', page: 16, rule: T('Scope changes are documented before work continues.', 'Los cambios de alcance se documentan antes de continuar el trabajo.'), enforcedBy: 'changeOrders' },
  { id: 'G-05', kind: 'mandatory', page: 16, rule: T('Design revisions are consolidated into a single revision matrix.', 'Las revisiones de diseño se consolidan en una sola matriz de revisión.'), enforcedBy: 'revisionItems (one matrix per project)' },
  { id: 'G-06', kind: 'mandatory', page: 16, rule: T('No construction begins without an approved design package.', 'Ninguna obra comienza sin un paquete de diseño aprobado.'), enforcedBy: 'pipelineStatus approved before procurement / in-construction' },
  { id: 'G-07', kind: 'mandatory', page: 16, rule: T('Purchases are tracked from quotation to installation.', 'Las compras se rastrean desde la cotización hasta la instalación.'), enforcedBy: 'purchases.status (PURCHASE_STATUSES)' },
  { id: 'G-08', kind: 'mandatory', page: 16, rule: T('Every site visit produces a written and photographic record.', 'Cada visita de obra produce un registro escrito y fotográfico.'), enforcedBy: 'siteReports' },
  { id: 'G-09', kind: 'mandatory', page: 16, rule: T('Every service ends with a formal delivery and closure step.', 'Cada servicio termina con un paso formal de entrega y cierre.'), enforcedBy: 'engagements.status delivered / closed; the delivery phase of each service' },
  { id: 'G-10', kind: 'commercial', page: 3, rule: T('Never sell a small service when the diagnosis clearly shows that the client needs a deeper scope. The goal is not to oversell - it is to place the client in the right process.', 'Nunca vender un servicio pequeño cuando el diagnóstico muestra con claridad que el cliente necesita un alcance más profundo. La meta no es sobrevender, es ubicar al cliente en el proceso correcto.'), enforcedBy: 'routeService() suggests; leads.suggestedService vs requestedService' },
  { id: 'G-11', kind: 'method', page: 8, rule: T('ALUZINA does not design impulsively during the visit. First we observe. Then we process. Then we design.', 'ALUZINA no diseña impulsivamente durante la visita. Primero observamos. Luego procesamos. Luego diseñamos.') },
  { id: 'G-12', kind: 'gate', page: 11, rule: T('Construction may begin only after the client approves the final design for execution. This gate protects quality, schedule, scope and cost.', 'La construcción solo puede comenzar cuando el cliente aprueba el diseño final para ejecución. Esta puerta protege calidad, cronograma, alcance y costo.'), enforcedBy: 'pipelineStatus approved is required before procurement' },
  { id: 'G-13', kind: 'principle', page: 12, rule: T('Design and construction are separate stages. Final execution pricing must be based on an approved design, not assumptions.', 'Diseño y construcción son etapas separadas. El precio final de ejecución debe basarse en un diseño aprobado, no en supuestos.'), enforcedBy: 'service E requires an approved 03 engagement' },
  { id: 'G-14', kind: 'change-control', page: 13, rule: T('Any request after approval becomes a change order with description, reason, additional cost, additional time and client approval; unapproved changes are not executed.', 'Toda solicitud posterior a la aprobación se convierte en una orden de cambio con descripción, motivo, costo adicional, tiempo adicional y aprobación del cliente; los cambios no aprobados no se ejecutan.'), enforcedBy: 'changeOrders.status executed only after approved' },
];

export const FINAL_PRINCIPLE: Text = T(
  "The operating system exists so ALUZINA can grow without losing its creative intelligence. The method should protect the studio's point of view while making delivery clear, measurable and repeatable.",
  'El sistema operativo existe para que ALUZINA pueda crecer sin perder su inteligencia creativa. El método debe proteger el punto de vista del estudio mientras hace la entrega clara, medible y repetible.',
);

// ---------------------------------------------------------------------------------------------
// Lead intake (p. 3)
// ---------------------------------------------------------------------------------------------

export type LeadChannelId = 'instagram' | 'whatsapp' | 'website' | 'referral' | 'email' | 'networking' | 'partnership';

export interface LeadChannel {
  id: LeadChannelId;
  label: Text;
}

export const LEAD_CHANNELS: readonly LeadChannel[] = [
  { id: 'instagram', label: T('Instagram', 'Instagram') },
  { id: 'whatsapp', label: T('WhatsApp', 'WhatsApp') },
  { id: 'website', label: T('Website', 'Sitio web') },
  { id: 'referral', label: T('Referral', 'Referido') },
  { id: 'email', label: T('Email', 'Correo') },
  { id: 'networking', label: T('Networking', 'Contactos') },
  { id: 'partnership', label: T('Commercial partnership', 'Alianza comercial') },
];

export interface FieldDef {
  /** `leads` column the field maps to. */
  key: string;
  label: Text;
}

/** Immediate registration, lead record (p. 3) -> `leads` columns. */
export const LEAD_RECORD_FIELDS: readonly FieldDef[] = [
  { key: 'name', label: T('Client name', 'Nombre del cliente') },
  { key: 'phone', label: T('Phone', 'Teléfono') },
  { key: 'email', label: T('Email', 'Correo') },
  { key: 'city', label: T('City', 'Ciudad') },
  { key: 'projectType', label: T('Project type', 'Tipo de proyecto') },
  { key: 'areaM2', label: T('Approximate area', 'Área aproximada') },
  { key: 'projectStatus', label: T('Current project status', 'Estado actual del proyecto') },
];

/** Immediate registration, commercial data (p. 3) -> `leads` columns. */
export const COMMERCIAL_FIELDS: readonly FieldDef[] = [
  { key: 'requestedService', label: T('Requested service', 'Servicio solicitado') },
  { key: 'budgetCop', label: T('Estimated intervention budget', 'Presupuesto estimado de intervención') },
  { key: 'desiredStart', label: T('Desired start date', 'Fecha deseada de inicio') },
  { key: 'channel', label: T('How they found ALUZINA', 'Cómo conocieron a ALUZINA') },
  { key: 'ownerId', label: T('Assigned ALUZINA owner', 'Responsable asignado en ALUZINA') },
  { key: 'status', label: T('Lead status', 'Estado del lead') },
];

export type QualificationKey = 'transform' | 'why' | 'typology' | 'areaM2' | 'floorPlan' | 'projectStatus' | 'depth' | 'execute' | 'investment' | 'start';

export interface QualificationQuestion {
  key: QualificationKey;
  question: Text;
  /** Closed answers when the question has them; free text otherwise. */
  options?: { value: string; label: Text }[];
}

/** Initial qualification (p. 3), 10 questions; answers live in `leads.qualification[key]`. */
export const QUALIFICATION_QUESTIONS: readonly QualificationQuestion[] = [
  { key: 'transform', question: T('What does the client want to transform?', '¿Qué quiere transformar el cliente?') },
  { key: 'why', question: T('Why do they want to do it now?', '¿Por qué quieren hacerlo ahora?') },
  {
    key: 'typology',
    question: T('Is it residential, commercial, hospitality, wellness or another typology?', '¿Es residencial, comercial, hospitalidad, bienestar u otra tipología?'),
    options: [
      { value: 'residential', label: T('Residential', 'Residencial') },
      { value: 'commercial', label: T('Commercial', 'Comercial') },
      { value: 'hospitality', label: T('Hospitality', 'Hospitalidad') },
      { value: 'wellness', label: T('Wellness', 'Bienestar') },
      { value: 'other', label: T('Other', 'Otra') },
    ],
  },
  { key: 'areaM2', question: T('How many square meters are involved?', '¿Cuántos metros cuadrados están involucrados?') },
  { key: 'floorPlan', question: T('Does a current floor plan exist?', '¿Existe un plano actual?'), options: [{ value: 'yes', label: T('Yes', 'Sí') }, { value: 'no', label: T('No', 'No') }] },
  {
    key: 'projectStatus',
    question: T('Is the project built, under construction or still conceptual?', '¿El proyecto está construido, en construcción o aún es conceptual?'),
    options: [
      { value: 'built', label: T('Built', 'Construido') },
      { value: 'under-construction', label: T('Under construction', 'En construcción') },
      { value: 'conceptual', label: T('Conceptual', 'Conceptual') },
    ],
  },
  {
    key: 'depth',
    question: T('Does the client need ideas only or full design development?', '¿El cliente necesita solo ideas o el desarrollo completo del diseño?'),
    options: [
      { value: 'ideas', label: T('Ideas and direction only', 'Solo ideas y dirección') },
      { value: 'full-design', label: T('Full design development', 'Desarrollo completo del diseño') },
      { value: 'styling', label: T('Styling of an existing space', 'Styling de un espacio existente') },
    ],
  },
  { key: 'execute', question: T('Do they want ALUZINA to execute the project?', '¿Quieren que ALUZINA ejecute el proyecto?'), options: [{ value: 'yes', label: T('Yes', 'Sí') }, { value: 'no', label: T('No', 'No') }, { value: 'later', label: T('Maybe later', 'Quizás después') }] },
  { key: 'investment', question: T('What is the expected investment range?', '¿Cuál es el rango de inversión esperado?') },
  { key: 'start', question: T('When do they want to start?', '¿Cuándo quieren empezar?') },
];

export type QualificationAnswers = Partial<Record<QualificationKey | 'visit', string>>;

export interface ServiceRoute {
  code: ServiceCode;
  /** The service that follows once the first is delivered and approved (E after 03). */
  then?: ServiceCode;
  reason: Text;
}

/**
 * Service routing (p. 3) as a simple heuristic over the qualification answers plus the optional `visit`
 * answer ("wants an on-site diagnosis"). It only suggests (`leads.suggestedService`); the commercial rule
 * G-10 is a person's judgment, and the founder routes.
 */
export function routeService(answers: QualificationAnswers): ServiceRoute {
  const depth = answers.depth;
  const wantsExecution = answers.execute === 'yes';
  if (depth === 'styling' || (answers.projectStatus === 'built' && depth === undefined && answers.execute === 'no' && answers.transform?.toLowerCase().includes('styl'))) {
    return { code: '04', reason: T('An existing space that needs composition, objects and atmosphere, not a new architecture.', 'Un espacio existente que necesita composición, objetos y atmósfera, no una nueva arquitectura.') };
  }
  if (depth === 'full-design' || wantsExecution) {
    const reason = wantsExecution
      ? T('Wants ALUZINA to execute: execution (E) follows the approved comprehensive design (approval gate G-12).', 'Quiere que ALUZINA ejecute: la ejecución (E) sigue al diseño integral aprobado (puerta de aprobación G-12).')
      : T('Needs full design development before construction.', 'Necesita el desarrollo completo del diseño antes de construir.');
    return wantsExecution ? { code: '03', then: 'E', reason } : { code: '03', reason };
  }
  if (answers.visit === 'yes' || (answers.projectStatus === 'built' && depth === 'ideas' && answers.floorPlan === 'no')) {
    return { code: '02', reason: T('Wants an on-site diagnosis: direct observation converts into a clear creative route.', 'Quiere un diagnóstico en sitio: la observación directa se convierte en una ruta creativa clara.') };
  }
  if (depth === 'ideas' || answers.projectStatus === 'conceptual') {
    return { code: '01', reason: T('Needs conceptual clarity and direction; the space can be surveyed remotely.', 'Necesita claridad conceptual y dirección; el espacio puede levantarse a distancia.') };
  }
  return { code: '01', reason: T('Not enough answers yet: start with the digital consultation and let the diagnosis place the client (G-10).', 'Aún no hay respuestas suficientes: empezar con la consultoría digital y dejar que el diagnóstico ubique al cliente (G-10).') };
}

// ---------------------------------------------------------------------------------------------
// Roles, assets, KPIs (p. 17)
// ---------------------------------------------------------------------------------------------

export interface RoleResponsibility {
  id: string;
  playbookRole: Text;
  /** Portal role that holds it today; null when no role exists yet (`docs/knowledge/service-playbook.md`). */
  roleId: RoleId | null;
  note: Text;
}

export const ROLE_RESPONSIBILITIES: readonly RoleResponsibility[] = [
  { id: 'creative-director', playbookRole: T('Creative Director', 'Directora creativa'), roleId: 'founder', note: T('Alejandra Guerra: creative direction, key decisions, client relations, final approval.', 'Alejandra Guerra: dirección creativa, decisiones clave, relación con clientes, aprobación final.') },
  { id: 'interior-designer', playbookRole: T('Interior Designer / Junior', 'Diseñadora de interiores / junior'), roleId: 'studio', note: T('Sarai: design development, references, palettes, plans, schedules, consistency check.', 'Sarai: desarrollo de diseño, referencias, paletas, planos, cuadros, chequeo de consistencia.') },
  { id: 'administrative-assistant', playbookRole: T('Administrative Assistant', 'Asistente administrativo'), roleId: 'ops', note: T('Miguel: activation, schedule, suppliers, quotes, purchases, payments, site control records.', 'Miguel: activación, cronograma, proveedores, cotizaciones, compras, pagos, registros de obra.') },
  { id: 'brand-designer', playbookRole: T('Graphic / Brand Designer', 'Diseñadora gráfica / de marca'), roleId: 'brand', note: T('Angélica: presentations, delivery documents with the brand identity, images, revisions.', 'Angélica: presentaciones, documentos de entrega con la identidad de marca, imágenes, revisiones.') },
  { id: 'project-manager', playbookRole: T('Project Manager (when applicable)', 'Gerente de proyecto (cuando aplique)'), roleId: null, note: T('No portal role yet; operations holds the execution permissions meanwhile.', 'Aún sin rol de portal; operaciones tiene los permisos de ejecución mientras tanto.') },
  { id: 'suppliers', playbookRole: T('External suppliers and specialists', 'Proveedores y especialistas externos'), roleId: null, note: T('No login yet; catalogued as `suppliers` rows, a supplier portal is planned.', 'Aún sin acceso; catalogados como filas de `suppliers`, se planea un portal de proveedores.') },
];

export interface OperationalAsset {
  id: string;
  label: Text;
  /** Entity, page code or `null` (unknown / not in the product yet). */
  productMapping: string | null;
}

export const OPERATIONAL_ASSETS: readonly OperationalAsset[] = [
  { id: 'folder-tree', label: T('Folder tree', 'Árbol de carpetas'), productMapping: null },
  { id: 'naming-convention', label: T('File naming convention', 'Convención de nombres de archivo'), productMapping: null },
  { id: 'message-templates', label: T('Client message templates', 'Plantillas de mensajes al cliente'), productMapping: null },
  { id: 'brief-forms', label: T('Brief forms', 'Formularios de brief'), productMapping: 'engagements.brief' },
  { id: 'visit-checklists', label: T('Visit checklists', 'Listas de chequeo de visita'), productMapping: 'engagements.checks' },
  { id: 'revision-matrix', label: T('Revision matrix', 'Matriz de revisión'), productMapping: 'revisionItems' },
  { id: 'approval-forms', label: T('Approval forms', 'Formularios de aprobación'), productMapping: 'projects.approval, A-02' },
  { id: 'budget-tracker', label: T('Budget tracker', 'Control de presupuesto'), productMapping: 'quotes, payments' },
  { id: 'procurement-tracker', label: T('Procurement tracker', 'Control de compras'), productMapping: 'purchases' },
  { id: 'site-report', label: T('Site report', 'Informe de obra'), productMapping: 'siteReports' },
  { id: 'handover-checklist', label: T('Handover checklist', 'Lista de entrega'), productMapping: 'E-10 checklist' },
];

export type KpiUnit = '%' | 'days' | 'count' | 'score';

export interface Kpi {
  key: string;
  label: Text;
  unit: KpiUnit;
}

/** Recommended KPI layer (p. 17), 10 indicators. */
export const KPIS: readonly Kpi[] = [
  { key: 'leadToContractRate', label: T('Lead-to-contract conversion rate', 'Tasa de conversión de lead a contrato'), unit: '%' },
  { key: 'daysLeadToContract', label: T('Average days from lead to contract', 'Días promedio de lead a contrato'), unit: 'days' },
  { key: 'designCycleDays', label: T('Average design cycle time', 'Tiempo promedio del ciclo de diseño'), unit: 'days' },
  { key: 'revisionRounds', label: T('Number of revision rounds', 'Número de rondas de revisión'), unit: 'count' },
  { key: 'grossMarginByService', label: T('Gross margin by service', 'Margen bruto por servicio'), unit: '%' },
  { key: 'supplierVariance', label: T('Supplier variance vs approved budget', 'Variación de proveedores vs presupuesto aprobado'), unit: '%' },
  { key: 'scheduleVariance', label: T('Schedule variance', 'Variación del cronograma'), unit: 'days' },
  { key: 'clientSatisfaction', label: T('Client satisfaction after delivery', 'Satisfacción del cliente tras la entrega'), unit: 'score' },
  { key: 'consultationToDesignRate', label: T('Percentage of consultation clients converted to design', 'Porcentaje de clientes de consultoría convertidos a diseño'), unit: '%' },
  { key: 'designToExecutionRate', label: T('Percentage of design clients converted to execution', 'Porcentaje de clientes de diseño convertidos a ejecución'), unit: '%' },
];

/** Pick the text for a language (English fallback, D-004). */
export function pick(text: Text, lang: 'en' | 'es'): string {
  return lang === 'es' && text.es ? text.es : text.en;
}
