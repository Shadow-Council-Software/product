using UnityEngine;

namespace Enterprise.Sim
{
    /// <summary>
    /// POC-only: camera preset, on-screen legend, honest "placeholder" labeling.
    /// Not production LCARS — visual sanity check for measured layout.
    /// </summary>
    public class PocSceneDirector : MonoBehaviour
    {
        [SerializeField] private Vector3 plateLookAt = new(8.839f, 1.45f, 3.45f);
        [SerializeField] private Vector3 cameraPosition = new(8.839f, 1.65f, 7.2f);

        private void Start()
        {
            SetupCamera();
            Debug.Log(
                "ENTERPRISE POC — placeholder visuals only. " +
                "Floor plan from owner scan; LCARS plate is debug quad, not Okuda audit.");
        }

        private void SetupCamera()
        {
            var cam = Camera.main;
            if (cam == null) return;
            cam.transform.position = cameraPosition;
            cam.transform.LookAt(plateLookAt);
            cam.fieldOfView = 55f;
            cam.backgroundColor = new Color(0.06f, 0.07f, 0.1f);
        }

        private void OnGUI()
        {
            const int w = 420;
            GUI.Box(new Rect(10, 10, w, 150), "ENTERPRISE Unity POC (sanity check)");
            GUI.Label(new Rect(20, 35, w - 20, 20), "• Orange floor = central-hall (first plate candidate)");
            GUI.Label(new Rect(20, 55, w - 20, 20), "• Cyan cylinder = env.nest.primary station");
            GUI.Label(new Rect(20, 75, w - 20, 20), "• HealthStrip quad = PLACEHOLDER (not Okuda LCARS)");
            GUI.Label(new Rect(20, 95, w - 20, 20), "• Compare to floor scan — scale/room adjacency");
            GUI.Label(new Rect(20, 115, w - 20, 20), "• Escalate alert in LCARS web → strip updates");
            GUI.Label(new Rect(20, 135, w - 20, 20), "Sim Bridge :3002 | Engine :3001");
        }
    }
}
