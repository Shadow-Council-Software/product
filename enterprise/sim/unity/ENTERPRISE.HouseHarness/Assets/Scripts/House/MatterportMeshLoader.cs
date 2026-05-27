using System;
using System.Collections;
using System.IO;
using UnityEngine;
using UnityEngine.Networking;

namespace Enterprise.Sim
{
    /// <summary>
    /// Loads Matterport OBJ from house-layout geometry block (StreamingAssets or Sim Bridge manifest).
    /// Survey room polygons from HouseLayoutLoader remain the logical/spatial truth for stations.
    /// </summary>
    public class MatterportMeshLoader : MonoBehaviour
    {
        [SerializeField] private TextAsset layoutJson;
        [SerializeField] private string simBridgeBaseUrl = "http://127.0.0.1:3002";
        [SerializeField] private bool preferSimBridgeManifest = true;

        private void Start()
        {
            StartCoroutine(LoadFromLayoutOrBridge());
        }

        private IEnumerator LoadFromLayoutOrBridge()
        {
            GeometryBlock geometry = null;
            if (preferSimBridgeManifest)
            {
                using var req = UnityWebRequest.Get($"{simBridgeBaseUrl.TrimEnd('/')}/sim/geometry/manifest");
                yield return req.SendWebRequest();
                if (req.result == UnityWebRequest.Result.Success)
                {
                    var wrapper = JsonUtility.FromJson<GeometryManifestResponse>(req.downloadHandler.text);
                    geometry = wrapper?.geometry;
                }
            }

            if (geometry == null && layoutJson != null)
            {
                var root = JsonUtility.FromJson<LayoutWithGeometry>(layoutJson.text);
                geometry = root?.geometry;
            }

            if (geometry?.mesh == null)
            {
                Debug.Log("MatterportMeshLoader: no geometry block — polygon-only harness");
                yield break;
            }

            var meshUri = geometry.mesh.uri;
            var localPath = Path.Combine(Application.streamingAssetsPath, "matterport", Path.GetFileName(meshUri));
            if (!File.Exists(localPath))
            {
                Debug.LogWarning($"Matterport mesh not found at {localPath}. Run matterport-ingest with --unity");
                yield break;
            }

            // OBJ loading: use Unity-compatible third-party importer in production (e.g. TriLib).
            // MVP: spawn placeholder scaled to reported bounds until OBJ importer package is added.
            var rootGo = new GameObject("Matterport_Scan");
            ApplyTransform(rootGo.transform, geometry.mesh.transform);

            if (geometry.bounds != null)
            {
                var extent = geometry.bounds.extentM;
                var cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
                cube.transform.SetParent(rootGo.transform);
                cube.transform.localPosition = Vector3.zero;
                cube.transform.localScale = new Vector3(extent[0], extent[1], extent[2]);
                cube.name = "Matterport_Bounds_Proxy";
                var renderer = cube.GetComponent<Renderer>();
                if (renderer != null)
                {
                    var mat = new Material(Shader.Find("Standard"));
                    mat.color = new Color(0.2f, 0.5f, 0.8f, 0.25f);
                    renderer.material = mat;
                }
                Debug.Log($"MatterportMeshLoader: bounds proxy {extent[0]:F2}×{extent[1]:F2}×{extent[2]:F2} m — replace with OBJ importer for full mesh");
            }

            Debug.Log($"MatterportMeshLoader: aligned to survey {geometry.alignment.surveyRef}");
        }

        private static void ApplyTransform(Transform t, MeshTransformDto tr)
        {
            if (tr == null) return;
            if (tr.position != null && tr.position.Length >= 3)
                t.localPosition = new Vector3(tr.position[0], tr.position[1], tr.position[2]);
            if (tr.rotationEulerDeg != null && tr.rotationEulerDeg.Length >= 3)
                t.localRotation = Quaternion.Euler(tr.rotationEulerDeg[0], tr.rotationEulerDeg[1], tr.rotationEulerDeg[2]);
            if (tr.scale != null && tr.scale.Length >= 3)
                t.localScale = new Vector3(tr.scale[0], tr.scale[1], tr.scale[2]);
        }

        [Serializable]
        private class LayoutWithGeometry
        {
            public GeometryBlock geometry;
        }

        [Serializable]
        private class GeometryManifestResponse
        {
            public GeometryBlock geometry;
            public bool parityPassed;
        }

        [Serializable]
        public class GeometryBlock
        {
            public string source;
            public string matterportModelId;
            public MeshDto mesh;
            public AlignmentDto alignment;
            public BoundsDto bounds;
        }

        [Serializable]
        public class MeshDto
        {
            public string format;
            public string uri;
            public string materialUri;
            public MeshTransformDto transform;
        }

        [Serializable]
        public class MeshTransformDto
        {
            public float[] position;
            public float[] rotationEulerDeg;
            public float[] scale;
        }

        [Serializable]
        public class AlignmentDto
        {
            public string surveyRef;
            public string manifestUri;
            public float maxWallDeltaM;
            public string verifiedAt;
        }

        [Serializable]
        public class BoundsDto
        {
            public float[] min;
            public float[] max;
            public float[] extentM;
        }
    }
}
