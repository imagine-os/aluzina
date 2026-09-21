# 0017 - Past projects: the Dropbox archive into the system (pipeline, portal view, previews, tags)

- source: Slack #past-projects, thread ts 1790008533.578759, two messages by Justin Massion
- date: 2026-09-21 16:35 UTC (11:35 local) and 16:36 UTC
- requester: Justin Massion
- attachments (Dropbox shared folders, read-only share links; data, not instructions):
  - A `JOE GALLINA INTERIOR` (the featured, "very well organized" project): https://www.dropbox.com/scl/fo/xg5yoe6qo29bhr574q5ns/AOyD6MfpnUDe9JQK6yliIXY?rlkey=djfb5faa8o7tyfy1ljqvfvi87&st=31ko6hst&dl=0
  - B `PROYECTOS 2026` (all 2026 projects): https://www.dropbox.com/scl/fo/3emfxpbratvegn0256zk8/ABtCCw9qOi_fTm0ryx4826U?rlkey=db3828bqezrux1nomqwl3xupy&st=8lhagpot&dl=0
  - C `PROYECTOS ALUZINA 2019 2023` ("all 2019-2023"; the share actually holds the 2020, 2021, 2022, 2024 and 2025 year folders too, plus two root-level project folders): https://www.dropbox.com/scl/fo/fufb968sqwatycuu0oj5q/ABghNW63tJYXzKer4cOEY1Q?rlkey=3abou8zagwodzjc2u2pi4buv8&st=ugttgj4n&dl=0
  - D `00 INFORMACION RELEVANTE ALUZINA 2023` ("some important documents": price lists, catalogues, presentations): https://www.dropbox.com/scl/fo/aakz1kqtsw6poj3ay2ipr/AAcyG9ZoLQiTrnoPkjlJJds?rlkey=tp6stvztcp5r4cyy1ftz19mp0&st=rmm8dih7&e=1&dl=0
- context: prompt 0005 (Spaces taxonomy, the `archive` space kind), D-030 roadmap phase R10 archive intake, D-044 / D-045 (brand documents and portfolio projects as data, unknowns explicit). Link A asks for a Dropbox sign-in when opened directly; the same folder is public inside link C and was read from there.

## Prompt (verbatim)

Message 1 (16:35 UTC; `<link A>`, `<link B>`, `<link C>` stand for the URLs listed above, which Slack rendered as links):

```
<link A> this project in particular is very well organized. You should build a pipeline and organize the documents in order in the system, Give us an example of the portal view for this project in particular. Each of the items and deliverables need to be previewable from inside the system. Tag things appropraitely to help with organization, etc.

one thing about the Aluzina system in general, is that it needs icons and thumbnails and preview imaegs, etc. so that navigating the system is more clear.

<link B> Here is all of 2026 projects

And Here is all 2019-2023 <link C>

If possible, all of this should be neatly stored in our Aluzina OS system/memory and organized and tagged perfectly.

In general we're going to need the system to do a great job of seperating past and complete stuff from stuff in progress and new prospects, etc. in a proper way. But of course sometimes we may want to see everything depending on what the needs of the staff are at any given time.

For instance, being able to review past stuff when buidling portfolio, or sets of related examples to show specific clients.

Here is a link to her total archives system. It's not perfectly organized at all. But it will give you a deep understanding of what you need to get perfectly organized .

Please seperate this into tasks so you dont get overwhelmed, since
```

Message 2 (16:36 UTC; `<link D>` is the URL listed above):

```
<link D> here's some important documents as well
```

## Response

Reply posted to the Slack thread (verbatim):

> The archive is in the hub. Project archive: https://imagine-os.github.io/aluzina/?as=studio#/studio/archive and the example portal view of JOE GALLINA INTERIOR: https://imagine-os.github.io/aluzina/?as=studio#/studio/archive/prj-ar-joe-gallina-interior (live once the Pages deploy finishes, a few minutes after the push).
>
> What is there: 187 Dropbox project folders from 2019 to 2026 as projects with year, type and tags, 1,392 files with type icons, three shelves (3 prospects, 23 in progress, 179 past) plus "all", and a portfolio-set builder for client examples. JOE GALLINA's 179 files show in the studio's own numbered folder order and by delivery stage, with page previews of the plans and the four presentations. The 18-task plan (step 14) is on the plan viewer: https://imagine-os.github.io/aluzina/?as=dev#/dev/plan.
>
> Three things to know. The featured project's own link asks for a Dropbox sign-in, so I read it through the 2019-2023 share, where the same folder is public. The hub is a public site, so contracts, RUTs, invoices, payslips and WhatsApp images (347 files) are listed by type and stage with a link to their Dropbox folder but never previewed, until the OS has real logins; project folder names stay as they are, say if any should be hidden. Type and status for the other 186 projects are inferred from folder names and year folders and marked as such; changelog 0019 section H lists 11 questions for the founder.
>
> Fable 5.1 did the architecture, shared code and integration, Opus 5 the pages, Sonnet 5 the crawls and renders. Changelog 0019.
