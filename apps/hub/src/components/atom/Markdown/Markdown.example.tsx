import { Markdown } from './Markdown';

const SAMPLE = `# Brand voice\n\nA **warm**, *precise* voice in every deliverable. Code: \`useT()\`.\n\n- [x] Spanish first\n- [ ] English on request\n\n> If Alejandra would not say it in a meeting, it does not go.\n\n| Channel | Purpose |\n| --- | --- |\n| Instagram | process and light |\n| Website | portfolio |\n\n[Public site](https://aluzinaa.com/) and an unsafe one: [x](javascript:alert(1)).`;

export default function MarkdownExample() {
  return <Markdown source={SAMPLE} />;
}
