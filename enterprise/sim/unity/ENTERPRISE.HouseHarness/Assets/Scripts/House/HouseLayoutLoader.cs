using System;
using System.Collections.Generic;
using UnityEngine;

namespace Enterprise.Sim
{
    [Serializable]
    public class HouseLayoutDto
    {
        public int schemaVersion;
        public LayoutMetadata metadata;
        public List<RoomDto> rooms = new();
        public List<StationDto> stations = new();
    }

    [Serializable] public class LayoutMetadata { public string name; public string units; }
    [Serializable]
    public class RoomDto
    {
        public string id;
        public string label;
        public float floorElevation;
        public float ceilingHeight = 2.7f;
        public List<Vector2> floorPolygon = new();
    }
    [Serializable]
    public class StationDto
    {
        public string stationId;
        public string roomId;
        public string label;
        public Vector3 position;
        public float rotationY;
        public int matterNodeId;
        public string deviceType;
    }

    /// <summary>Builds room floor meshes and station markers from house-layout.json.</summary>
    public class HouseLayoutLoader : MonoBehaviour
    {
        [SerializeField] private TextAsset layoutJson;
        [SerializeField] private Material floorMaterial;
        [SerializeField] private Material stationMaterial;

        private void Start()
        {
            if (layoutJson == null)
            {
                Debug.LogWarning("Assign house-layout.json TextAsset in StreamingAssets");
                return;
            }
            var layout = JsonUtility.FromJson<HouseLayoutDto>(layoutJson.text);
            BuildLayout(layout);
        }

        public void BuildLayout(HouseLayoutDto layout)
        {
            var root = new GameObject($"House_{layout.metadata.name}");
            foreach (var room in layout.rooms)
            {
                var roomGo = new GameObject(room.label);
                roomGo.transform.SetParent(root.transform);
                var mesh = ExtrudeFloor(room);
                var mf = roomGo.AddComponent<MeshFilter>();
                mf.sharedMesh = mesh;
                var mr = roomGo.AddComponent<MeshRenderer>();
                mr.sharedMaterial = floorMaterial != null ? floorMaterial : new Material(Shader.Find("Standard"));
                roomGo.transform.position = new Vector3(0, room.floorElevation, 0);
            }
            foreach (var station in layout.stations)
            {
                var marker = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                marker.name = station.label ?? station.stationId;
                marker.transform.SetParent(root.transform);
                marker.transform.position = station.position;
                marker.transform.localScale = new Vector3(0.15f, 0.05f, 0.15f);
                marker.transform.rotation = Quaternion.Euler(0, station.rotationY, 0);
                if (stationMaterial != null)
                    marker.GetComponent<Renderer>().sharedMaterial = stationMaterial;
            }
        }

        private static Mesh ExtrudeFloor(RoomDto room)
        {
            var mesh = new Mesh();
            if (room.floorPolygon == null || room.floorPolygon.Count < 3) return mesh;
            var verts = new Vector3[room.floorPolygon.Count];
            for (int i = 0; i < room.floorPolygon.Count; i++)
                verts[i] = new Vector3(room.floorPolygon[i].x, 0, room.floorPolygon[i].y);
            var tris = new int[(room.floorPolygon.Count - 2) * 3];
            for (int i = 1; i < room.floorPolygon.Count - 1; i++)
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
