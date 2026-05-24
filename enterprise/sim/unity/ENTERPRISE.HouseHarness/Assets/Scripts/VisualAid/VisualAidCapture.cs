using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace Enterprise.Sim
{
    /// <summary>Captures viewport + annotations for LLM visual aids via Sim Bridge.</summary>
    public class VisualAidCapture : MonoBehaviour
    {
        [SerializeField] private string simBridgeUrl = "http://127.0.0.1:3002";
        [SerializeField] private float captureIntervalSeconds = 5f;
        [SerializeField] private string focusStationId = "env.nest.primary";
        [SerializeField] private string focusRoomId = "living-room";

        private void Start() => StartCoroutine(CaptureLoop());

        private IEnumerator CaptureLoop()
        {
            while (true)
            {
                yield return new CaptureAtEndOfFrame();
                yield return PostCapture();
                yield return new WaitForSeconds(captureIntervalSeconds);
            }
        }

        private Texture2D _lastFrame;

        private IEnumerator CaptureAtEndOfFrame()
        {
            yield return new WaitForEndOfFrame();
            var cam = Camera.main;
            if (cam == null) yield break;
            _lastFrame = new Texture2D(Screen.width, Screen.height, TextureFormat.RGB24, false);
            _lastFrame.ReadPixels(new Rect(0, 0, Screen.width, Screen.height), 0, 0);
            _lastFrame.Apply();
        }

        private IEnumerator PostCapture()
        {
            if (_lastFrame == null) yield break;
            var cam = Camera.main;
            if (cam == null) yield break;

            var png = _lastFrame.EncodeToPNG();
            var b64 = Convert.ToBase64String(png);
            var pos = cam.transform.position;
            var rot = cam.transform.rotation.eulerAngles;
            var json = $@"{{
  ""captureId"": ""{Guid.NewGuid()}"",
  ""timestamp"": {DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()},
  ""camera"": {{ ""position"": [{pos.x},{pos.y},{pos.z}], ""rotationEuler"": [{rot.x},{rot.y},{rot.z}], ""fov"": {cam.fieldOfView} }},
  ""focus"": {{ ""stationId"": ""{focusStationId}"", ""roomId"": ""{focusRoomId}"" }},
  ""imageBase64"": ""{b64}"",
  ""annotations"": []
}}";

            using var req = new UnityWebRequest($"{simBridgeUrl.TrimEnd('/')}/sim/visual-aid", "POST");
            req.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
            req.downloadHandler = new DownloadHandlerBuffer();
            req.SetRequestHeader("Content-Type", "application/json");
            yield return req.SendWebRequest();
            Destroy(_lastFrame);
            _lastFrame = null;
        }
    }
}
