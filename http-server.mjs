// http-server.mjs
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

function buildServer() {
  const s = new McpServer({ name: "demo-http", version: "1.0.0" });
  s.registerTool(
    "add",
    {
      title: "Add",
      description: "Add two numbers",
      inputSchema: { a: z.number(), b: z.number() }
    },
    async ({ a, b }) => ({ content: [{ type: "text", text: String(a + b) }] })
  );
  return s;
}

const app = express();

// Parse JSON for MCP. Do not add other parsers before this route.
app.use(express.json());

app.post("/mcp", async (req, res) => {
  try {
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({
      // stateless mode
      sessionIdGenerator: undefined
    });
    // close on client disconnect
    res.on("close", () => {
      transport.close();
      server.close();
    });

    await server.connect(transport);
    // pass the parsed JSON body
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null
      });
    }
  }
});

app.listen(3000, () => console.log("MCP HTTP on :3000"));
