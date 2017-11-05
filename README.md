# Brightside <img width="330px" src="images/brightside.svg"/>
<sup>[💬 Join the conversation at decstack](http://tinyurl.com/decstack-projects-invite) channel: brightside-f2f</sup>

Brightside is a decentralized service that allows applications to verify that users are unique individuals.

This is important to a variety of applications, including basic income, voting, membership, records and credential management, and charities.

## Components
### Interaction Client
The Brightside interaction client runs on mobile devices and records face-to-face interactions. These interactions form the basis for establishing someone's uniqueness.

Individuals use the interaction client to grant third-party applications the right to verify their uniqueness.

[Read more about the Interaction client in the wiki](https://github.com/adamstallard/brightside/wiki/Interaction-Client)
### Interaction API
Third-party applications interface with the Brightside interaction client running on the same device to retrieve a public key associated with the user.
### Uniqueness Verification Service
An application pushes a public key obtained through the interaction API to one or more Brightside nodes, which then perform a verification check and publish the result.

## How it Works
Brightside nodes store pairs of interactions, forming a social graph. By analyzing this graph, a node is able to determine whether or not a person can be verified as unique. When another application, such as a Basic Income application wants to know whether a user is a unique individual in their system, they push a request to a Brightside node. There are several methods available to nodes to handle these requests. Brightside nodes protect systems against fake or duplicate accounts, known as _sybils_. Node operators may earn money for their services.

## Read More
* [Running a Node](node.md)
* [Security](security.md)
* Consensus is mediated by [SCP (Stellar Consensus Protocol)](https://www.stellar.org/blog/stellar-consensus-protocol-proof-code/)

---
## Contribute

Check out our [open projects](https://github.com/adamstallard/brightside/projects).  Or [start a new Issue](https://github.com/adamstallard/brightside/issues) and we'll add you to the conversation.

## Discuss

Discuss on [Decstack](http://decstack.com/)--Join the conversation at http://tinyurl.com/decstack-projects-invite, channel: https://hub.decstack.com/projects/channels/brightside-f2f.
