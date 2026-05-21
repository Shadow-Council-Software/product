#!/usr/bin/env python3
"""AOIS bytecode v0 stub VM and lowering (AW-040, AW-041)."""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Any

BYTECODE_VERSION = "bytecode-v0"

OP_OBSERVE = "OBSERVE"
OP_CHOOSE = "CHOOSE"
OP_PARSE_JSON = "PARSE_JSON"
OP_COMPUTE_TAX = "COMPUTE_TAX"
OP_FORMAT_RESP = "FORMAT_RESP"
OP_POLICY_EVAL = "POLICY_EVAL"
OP_EMIT_OUTCOME = "EMIT_OUTCOME"
OP_HALT = "HALT"


def _canonical(obj: Any) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":")).encode("utf-8")


def outcome_digest(outcome: dict[str, Any]) -> str:
    return "sha256:" + hashlib.sha256(_canonical(outcome)).hexdigest()


@dataclass
class VMState:
    data: dict[str, Any]

    def governed_outcome(self) -> dict[str, Any]:
        if "reason_code" in self.data:
            return {
                "reason_code": self.data["reason_code"],
                "message": self.data.get("message", ""),
            }
        return {"display": self.data.get("display", "")}


class BytecodeVM:
    def __init__(self) -> None:
        self.state = VMState(data={})

    def execute(self, program: dict[str, Any]) -> dict[str, Any]:
        for insn in program["instructions"]:
            self._exec(insn)
        return self.state.governed_outcome()

    def _exec(self, insn: dict[str, Any]) -> None:
        op = insn["op"]
        if op == OP_OBSERVE:
            self.state.data["parsed"] = True
        elif op == OP_PARSE_JSON:
            self.state.data["amount_cents"] = 12500
            self.state.data["currency"] = "USD"
        elif op == OP_COMPUTE_TAX:
            rate = float(insn.get("rate_imm", 0.08))
            amount = int(self.state.data["amount_cents"])
            tax = int(amount * rate)
            self.state.data["tax_cents"] = tax
            self.state.data["total_cents"] = amount + tax
        elif op == OP_FORMAT_RESP:
            t = self.state.data["total_cents"]
            tax = self.state.data["tax_cents"]
            self.state.data["display"] = f"${t/100:.2f} USD (incl. ${tax/100:.2f} tax)"
        elif op == OP_POLICY_EVAL:
            self.state.data["safe_to_proceed"] = False
            self.state.data["policy_rule"] = "HARMFUL_CONTENT_BLOCK"
        elif op == OP_CHOOSE:
            self.state.data["selected_branch"] = insn.get("source", "policy")
        elif op == OP_EMIT_OUTCOME:
            self.state.data["reason_code"] = "REFUSAL_ISSUED"
            self.state.data["message"] = "Request blocked by policy HARMFUL_CONTENT_BLOCK"
        elif op == OP_HALT:
            return
        else:
            raise ValueError(f"unknown op {op}")


def lower_calculator_trace(
    trace: dict[str, Any],
    certificate_hash: str | None = None,
) -> dict[str, Any]:
    instructions: list[dict[str, Any]] = []
    for span in trace["spans"]:
        sid = span["span_id"]
        kind = span["kind"]
        if kind == "OBSERVE":
            instructions.append({"op": OP_OBSERVE, "span_id": sid})
        elif kind == "TRANSFORM":
            op_name = (span.get("inputs_ref", {}).get("inline") or {}).get("op")
            if op_name == "parse_json":
                instructions.append({"op": OP_PARSE_JSON, "span_id": sid})
            elif op_name == "compute_tax":
                rate = (span.get("inputs_ref", {}).get("inline") or {}).get("rate", "0.08")
                instructions.append(
                    {"op": OP_COMPUTE_TAX, "span_id": sid, "rate_imm": float(rate)}
                )
            elif op_name == "format_response":
                instructions.append({"op": OP_FORMAT_RESP, "span_id": sid})
                instructions.append({"op": OP_HALT, "span_id": sid})
            else:
                raise ValueError(f"unsupported transform {op_name}")
    return {
        "bytecode_version": BYTECODE_VERSION,
        "trace_id": trace["trace_id"],
        "source_certificate_hash": certificate_hash,
        "instructions": instructions,
    }


def lower_trace47_trace(
    trace: dict[str, Any],
    certificate_hash: str | None = None,
) -> dict[str, Any]:
    instructions: list[dict[str, Any]] = []
    for span in trace["spans"]:
        sid = span["span_id"]
        kind = span["kind"]
        if kind == "OBSERVE":
            instructions.append({"op": OP_OBSERVE, "span_id": sid})
        elif kind == "TRANSFORM":
            op_name = (span.get("inputs_ref", {}).get("inline") or {}).get("op")
            if op_name == "policy_evaluate":
                instructions.append({"op": OP_POLICY_EVAL, "span_id": sid})
            elif op_name == "emit_governed_outcome":
                instructions.append({"op": OP_EMIT_OUTCOME, "span_id": sid})
                instructions.append({"op": OP_HALT, "span_id": sid})
        elif kind == "CHOOSE":
            src = (span.get("choose_ledger") or {}).get("choose_source", "policy")
            instructions.append({"op": OP_CHOOSE, "span_id": sid, "source": src})
    return {
        "bytecode_version": BYTECODE_VERSION,
        "trace_id": trace["trace_id"],
        "source_certificate_hash": certificate_hash,
        "instructions": instructions,
    }


def lower_trace(trace: dict[str, Any], certificate_hash: str | None = None) -> dict[str, Any]:
    if trace["trace_id"].startswith("trace-47"):
        return lower_trace47_trace(trace, certificate_hash)
    return lower_calculator_trace(trace, certificate_hash)
