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

  'hub.section.product': { en: 'Product surfaces', es: 'Superficies del producto' },
  'hub.section.productDesc': {
    en: 'What clients and the team use: the public site and the services intake, the client app, the manual, the docs, Spaces and the prototype.',
    es: 'Lo que usan clientes y equipo: el sitio público y el ingreso de servicios, la app del cliente, el manual, la documentación, Espacios y el prototipo.',
  },
  'hub.section.tools': { en: 'Builder and dev tools', es: 'Herramientas de construcción y desarrollo' },
  'hub.section.toolsDesc': {
    en: 'How the system is built and checked: plan viewer, canvas, demo simulator, actions, tokens, testing hub, components, specs, multiuser.',
    es: 'Cómo se construye y se verifica el sistema: visor del plan, lienzo, simulador, acciones, tokens, centro de pruebas, componentes, especificaciones, multiusuario.',
  },
  'hub.cards.website.title': { en: 'Public website', es: 'Sitio web público' },
  'hub.cards.website.desc': {
    en: 'aluzinaa.com, the studio site built in Lovable: interior design, emotional lighting and neurointeriorism in Medellín',
    es: 'aluzinaa.com, el sitio del estudio hecho en Lovable: diseño interior, iluminación emocional y neurointeriorismo en Medellín',
  },
  'hub.cards.services.title': { en: 'Services and intake', es: 'Servicios e ingreso' },
  'hub.cards.services.desc': {
    en: 'the five ALUZINA services from the playbook (digital and in-person consultation, comprehensive design, execution, styling) and the intake form that opens a lead in the pipeline',
    es: 'los cinco servicios ALUZINA del playbook (consultoría digital y presencial, diseño integral, ejecución, styling) y el formulario de ingreso que abre un lead en el pipeline',
  },
  'hub.cards.brandDocs.title': { en: 'Portfolio & brochure', es: 'Portafolio y brochure' },
  'hub.cards.brandDocs.desc': {
    en: 'The studio portfolio and the brochure: read them in the page, download the PDF or copy a link to send a client.',
    es: 'El portafolio del estudio y el brochure: léelos en la página, descarga el PDF o copia un enlace para enviarle a un cliente.',
  },
  'hub.cards.client.title': { en: 'Client app', es: 'App del cliente' },
  'hub.cards.client.desc': {
    en: 'phone-first app for the client: their project and its progress, the revision matrix to approve, messages with the studio, payment status',
    es: 'app pensada para el celular del cliente: su proyecto y su avance, la matriz de revisión por aprobar, mensajes con el estudio, estado de pagos',
  },
  'hub.cards.manual.title': { en: 'Ops manual', es: 'Manual de operaciones' },
  'hub.cards.manual.desc': {
    en: 'the bilingual operations manual: the service playbook phase by phase, governance rules, roles and how each portal runs them',
    es: 'el manual de operaciones bilingüe: el playbook de servicios fase por fase, reglas de gobierno, roles y cómo cada portal las ejecuta',
  },
  'hub.cards.docs.title': { en: 'Docs', es: 'Documentación' },
  'hub.cards.docs.desc': {
    en: 'the repository docs in the app: principles, brief, build plan, decisions, kanban, prompts, changelog, knowledge base and page docs',
    es: 'la documentación del repositorio dentro de la app: principios, brief, plan de construcción, decisiones, kanban, prompts, changelog, base de conocimiento y fichas de página',
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
  'hub.cards.design.title': { en: 'Design system', es: 'Sistema de diseño' },
  'hub.cards.design.desc': {
    en: 'the brand manual alive in the product: logo, palette, gradients, typography, elements and textures (D-12), every design token with its contrast in both themes (D-10) and the shader finishes (D-13). Gold today, silver ready.',
    es: 'el manual de marca vivo en el producto: logo, paleta, degradados, tipografía, elementos y texturas (D-12), cada token de diseño con su contraste en ambos temas (D-10) y los acabados con shader (D-13). Dorado hoy, plateado listo.',
  },
  'hub.cards.plan.title': { en: 'Plan viewer', es: 'Visor del plan' },
  'hub.cards.plan.desc': {
    en: 'the development plan from docs/plan/plan.json as kanban, list and timeline with dependencies; tasks bound by dependencies, not dates, with the model per task',
    es: 'el plan de desarrollo de docs/plan/plan.json como kanban, lista y cronograma con dependencias; tareas atadas a dependencias, no a fechas, con el modelo por tarea',
  },
  'hub.cards.canvas.title': { en: 'Canvas', es: 'Lienzo' },
  'hub.cards.canvas.desc': {
    en: 'every page of the system laid out on one zoomable canvas, grouped by surface, with its code, status and thumbnail',
    es: 'todas las páginas del sistema sobre un lienzo con zoom, agrupadas por superficie, con su código, estado y miniatura',
  },
  'hub.cards.simulator.title': { en: 'Demo simulator', es: 'Simulador de demo' },
  'hub.cards.simulator.desc': {
    en: 'phone and desktop frames side by side showing any page as any role, for demos and for checking the matrix',
    es: 'marcos de celular y escritorio lado a lado mostrando cualquier página como cualquier rol, para demos y para revisar la matriz',
  },
  'hub.cards.actions.title': { en: 'Actions', es: 'Acciones' },
  'hub.cards.actions.desc': {
    en: 'the actions registry: every declared action with page, intent, permission and params, whether a handler is live, and a runner (the WebMCP and voice vocabulary)',
    es: 'el registro de acciones: cada acción declarada con página, intención, permiso y parámetros, si tiene un manejador activo, y un ejecutor (el vocabulario de WebMCP y voz)',
  },
  'hub.cards.tokens.title': { en: 'Tokens', es: 'Tokens' },
  'hub.cards.tokens.desc': {
    en: 'the design tokens as data: colours, type, spacing, radii, shadows and the scale bands, in light and dark',
    es: 'los tokens de diseño como datos: colores, tipografía, espaciado, radios, sombras y las bandas de escala, en claro y oscuro',
  },
  'hub.cards.testing.title': { en: 'Testing hub', es: 'Centro de pruebas' },
  'hub.cards.testing.desc': {
    en: 'the QA view: responsive matrix per page, placeholder counts, checked widths, strings coverage and the smoke results',
    es: 'la vista de QA: matriz responsive por página, conteo de placeholders, anchos verificados, cobertura de textos y resultados del smoke',
  },
  'hub.cards.components.title': { en: 'Components', es: 'Componentes' },
  'hub.cards.components.desc': {
    en: 'the component library rendered from its metas with a live example per component (atom, molecule, organism, template)',
    es: 'la biblioteca de componentes renderizada desde sus metas con un ejemplo vivo por componente (átomo, molécula, organismo, plantilla)',
  },
  'hub.cards.specs.title': { en: 'Page specs', es: 'Especificaciones de página' },
  'hub.cards.specs.desc': {
    en: 'every page spec: purpose, layout, data tables, roles, logic, components, actions, checked widths and completeness',
    es: 'cada especificación de página: propósito, layout, tablas, roles, lógica, componentes, acciones, anchos verificados y completitud',
  },
  'hub.cards.multiuser.title': { en: 'Multiuser', es: 'Multiusuario' },
  'hub.cards.multiuser.desc': {
    en: 'open the system as two people in two tabs and watch realtime, presence and conflicts happen',
    es: 'abre el sistema como dos personas en dos pestañas y observa el tiempo real, la presencia y los conflictos',
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
