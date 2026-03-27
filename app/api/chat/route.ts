type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT =
  "Eres Guia Espiritual de Semana Santa, un asistente catolico sereno, respetuoso y contemplativo para un evento publico de la Municipalidad de San Miguel de Tucuman. Debes responder con prioridad usando esta informacion oficial del evento cuando te consulten por lugar, horarios, ingreso, duracion, modalidad o asistencia. Informacion oficial: Lugar: El Rosedal, Parque 9 de Julio. Ingreso principal por la pergola. Dias y horarios: jueves, viernes y domingo, de 19:00 a 23:00. Actividad: realizar estaciones de Jesus en una experiencia inmersiva, acompanada por facilitadores de la Iglesia. Habra promotores municipales que recibiran a las personas e indicaran cada paso a seguir. No requiere inscripcion. Todo el trayecto dura 45 minutos. Se suspende por lluvia. Tambien puedes acompanar consultas sobre Via Crucis, Semana Santa, oracion, reflexion, sentido espiritual de las celebraciones y mensajes de esperanza. Responde con calidez, claridad y tono sobrio. No inventes citas ni doctrina. Si una situacion requiere acompanamiento personal o sacramental, sugiere acercarse a un sacerdote o agente pastoral.";

function sanitizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter(
      (message: unknown): message is ChatMessage =>
        typeof message === "object" &&
        message !== null &&
        "role" in message &&
        "content" in message &&
        typeof (message as ChatMessage).role === "string" &&
        typeof (message as ChatMessage).content === "string"
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = sanitizeMessages(body?.messages);

    if (!messages.length) {
      return new Response(
        JSON.stringify({ error: "Debes enviar al menos un mensaje." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Falta configurar OPENROUTER_API_KEY en .env.local",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": process.env.NEXT_PUBLIC_APP_NAME || "Guia Espiritual",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          stream: true,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
        }),
      }
    );

    if (!openRouterResponse.ok || !openRouterResponse.body) {
      const data = await openRouterResponse
        .json()
        .catch(() => ({ error: { message: "No se pudo obtener respuesta." } }));

      return new Response(
        JSON.stringify({
          error:
            data?.error?.message ||
            "No se pudo obtener respuesta desde OpenRouter.",
        }),
        {
          status: openRouterResponse.status || 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = openRouterResponse.body?.getReader();

        if (!reader) {
          controller.close();
          return;
        }

        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split("\n\n");
            buffer = events.pop() || "";

            for (const event of events) {
              const lines = event
                .split("\n")
                .filter((line) => line.startsWith("data:"));

              for (const line of lines) {
                const data = line.replace(/^data:\s*/, "");

                if (data === "[DONE]") {
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const token =
                    parsed?.choices?.[0]?.delta?.content ||
                    parsed?.choices?.[0]?.message?.content ||
                    "";

                  if (token) {
                    controller.enqueue(encoder.encode(token));
                  }
                } catch {
                  continue;
                }
              }
            }
          }
        } catch {
          controller.error(new Error("Error transmitiendo la respuesta."));
          return;
        }

        if (buffer.trim()) {
          const trailingLines = buffer
            .split("\n")
            .filter((line) => line.startsWith("data:"));

          for (const line of trailingLines) {
            const data = line.replace(/^data:\s*/, "");

            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              const token =
                parsed?.choices?.[0]?.delta?.content ||
                parsed?.choices?.[0]?.message?.content ||
                "";

              if (token) {
                controller.enqueue(encoder.encode(token));
              }
            } catch {
              continue;
            }
          }
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Ocurrio un error procesando la solicitud." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
