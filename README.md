# Brightside
Brightside is a public [distributed ledger](https://en.wikipedia.org/wiki/Distributed_ledger) secured by a social graph of face-to-face connections instead of a blockchain (proof-of-work or proof-of-stake).

## Unique Identity of Users is Fundamental
As a side-effect of its security model, Brightside maintains in its ledger a set of public keys representing unique individuals.  Applications built on Brightside have access to this set.  This makes Brightside a good fit for applications where each user represents a unique person--such as certain kinds of social networks, self-sovereign identity, credit management, property registries, universal basic income distribution, and voting systems.

## Appropriate Scale
Applications built on Brightside have their own ledger space, visible (raw or encrypted), but not alterable by other applications.  Each application is a [replicated state machine](https://en.wikipedia.org/wiki/State_machine_replication) operating within its own ledger space.  Brightside nodes can run any combination of applications, allowing for application networks of different sizes.  This allows applications to achieve (but not exceed) the scale they need.  Applications can be written in any language, connecting to the ledger through a local API.

---
### Architecture
We're still making architectural decisions.  [See Architecture](ARCHITECTURE.md).

If you're interested in contributing to the architecture, please [start a new Issue](https://github.com/adamstallard/brightside/issues) and we'll add you to the conversation.
