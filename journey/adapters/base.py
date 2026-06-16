"""Transport seam for isolated foreign branches.

Today: SubprocessTransport (one `python _run_branch.py` per call, repo as cwd).
The Transport ABC is the swap point for a future persistent per-repo worker pool
(D4) — orchestrator/adapters never call create_subprocess_exec directly.
"""

from __future__ import annotations

import abc
import asyncio
import json
import tempfile
from pathlib import Path

import config
from state import BranchResult, BranchStatus


class Transport(abc.ABC):
    @abc.abstractmethod
    async def run_branch(self, branch: str, customer_id: int) -> BranchResult: ...


class SubprocessTransport(Transport):
    def __init__(self, timeout_s: float = config.BRANCH_TIMEOUT_S):
        self.timeout_s = timeout_s

    async def run_branch(self, branch: str, customer_id: int) -> BranchResult:
        spec = config.BRANCHES[branch]
        with tempfile.NamedTemporaryFile(suffix=f"_{branch}.json", delete=False) as tf:
            out_path = tf.name

        cmd = [
            config.PY_INTERPRETER, config.RUN_BRANCH,
            "--branch", branch,
            "--customer-id", str(customer_id),
            "--render", spec["render"],
            "--builder", spec["builder"],
            "--out", out_path,
        ]

        proc = await asyncio.create_subprocess_exec(
            *cmd, cwd=spec["repo"],
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
        )
        try:
            _, stderr = await asyncio.wait_for(proc.communicate(), timeout=self.timeout_s)
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()
            return BranchResult(branch=branch, status=BranchStatus.failed,
                                error=f"timeout after {self.timeout_s}s")

        try:
            payload = json.loads(Path(out_path).read_text())
        except Exception as e:
            tail = (stderr or b"").decode(errors="replace").strip().splitlines()[-4:]
            return BranchResult(branch=branch, status=BranchStatus.failed,
                                error=f"no/invalid result ({e}); stderr: {' | '.join(tail)}")
        finally:
            Path(out_path).unlink(missing_ok=True)

        if not payload.get("ok"):
            return BranchResult(branch=branch, status=BranchStatus.failed,
                                summary=payload.get("summary"),
                                error=payload.get("error") or "branch returned ok=false",
                                elapsed_s=payload.get("elapsed_s", 0.0))

        # ok=true but a render fallback (no artifact) -> degraded, not failed.
        status = BranchStatus.ok if payload.get("report_path") else BranchStatus.degraded
        return BranchResult(
            branch=branch, status=status,
            summary=payload.get("summary"),
            detail=payload.get("detail"),
            report_path=payload.get("report_path"),
            model_used=payload.get("model_used"),
            elapsed_s=payload.get("elapsed_s", 0.0),
        )
