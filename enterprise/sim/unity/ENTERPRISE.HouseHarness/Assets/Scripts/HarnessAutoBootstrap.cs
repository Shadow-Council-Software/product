using UnityEngine;

namespace Enterprise.Sim
{
    /// <summary>
    /// One-click Play Mode setup: Sim Bridge client, house layout, HealthStrip plate, visual aid capture.
    /// Attach to an empty "Harness" GameObject in the scene.
    /// </summary>
    public class HarnessAutoBootstrap : MonoBehaviour
    {
        private void Awake()
        {
            EnsureComponent<SimBridgeClient>("SimBridgeClient");
            if (FindObjectOfType<HouseLayoutLoader>() == null)
            {
                new GameObject("HouseBuilder").AddComponent<HouseLayoutLoader>();
            }
            EnsureComponent<HealthStripRenderer>("HealthStripPlate");
            if (FindObjectOfType<PocSceneDirector>() == null)
            {
                gameObject.AddComponent<PocSceneDirector>();
            }
            EnsureCameraWithCapture();
        }

        private static void EnsureCameraWithCapture()
        {
            var cam = Camera.main;
            if (cam == null)
            {
                var camGo = new GameObject("Main Camera");
                cam = camGo.AddComponent<Camera>();
                camGo.tag = "MainCamera";
                cam.transform.position = new Vector3(8.839f, 1.65f, 6.5f);
                cam.transform.LookAt(new Vector3(8.839f, 1.45f, 3.45f));
            }

            if (cam.GetComponent<VisualAidCapture>() == null)
            {
                cam.gameObject.AddComponent<VisualAidCapture>();
            }
        }

        private static T EnsureComponent<T>(string objectName) where T : Component
        {
            var existing = FindObjectOfType<T>();
            if (existing != null) return existing;
            var go = new GameObject(objectName);
            return go.AddComponent<T>();
        }
    }
}
