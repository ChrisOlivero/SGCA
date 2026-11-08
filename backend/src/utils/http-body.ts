import type { IncomingMessage } from "node:http";

const LIMITE_BODY = 100_000;

export class BodyDemasiadoGrandeError extends Error {
    constructor() {
        super("El cuerpo de la solicitud es demasiado grande");
        this.name = "BodyDemasiadoGrandeError";
    }
}

export async function leerBodyJson(
    request: IncomingMessage
): Promise<unknown> {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    for await (const chunk of request) {
        const buffer = Buffer.isBuffer(chunk)
            ? chunk
            : Buffer.from(chunk);

        totalBytes += buffer.length;

        if (totalBytes > LIMITE_BODY) {
            throw new BodyDemasiadoGrandeError();
        }

        chunks.push(buffer);
    }

    const body = Buffer.concat(chunks).toString("utf8");

    return JSON.parse(body);
}