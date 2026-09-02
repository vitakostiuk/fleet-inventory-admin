import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const tools = [
  {
    name: "filter_devices",
    description: "Filter the device list by client, status, or location",
    input_schema: {
      type: "object",
      properties: {
        client: { type: "string", description: "Client name, or 'all'" },
        status: { type: "string", enum: ["online", "offline", "maintenance", "all"] },
      },
      required: ["status"],
    },
  },
  {
    name: "get_status_summary",
    description: "Get a count of devices grouped by status (online/offline/maintenance) for one client or across all clients",
    input_schema: {
      type: "object",
      properties: {
        client: { type: "string", description: "Client name, or 'all'" },
      },
      required: ["client"],
    },
  },
  {
    name: "get_locations_for_client",
    description: "List the physical locations a client has, with a device count per location",
    input_schema: {
      type: "object",
      properties: {
        client: { type: "string", description: "Client name, or 'all'" },
      },
      required: ["client"],
    },
  },
];

// Every function below shares the same shape: (devices, toolInput) -> plain JS data.
// Claude only ever sees the schemas above; these are what actually run.

function filterDevices(devices, { client: clientName, status }) {
  return devices.filter((device) => {
    const clientMatches = !clientName || clientName === "all" || device.client === clientName;
    const statusMatches = !status || status === "all" || device.status === status;
    return clientMatches && statusMatches;
  });
}

function getStatusSummary(devices, { client: clientName }) {
  const scoped =
    !clientName || clientName === "all" ? devices : devices.filter((d) => d.client === clientName);

  const summary = { online: 0, offline: 0, maintenance: 0 };
  for (const device of scoped) {
    summary[device.status] += 1;
  }
  return { client: clientName ?? "all", total: scoped.length, ...summary };
}

function getLocationsForClient(devices, { client: clientName }) {
  const scoped =
    !clientName || clientName === "all" ? devices : devices.filter((d) => d.client === clientName);

  const byLocation = new Map();
  for (const device of scoped) {
    if (!byLocation.has(device.location)) {
      byLocation.set(device.location, {
        location: device.location,
        city: device.city,
        state: device.state,
        deviceCount: 0,
      });
    }
    byLocation.get(device.location).deviceCount += 1;
  }
  return Array.from(byLocation.values());
}

// Runs one tool_use block and returns the raw (not-yet-stringified) result.
function runTool(block, devices) {
  if (block.name === "filter_devices") {
    return filterDevices(devices, block.input);
  }
  if (block.name === "get_status_summary") {
    return getStatusSummary(devices, block.input);
  }
  if (block.name === "get_locations_for_client") {
    return getLocationsForClient(devices, block.input);
  }
  return { error: `Unknown tool: ${block.name}` };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { question, devices } = req.body;
  if (!question || !Array.isArray(devices)) {
    return res.status(400).json({ error: "Expected { question: string, devices: Device[] }" });
  }

  const messages = [{ role: "user", content: question }];
  // Log of every tool call made during the loop, returned alongside the
  // answer so the UI can show *how* the model got there, not just the result.
  const toolCalls = [];

  try {
    let response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      tools,
      messages,
    });

    // Agentic loop: keep going as long as Claude asks to call a tool.
    // Each iteration = one round trip to the API.
    while (response.stop_reason === "tool_use") {
      // Claude's turn (its text so far + the tool_use block(s)) must go back
      // into the transcript verbatim, or the next request loses context.
      messages.push({ role: "assistant", content: response.content });

      const toolResults = response.content
        .filter((block) => block.type === "tool_use")
        .map((block) => {
          const result = runTool(block, devices);
          toolCalls.push({
            name: block.name,
            input: block.input,
            resultCount: Array.isArray(result) ? result.length : undefined,
          });
          return {
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result),
          };
        });

      // All tool_result blocks from this turn go back as ONE user message.
      messages.push({ role: "user", content: toolResults });

      response = await client.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 1024,
        tools,
        messages,
      });
    }

    const textBlock = response.content.find((block) => block.type === "text");
    res.status(200).json({ answer: textBlock?.text ?? "", toolCalls });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      res.status(429).json({ error: "Rate limited, try again shortly" });
    } else if (error instanceof Anthropic.APIError) {
      res.status(error.status ?? 500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unexpected error" });
    }
  }
}
