# Whatsapp Multi Session

Connecting Your app with Whatsapp Messaging

Lightweight library for whatsapp. Not require Selenium or any other browser.

Stand above [Baileys](https://github.com/adiwajshing/Baileys) Library.

## Installation

Install package using npm

```
  npm install wa-multi-session
```

Then import your code

Using JS Module

```ts
import whatsapp from "wa-multi-session";
```

or using CommonJS

```ts
const whatsapp = require("wa-multi-session");
```

## Session Usage/Examples

Start New Session

```ts
// create session with ID : mysessionid

const session = await whatsapp.startWhatsapp("mysessionid");
// Then, scan QR on terminal
```

Get All Session ID

```ts
const sessions = whatsapp.getAllSession();
// returning all session name that has been created
```

Get Session Data By ID

```ts
const session = whatsapp.getSession("mysessionid");
// returning session data
```

## Messaging Usage/Examples

Send Text Message

```ts
await whatsapp.sendTextMessage({
    session: session // session data,
    phoneNumber: "6281234567890",
    message: "Hi There, This is Message from Server!",
});
```

## Authors

- [@mimamch](https://www.github.com/mimamch)

## Feedback or Support

If you have any feedback or support, please reach out to me at mimamch28@gmail.com
