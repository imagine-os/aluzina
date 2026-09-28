# 0025 - What Aluzina does on computers (product-vision conversation)

- source: Slack #all-aluzina, thread started 2026-09-28 23:20 UTC (channel-level @mention)
- date: 2026-09-28
- requester: Justin Massion
- context: the repo at `bfebd66` (version 0.19.0, changelog 0031, prompt 0024, D-102). Justin said he is not ready to transfer (the tenant hand-off into the multitenant host, tp-13) yet, and opened a conversation about what Aluzina does on computers. Nature: product-vision conversation. No code change, no decision taken yet; the transfer is explicitly deferred by Justin.
- open questions to Justin: (1) routing to "new and existing people": which is the harder case, the client who has never heard of Aluzina or the contractor already on three projects; (2) money: mostly client-side (deposits, milestones, change orders), supplier-side (purchasing, margins), or one number flowing through both without being retyped; (3) whether "it is all light" is a design principle, i.e. a message, a payment and a status change are one kind of thing (an event moving through phases), arguing for a single event log under everything.

## Prompt (verbatim)

```
for aluzina i'm not ready to transfer yet. So lets talk about what Aluzina does on computers.

It essentially follows a process in phases, and uses customizable templates and procedures at every stage. And it helps humans communicate effectively. Additionally it routes communications to new and existing people incredibly well. And it handles money incredibly incredibly well. It is all light. everything is energy, matter, light.
```

## Response

Your five things map onto the Hub cleanly, but unevenly.

**Strong today: the phases.** One client journey (lead, diagnosis, brief, concept, development, validation, delivery, closure, follow-up), 15 statuses on top, and each of the five services carrying its own stages. Templates per stage are there too, straight from the playbook: the 10 intake questions, delivery contents, approval gates, the purchasing statuses.

**Middle: helping humans communicate.** Roles, presence, annotations and the EN/ES toggle exist. What's mostly not written yet is the *what to say* at each stage: the client update after concept, the "your quote is ready" note, the site report.

**Thin: routing and money.** Routing today is one field, the assigned Aluzina owner on the lead. Nothing decides who hears what when a status flips. Money is a status list (quoted, approved, paid, ordered, received, installed) with no payment record, no payment link, no margin view, all on mock data.

Two questions:

1. Routing to "new and existing people": who's the harder case, the client who has never heard of Aluzina, or the contractor already on three projects? The rules differ.
2. Money: is that mostly client-side (deposits, milestones, change orders), supplier-side (purchasing, margins), or the point that one number flows through both without being retyped?

On the light line, I read it as a design principle. A message, a payment and a status change are the same kind of thing: one event moving through phases. If so, it argues for a single event log under everything, which the multiplayer design you asked for needs anyway.

_Fable 5.1 for this reply; Sonnet 5 logging prompt and reply to the repo._

Model: Fable 5.1 (conversation and reply); Sonnet 5 (logging).
