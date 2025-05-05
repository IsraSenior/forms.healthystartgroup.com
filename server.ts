// server.ts
import { createServer } from "node:http";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp, toNodeListener } from "#imports";

// Create Nuxt app
const app = await createApp();

// Create server
const server = createServer(toNodeListener(app));

// Start listening
server.listen(3000, () => {
  console.log("Nuxt 3 running on Deno at http://localhost:3000");
});