// server.mjs
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";

const server = new McpServer({ name: "demo-server", version: "1.0.0" });

// echo
server.registerTool(
  "echo",
  { title: "Echo", description: "Return input text", inputSchema: { text: z.string() } },
  async ({ text }) => ({ content: [{ type: "text", text }] })
);

// add
server.registerTool(
  "add",
  { title: "Add", description: "Add two numbers", inputSchema: { a: z.number(), b: z.number() } },
  async ({ a, b }) => ({ content: [{ type: "text", text: String(a + b) }] })
);

// write_file
server.registerTool(
  "write_file",
  {
    title: "Write file",
    description: "Write UTF-8 text to a path",
    inputSchema: { path: z.string(), text: z.string() }
  },
  async ({ path, text }) => {
    await fs.writeFile(path, text, "utf8");
    return { content: [{ type: "text", text: `ok:${path}` }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

