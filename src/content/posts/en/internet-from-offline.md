---
title: Imagining the internet from offline
description: "Taking cryptographic identity as the starting point, we imagine the internet from its smallest building blocks: identity, objects, authorization, mailboxes and bundles."
date: 2026-10-20
---

Most of our online identities today depend on platforms, and they are not really ours. The only identity that does not depend on a platform is a cryptographic one: it can be generated offline, and it is a secret that belongs to you alone.

Our goal is to take cryptographic identity as a given and ask what kind of internet would suit it best. Our approach is to find the smallest building blocks first, then add to them bit by bit.

The first building block to think about is identity, and what properties it has.

## Identity: proving you are you

From anyone else's point of view, an identity is something that can sign. So instead of deciding up front what kind of key it is, we only specify the two things it has to do:

```ts
interface Signer {
  readonly identity: Identity
  sign(digest: Uint8Array): Promise<Uint8Array>
}

function verify(identity: Identity, digest: Uint8Array, signature: Uint8Array): boolean
```

- `sign` lives with the holder and signs the hash of an object.
- `verify` is for anyone: with the identity, the hash and the signature, you can verify without going online or asking any server.

Anything that can do these two things can be an identity. The first version supports three kinds: a plain Ed25519 key, an Ethereum wallet's `personal_sign`, and Solana's off-chain message. Each wraps the content to be signed in its own format, but all of them can sign a piece of text, and all of them can be verified locally from the public key alone.

The shape of an identity as an object:

```
Identity  {"publicKey": "<hex>", "scheme": "ed25519" | "eip191" | "solana-offchain"}
```

## Objects: data that carries how to read it

We organize data as JSON objects. But data alone is not enough: whoever receives it cannot tell what it is, and so cannot tell how to use it. An object therefore has to carry the way to read it, and that way is a JSON Schema:

```
Object  {"data": <any JSON value>, "schema": "sha256:<link to the schema>"}
```

The schema is content-addressed: its link is the SHA-256 of its content, so changing a single character gives a different link. That lets the schema serve as the object's type, and the type cannot change behind its users' backs. Users handle only the types they recognize: when an app meets a schema it does not know, it can tell the object is not meant for it, and it will not mistake the object for one of its own.

An object also gets a link from its content. When an identity signs an object, this link is what it signs:

```
Signature  {"identity": <Identity>, "object": "sha256:<link to the object>", "signature": "<hex>"}
```

## Authorization and proxies: root stays locked away, a daily key acts for it

If the private key is lost, the identity is gone for good. So we expect the root identity to be protected by hardware, for example kept in a hardware wallet. But taking a hardware wallet out all day raises the risk of a leak, and it is a hassle. So the key for daily use should be a different one: authorized by root, it can act on root's behalf while root stays away.

To grant authorization, root signs an Authorization that names the agent, optionally with an expiry time.

```
Authorization  {"agent": <Identity>, "until"?: <time>}
```

When the agent signs, it does not sign the target object directly. It signs a Proxy instead: `target` points to the object being signed, and `chain` references the Authorization that root signed. A reader who follows the links can see that root stands behind the object, and which daily key handled it.

```
Proxy  {"target": <link to an object>, "chain": [<link to an authorization signature>, …]}
```

## Mailboxes: hold one and you can send

We think of an object as standing for a capability. From a user's point of view, holding someone's Identity lets them verify that person's signatures. In the same way, to send someone a message, you should hold a Mailbox object. So a Mailbox itself carries the way to send, and its interface is an object with `send`:

```ts
interface Mailbox {
  send(message: Message): Promise<void>
}
```

So what does a mailbox object need? First, a public key for end-to-end encryption, so that only the recipient can read the message. Then, ways to reach the recipient: an HTTP POST to some address, a handoff through a mediator, or even email or iroh. Each way is a schema, and a sender can deliver to any mailbox that offers a way it recognizes.

```
Mailbox  {"key": <x25519 public key>, <contact method fields>…}
```

## Bundles: an object with the blobs it depends on

Next, consider how objects travel over the network. Objects refer to other objects by SHA-256, so an object should travel with the blobs it depends on. Each object can then be seen as a folder holding everything it depends on, including its own schema, which sits in the blobs too.

```
index.json          the object itself
blobs/sha256/<hex>  a blob it depends on, named by the SHA-256 of its content
```

The folder can be zipped up for transfer.

Imagine that in the future, when two people start a relationship, they pass each other an object, the way they would hand over a business card. The card object holds the other capability objects the relationship needs, such as an Identity and a Mailbox. These objects can be passed offline, in a way similar to AirDrop.

The code so far is at [estoc-dev/suite](https://github.com/estoc-dev/suite).

*To be continued*
