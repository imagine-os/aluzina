# vendor/

Same-origin copies of what the Claude Design runtime (`../support.js`) used to fetch from CDNs at page load (decision D-008), so the prototype has no network dependency beyond this site.

| File | Origin | Check |
| --- | --- | --- |
| `react.production.min.js` | https://unpkg.com/react@18.3.1/umd/react.production.min.js | sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z (matches the SRI pinned in support.js) |
| `react-dom.production.min.js` | https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1 |
| `babel.min.js` | https://unpkg.com/@babel/standalone@7.29.0/babel.min.js | sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y |
| `fonts/instrument-plex-a.css` | Google Fonts css2: Instrument Sans (ital,wght 400..700) + Instrument Serif (ital 0;1) + IBM Plex Mono (400;500), fetched 2026-09-20 with a woff2-capable UA; `url()`s rewritten to `files/` | used by ALUZINA Business OS, ALUZINA Home |
| `fonts/instrument-plex-b.css` | Google Fonts css2: Instrument Serif + Instrument Sans (400;500;600) + IBM Plex Mono (400;500) | used by Cyber Bridge, Cyber Bridge Deck, Image Generation Plan, LOD Ladder |
| `fonts/files/*.woff2` | fonts.gstatic.com, 18 files (Instrument Sans v6, Instrument Serif v6, IBM Plex Mono v20), OFL-licensed | |

`support.js` loads the three scripts from here (search for `[aluzina]` in it); each page's `<helmet>` links the CSS from here. Re-exporting from Claude Design overwrites both; re-apply the edits described in `docs/reference/business-os-export.md` section 3.
