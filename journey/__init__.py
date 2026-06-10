"""Journey package. Its modules use flat absolute imports (`import config`,
`from state import ...`), so the package dir must lead sys.path. Bootstrapping it
here means `python -m journey` and direct imports both resolve correctly."""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)
