
import test from "node:test";
import assert from "node:assert/strict";

import {
    validarTransicionEstado,
    TransicionEstadoInvalidaError
} from "../../src/domain/transiciones-solicitud.js";

import type { EstadoSolicitud } from "../../src/models/solicitud.js";

test("permite todas las transiciones válidas", () => {
    const transicionesValidas: [
        EstadoSolicitud,
        EstadoSolicitud
    ][] = [
        ["PENDIENTE", "EN_REVISION"],
        ["PENDIENTE", "RECHAZADA"],
        ["EN_REVISION", "APROBADA"],
        ["EN_REVISION", "RECHAZADA"],
        ["APROBADA", "FINALIZADA"]
    ];

    for (const [actual, nuevo] of transicionesValidas) {
        assert.doesNotThrow(() => {
            validarTransicionEstado(actual, nuevo);
        });
    }
});

test("rechaza todas las transiciones no permitidas", () => {
    const transicionesInvalidas: [
        EstadoSolicitud,
        EstadoSolicitud
    ][] = [
        ["PENDIENTE", "APROBADA"],
        ["PENDIENTE", "FINALIZADA"],
        ["EN_REVISION", "PENDIENTE"],
        ["EN_REVISION", "FINALIZADA"],
        ["APROBADA", "PENDIENTE"],
        ["APROBADA", "RECHAZADA"],
        ["RECHAZADA", "PENDIENTE"],
        ["FINALIZADA", "PENDIENTE"]
    ];

    for (const [actual, nuevo] of transicionesInvalidas) {
        assert.throws(
            () => validarTransicionEstado(actual, nuevo),
            TransicionEstadoInvalidaError
        );
    }
});

test("devuelve un mensaje descriptivo cuando la transición es inválida", () => {
    assert.throws(
        () => validarTransicionEstado("PENDIENTE", "APROBADA"),
        {
            message: "No se puede cambiar de PENDIENTE a APROBADA"
        }
    );
});
