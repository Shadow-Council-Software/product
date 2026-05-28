using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

namespace Enterprise.Sim
{
    /// <summary>
    /// Polls orchestration engine alert FSM and renders a HealthStrip composite placeholder
    /// at the central-hall BACKLIT-PLATE anchor (Sprint 1 / SIM-AC-02).
    /// </summary>
    public class HealthStripRenderer : MonoBehaviour
    {
        [SerializeField] private string engineUrl = "http://127.0.0.1:3001";
        [SerializeField] private float pollIntervalSeconds = 1f;
        [SerializeField] private string panelAnchorRoomId = "central-hall";
        [SerializeField] private Vector3 panelMountPosition = new(8.839f, 1.45f, 3.45f);

        public event Action<AlertFsmSnapshot> OnAlertPhaseChanged;

        private AlertFsmSnapshot _lastSnapshot;
        private TextMesh _label;

        private void Start()
        {
            SpawnPlaceholderPlate();
            StartCoroutine(PollAlertFsmLoop());
        }

        private void SpawnPlaceholderPlate()
        {
            var plate = GameObject.CreatePrimitive(PrimitiveType.Quad);
            plate.name = $"HealthStrip_{panelAnchorRoomId}";
            plate.transform.position = panelMountPosition;
            plate.transform.rotation = Quaternion.Euler(0, 180f, 0);
            plate.transform.localScale = new Vector3(0.6f, 0.12f, 1f);

            // TODO: bind experience-pack L3 HealthStrip composite via DistanceAwareCompositePort (3 m legibility)
            // TODO: replace Standard shader tint with pack manifest token refs — no TNG hardcoding (SIM-AC-08)

            var labelGo = new GameObject("HealthStripLabel");
            labelGo.transform.SetParent(plate.transform);
            labelGo.transform.localPosition = new Vector3(0, 0, -0.01f);
            labelGo.transform.localRotation = Quaternion.identity;
            labelGo.transform.localScale = Vector3.one * 0.08f;
            _label = labelGo.AddComponent<TextMesh>();
            _label.fontSize = 48;
            _label.anchor = TextAnchor.MiddleCenter;
            _label.alignment = TextAlignment.Center;
            _label.text = "HEALTHSTRIP: PENDING";
        }

        private IEnumerator PollAlertFsmLoop()
        {
            while (true)
            {
                using var req = UnityWebRequest.Get($"{engineUrl.TrimEnd('/')}/api/v1/alerts");
                yield return req.SendWebRequest();
                if (req.result == UnityWebRequest.Result.Success)
                {
                    var snapshot = JsonUtility.FromJson<AlertFsmSnapshot>(req.downloadHandler.text);
                    if (snapshot == null) { yield return new WaitForSeconds(pollIntervalSeconds); continue; }
                    var phaseChanged = _lastSnapshot == null
                        || !string.Equals(snapshot.phase, _lastSnapshot.phase, StringComparison.Ordinal);
                    if (phaseChanged)
                    {
                        _lastSnapshot = snapshot;
                        ApplyHealthStripVisual(snapshot);
                        OnAlertPhaseChanged?.Invoke(snapshot);
                    }
                }
                else
                {
                    ApplyOfflineVisual();
                }
                yield return new WaitForSeconds(pollIntervalSeconds);
            }
        }

        private void ApplyHealthStripVisual(AlertFsmSnapshot snapshot)
        {
            if (_label == null) return;
            // TODO: map phase → TRIAX + motion tokens from pack manifest (F-09 / F-11)
            _label.text = $"HEALTHSTRIP: {snapshot.phase?.ToUpperInvariant() ?? "UNKNOWN"}";
            _label.color = PhaseColor(snapshot.phase);
        }

        private void ApplyOfflineVisual()
        {
            if (_label == null) return;
            _label.text = "HEALTHSTRIP: OFFLINE";
            _label.color = Color.gray;
        }

        private static Color PhaseColor(string phase) => phase switch
        {
            "green" => new Color(0.2f, 0.75f, 0.35f),
            "yellow" => new Color(0.91f, 0.63f, 0.19f),
            "red" => new Color(1f, 0.12f, 0.12f),
            "battle-stations" => new Color(0.77f, 0.10f, 0.10f),
            _ => Color.white
        };

        [Serializable]
        public class AlertFsmSnapshot
        {
            public string phase;
            public long lastTransitionTs;
            public string acknowledgedBy;
        }
    }
}
