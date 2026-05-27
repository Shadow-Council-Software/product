using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

namespace Enterprise.Sim
{
    /// <summary>Polls Sim Bridge spatial state and drives scene updates.</summary>
    public class SimBridgeClient : MonoBehaviour
    {
        [SerializeField] private string simBridgeUrl = "http://127.0.0.1:3002";
        [SerializeField] private float pollIntervalSeconds = 2f;

        public event Action<string> OnSpatialState;

        private void Start() => StartCoroutine(PollLoop());

        private IEnumerator PollLoop()
        {
            while (true)
            {
                using var req = UnityWebRequest.Get($"{simBridgeUrl.TrimEnd('/')}/sim/spatial-state");
                yield return req.SendWebRequest();
                if (req.result == UnityWebRequest.Result.Success)
                    OnSpatialState?.Invoke(req.downloadHandler.text);
                yield return new WaitForSeconds(pollIntervalSeconds);
            }
        }
    }
}
