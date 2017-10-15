# Brightside <img width="330px" src="images/brightside.svg"/>
Brightside is a public [distributed ledger](https://en.wikipedia.org/wiki/Distributed_ledger) secured by a social graph instead of a blockchain (proof-of-work or proof-of-stake).

### Unique Identity of Users is Fundamental
As a side-effect of its security model, Brightside maintains in its ledger a set of public keys representing unique individuals.  Applications built on Brightside have access to this set.  This makes Brightside a good fit for applications where each account represents a unique person--such as self-sovereign identity, self-managed medical and credit histories, universal basic income distribution, charities, and voting systems.

### Appropriate Scale
Applications built on Brightside have their own ledger space, visible (raw or encrypted), but not alterable by other applications.  Each application is a [replicated state machine](https://en.wikipedia.org/wiki/State_machine_replication) operating within its own ledger space.  Brightside nodes can run any combination of applications, allowing application networks of different sizes.  This allows applications to achieve (but not exceed) the scale they need.  Applications can be written in any language, connecting to the ledger through a local API.

## Operational Overview
A social graph of connected users is central to both the security and the operation of Brightside.

When a new user joins, they must find a real-world contact who's running a node.
<div><img height="300px" src="images/init.svg"/></div>

From there, they can expand their network by adding real-world connections
<div><img height="300px" src="images/network-growth.svg"/></div>

### Security
Once a user has enough face-to-face connections to already *verified* users, they're added to the set of verified users.

Non-verified users can still use the network, but some applications may exclude them from certain benefits such as receiving a basic income.

After a waiting period, verified users can run a node. Each node adds to the overall security of the system.

Brightside nodes analyze the network to protect against sybil (fake, duplicate) accounts.

[Read more about security](security.md).

### Running a node
Any verified user can run a node.  They should have a computer that can stay connected to the internet.  The software is installed using a simple installer.  Network and hardware requirements are typical of those of a home computer.

Running a node is very valuable because it allows more users to join the network; a new user must already know someone who's running a node.  They also aid in the graph analysis used to detect sybil accounts.

Nodes communicate with other nodes, store the social graph information, and receive updates to the graph (signed attestations of face-to-face connections) from clients.
<div><img height="300px" src="images/many-nodes.svg"/></div>

Each node can run a different set of application modules.  For instance, Node A could run a voting module and an id service, while Nodes B and C could support a universal basic income currency ledger.

---
### Architecture
Consensus between nodes is mediated by [SCP (Stellar Consensus Protocol)](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwij5cvx4LbWAhWi5lQKHXGpCoAQFggtMAA&url=https%3A%2F%2Fwww.stellar.org%2Fpapers%2Fstellar-consensus-protocol.pdf&usg=AFQjCNFDrsjJtP5IbB05TRfIQqARqDCr-A).  Other pieces of [stellar-core](https://github.com/stellar/stellar-core) are being considered for inclusion.

## Contributing

Help us [make architectural decisions](architecture.md).

If you're interested in contributing, please [start a new Issue](https://github.com/adamstallard/brightside/issues) and we'll add you to the conversation.
