using System;
using System.Collections;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

namespace Enterprise.Sim
{
    [Serializable] public class Float2Dto { public float x; public float y; }
    [Serializable] public class Float3Dto { public float x; public float y; public float z; }

    [Serializable]
    public class HouseLayoutDto
    {
        public int schemaVersion;
        public LayoutMetadata metadata;
        public RoomDto[] rooms;
        public StationDto[] stations;
        public DeviceDto[] devices;
    }

    [Serializable] public class LayoutMetadata { public string name; public string units; }

    [Serializable]
    public class RoomDto
    {
        public string id;
        public string label;
        public float floorElevation;
        public float ceilingHeight = 2.7f;
        public Float2Dto[] floorPolygon;
    }

    [Serializable]
    public class StationDto
    {
        public string stationId;
        public string roomId;
        public string label;
        public Float3Dto position;
        public float rotationY;
        public int matterNodeId;
        public string deviceType;
    }

    [Serializable]
    public class DeviceDto
    {
        public string deviceId;
        public string roomId;
        public string label;
        public string deviceType;
        public Float3Dto position;
        public float rotationY;
    }

    /// <summary>Builds room floor meshes and station markers from house-layout.json (Unity JsonUtility format).</summary>
    public class HouseLayoutLoader : MonoBehaviour
    {
        [SerializeField] private TextAsset layoutJson;
        [SerializeField] private string streamingAssetsFileName = "house-layout.json";
        [SerializeField] private Material floorMaterial;
        [SerializeField] private Material stationMaterial;
        [SerializeField] private Material highlightMaterial;

        public event Action<HouseLayoutDto> OnLayoutBuilt;

        private void Start() => StartCoroutine(LoadAndBuild());

        private IEnumerator LoadAndBuild()
        {
            string json = layoutJson != null ? layoutJson.text : null;

            if (string.IsNullOrEmpty(json))
            {
                var path = Path.Combine(Application.streamingAssetsPath, streamingAssetsFileName);
#if UNITY_EDITOR || UNITY_STANDALONE_OSX || UNITY_STANDALONE_LINUX
                if (File.Exists(path))
                    json = File.ReadAllText(path);
#endif
            }

            if (string.IsNullOrEmpty(json))
            {
                Debug.LogWarning(
                    "POC: No layout in StreamingAssets. Run: node enterprise/sim/scripts/convert-layout-for-unity.mjs");
                yield break;
            }

            var layout = JsonUtility.FromJson<HouseLayoutDto>(json);
            if (layout?.rooms == null || layout.rooms.Length == 0)
            {
                Debug.LogError("POC: Layout parse failed — regenerate with convert-layout-for-unity.mjs");
                yield break;
            }

            BuildLayout(layout);
            OnLayoutBuilt?.Invoke(layout);
        }

        public void BuildLayout(HouseLayoutDto layout)
        {
            var root = new GameObject($"House_{layout.metadata?.name ?? "POC"}");
            foreach (var room in layout.rooms)
            {
                if (room.floorPolygon == null || room.floorPolygon.Length < 3) continue;

                var roomGo = new GameObject($"{room.label} ({room.id})");
                roomGo.transform.SetParent(root.transform);
                var mesh = ExtrudeFloor(room);
                var mf = roomGo.AddComponent<MeshFilter>();
                mf.sharedMesh = mesh;
                var mr = roomGo.AddComponent<MeshRenderer>();
                mr.sharedMaterial = PickRoomMaterial(room.id);

                var outline = roomGo.AddComponent<LineRenderer>();
                outline.useWorldSpace = false;
                outline.loop = true;
                outline.widthMultiplier = 0.03f;
                outline.positionCount = room.floorPolygon.Length + 1;
                outline.material = new Material(Shader.Find("Sprites/Default"));
                outline.startColor = outline.endColor = new Color(0.2f, 0.85f, 1f, 0.9f);
                for (var i = 0; i < room.floorPolygon.Length; i++)
                {
                    var p = room.floorPolygon[i];
                    outline.SetPosition(i, new Vector3(p.x, 0.02f, p.y));
                }
                var p0 = room.floorPolygon[0];
                outline.SetPosition(room.floorPolygon.Length, new Vector3(p0.x, 0.02f, p0.y));

                roomGo.transform.position = new Vector3(0, room.floorElevation, 0);
            }

            if (layout.stations != null)
            {
                foreach (var station in layout.stations)
                {
                    SpawnMarker(root.transform, station.label ?? station.stationId,
                        ToVector3(station.position), station.rotationY, stationMaterial, 0.18f, Color.cyan);
                }
            }

            if (layout.devices != null)
            {
                foreach (var device in layout.devices)
                {
                    var color = device.deviceType == "thermostat" ? new Color(1f, 0.55f, 0.1f) : Color.yellow;
                    SpawnMarker(root.transform, device.label ?? device.deviceId,
                        ToVector3(device.position), device.rotationY, null, 0.12f, color);
                }
            }
        }

        private Material PickRoomMaterial(string roomId)
        {
            if (roomId == "central-hall" && highlightMaterial != null)
                return highlightMaterial;
            if (floorMaterial != null)
                return floorMaterial;

            var mat = new Material(Shader.Find("Standard"));
            mat.color = roomId switch
            {
                "central-hall" => new Color(0.55f, 0.35f, 0.12f),
                "kitchen-dining" => new Color(0.25f, 0.3f, 0.35f),
                "entry-hall" => new Color(0.2f, 0.22f, 0.28f),
                _ => new Color(0.18f, 0.2f, 0.24f),
            };
            return mat;
        }

        private static void SpawnMarker(Transform parent, string name, Vector3 pos, float rotY,
            Material mat, float scale, Color fallback)
        {
            var marker = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            marker.name = name;
            marker.transform.SetParent(parent);
            marker.transform.position = pos;
            marker.transform.localScale = new Vector3(scale, 0.04f, scale);
            marker.transform.rotation = Quaternion.Euler(0, rotY, 0);
            var renderer = marker.GetComponent<Renderer>();
            if (mat != null)
                renderer.sharedMaterial = mat;
            else
            {
                var m = new Material(Shader.Find("Standard"));
                m.color = fallback;
                renderer.sharedMaterial = m;
            }
        }

        private static Vector3 ToVector3(Float3Dto p) =>
            p == null ? Vector3.zero : new Vector3(p.x, p.y, p.z);

        private static Mesh ExtrudeFloor(RoomDto room)
        {
            var mesh = new Mesh();
            var verts = new Vector3[room.floorPolygon.Length];
            for (var i = 0; i < room.floorPolygon.Length; i++)
                verts[i] = new Vector3(room.floorPolygon[i].x, 0, room.floorPolygon[i].y);

            var tris = new int[(room.floorPolygon.Length - 2) * 3];
            for (var i = 1; i < room.floorPolygon.Length - 1; i++)
            {
                tris[(i - 1) * 3] = 0;
                tris[(i - 1) * 3 + 1] = i;
                tris[(i - 1) * 3 + 2] = i + 1;
            }

            mesh.vertices = verts;
            mesh.triangles = tris;
            mesh.RecalculateNormals();
            return mesh;
        }
    }
}
