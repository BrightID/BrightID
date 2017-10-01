# Architecture

## Consensus
Consensus is achieved through the [Stellar Consensus Protocol](https://github.com/stellar/stellar-core/blob/master/src/scp/readme.md).

## Replicated State Machine
Other pieces of [stellar-core](https://github.com/stellar/stellar-core/tree/master/src) will be used to implement the replicated state machine (RSM):
* Herder (instantiating state)
* Overlay (TCP communication)
* Ledger (keep node state up-to-date, using History as needed)
* History
* Bucket (managing hashes and deltas of the state)

## Databases
One or more databases for storing the social graph, generic ledgers, hashes and deltas for quick lookup.  Open topic--suggestions?
