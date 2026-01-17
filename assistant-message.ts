import { createLogger } from "./sdk-logger";

const logger = createLogger("AssistantLogger");

export interface AssistantMessageInfo {
  id: string;
  content: string;
  model: string;
  provider: string;
  created: string;
  tokens: {
    input: number;
    output: number;
    reasoning: number;
  };
  cost: number;
}

export async function getLastAssistantMessage(
  client: any,
  sessionID: string,
  directory?: string
): Promise<AssistantMessageInfo | null> {
  try {
    const response = await client.Session.messages({
      path: { id: sessionID },
      query: { 
        limit: 50,
        directory: directory || "" 
      }
    });

    if (!response.data || response.data.length === 0) {
      logger.warn("No messages found in session");
      return null;
    }

    // Filter for assistant messages and get the last one
    const assistantMessages = response.data.filter(
      (msg: any) => msg.info.role === "assistant"
    );

    if (assistantMessages.length === 0) {
      logger.warn("No assistant messages found in session");
      return null;
    }

    const lastAssistant = assistantMessages[assistantMessages.length - 1];
    const info = lastAssistant.info as any;

    // Extract text content from parts
    const textContent = lastAssistant.parts
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("\n");

    const result: AssistantMessageInfo = {
      id: info.id,
      content: textContent.slice(0, 200) + (textContent.length > 200 ? "..." : ""),
      model: `${info.providerID}/${info.modelID}`,
      provider: info.providerID,
      created: new Date(info.time.created).toISOString(),
      tokens: info.tokens || { input: 0, output: 0, reasoning: 0 },
      cost: info.cost || 0,
    };

    logger.info("Retrieved last assistant message", {
      messageID: result.id,
      model: result.model,
      tokens: result.tokens,
      cost: result.cost
    });

    return result;

  } catch (error) {
    logger.error("Failed to fetch assistant message", error);
    return null;
  }
}

// Example usage in a plugin hook:
// "chat.message": async ({ sessionID }, { message }) => {
//   const lastAssistant = await getLastAssistantMessage(ctx.client, sessionID, ctx.directory);
//   if (lastAssistant) {
//     logger.info("Last assistant message:", { content: lastAssistant.content });
//   }
// }

export default getLastAssistantMessage;
