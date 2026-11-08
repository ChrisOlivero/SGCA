
import type { IncomingMessage } from "node:http";

export async function leerBodyJson(
    request: IncomingMessage
): Promise<unknown> {
    let body = "";

    for await (const chunk of request) {
        body += chunk.toString();

        if (body.length > 100_000) {
            throw new Error(
                "El cuerpo de la solicitud es demasiado grande"
            );
        }
    }

    return JSON.parse(body);
}
