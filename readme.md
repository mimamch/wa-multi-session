# Whatsapp Multi Session - Connecting More Whatsapp Session in 1 App

Connecting Your app with Whatsapp Messaging

Lightweight library for whatsapp. Not require Selenium or any other browser.

Stand above [Baileys](https://github.com/WhiskeySockets/Baileys) Library.

## Installation

Install package using npm

```bash
npm install wa-multi-session@latest
```

Then import your code

Using JS Module

```ts
import { Whatsapp, SQLiteAdapter } from "wa-multi-session";
```

or using CommonJS

```ts
const { Whatsapp, SQLiteAdapter } = require("wa-multi-session");
```

## Initialization

Create new Whatsapp Instance

```ts
const whatsapp = new Whatsapp({
  adapter: new SQLiteAdapter(),

  // Optional: Add Listener/Callback
  onConnecting: (sessionId) => {
    console.log(`[${sessionId}] Connecting...`);
  },
  onConnected: (sessionId) => {
    console.log(`[${sessionId}] Connected`);
  },
  onDisconnected: (sessionId) => {
    console.log(`[${sessionId}] Disconnected`);
  },
});
```

## Session Usage/Examples

Start New Session

```ts
// create session with ID : session1

const session = await whatsapp.startSession("session1");
// Then, scan QR on terminal
```

Get All Session ID

```ts
const sessions = await whatsapp.getSessionsIds();
// returning all session ID that has been created
```

Get Session Data By ID

```ts
const session = await whatsapp.getSessionById("session1");
// returning session data
```

## Messaging Usage/Examples

Send Text Message

```ts
await whatsapp.sendText({
  sessionId: "session1", // session ID
  to: "6281234567890",
  text: "Hi There, This is Message from Server!",
});
```

Send Image

```ts
const image = fs.readFileSync("./myimage.png"); // Buffer
const send = await whatsapp.sendImage({
  sessionId: "session1",
  to: "6281234567890",
  text: "My Image Caption",
  media: image, // can from URL too
});
```

Send Video

```ts
const video = fs.readFileSync("./myvideo.mp4"); // Buffer
const send = await whatsapp.sendVideo({
  sessionId: "session1",
  to: "6281234567890",
  text: "My Video Caption",
  media: video, // can from URL too
});
```

Send Document File

```ts
const filename = "mydocument.docx";
const document = fs.readFileSync(filename); // Buffer
const send = await whatsapp.sendDocument({
  sessionId: "session1",
  to: "6281234567890",
  filename: filename,
  media: document,
  text: "Hei, Check this Document",
});
```

Send Voice Note

```ts
const filename = "myaudio.mp3";
const audio = fs.readFileSync(filename); // Buffer
const send = await whatsapp.sendAudio({
  sessionId: "session1",
  to: "6281234567890",
  media: audio,
  asVoiceNote: true, // send as voice note (ptt)
});
```

Read a Message

```ts
await whatsapp.readMessage({
  sessionId: "session1",
  key: msg.key,
});
```

Send Typing Effect

```ts
await whatsapp.sendTypingIndicator({
  sessionId: "session1",
  to: "6281234567890",
  duration: 3000,
});
```

Send Poll

```ts
await whatsapp.sendPoll({
  sessionId: "session1",
  to: "6281234567890",
  poll: {
    name: "Your favorite programming language?",
    values: ["JavaScript", "Python", "Go", "Rust"],
    selectableCount: 1, // number of values can be selected
  },
});
```

## Handling Incoming Message Examples

```ts
const whatsapp = new Whatsapp({
  adapter: new SQLiteAdapter(),
  onMessageReceived: async (msg) => {
    if (msg.key.fromMe || msg.key.remoteJid?.includes("status")) return;
    const sender = msg.key.participant || msg.key.remoteJid!;
    await whatsapp.readMessage({
      sessionId: msg.sessionId,
      key: msg.key,
    });
    await whatsapp.sendTypingIndicator({
      sessionId: msg.sessionId,
      to: sender,
      duration: 3000,
    });
    await whatsapp.sendText({
      sessionId: msg.sessionId,
      to: sender,
      text: `You said: ${msg.message?.conversation || ""}`,
      answering: msg, // for quoting message
    });
  },
});
```

## Save Media Message (Image, Video, Document)

```ts
const whatsapp = new Whatsapp({
  adapter: new SQLiteAdapter(),
  onMessageReceived: async (msg) => {
    if (msg.message?.imageMessage) {
      // save image
      msg.saveImage("./myimage.jpg");
    }

    if (msg.message?.videoMessage) {
      // save video
      msg.saveVideo("./myvideo.mp4");
    }

    if (msg.message?.documentMessage) {
      // save document
      msg.saveDocument("./mydocument"); // without extension
    }
  },
});
```

## Optional Configuration Usage/Examples

Set custom credentials directory

```ts
// use adapter to set custom directory
const adapter = new SQLiteAdapter({
  databasePath: "my_custom_dir/database.db",
});
```

## Also Visit Headless Whatsapp Gateway API

- [wa-gateway](https://www.github.com/mimamch/wa-gateway)

## Authors

- [@mimamch](https://www.github.com/mimamch)

## Feedback or Support

If you have any feedback or support, please reach out to me at mimamch28@gmail.com
