// http-server.mjs
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

function buildServer() {
  const s = new McpServer({ name: "demo-http", version: "1.0.0" });
  s.registerTool(
    "add",
    { title: "Add", description: "Add two numbers", inputSchema: { a: z.number(), b: z.number() } },
    async ({ a, b }) => ({ content: [{ type: "text", text: String(a + b) }] })
  );
  return s;
}

const app = express();

// only this route; no global parser
app.post("/mcp", express.json({ limit: "5mb" }), async (req, res) => {
  try {
    const t = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    const srv = buildServer();
    res.on("close", () => { t.close(); srv.close(); });
    await srv.connect(t);
    await t.handleRequest(req, res, req.body);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).send("server error");
  }
});

// simple GET health
app.get("/mcp", (_req, res) => res.status(200).send("ok"));

app.listen(3000, () => console.log("MCP HTTP on :3000"));
