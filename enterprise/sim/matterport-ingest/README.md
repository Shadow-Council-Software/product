# @enterprise/matterport-ingest

CLI to ingest **Matterport Matterpak** bundles into the ENTERPRISE digital twin layout contract.

## Commands

```bash
npm install

# Inspect a Matterpak zip or extracted folder
npm run ingest -- discover ../layouts/matterport/inbox/model.zip

# Full ingest (requires alignment-manifest.json)
npm run ingest -- ingest \
  --bundle ../layouts/matterport/inbox/model.zip \
  --alignment ../layouts/matterport/alignment-manifest.json \
  --layout ../layouts/onimurasame-residence-2026-05-24.json \
  --out ../layouts/house-layout.json \
  --unity

# Re-check parity after editing alignment
npm run ingest -- parity \
  --layout ../layouts/onimurasame-residence-2026-05-24.json \
  --publish-dir ../layouts/matterport/published/MODEL_ID
```

## Outputs

| Artifact | Location |
|----------|----------|
| Published mesh | `layouts/matterport/published/<model>/` |
| Alignment manifest | `published/<model>/alignment-manifest.json` |
| Parity report | `published/<model>/parity-report.json` |
| Merged layout | `layouts/house-layout.json` (or `--out`) |
| Unity copy | `unity/.../StreamingAssets/matterport/` with `--unity` |

See [../docs/MATTERPORT-INGESTION.md](../docs/MATTERPORT-INGESTION.md) for the full operator workflow.
