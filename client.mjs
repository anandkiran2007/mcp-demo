import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({ command: "node", args: ["server.mjs"] });
const client = new Client({ name: "demo-client", version: "1.0.0" });
await client.connect(transport);

const tools = await client.listTools();
console.log("TOOLS:", tools.tools.map(t => t.name));

const r1 = await client.callTool({ name: "echo", arguments: { text: "hello" } });
console.log("ECHO:", r1.content?.[0]?.text);

const r2 = await client.callTool({ name: "add", arguments: { a: 2, b: 5 } });
console.log("ADD:", r2.content?.[0]?.text);

process.exit(0);
