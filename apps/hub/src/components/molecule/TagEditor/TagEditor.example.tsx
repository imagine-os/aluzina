import { useState } from 'react';
import { TagEditor } from './TagEditor';

const SUGGESTIONS = ['archivo', 'dropbox', 'residencial', 'comercial', 'hospitalidad', 'bienestar', 'iluminación', 'planos', 'render', 'cotización', 'confidencial'];

export default function TagEditorExample() {
  const [tags, setTags] = useState(['archivo', 'planos']);
  const [few, setFew] = useState(['render']);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-5)', maxWidth: '32rem' }}>
      <TagEditor
        value={tags}
        onChange={setTags}
        suggestions={SUGGESTIONS}
        label="Tags"
        placeholder="Type a tag and press Enter"
        addLabel="Add"
        removeLabel={(tag) => `Remove the tag ${tag}`}
        hint="Free text, lower-cased. Arrow keys walk the suggestions."
        countLabel={(n) => `${n} tags`}
      />
      <TagEditor
        value={few}
        onChange={setFew}
        suggestions={SUGGESTIONS}
        label="Tags (max 3)"
        addLabel="Add"
        removeLabel={(tag) => `Remove the tag ${tag}`}
        max={3}
        hint="Locks at three tags."
        countLabel={(n) => `${n} of 3`}
      />
      <TagEditor value={['solo lectura']} onChange={() => undefined} suggestions={SUGGESTIONS} label="Tags (disabled)" addLabel="Add" removeLabel={(tag) => `Remove the tag ${tag}`} disabled countLabel={(n) => `${n} tag`} />
    </div>
  );
}
