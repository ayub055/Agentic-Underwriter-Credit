"""Bureau branch spec. Wraps Bureau_Agent's render entry behind the transport;
imports nothing from the repo (isolation lives in the subprocess)."""

from __future__ import annotations

from adapters.base import Transport
from state import BranchResult

BRANCH = "bureau"


async def run(transport: Transport, customer_id: int) -> BranchResult:
    return await transport.run_branch(BRANCH, customer_id)
