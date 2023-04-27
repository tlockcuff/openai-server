import cors from "@/utils/cors";
import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return cors(
      req,
      new Response(JSON.stringify({ message: "Hello World!" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  }

  const authToken = req.headers.get("Authorization");

  if (!authToken) {
    return new Response("No authorization token", { status: 401 });
  }

  if (authToken !== `Bearer ${process.env.AUTH_TOKEN ?? ""}`) {
    return new Response("Invalid authorization token", { status: 401 });
  }

  const { prompt, system, options } = (await req.json()) as {
    prompt?: string;
    system: string;
    options?: OpenAIStreamPayload;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1000,
    stream: true,
    n: 1,
    ...options,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream)
};

export default handler;
