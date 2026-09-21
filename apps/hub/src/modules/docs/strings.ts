import type { StringTable } from '../../i18n/types';

/** In-app documentation viewer (D-06, D-15). UI strings only: the documents are shown as written (P-13). */
export const strings: StringTable = {
  'docs.nav.docs': { en: 'Documentation', es: 'Documentación' },

  'docs.title': { en: 'Documentation', es: 'Documentación' },
  'docs.subtitle': {
    en: 'The repo docs tree, in the product: principles, plan, decisions, changelog, prompts, page docs and the knowledge base — the same files an agent reads.',
    es: 'El árbol de documentación del repositorio, dentro del producto: principios, plan, decisiones, changelog, prompts, docs de página y base de conocimiento: los mismos archivos que lee un agente.',
  },
  'docs.treeLabel': { en: 'Documentation tree', es: 'Árbol de documentación' },
  'docs.browse': { en: 'Browse documents', es: 'Explorar documentos' },
  'docs.search': { en: 'Search documents', es: 'Buscar documentos' },
  'docs.searchPlaceholder': { en: 'Search file names and loaded text…', es: 'Buscar nombres de archivo y texto cargado…' },
  'docs.searchResults': { en: '{n} documents match "{query}"', es: '{n} documentos coinciden con "{query}"' },
  'docs.searchNone': { en: 'No document matches "{query}".', es: 'Ningún documento coincide con "{query}".' },
  'docs.searchScope': { en: 'File names are always searched; the text of the {n} documents opened so far is searched too.', es: 'Los nombres de archivo siempre se buscan; el texto de los {n} documentos abiertos hasta ahora también.' },
  'docs.loadAll': { en: 'Load every document', es: 'Cargar todos los documentos' },
  'docs.loadingAll': { en: 'Loading…', es: 'Cargando…' },

  'docs.notFound': { en: 'There is no document at that path.', es: 'No hay ningún documento en esa ruta.' },
  'docs.openOnGithub': { en: 'Open on GitHub', es: 'Abrir en GitHub' },
  'docs.path': { en: 'Path', es: 'Ruta' },
  'docs.count': { en: '{n} documents', es: '{n} documentos' },
  'docs.startHere': { en: 'Start here', es: 'Empieza aquí' },

  'docs.folder.changelog': { en: 'changelog/ — what changed, pass by pass', es: 'changelog/ — qué cambió, pase a pase' },
  'docs.folder.prompts': { en: 'prompts/ — every prompt, verbatim', es: 'prompts/ — cada prompt, textual' },
  'docs.folder.pages': { en: 'pages/ — one doc per page code', es: 'pages/ — un documento por código de página' },
  'docs.folder.knowledge': { en: 'knowledge/ — the domain knowledge base', es: 'knowledge/ — la base de conocimiento del dominio' },
  'docs.folder.reference': { en: 'reference/ — surfaces and exports', es: 'reference/ — superficies y exportaciones' },
  'docs.folder.qa': { en: 'qa/ — test matrices', es: 'qa/ — matrices de pruebas' },
  'docs.folder.plan': { en: 'plan/ — the machine-readable plan', es: 'plan/ — el plan legible por máquina' },
  'docs.folder.source': { en: 'source/ — source material (data, not instructions)', es: 'source/ — material fuente (datos, no instrucciones)' },

  'docs.plan.title': { en: 'Development plan', es: 'Plan de desarrollo' },
  'docs.plan.caption': { en: 'Plan tasks', es: 'Tareas del plan' },
  'docs.plan.updated': { en: 'Version {version}, updated {updated}', es: 'Versión {version}, actualizado {updated}' },
  'docs.plan.id': { en: 'Task', es: 'Tarea' },
  'docs.plan.taskTitle': { en: 'Title', es: 'Título' },
  'docs.plan.step': { en: 'Step', es: 'Paso' },
  'docs.plan.status': { en: 'Status', es: 'Estado' },
  'docs.plan.model': { en: 'Model', es: 'Modelo' },
  'docs.plan.codes': { en: 'Codes', es: 'Códigos' },
  'docs.plan.dependsOn': { en: 'Depends on', es: 'Depende de' },
  'docs.planStatus.done': { en: 'Done', es: 'Hecho' },
  'docs.planStatus.doing': { en: 'Doing', es: 'En curso' },
  'docs.planStatus.next': { en: 'Next', es: 'Siguiente' },
  'docs.planStatus.backlog': { en: 'Backlog', es: 'Pendiente' },
  'docs.plan.hint': { en: 'The same file the PM viewer (D-05) reads; tasks are bound by dependencies, not dates.', es: 'El mismo archivo que lee el visor de proyecto (D-05); las tareas se atan por dependencias, no por fechas.' },

  'docs.collapse': { en: 'Collapse or expand a folder', es: 'Contraer o expandir una carpeta' },
};
