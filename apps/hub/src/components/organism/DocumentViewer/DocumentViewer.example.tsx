import { useState } from 'react';
import type { DocumentViewerLabels } from './DocumentViewer';
import { DocumentViewer } from './DocumentViewer';

const labels: DocumentViewerLabels = {
  fallback: 'This file cannot be shown here.',
  download: 'Download',
  openSource: 'Open at source',
  page: (n, total) => `Page ${n} of ${total}`,
  prev: 'Previous page',
  next: 'Next page',
  thumbnails: 'Pages',
};

export default function DocumentViewerExample() {
  const [page, setPage] = useState(1);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
      <DocumentViewer
        page={page}
        onPage={setPage}
        labels={labels}
        asset={{
          title: 'Portfolio (page renders, controlled page)',
          titleEs: 'Portafolio',
          url: './brand/aluzina-portfolio.pdf',
          sourceUrl: null,
          mimeType: 'application/pdf',
          pageCount: 3,
          thumbnailUrl: null,
          previewUrls: ['./thumbs/G-08.jpg', './thumbs/P-01.jpg', './thumbs/K-01.jpg'],
          fileType: 'pdf',
        }}
      />
      <DocumentViewer
        labels={{ ...labels, fileType: 'CAD drawing' }}
        asset={{ title: 'planta-general.dwg', titleEs: null, url: null, sourceUrl: 'https://www.dropbox.com/', mimeType: 'image/vnd.dwg', pageCount: null, thumbnailUrl: null, previewUrls: [], fileType: 'cad' }}
      />
    </div>
  );
}
