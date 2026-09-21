# 0008 - Social scraping: Instagram intake for aluzina.espacios

- source: Slack #social-scraping (public channel, workspace Aluzina; new channel, first thread)
- date: 2026-09-21 03:20 UTC (22:20 local, 2026-09-20); mention at 03:59 UTC
- requester: Justin Massion
- context: this is the `social-scraping` intake the Spaces seed (Brand Memory > `social-scraping`, draft post "... intake (pending instructions)") and the kanban card "Archive intake" were waiting for (prompt 0005 follow-up, D-027, D-030); the sibling website intake from #website-scraping is prompt 0007 / changelog 0011. The first token of the first message was a link to https://www.instagram.com/aluzina.espacios/.

## Prompt (verbatim)

```
instagram.com/aluzina.espacios scrape everything and save to memory and the system of past reference material and more
```

Mention at 03:59 UTC (mention token stripped):

```
Check the instructions above and get started
```

## Response

Reply posted to the Slack thread (verbatim):

> Instagram blocked every anonymous route from here, so I have nothing from the profile yet. The bigger problem is that instagram.com/aluzina.espacios looks like it doesn't exist: Instagram serves its "page not found" shell for it, no search engine has it indexed, and aluzinaa.com links its Instagram buttons to instagram.com/aluzinaa (about 450 posts and 21K followers per search snippets). I'm logging this pass to the repo and will retry against @aluzinaa when the rate limit lifts unless you say otherwise. Model for this pass: Fable 5.1.
>
> **Which account is it: @aluzinaa, or does aluzina.espacios exist under another spelling or as a private account?**
>
> **Can you upload Instagram's own data export to this thread (Accounts Center, Download your information, JSON)? It has every post, caption, date and media file, and I'll ingest it from here.**

## Outcome

The public, unauthenticated capture was blocked (Instagram 400 / 401 on its web API, 429 + login redirect for every browser-like fetch, all public mirrors challenged or blocked) and the handle question is open: `aluzina.espacios` resolves to Instagram's 404 shell while the company website links `@aluzinaa`. Nothing from the profile was saved; the evidence and the website snapshot are in `docs/source/social/instagram/2026-09-21-aluzina.espacios/`. See changelog 0012, D-032 and `docs/knowledge/social-channels.md`.
