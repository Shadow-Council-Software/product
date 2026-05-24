using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

namespace Enterprise.Sim
{
    /// <summary>
    /// Fetches coverage report and spawns FOV debug geometry for UX planning.
    /// </summary>
    public class CoverageVisualizer : MonoBehaviour
    {
        [SerializeField] private string simBridgeUrl = "http://127.0.0.1:3002";
        [SerializeField] private float refreshSeconds = 10f;
        [SerializeField] private Material fovMaterialInstalled;
        [SerializeField] private Material fovMaterialPlanned;
        [SerializeField] private GameObject gapMarkerPrefab;

        private Transform _root;

        private void Start()
        {
            _root = new GameObject("CoverageDebug").transform;
            StartCoroutine(RefreshLoop());
        }

        private IEnumerator RefreshLoop()
        {
            while (true)
            {
                yield return Refresh();
                yield return new WaitForSeconds(refreshSeconds);
            }
        }

        private IEnumerator Refresh()
        {
            using var req = UnityWebRequest.Get($"{simBridgeUrl.TrimEnd('/')}/sim/devices");
            yield return req.SendWebRequest();
            if (req.result != UnityWebRequest.Result.Success) yield break;

            foreach (Transform child in _root)
                Destroy(child.gameObject);

            // Parse minimal — full JSON lib recommended for production
            var json = req.downloadHandler.text;
            if (json.Contains("sec.nest.doorbell"))
                SpawnFovWedge(new Vector3(8.534f, 1.15f, -0.05f), 0f, 150f, 8f, fovMaterialInstalled);
            if (json.Contains("sec.nest.garage.floodlight"))
                SpawnFovWedge(new Vector3(19.5f, 3.2f, 4.5f), 270f, 130f, 15f, fovMaterialPlanned);

            using var gapReq = UnityWebRequest.Get($"{simBridgeUrl.TrimEnd('/')}/sim/coverage/report");
            yield return gapReq.SendWebRequest();
            if (gapReq.result == UnityWebRequest.Result.Success && gapMarkerPrefab != null
                && gapReq.downloadHandler.text.Contains("\"gaps\""))
            {
                // Gap markers: refine with Newtonsoft when parsing full report
            }
        }

        private void SpawnFovWedge(Vector3 origin, float yawDeg, float fovDeg, float range, Material mat)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            go.transform.SetParent(_root);
            go.transform.position = origin;
            go.transform.rotation = Quaternion.Euler(0, yawDeg, 0);
            go.transform.localScale = new Vector3(range * 2f, 0.02f, range * 0.5f);
            if (mat != null) go.GetComponent<Renderer>().sharedMaterial = mat;
        }
    }
}
