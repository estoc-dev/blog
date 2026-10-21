---
title: 從離線優先出發，設計網絡上的交互
description: 身份、物件、簽名、授權、信箱與 bundle：如果交互要在沒有網絡時也成立，每一塊該怎麼設計。
date: 2026-10-20
---

說一個 app「離線優先」，通常是指它沒有網絡也能打開、能編輯，連上了再同步。我們想把這個要求推到人與人之間：證明我是誰、簽一份合約、讓另一把鑰匙代我登入、交換名片，這些事在沒有網絡的時候也要成立。網絡只負責把東西搬過去，搬得慢、搬丟了、搬了兩次，都不改變事情本身。

從這個角度出發，下面是目前定下來的幾塊。有的已經寫成程式碼，有的還是計劃。

## 身份：一個接口，三種實現

從別人的角度看，一個身份就是一個能簽名的東西。所以我們不先規定它是哪種鑰匙，只規定它要做到的兩件事：

```ts
interface Signer {
  readonly identity: Identity
  sign(digest: Uint8Array): Promise<Uint8Array>
}

function verify(identity: Identity, digest: Uint8Array, signature: Uint8Array): boolean
```

- `sign` 在持有者那邊，替一份物件的 hash 簽名。它是非同步的，因為簽名的可能是記憶體裏的一把鑰匙，也可能是一個要人按一下才簽的錢包。
- `verify` 在任何人那邊：有身份、hash 和簽名就能驗，不連網，也不問任何伺服器。

實現得了這兩件事的，都可以是身份。第一版支援三種：普通的 Ed25519 鑰匙、以太坊錢包的 `personal_sign`，以及 Solana 的 off-chain message。三者把要簽的內容包成不同的格式，但都能替一段文字簽名，也都能只憑公鑰在本地驗。

身份的物件形狀：

```
Identity  {"publicKey": "<hex>", "scheme": "ed25519" | "eip191" | "solana-offchain"}
```

## 物件：資料帶着解讀它的方法

我們把資料組織成 JSON 物件。但只有資料還不夠：收到的人不知道它是什麼，也就不知道該怎麼用。所以一份物件必須帶着解讀它的方法，這個方法就是一份 JSON Schema：

```
Object  {"data": <任何 JSON 值>, "schema": "sha256:<schema 的連結>"}
```

schema 是內容定址的：它的連結就是內容的 SHA-256，改了一個字就是另一個連結。所以 schema 可以看作這份物件的類型，而且這個類型不會在用的人不知情時變掉。用的人只處理自己認得的類型：一個應用遇到不認得的 schema，就知道這份物件不是給它的，也不會錯當成自己的。

物件本身也按內容得到連結。一個身份簽一份物件，簽的就是這個連結：

```
Signature  {"identity": <Identity>, "object": "sha256:<物件的連結>", "signature": "<hex>"}
```

## 授權與代理：root 收起來，日用的鑰匙代它行事

私鑰如果丟了，身份就徹底失去了。所以我們設想 root 身份應該被硬件保護起來，例如放在硬件錢包裏。然而硬件錢包如果整天拿出來用，洩露的風險就會增加，也很麻煩。所以日用的鑰匙應該是另一把：它得到 root 的授權，root 不在也能代為行事。

要授權的時候，root 簽一份 Authorization，寫明代理人（agent）是誰，也可以寫一個到期時間。

```
Authorization  {"agent": <Identity>, "until"?: <時間>}
```

代理人要簽名的時候，不直接簽目標物件，而是簽一份 Proxy：`target` 指向要簽的物件，`chain` 引用 root 簽過的那份 Authorization。讀的人順着連結，就能讀出 root 站在這份物件後面，經手的是哪把日用的鑰匙。

```
Proxy  {"target": <物件的連結>, "chain": [<授權簽名的連結>, …]}
```

## 信箱：拿到就能寄

我們設想一份物件代表着一種能力。從一個用戶的角度看，拿到另一個人的 Identity，他就能驗證這個人的簽名。同樣地，要給一個人發消息，應該是拿到一份 Mailbox 物件。所以 Mailbox 本身就蘊含了發送的方法，它的接口是一個帶 `send` 的物件：

```ts
interface Mailbox {
  send(message: Message): Promise<void>
}
```

那一個信箱物件要有什麼？首先要有一把公鑰，用來做端對端加密，信只有收件人解得開。然後要有聯繫對方的方式，例如 HTTP POST 到某個地址、經一個 mediator 轉交，甚至可以是 email 或 iroh。每種方式是一種 schema，寄信的一方認得哪幾種，就能寄給哪幾種信箱。

```
Mailbox  {"key": <x25519 公鑰>, <聯繫方式的欄位>…}
```

## Bundle：物件連同它依賴的 blobs

再來考慮物件要怎麼在網上傳輸。物件會用 sha256 引用別的物件，所以一份物件應該伴隨它依賴的 blobs 一起走。於是就有了這個結構：

```
index.json          這份物件本身
blobs/sha256/<hex>  它依賴的 blob，檔名就是內容的 SHA-256
```

每份物件都可以是一個帶 `index.json` 的文件夾，要傳輸時打成一包。

將來人和人建立關係的時候，會導入一個文件，裏面是這段關係相關的各種能力物件，例如對方簽過的 Mailbox。這個文件可以經 NFC、AirDrop 這類方式離線傳輸。

*To be continued*
