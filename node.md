# Running A Node
## Overview
Any verified unique user can run a Brightside node, but this isn't required to use the Brightside network or the interaction client.

A network of nodes forms the decentralized core of the uniqueness verification service. The nodes reach a consensus about changes to the social graph and store a copy of the complete graph. They run software that can detect the presence of sybils based on social graph analysis.
## Node Software
### Interaction Recorder
Nodes receive client requests to record signed interactions. Signed interactions include the public keys of the two people involved, and a dated proof of interaction signed by their private keys. Nodes forward these requests to other nodes for consensus.
### Consensus
Nodes reach a consensus about signed interactions. Once it's clear that all nodes will accept a signed interaction, it's added to the social graph.
### Uniqueness Verification Service
Nodes respond to requests about the verification status of a public key.
#### Direct Network
A node can choose to respond to a direct network request about a public key.
#### Blockchain Push Requests
A request can be placed on a public blockchain for the node to read, along with an optional payment. The node can then post the response. Brightside node software comes with the ability to support different blockchains.
### Sybil Detection
Nodes run [SybilInfer](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.149.6318), [SybilDefender](https://pdfs.semanticscholar.org/7606/64eab41125b06692a95832961bc5473d2aae.pdf) and/or other systems designed to detect sybils. They publish information about possible sybils so that applications can alert their users. Users can revoke their connections to a sybil account which can in turn revoke its verification status.
