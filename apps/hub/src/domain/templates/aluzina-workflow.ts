import type { Text } from '../playbook';
import type { ProjectTemplate, TemplateTask, Trade, Zone } from './types';

/**
 * `tpl-aluzina-workflow`: the founder's standard project workflow as one bilingual template (D-062).
 *
 * Sources (`docs/knowledge/asana-conventions.md`, exports in `docs/source/asana/2026-09-21/`):
 * - **Spine**: ALUZINA WORKFLOW FOR EVERY PROJECT (Spanish, 2023-07-19, still edited) — DISEÑO,
 *   PLANEACION, COTIZACION, PRODUCCION, in the founder's own wording and numbering.
 * - **Phase 0**: PROYECTO HOY's kickoff section `Cierre de cliente Primer pago de diseño`
 *   (CONTRATO, FACTURACION, SUBIR FOTOGRAFIAS…), which exists in neither template.
 * - **English labels**: WORK CHRONOGRAM ALUZINA ENGLISH (2023-07-18) where a task matches.
 *   **`en` labels without an Asana source are the integrator's translations (D-004).**
 *
 * Deliberately **not** carried over (2023 residue of the real project the Spanish template grew out of):
 * the `Untitled section` one-offs, INFORMACION DE CLIENTE (client names), PAGOS DE CLIENTES (amounts),
 * PISOS (one task per curing day), the 12-space botany list, the per-project luminaire shopping list,
 * `10. DISENOS REQUERIDOS PARA SEMCO`, `Terraza federico`, `Apartment , semco` and the brand-specific
 * purchase lines under `13. COCINA` / `14. ACABADOS`.
 *
 * The founder's hand numbering is kept **verbatim in the titles** (including the two `16.` siblings of
 * PRODUCCION): `docs/knowledge/asana-conventions.md` records it as an ordering hint, and `tasks.order`
 * carries the real order, so renumbering her template here would invent a workflow she does not use.
 *
 * Zone-scoped tasks (`zoneScoped: true`) are written once per zone chosen on W-03, never stored eleven
 * times: the references sketch per space, the 3D model per space and the nine-lens deep design per space.
 */

const T = (en: string, es: string): Text => ({ en, es });

/** `deliverables` catalog ids (`apps/hub/src/data/seed/spaces.ts` `DELIVERABLE_IDS`, `docs/knowledge/deliverables.md`). */
const DEL = {
  survey: 'del-site-survey',
  concept: 'del-concept-presentation',
  moodBoard: 'del-mood-board',
  lightingConcept: 'del-lighting-concept',
  lightingPlan: 'del-lighting-plan',
  furnitureSchedule: 'del-furniture-schedule',
  drawings: 'del-technical-drawings',
  renderPack: 'del-render-pack',
  budget: 'del-budget-quote-comparison',
  rfq: 'del-rfq-packet',
  schedule: 'del-project-schedule',
  contract: 'del-contract',
  invoice: 'del-invoice',
  finalPresentation: 'del-final-presentation',
  handover: 'del-handover-package',
  punchList: 'del-punch-list',
} as const;

/** The eleven spaces of the founder's template, Spanish from the workflow and English from the chronogram. */
export const ZONES: readonly Zone[] = [
  { id: 'zone-1', name: T('Entrance', 'Entrada') },
  { id: 'zone-2', name: T('Dining area', 'Comedor') },
  { id: 'zone-3', name: T('Balcony', 'Balcón') },
  { id: 'zone-4', name: T('Living room', 'Sala') },
  { id: 'zone-5', name: T('Kitchen', 'Cocina') },
  { id: 'zone-6', name: T('Guest room / study', 'Habitación para invitados / estudio') },
  { id: 'zone-7', name: T('Bar area', 'Área del bar') },
  { id: 'zone-8', name: T('Social bathroom', 'Baño social') },
  { id: 'zone-9', name: T('Master bedroom', 'Habitación principal') },
  { id: 'zone-10', name: T('Cinema', 'Cine') },
  { id: 'zone-11', name: T('Terrace', 'Terraza') },
];

/** The sixteen trades the founder asks to quote (COTIZACION step 2; the export writes them in English). */
export const TRADES: readonly Trade[] = [
  { id: 'trade-1', name: T('1. Demolition', '1. Demolición') },
  { id: 'trade-2', name: T('2. Plumber', '2. Plomería') },
  { id: 'trade-3', name: T('3. Electrician', '3. Electricidad') },
  { id: 'trade-4', name: T('4. Ceiling', '4. Techos') },
  { id: 'trade-5', name: T('5. Floor', '5. Pisos') },
  { id: 'trade-6', name: T('6. Builder cement, drywall', '6. Obra en cemento y dry wall') },
  { id: 'trade-7', name: T('7. Plating', '7. Enchapes') },
  { id: 'trade-8', name: T('8. Dry wall', '8. Dry wall') },
  { id: 'trade-9', name: T('9. Instalation of elements', '9. Instalación de elementos') },
  { id: 'trade-10', name: T('10. Windows and doors', '10. Ventanas y puertas') },
  { id: 'trade-11', name: T('11. Closing of everything', '11. Cerramientos') },
  { id: 'trade-12', name: T('12. Wallpaper and painting', '12. Papel colgadura y pintura') },
  { id: 'trade-13', name: T('13. Online buying', '13. Compras por internet') },
  { id: 'trade-14', name: T('14. Lighting installation', '14. Instalación de iluminación') },
  { id: 'trade-15', name: T('15. Wood and furniture', '15. Madera y mobiliario') },
  { id: 'trade-16', name: T('16. Metalmecanic', '16. Metalmecánica') },
];

/** Leaf task. */
function leaf(id: string, en: string, es: string, deliverableId: string | null = null): TemplateTask {
  return { id, title: T(en, es), deliverableId, children: [] };
}
/** Task with children. */
function node(id: string, en: string, es: string, children: TemplateTask[], deliverableId: string | null = null): TemplateTask {
  return { id, title: T(en, es), deliverableId, children };
}
/** Task generated once per chosen zone. */
function perZone(id: string, en: string, es: string, children: TemplateTask[] = [], deliverableId: string | null = null): TemplateTask {
  return { id, title: T(en, es), deliverableId, zoneScoped: true, children };
}
/** Simple numbered child list: `['1. Kitchen|1. Cocina', …]`. */
function kids(prefix: string, pairs: string[]): TemplateTask[] {
  return pairs.map((pair, i) => {
    const [en, es] = pair.split('|');
    return leaf(`${prefix}-${i + 1}`, en, es ?? en);
  });
}

/** The nine lenses every space is designed through (same list in both templates). */
const LENSES = kids('lens', [
  '1. Atmosphere|1. Atmósfera',
  '2. Circulation|2. Circulación',
  '3. Ventilation, natural and artificial|3. Ventilación natural y artificial',
  '4. Lighting, natural and artificial|4. Iluminación natural y artificial',
  '5. Closures|5. Cerramientos',
  '6. Color|6. Color',
  '7. Finished|7. Acabados',
  '8. Furniture|8. Mobiliario',
  '9. Detail|9. Detalles',
]);

export const ALUZINA_WORKFLOW: ProjectTemplate = {
  id: 'tpl-aluzina-workflow',
  name: T('Aluzina workflow for every project', 'Flujo de trabajo Aluzina para cada proyecto'),
  source: T(
    'Merge of the founder’s two Asana template projects (ALUZINA WORKFLOW FOR EVERY PROJECT, WORK CHRONOGRAM ALUZINA ENGLISH) plus PROYECTO HOY’s kickoff section.',
    'Fusión de las dos plantillas de Asana de la fundadora (ALUZINA WORKFLOW FOR EVERY PROJECT, WORK CHRONOGRAM ALUZINA ENGLISH) más la sección de arranque de PROYECTO HOY.',
  ),
  serviceCode: '03',
  phases: [
    // ---- Phase 0: the kickoff section PROYECTO HOY adds in front of DISEÑO ----
    {
      id: 'phase-cierre',
      name: T('Client close · first design payment', 'Cierre de cliente · primer pago de diseño'),
      ownerRole: 'ops',
      tasks: [
        { ...leaf('cierre-contrato', 'CONTRATO', 'CONTRATO', DEL.contract), ownerRole: 'founder' },
        leaf('cierre-facturacion', 'FACTURACION', 'FACTURACION', DEL.invoice),
        { ...leaf('cierre-dropbox', 'SUBIR FOTOGRAFIAS DE ESPACIO Y REFERENCIA A DROPBOX', 'SUBIR FOTOGRAFIAS DE ESPACIO Y REFERENCIA A DROPBOX'), ownerRole: 'studio' },
      ],
    },

    // ---- DISEÑO / DESIGN ----
    {
      id: 'phase-diseno',
      name: T('DESIGN', 'DISEÑO'),
      ownerRole: 'founder',
      tasks: [
        leaf('dis-1', '1. Investigations', '1. Investigación'),
        leaf('dis-2', '2. Conceptualization', '2. Conceptualización'),
        { ...leaf('dis-3', '3. 2D Acad Model', '3. 2D Acad Model', DEL.survey), ownerRole: 'studio' },
        leaf('dis-4', '4. Define Areas and Zonifications', '4. Definir zonas y áreas'),
        leaf('dis-5', '5. User experience in each space', '5. Experiencia de usuario en cada espacio'),
        node(
          'dis-6',
          '6. FIRST DESIGN MEETING WITH THE CLIENT',
          '6. PRIMERA REUNIÓN DE DISEÑO CON EL CLIENTE',
          [
            leaf('dis-7-punto', '7. Locate the point of the process we are at in the client presentation', '7. Ubicar el punto del proceso en el que vamos en la presentación con cliente'),
            node('dis-8-mood', '8. MOOD BOARD', '8. MOOD BOARD', kids('mood', ['A. COLOURS|A. COLORES', 'B. MATERIALS|B. MATERIALES', 'C. KEY IMAGE|C. IMAGEN RELEVANTE', 'D. TEXTURES|D. TEXTURAS']), DEL.moodBoard),
            node('dis-9-referentes', '9. Find the references that suit each space and sketch to deepen its style', '9. Buscar los referentes que se adaptan a cada espacio, realizar algunos sketch para profundizar en el estilo de cada espacio', [
              perZone('dis-9-zone', 'References and sketch', 'Referentes y sketch'),
            ]),
            leaf('dis-10-luz', '10. Reference scheme of the lighting intention', '10. Esquema de referencia de la intención de iluminación', DEL.lightingConcept),
            leaf('dis-11-alzado', '11. Three-dimensional elevation of the interior space to have the container', '11. Alzado tridimensional del espacio interior para tener el contenedor'),
          ],
          DEL.concept,
        ),
        node(
          'dis-12',
          '12. SECOND DESIGN MEETING WITH THE CLIENT',
          '12. SEGUNDA REUNIÓN DE DISEÑO CON EL CLIENTE',
          [
            leaf('dis-12-punto', '12. Locate the point of the process we are at in the client presentation', '12. Ubicar el punto del proceso en el que vamos en la presentación con cliente'),
            node(
              'dis-13-modelado',
              '13. 3D MODELING of the design',
              '13. Modelado tridimensional del diseño',
              [
                perZone('dis-13-1', '13. 1 3D MODEL OF EACH SPACE', '13. 1 MODELADO DE CADA ESPACIO'),
                leaf('dis-13-2', '13. 2 2D plans of the space with every specification', '13. 2 2D planos del espacio con todo especificado', DEL.drawings),
                leaf('dis-13-3', '13. 3 Design of the furniture to be fabricated, 3D model for approval', '13. 3 Diseño de mobiliario que se va a fabricar, modelo 3D para aprobación', DEL.furnitureSchedule),
                leaf('dis-13-4', '13. 4 Specification of the furniture and details to be bought', '13. 4 Especificación de mobiliario y detalles que se van a comprar', DEL.furnitureSchedule),
              ],
              DEL.renderPack,
            ),
            node('dis-13-profundidad', '13. DESIGN EACH SPACE IN DEPTH', '13. DISEÑO A PROFUNDIDAD DE CADA ESPACIO', [
              perZone('dis-13-lens', 'Design in depth', 'Diseño a profundidad', LENSES),
            ]),
            leaf('dis-14-migrar', '14. MERGE the 3D images of our design into the presentation, replacing the references with the studio’s creations', '14. MIGRAR las imágenes 3D con nuestro diseño a la presentación, reemplazando los referentes por las creaciones del estudio', DEL.renderPack),
            node(
              'dis-15-luminico',
              '15. LIGHTING DESIGN',
              '15. DISEÑO LUMÍNICO',
              [
                leaf('dis-15-1', 'Lighting design by requirement and feeling', 'Diseño lumínico en cuanto a requerimientos y sensaciones'),
                leaf('dis-15-2', 'Electrical plan', 'Plano eléctrico'),
                leaf('dis-15-3', 'Luminaires described per space', 'Luminarias en cada espacio descritas'),
                leaf('dis-15-4', 'Complete lighting plan', 'Plano lumínico entero'),
              ],
              DEL.lightingPlan,
            ),
          ],
          DEL.concept,
        ),
        node('dis-envio', 'DELIVERY OF THE PRESENTATION', 'ENVÍO DE PRESENTACIÓN', [leaf('dis-envio-3d', '3D model handover', 'Entrega de modelo 3D')], DEL.finalPresentation),
        { ...leaf('dis-pago-final', 'LAST PAYMENT OF THE DESIGN', 'ÚLTIMO PAGO DEL DISEÑO', DEL.invoice), ownerRole: 'ops' },
      ],
    },

    // ---- PLANEACION / PLANNING ----
    {
      id: 'phase-planeacion',
      name: T('PLANNING', 'PLANEACIÓN'),
      ownerRole: 'ops',
      tasks: [
        leaf('pla-estructura', 'Structure the production board', 'Estructuración de Asana de producción'),
        node(
          'pla-cronograma',
          'Work schedule',
          'Cronograma de trabajo',
          [
            leaf('pla-cronograma-cliente', 'Board shared with the client', 'ASANA COMPARTIDO CON CLIENTE'),
            leaf('pla-cronograma-excel', 'General report spreadsheet', 'EXCEL CON REPORTE GENERAL'),
          ],
          DEL.schedule,
        ),
        leaf('pla-reunion', 'WEEKLY MEETING, Monday', 'REUNIÓN SEMANAL lunes'),
      ],
    },

    // ---- COTIZACION / QUOTATION ----
    {
      id: 'phase-cotizacion',
      name: T('QUOTATION', 'COTIZACIÓN'),
      ownerRole: 'ops',
      tasks: [
        leaf('cot-1', '1. ALL THE DESIGN ELEMENTS MIGRATED INTO THE FORMAL QUOTATION SPREADSHEET', '1. Todos los elementos de diseño migrados a EXCEL a la cotización formal', DEL.budget),
        node(
          'cot-2',
          '2. CONTACT THE PROVIDERS OF EACH ELEMENT WITH THE DESIGN SPECIFICATIONS SO THEY QUOTE',
          '2. Contactar los proveedores de cada elemento de obra con las especificaciones de diseño para que hagan sus cotizaciones',
          [node('cot-2-proveedores', 'PROVEETORS', 'PROVEEDORES', TRADES.map((trade, i) => leaf(`cot-trade-${i + 1}`, trade.name.en, trade.name.es ?? trade.name.en)))],
          DEL.rfq,
        ),
      ],
    },

    // ---- PRODUCCION / PRODUCTION ----
    {
      id: 'phase-produccion',
      name: T('PRODUCTION', 'PRODUCCIÓN'),
      ownerRole: 'ops',
      tasks: [
        leaf('pro-0', '0. Roof maintenance', '0. Mantenimiento de techo'),
        node('pro-1', '1. Demolition', '1. Demolición', kids('pro-1', [
          '1. Kitchen walls|1. Cocina paredes',
          '2. Kitchen ceiling|2. Cocina techo',
          '3. Social bathroom|3. Baño social',
          '4. Laundry|4. Lavandería',
          '5. Second-floor suspended ceilings|5. Cielos rasos de segundo piso',
        ])),
        node('pro-2', '2. Court (chasing)', '2. Canchados', kids('pro-2', [
          '1. Chasing for electricity|1. Canchado para electricidad',
          '2. Chasing for plumbing|2. Canchado para plomería',
          '3. Chasing for ventilation|3. Canchado para ventilación',
          '4. Chasing for home automation|4. Canchado para domótica',
        ])),
        leaf('pro-3', '3. Running the ventilation, plumbing and gas pipes', '3. Tirado de tuberías de ventilación, de plomería y gas'),
        node('pro-4', '4. Mamposteria', '4. Mampostería', kids('pro-4', [
          '1. Poured concrete floor|1. Piso de concreto vaciado',
          '2. Catalan brick and drywall walls|2. Paredes en ladrillo catalán y dry wall',
          '3. Bathroom planters|3. Materas de baño',
          '4. Wall luminaires|4. Luminarias en paredes',
        ])),
        node('pro-5', '5. Contact providers of metalwork and joinery', '5. Contratación de proveedores de metalmecánica y carpintería', kids('pro-5', [
          '1. Mirrors|1. Espejos',
          '2. Balcony planters: construction and installation drawings, 3D|2. Materas de balcón: planos constructivos y de instalación, 3D',
          '3. Bench transformation|3. Transformación de banca',
          '4. Sofa fabrication|4. Fabricación de sofá',
        ])),
        leaf('pro-6', '6. Glass doors and skylights', '6. Puertas vidrieras y tragaluces'),
        leaf('pro-7', '7. Botanic', '7. Botánica'),
        node('pro-8', '8. Plumber', '8. Plomería', kids('pro-8', [
          '1. Kitchen|1. Cocina',
          '2. Point in the living room|2. Punto en la sala',
          '3. Point in the balcony|3. Punto en el balcón',
          '4. Points for the service area|4. Puntos para área de servicio',
        ])),
        leaf('pro-9', '9. Water wall and jacuzzi', '9. Muro llorón y jacuzzi'),
        node('pro-10', '10. Cellings', '10. Techos', kids('pro-10', [
          '1. Roof maintenance|1. Mantenimiento de techo',
          '2. Unify the kitchen ceiling colour|2. Unificación de color de techo de cocina',
          '3. Coffered ceiling in the master bedroom|3. Construcción de casetones en habitación principal',
          '4. Replace the damaged slats of the cinema ceiling|4. Reposición de tablillas en mal estado en techo de cine',
          '5. Guest room ceiling and wall|5. Instalación de techo y pared de habitación de huéspedes',
        ])),
        node('pro-11', '11. ELECTRICITY', '11. ELECTRICIDAD', kids('pro-11', [
          '1. Technology points: TVs, cameras and projectors|1. Instalación de tecnología: puntos para televisores, cámaras y proyectores',
          '2. Bulb points|2. Puntos para bombillas',
          '3. 220 V for the kitchen equipment|3. 220 eléctricidad para equipos en cocina',
          '4. Exposed electrical wiring|4. Cableado eléctrico expuesto',
          '5. Electrical works in the kitchen|5. Adecuaciones eléctricas en cocina',
          '6. Electrical works in the bathrooms|6. Adecuaciones eléctricas en baños',
          '7. Curtain electrical points|7. Puntos eléctricos de cortinas',
          '8. Light point for the soap dispenser and the wall air|8. Adecuación de punto de luz para jabonero y aire en pared',
          '9. LED profiles with tape and transformers|9. Perfiles led con cinta led y transformadores',
          '10. Decorative luminaires|10. Luminarias decorativas',
          '11. Switches throughout the house|11. Switches de toda la casa',
        ])),
        leaf('pro-12', '12. FLOOR', '12. PISOS'),
        leaf('pro-13', '13. Kitchen', '13. COCINA'),
        node('pro-14', '14. Finishes', '14. ACABADOS', kids('pro-14', [
          '1. Plating|1. Enchapes',
          '2. Wallpaper|2. Papel colgadura',
          '3. Mural|3. Mural',
          '4. Paint: colours and quantities|4. Pinturas: colores y cantidades',
        ])),
        node('pro-15', '15. ENCLOSURE', '15. CERRAMIENTOS', kids('pro-15', [
          '1. Catalan-brick dividing wall|1. Pared divisoria en ladrillo catalán',
          '2. Drywall wall carrying the kitchen anchoring|2. Muro de dry wall que soporte el anclaje de los requerimientos de cocina',
          '3. Wood|3. Madera',
        ])),
        node('pro-16-bano', '16. Bathroom accessories', '16. Accesorios de baño', kids('pro-16-bano', [
          '1. Shower and taps|1. Ducha y canillas',
          '2. Toilet|2. Inodoro',
          '3. Dispenser soap|3. Dispensador de jabón',
          '4. Dispenser fragance|4. Dispensador de fragancia',
          '5. Hands dryer|5. Secador de manos',
        ])),
        node('pro-16-tec', '16. Technology', '16. Tecnología', kids('pro-16-tec', [
          '1. Projectors and projection screen|1. Proyectores y pantalla de proyección',
          '2. Home automation: irrigation, curtains and lighting control|2. Sistema domótico para riego, cortinas y control lumínico',
        ])),
        node('pro-17', '17. Lighting', '17. Iluminación', kids('pro-17', [
          '1. LED profiles outdoors and on the stairs|1. Perfiles led en el exterior y en escalas',
          '2. LED profiles in the social area and every bedroom|2. Perfiles led en área social y cada una de las habitaciones',
          '3. Domotic and dimmer switches|3. Switches domóticos y switches dimmer',
          '4. Kitchen furniture lighting|4. Iluminación en mobiliario de la cocina',
          '5. Surface-mounted downlights|5. Balas sobrepuestas',
          '6. ALUZINA decorative lighting|6. Iluminación decorativa ALUZINA',
        ])),
        leaf('pro-18', '18. Neon sign in the laundry', '18. Aviso luminoso en neón en lavandería'),
        node('pro-19', '19. Furniture', '19. Mobiliario', kids('pro-19', [
          '1. Metalmecanic|1. Metalmecánica',
          '2. Wood made|2. Carpintería',
          '3. Buying from store|3. Comprados de almacenes',
          '4. Sofa|4. Sofá',
        ])),
        leaf('pro-20', '20. Internet buyings', '20. Elementos comprados por internet'),
        { ...leaf('pro-21', '21. Art', '21. Arte'), ownerRole: 'founder' },
        { ...leaf('pro-22', '22. House details', '22. Detalles de casa'), ownerRole: 'founder' },
        leaf('pro-23', '23. Final details', '23. Detalles finales', DEL.punchList),
        leaf('pro-24', '24. Final arrengment', '24. Arreglo final'),
        leaf('pro-25', '25. Client deliver', '25. Entrega al cliente', DEL.handover),
        leaf('pro-26', '26. Client correction in space', '26. Corrección con el cliente en el espacio', DEL.punchList),
      ],
    },
  ],
};
