# Brightside <img width="330px" src="images/brightside.svg"/>
Brightside is a decentralized service that allows applications to verify that users are unique individuals.

This is important to a variety of applications, including basic income, voting, membership, records and credential management, and charities.

## Components
### Interaction Client
The Brightside interaction client runs on mobile devices and records face-to-face interactions. These interactions form the basis for establishing someone's uniqueness.

Individuals use the interaction client to grant third-party applications the right to verify their uniqueness.
### Interaction API
Third-party applications interface with the Brightside interaction client running on the same device to retrieve a public key associated with the user.
### Uniqueness Verification Service
An application pushes a public key obtained through the interaction API to one or more Brightside nodes, which then perform a verification check and publish the result.

## How it Works
When two people record an interaction, they each check the interaction client on their device to see whether they've previously interacted, and if not, record the other person's name. The interaction client signs this event with each person's private key and sends it to a Brightside node to be recorded. Names are stored locally and public keys and signed interactions are sent to Brightside nodes.

Brightside nodes store pairs of interactions, forming a social graph. By analyzing this graph, a node is able to determine whether or not a person can be verified as unique. When another application, such as a Basic Income application wants to know whether a user is a unique individual in their system, they push a request to a Brightside node. There are several methods available to nodes to handle these requests. Brightside nodes protect systems against sybils (fake or duplicate accounts). (see [Running a Node](node.md))

## Read More
* [Security](security.md)
* [Running/Monetizing a Node](node.md)
* Consensus is mediated by [SCP (Stellar Consensus Protocol)](https://www.stellar.org/blog/stellar-consensus-protocol-proof-code/)

---
## Contribute

If you're interested in contributing, please [start a new Issue](https://github.com/adamstallard/brightside/issues) and we'll add you to the conversation.
