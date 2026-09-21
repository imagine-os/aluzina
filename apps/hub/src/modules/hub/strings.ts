import type { StringTable } from '../../i18n/types';

/** HUB-01 strings, namespaced `hub.*`. Full Spanish (P-13). */
export const strings: StringTable = {
  'hub.brand': { en: 'Aluzina', es: 'Aluzina' },
  'hub.title': { en: 'Aluzina Business OS', es: 'Aluzina Business OS' },
  'hub.subtitle': {
    en: 'One hub for every surface of the Aluzina system: the prototype, the public site, the apps, the docs and the tools.',
    es: 'Un solo punto de entrada a todas las superficies del sistema Aluzina: el prototipo, el sitio público, las apps, la documentación y las herramientas.',
  },
  'hub.header.controls': { en: 'Display settings', es: 'Ajustes de pantalla' },
  'hub.header.lang.toEs': { en: 'Switch to Spanish', es: 'Cambiar a español' },
  'hub.header.lang.toEn': { en: 'Switch to English', es: 'Cambiar a inglés' },
  'hub.header.theme.toDark': { en: 'Switch to dark theme', es: 'Cambiar a tema oscuro' },
  'hub.header.theme.toLight': { en: 'Switch to light theme', es: 'Cambiar a tema claro' },
  'hub.header.theme.light': { en: 'Light', es: 'Claro' },
  'hub.header.theme.dark': { en: 'Dark', es: 'Oscuro' },
  'hub.header.dev.label': { en: 'Developer mode', es: 'Modo desarrollador' },
  'hub.header.dev.on': { en: 'Dev on', es: 'Dev activo' },
  'hub.header.dev.off': { en: 'Dev off', es: 'Dev inactivo' },
  'hub.section.surfaces': { en: 'Surfaces', es: 'Superficies' },
  'hub.status.live': { en: 'Live', es: 'Activo' },
  'hub.status.planned': { en: 'Planned', es: 'Planeado' },
  'hub.status.stub': { en: 'Stub', es: 'Borrador' },
  'hub.cta.open': { en: 'Open', es: 'Abrir' },
  'hub.cta.visit': { en: 'Visit site', es: 'Visitar sitio' },
  'hub.cta.enterAs': { en: 'Enter as {name}', es: 'Entrar como {name}' },

  'hub.section.portals': { en: 'Portals', es: 'Portales' },
  'hub.section.portalsDesc': {
    en: 'One view of the system per role. Entering a portal switches the demo user; identity is mocked, permissions are real.',
    es: 'Una vista del sistema por rol. Entrar a un portal cambia el usuario demo; la identidad es simulada, los permisos son reales.',
  },
  'hub.portals.founder.title': { en: 'Founder', es: 'Fundadora' },
  'hub.portals.founder.desc': {
    en: 'Alejandra Guerra: approvals queue, pipeline and sales, client quotes and graphic proposals, project PDFs, partnerships, product development',
    es: 'Alejandra Guerra: cola de aprobaciones, pipeline y ventas, cotizaciones y propuestas gráficas, PDFs de proyecto, alianzas, desarrollo de producto',
  },
  'hub.portals.ops.title': { en: 'Administration and Operations', es: 'Administración y Operaciones' },
  'hub.portals.ops.desc': {
    en: 'Miguel: schedule, pending tasks, meetings, suppliers and follow-ups, quotes and comparisons, deliveries, payments and who owes what, alerts before urgent',
    es: 'Miguel: cronograma, tareas pendientes, reuniones, proveedores y seguimiento, cotizaciones y comparativos, entregas, pagos y quién debe qué, alertas antes de lo urgente',
  },
  'hub.portals.studio.title': { en: 'Interior Design', es: 'Diseño Interior' },
  'hub.portals.studio.desc': {
    en: 'Sarai: design proposals per project, references, mood boards and palettes, plans, furniture and material schedules, render packs, measurements, consistency check',
    es: 'Sarai: propuestas de diseño por proyecto, referencias, moodboards y paletas, planos, cuadros de mobiliario y materiales, paquetes de render, medidas, chequeo de consistencia',
  },
  'hub.portals.brand.title': { en: 'Graphic Design and Communication', es: 'Diseño Gráfico y Comunicación' },
  'hub.portals.brand.desc': {
    en: 'Angélica: competitions calendar (20 entries in 2027), sales presentations, brand identity, client image sets, graphic revisions queue, asset library',
    es: 'Angélica: calendario de concursos (20 en 2027), presentaciones de ventas, identidad de marca, imágenes para clientes, cola de revisiones gráficas, biblioteca de activos',
  },
  'hub.portals.client.title': { en: 'Client portal', es: 'Portal del cliente' },
  'hub.portals.client.desc': {
    en: 'opens the client-facing app: their projects, proposals and PDFs to review, approvals, messages, payment status; phone-first',
    es: 'abre la app para clientes: sus proyectos, propuestas y PDFs por revisar, aprobaciones, mensajes, estado de pagos; pensada para el celular',
  },

  'hub.cards.spaces.title': { en: 'Spaces', es: 'Espacios' },
  'hub.cards.spaces.desc': {
    en: 'The Hub\'s own organizer replacing the Slack sidebar: spaces without depth limit, posts filed in many places at once, relations between anything, a graph and the catalogs (deliverables, clients, tools, roles).',
    es: 'El organizador propio del Hub que reemplaza la barra lateral de Slack: espacios sin límite de profundidad, publicaciones archivadas en varios lugares a la vez, relaciones entre todo, un grafo y los catálogos (entregables, clientes, herramientas, roles).',
  },
  'hub.cards.businessOs.title': { en: 'Business OS prototype', es: 'Prototipo Business OS' },
  'hub.cards.businessOs.desc': {
    en: 'the Claude Design prototype of the Aluzina operations system: cockpit, stations, work views, QC, media, design system, docs; EN/ES toggle inside',
    es: 'el prototipo de Claude Design del sistema operativo de Aluzina: cabina, estaciones, vistas de trabajo, QC, medios, sistema de diseño, docs; con cambio EN/ES adentro',
  },
  'hub.cards.website.title': { en: 'Public website', es: 'Sitio web público' },
  'hub.cards.website.desc': {
    en: 'aluzinaa.com, the studio site built in Lovable: interior design, emotional lighting and neurointeriorism in Medellín',
    es: 'aluzinaa.com, el sitio del estudio hecho en Lovable: diseño interior, iluminación emocional y neurointeriorismo en Medellín',
  },
  'hub.cards.docs.title': { en: 'Docs', es: 'Documentación' },
  'hub.cards.docs.desc': {
    en: 'the repository docs: principles, brief, build plan, decisions, kanban, prompts, changelog and page docs',
    es: 'la documentación del repositorio: principios, brief, plan de construcción, decisiones, kanban, prompts, changelog y fichas de página',
  },
  'hub.cards.manual.title': { en: 'Ops manual', es: 'Manual de operaciones' },
  'hub.cards.manual.desc': {
    en: 'opens the bilingual operations manual for running the studio in person and in software',
    es: 'abre el manual de operaciones bilingüe para dirigir el estudio en persona y en el software',
  },
  'hub.cards.dev.title': { en: 'Dev tools', es: 'Herramientas de desarrollo' },
  'hub.cards.dev.desc': {
    en: 'the builder tools: component library (D-02) and page specs (D-03) today; tokens, actions, plan viewer, canvas and demo simulator next',
    es: 'las herramientas de construcción: biblioteca de componentes (D-02) y especificaciones de página (D-03) hoy; tokens, acciones, visor del plan, lienzo y simulador después',
  },

  'hub.section.prototypePages': { en: 'Prototype pages', es: 'Páginas del prototipo' },
  'hub.section.prototypePagesDesc': {
    en: 'The other pages that came with the Claude Design export, served as-is from ./business-os/.',
    es: 'Las demás páginas que vinieron con la exportación de Claude Design, servidas tal cual desde ./business-os/.',
  },
  'hub.proto.home.title': { en: 'ALUZINA Home', es: 'ALUZINA Home' },
  'hub.proto.home.desc': {
    en: 'marketing home concept with the loop and transition videos (marble and brass)',
    es: 'concepto de página de inicio con los videos de bucle y transición (mármol y latón)',
  },
  'hub.proto.cyberBridge.title': { en: 'Cyber Bridge', es: 'Cyber Bridge' },
  'hub.proto.cyberBridge.desc': {
    en: 'dark concept page: stations, menu and bible as windows onto the OS',
    es: 'página conceptual oscura: estaciones, menú y biblia como ventanas hacia el OS',
  },
  'hub.proto.cyberBridgeDeck.title': { en: 'Cyber Bridge Deck', es: 'Cyber Bridge Deck' },
  'hub.proto.cyberBridgeDeck.desc': {
    en: '1920 x 1080 slide deck with speaker notes (arrow keys to move)',
    es: 'presentación 1920 x 1080 con notas del orador (flechas para avanzar)',
  },
  'hub.proto.imageGenerationPlan.title': { en: 'Image Generation Plan', es: 'Plan de generación de imágenes' },
  'hub.proto.imageGenerationPlan.desc': {
    en: 'printable document: how the world renders and station images are produced',
    es: 'documento imprimible: cómo se producen los renders del mundo y las imágenes de estaciones',
  },
  'hub.proto.lodLadder.title': { en: 'LOD Ladder', es: 'Escalera LOD' },
  'hub.proto.lodLadder.desc': {
    en: 'concept page: levels of detail from world map to station close-up',
    es: 'página conceptual: niveles de detalle desde el mapa del mundo hasta el primer plano de estación',
  },

  'hub.footer.version': { en: 'Version {version}', es: 'Versión {version}' },
  'hub.footer.repo': { en: 'Source on GitHub', es: 'Código en GitHub' },
  'hub.footer.devHint': { en: 'Turn on developer mode to see page codes and declared actions (Ctrl+.).', es: 'Activa el modo desarrollador para ver códigos de página y acciones declaradas (Ctrl+.).' },
};
