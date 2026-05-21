# ART-06: Degraded-Mode Matrix

**Status:** Stub — referenced by FR32, NFR-R4.

| Subsystem | Unavailable trigger | Behavior |
|-----------|---------------------|----------|
| Policy engine | Service down | Fail-closed on actuators |
| Matter commissioner | Disconnect | Read-only LCARS; diegetic error |
| Audit log | Write failure | Block commands; alert operator |
