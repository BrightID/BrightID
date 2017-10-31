# Brightside <img width="330px" src="images/brightside.svg"/>
Brightside is a decentralized service that allows applications to verify that users are unique individuals.

This is important to a variety of applications, including basic income, voting, membership, records and credential management, and charities.

## Components
### Interaction Client
The Brightside interaction client runs on mobile devices and records face-to-face interactions. These interactions form the basis for establishing someone's uniqueness.

Individuals use the interaction client to grant third-party applications the right to verify their uniqueness.
### Interaction API
Third-party applications interface with the Brightside interaction client running on the same device to retrieve a public key associated with the user.
### Uniqueness Lookup Service
An application pushes a public key obtained through the interaction API to one or more Brightside nodes, which then perform a verification check and publish the result.
