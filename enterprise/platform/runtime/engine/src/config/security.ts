/** Battle Stations confirm gate — non-configurable per W-CT-03 / NFR-UX6 */
export const BATTLE_STATIONS_GATE_ENABLED = true as const;

export function isBattleStationsGateEnabled(): boolean {
  // Intentionally ignores BYPASS env vars — contract tests verify this.
  void process.env.BATTLE_STATIONS_BYPASS;
  void process.env.DISABLE_BATTLE_STATIONS;
  return BATTLE_STATIONS_GATE_ENABLED;
}
