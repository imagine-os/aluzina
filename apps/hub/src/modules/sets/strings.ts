import type { StringTable } from '../../i18n/types';

/**
 * Example-set strings (P-06). Namespace `sets.`. Spanish first: the page is read by the studio's clients,
 * who are Spanish-speaking, so every key is written in Spanish and translated to English (P-13, D-004).
 */
export const strings: StringTable = {
  'sets.title': { en: 'Project examples', es: 'Ejemplos de proyectos' },
  'sets.brandAria': { en: 'Aluzina', es: 'Aluzina' },
  'sets.intro': {
    en: 'A selection of projects from the studio, put together for this conversation: what each one was, where it is and what we designed for it.',
    es: 'Una selección de proyectos del estudio, reunida para esta conversación: qué fue cada uno, dónde está y qué diseñamos para él.',
  },
  'sets.count': { en: '{count} projects', es: '{count} proyectos' },
  'sets.countOne': { en: '1 project', es: '1 proyecto' },

  // Controls (hidden in print)
  'sets.controls': { en: 'Page controls', es: 'Controles de la página' },
  'sets.lang': { en: 'Language', es: 'Idioma' },
  'sets.langEs': { en: 'ES', es: 'ES' },
  'sets.langEn': { en: 'EN', es: 'EN' },
  'sets.langEsAria': { en: 'Read this page in Spanish', es: 'Leer esta página en español' },
  'sets.langEnAria': { en: 'Read this page in English', es: 'Leer esta página en inglés' },
  'sets.print': { en: 'Print / Save as PDF', es: 'Imprimir / Guardar como PDF' },
  'sets.copyLink': { en: 'Copy link', es: 'Copiar enlace' },
  'sets.copied': { en: 'Link copied', es: 'Enlace copiado' },
  'sets.copyFailed': { en: 'The clipboard is not available here; the link is in the address bar.', es: 'El portapapeles no está disponible aquí; el enlace está en la barra de direcciones.' },

  // Project section
  'sets.cover': { en: 'Cover of {name}', es: 'Portada de {name}' },
  'sets.mosaic': { en: 'File types of {name}', es: 'Tipos de archivo de {name}' },
  'sets.year': { en: 'Year', es: 'Año' },
  'sets.location': { en: 'Location', es: 'Ubicación' },
  'sets.previews': { en: 'Design previews', es: 'Avances de diseño' },
  'sets.previewsOf': { en: 'Design previews of {name}', es: 'Avances de diseño de {name}' },
  'sets.previewOpen': { en: 'Open the preview {name}', es: 'Abrir el avance {name}' },
  'sets.previewMore': { en: 'More images of this project on request.', es: 'Más imágenes de este proyecto a solicitud.' },
  'sets.previewLoading': { en: 'Loading previews…', es: 'Cargando avances…' },
  'sets.previewNone': { en: 'The images of this project are not published; we show them in a meeting.', es: 'Las imágenes de este proyecto no están publicadas; las mostramos en una reunión.' },
  'sets.previewFallback': { en: 'This file cannot be shown in the browser.', es: 'Este archivo no se puede mostrar en el navegador.' },
  'sets.previewPage': { en: 'Page {index} of {total}', es: 'Página {index} de {total}' },
  'sets.previewPrev': { en: 'Previous page', es: 'Página anterior' },
  'sets.previewNext': { en: 'Next page', es: 'Página siguiente' },
  'sets.previewPages': { en: 'Pages', es: 'Páginas' },
  'sets.previewClose': { en: 'Close', es: 'Cerrar' },

  // Project types (client language, no internal codes)
  'sets.type.residential': { en: 'Residential', es: 'Residencial' },
  'sets.type.commercial': { en: 'Commercial', es: 'Comercial' },
  'sets.type.hospitality': { en: 'Hospitality', es: 'Hospitalidad' },
  'sets.type.wellness': { en: 'Wellness', es: 'Bienestar' },
  'sets.type.lighting-product': { en: 'Lighting', es: 'Iluminación' },

  // Empty state
  'sets.emptyTitle': { en: 'This link has no projects', es: 'Este enlace no tiene proyectos' },
  'sets.emptyDesc': {
    en: 'An example set is built by the studio and shared as a link. Ask us for a new link, or see the studio site.',
    es: 'El estudio arma cada set de ejemplos y lo comparte como un enlace. Pídenos un enlace nuevo o visita el sitio del estudio.',
  },
  'sets.emptyAction': { en: 'Open the studio site', es: 'Abrir el sitio del estudio' },
  'sets.loading': { en: 'Loading the projects…', es: 'Cargando los proyectos…' },

  // Footer
  'sets.footStudio': { en: 'Aluzina — interior design and emotional lighting, Medellín', es: 'Aluzina — interiorismo e iluminación emocional, Medellín' },
  'sets.footSite': { en: 'aluzinaa.com', es: 'aluzinaa.com' },
  'sets.footSiteAria': { en: 'Open aluzinaa.com in a new tab', es: 'Abrir aluzinaa.com en una pestaña nueva' },
  'sets.footNote': { en: 'Prepared by the studio for this conversation.', es: 'Preparado por el estudio para esta conversación.' },
};
