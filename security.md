## Goals

The security model has the following goals, in order of importance:

1. [Protect the network against disruption](#protect-against-disruption)
1. [Prevent sybils--which can make applications less effective](#prevent-sybils)
1. [Allow the network to grow](#allow-the-network-to-grow)

### Protect against disruption

Consensus among nodes is achieved with [federated byzantine agreement](https://www.stellar.org/blog/stellar-consensus-protocol-proof-code).  As such, it's subject to the limits of [byzantine fault tolerance](https://en.wikipedia.org/wiki/Byzantine_fault_tolerance).  It can tolerate up to ``n/3`` nodes behaving badly. If ``n/2`` verifiers decide to collude and run nodes, they can disrupt the network. Brightside protects against this in the following ways.

1. Encourage legitimate users to run nodes. One way to do this is to allow them to monetize the services they offer.  See [Running a Node](node.md).
1. [Prevent sybils](#prevent-sybils), thereby limiting the number of nodes attackers can use.

### Prevent sybils

Brightside prevents sybils in the following ways.

1. Require users to have to connections to ``v`` already-verified users in order to be to verified.
1. Provide each node with a built-in command that runs [SybilInfer](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.149.6318), [SybilDefender](https://pdfs.semanticscholar.org/7606/64eab41125b06692a95832961bc5473d2aae.pdf) or a similar algorithm, either manually or on a schedule.
1. Enforce a wait period for newly verified users, giving the sybil detection algorithm time to do its job.
1. Allow verifiers to revoke their verification of an already-verified user, returning them to the provisional state.  This prevents the revoked user from verifying other users, and in turn revokes their verification of other users.  This can have a cascading effect.
1. Allow apps on the system to provide additional verification checks, the results of which can be made available to other apps.

### Allow the network to grow

Every protection against disruption or sybil creation makes it more difficult for legitimate users to be verified.  Brightside has updatable security settings that allow its developers to maintain the balance between protection and growth based on observations.

#### Security schedule
Nodes agree to adopt a _security schedule_. Here's an example.

|_v_ (required verifications per user)|Nodes (_n_)| Verified users|
|---|---|---|
|0|0|0|
|1|1|2|
|2|3|4|
|3|5|7|

The schedule dictates how _v_ increases with the number of nodes and verified users.  For _v_ to increase, both _n_ and "Verified users" must reach the level indicated.

The first row (with all zeros) sets the stage for the [genesis connection](genesis.md) between the first two users.

The second row dictates that after the first two users exist, a user will need to connect to an existing verified user to be verified.
 
The progression in subsequent rows has high values of _n_ compared to _v_, reflecting the realization that if a group of colluders smaller than _v_ arises--and _n_ is also small, it can simply disrupt the network by running nodes, and preventing more sybils with a higher _v_ is useless.

The value in "Verified users" could be increased if it becomes the limiting factor (rather than _n_) due to a high percentage of users running nodes.  If _v_ grows too quickly, it makes it difficult for users to be verified.
 
##### Updating the security schedule
If nodes agree, they can update the security schedule.  They do this using the [ledger versioning](https://www.stellar.org/developers/guides/concepts/versioning.html#ledger-versioning) model from stellar-core.

#### Merging networks
It's possible for multiple Brightside networks to exist, and existing networks to merge. Signed connections from one network are added to the other and re-verified. [Read more about merging](merging.md).
