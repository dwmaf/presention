using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Threading;
using System.Drawing;
using System.Drawing.Imaging;
using System.Windows.Forms;
using DPUruNet;

namespace FingerprintService
{
    // --- Data Models ---
    [DataContract]
    public class EnrollResponse
    {
        [DataMember] public bool success { get; set; }
        [DataMember] public string message { get; set; }
        [DataMember] public string fmd { get; set; }
        [DataMember] public string image { get; set; }
    }

    [DataContract]
    public class VerifyRequest
    {
        [DataMember] public List<UserFingerprint> database { get; set; }
    }

    [DataContract]
    public class UserFingerprint
    {
        [DataMember] public string id { get; set; }
        [DataMember] public string fmd { get; set; }
    }

    [DataContract]
    public class VerifyResponse
    {
        [DataMember] public bool match { get; set; }
        [DataMember] public string user_id { get; set; }
        [DataMember] public string message { get; set; }
    }

    // --- Main Form (Hidden) ---
    public class ServiceForm : Form
    {
        private HttpListener _listener;
        private Thread _serverThread;
        private Reader _reader;
        private TextBox _txtLog;
        
        // Sync Objects
        private CaptureResult _captureResult;
        private AutoResetEvent _waitForCapture = new AutoResetEvent(false);

        public ServiceForm()
        {
            this.Text = "Fingerprint Service Bridge (Port 5000)";
            this.Size = new Size(600, 400);
            
            _txtLog = new TextBox();
            _txtLog.Multiline = true;
            _txtLog.ScrollBars = ScrollBars.Vertical;
            _txtLog.Dock = DockStyle.Fill;
            _txtLog.Font = new Font("Consolas", 10);
            _txtLog.ReadOnly = true;
            this.Controls.Add(_txtLog);

            this.Load += ServiceForm_Load;
            this.FormClosing += ServiceForm_FormClosing;
        }

        private void ServiceForm_Load(object sender, EventArgs e)
        {
            Log("=== SERVICE STARTING ===");
            
            if (!InitReader())
            {
                Log("WARNING: No Reader Found at startup.");
            }

            try {
                if (!HttpListener.IsSupported) throw new Exception("OS Not Supported");
                
                _listener = new HttpListener();
                _listener.Prefixes.Add("http://localhost:5000/");
                _listener.Start();
                Log("HTTP Server Listening on Port 5000");

                // Start Server Thread (Background)
                _serverThread = new Thread(ServerLoop);
                _serverThread.IsBackground = true;
                _serverThread.Start();
            } catch (Exception ex) {
                Log("CRITICAL ERROR: " + ex.Message);
            }
        }

        private void ServiceForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (_listener != null) _listener.Abort();
            CleanupReader();
        }

        private void Log(string msg)
        {
            if (this.InvokeRequired) this.Invoke(new MethodInvoker(() => Log(msg)));
            else _txtLog.AppendText("[" + DateTime.Now.ToString("HH:mm:ss") + "] " + msg + "\r\n");
        }

        // --- Reader Management ---
        // CATATAN: InitReader dan CleanupReader HANYA boleh dipanggil dari UI Thread
        // (via Invoke), sehingga tidak perlu lock di sini.
        private bool InitReader()
        {
            try {
                CleanupReader(); // Bersihkan reader lama dulu
                
                ReaderCollection rc = ReaderCollection.GetReaders();
                if (rc.Count > 0)
                {
                    _reader = rc[0];
                    Log("Reader Detected: " + _reader.Description.Name);
                    return true;
                }
                Log("Tidak ada Reader yang terdeteksi.");
            } catch (Exception ex) {
                Log("InitReader Gagal: " + ex.Message);
            }
            return false;
        }

        private void CleanupReader()
        {
            if (_reader != null)
            {
                try {
                    _reader.CancelCapture();
                    _reader.Dispose(); 
                } catch {}
                _reader = null;
                Log("Reader di-dispose.");
            }
        }

        // --- Server Loop (Background Thread) ---
        private void ServerLoop()
        {
            while (_listener.IsListening)
            {
                try {
                    var context = _listener.GetContext();
                    // Handle request in a threadpool thread so we can handle multiple (though we lock)
                    ThreadPool.QueueUserWorkItem(state => ProcessRequest(context));
                } catch {}
            }
        }

        private void ProcessRequest(HttpListenerContext context)
        {
            string respJson = "{}";
            string path = context.Request.Url.AbsolutePath.ToLower();
            
            // CORS Headers
            context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
            context.Response.Headers.Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");

            if (context.Request.HttpMethod == "OPTIONS") {
                context.Response.Close();
                return;
            }

            Log("Incoming Request: " + path);

            // Routing - TANPA lock (lock di sini menyebabkan deadlock dengan Invoke)
            try {
                if (path == "/capture" || path == "/enroll")
                {
                    respJson = PerformCapture();
                }
                else if (path == "/identify" || path == "/verify")
                {
                    using (StreamReader r = new StreamReader(context.Request.InputStream))
                    {
                        respJson = PerformVerification(r.ReadToEnd());
                    }
                }
                else
                {
                    context.Response.StatusCode = 404;
                    respJson = "{\"message\":\"Not Found\"}";
                }
            } catch (Exception ex) {
                Log("Error Processing: " + ex.Message);
                respJson = "{\"success\":false, \"message\":\"" + ex.Message + "\"}";
            }

            // Send Response
            try {
                byte[] buf = Encoding.UTF8.GetBytes(respJson);
                context.Response.ContentType = "application/json";
                context.Response.ContentLength64 = buf.Length;
                context.Response.OutputStream.Write(buf, 0, buf.Length);
                context.Response.Close();
            } catch {}
        }

        // --- BUSINESS LOGIC ---

        private string PerformCapture()
        {
            // 1. Trigger Capture on UI Thread
            Log("Starting Capture Sequence...");
            bool started = false;
            
            // Invoke ke UI Thread untuk Start Capture
            this.Invoke(new MethodInvoker(() => {
                started = StartCaptureOnUI();
            }));

            if (!started) return Serialize(new EnrollResponse { success = false, message = "Reader Init Failed" });

            // 2. Wait for Signal (Background Thread sleeping)
            // Wait up to 20 seconds
            if (_waitForCapture.WaitOne(20000)) 
            {
                Log("Capture Single Received!");
                // 3. Process Result
                if (_captureResult != null && _captureResult.ResultCode == Constants.ResultCode.DP_SUCCESS)
                {
                    var fmdRes = FeatureExtraction.CreateFmdFromFid(_captureResult.Data, Constants.Formats.Fmd.ANSI);
                    if (fmdRes.ResultCode == Constants.ResultCode.DP_SUCCESS)
                    {
                        string b64 = Convert.ToBase64String(fmdRes.Data.Bytes);
                        
                        // Image
                        string img64 = "";
                        try {
                            var v = _captureResult.Data.Views[0];
                            using(Bitmap bmp = CreateBitmap(v.RawImage, v.Width, v.Height)) {
                                using(MemoryStream ms = new MemoryStream()) {
                                    bmp.Save(ms, ImageFormat.Png);
                                    img64 = "data:image/png;base64," + Convert.ToBase64String(ms.ToArray());
                                }
                            }
                        } catch {}

                        return Serialize(new EnrollResponse { success=true, message="Success", fmd=b64, image=img64 });
                    }
                }
                return Serialize(new EnrollResponse { success=false, message="Extraction Failed or Bad Quality" });
            }
            else
            {
                Log("Capture Timeout (20s).");
                // Dispose Reader saat timeout agar bersih untuk request berikutnya
                this.Invoke(new MethodInvoker(() => CleanupReader()));
                return Serialize(new EnrollResponse { success = false, message = "Timeout waiting for finger" });
            }
        }

        private string PerformVerification(string body)
        {
            var req = Deserialize<VerifyRequest>(body);
            if(req == null) return Serialize(new VerifyResponse{ match=false, message="Invalid Body"});
            
            Log("Verifying with " + req.database.Count + " items waiting...");

             // 1. Trigger Capture on UI Thread
            bool started = false;
            this.Invoke(new MethodInvoker(() => {
                started = StartCaptureOnUI();
            }));

            if (!started) return Serialize(new VerifyResponse { match = false, message = "Reader Init Failed" });

            // 2. Wait
            if (_waitForCapture.WaitOne(20000))
            {
                 Log("Finger Received. Matching...");
                 if (_captureResult != null && _captureResult.ResultCode == Constants.ResultCode.DP_SUCCESS)
                 {
                     var fmdRes = FeatureExtraction.CreateFmdFromFid(_captureResult.Data, Constants.Formats.Fmd.ANSI);
                     if (fmdRes.ResultCode == Constants.ResultCode.DP_SUCCESS)
                     {
                         Fmd candidate = fmdRes.Data;
                         int bestScore = int.MaxValue;
                         string bestId = null;

                         foreach(var u in req.database) {
                             try {
                                 if(string.IsNullOrEmpty(u.fmd)) continue;
                                 var dbFmd = Importer.ImportFmd(Convert.FromBase64String(u.fmd), Constants.Formats.Fmd.ANSI, Constants.Formats.Fmd.ANSI).Data;

                                 // FIX: Using correct Comparison parameters. 
                                 // Usually Importer.ImportFmd creates FMD with one view.
                                 // Comparison takes FMD, view_index, FMD, view_index.
                                 // Ensure we are using view 0.
                                 var res = Comparison.Compare(candidate, 0, dbFmd, 0);
                                 
                                 // DPUruNet documentation says score 0 is perfect match.
                                 // Score < 21474 is high match.
                                 if (res.ResultCode == Constants.ResultCode.DP_SUCCESS && res.Score < bestScore) {
                                     bestScore = res.Score;
                                     bestId = u.id;
                                 }
                             } catch {}
                         }

                         Log("Best Score: " + bestScore);
                         if (bestScore < (0x7fffffff / 100000))
                            return Serialize(new VerifyResponse { match = true, user_id=bestId, message="Match Found" });
                         else
                            return Serialize(new VerifyResponse { match = false, message="No Match Found" });
                     }
                 }
                 return Serialize(new VerifyResponse { match = false, message="Bad Capture" });
            }
            else
            {
                Log("Timeout.");
                // Dispose Reader saat timeout agar bersih untuk request berikutnya
                this.Invoke(new MethodInvoker(() => CleanupReader()));
                return Serialize(new VerifyResponse { match = false, message = "Timeout" });
            }
        }

        // --- UI THREAD METHODS ---
        private bool StartCaptureOnUI()
        {
            // SELALU init reader baru di sini (segar setiap request)
            _captureResult = null;
            _waitForCapture.Reset();

            // Pastikan reader sebelumnya sudah dibuang
            CleanupReader();
            
            if (!InitReader()) return false;

            try {
                _reader.On_Captured += OnReaderCaptured;
                
                Constants.ResultCode openRes = _reader.Open(Constants.CapturePriority.DP_PRIORITY_EXCLUSIVE);
                if (openRes != Constants.ResultCode.DP_SUCCESS) {
                    Log("Open Reader Gagal: " + openRes);
                    CleanupReader();
                    return false;
                }
                
                _reader.CaptureAsync(Constants.Formats.Fid.ANSI, Constants.CaptureProcessing.DP_IMG_PROC_DEFAULT, _reader.Capabilities.Resolutions[0]);
                Log("Reader hidup. Silakan tempelkan jari.");
                return true;
            } catch (Exception ex) {
                Log("StartCapture Gagal: " + ex.Message);
                CleanupReader();
                return false;
            }
        }

        private void OnReaderCaptured(CaptureResult res)
        {
            // RUNS ON UI THREAD (Managed by SDK)
            Log("Event: OnCaptured Fired!");
            _captureResult = res;

            // KRITIS: Dispose reader segera setelah capture berhasil,
            // agar state Reader bersih untuk request berikutnya
            CleanupReader();

            // Beri sinyal ke background thread bahwa capture selesai
            _waitForCapture.Set();
        }

        // --- Helpers ---
        public static Bitmap CreateBitmap(byte[] bytes, int width, int height)
        {
            byte[] rgbBytes = new byte[width * height * 3];
            for (int i = 0; i <= bytes.Length - 1; i++) {
                rgbBytes[(i * 3)] = bytes[i]; rgbBytes[(i * 3) + 1] = bytes[i]; rgbBytes[(i * 3) + 2] = bytes[i];
            }
            Bitmap bmp = new Bitmap(width, height, PixelFormat.Format24bppRgb);
            BitmapData data = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.WriteOnly, PixelFormat.Format24bppRgb);
            System.Runtime.InteropServices.Marshal.Copy(rgbBytes, 0, data.Scan0, rgbBytes.Length);
            bmp.UnlockBits(data);
            return bmp;
        }

        static string Serialize(object obj) {
            using (MemoryStream ms = new MemoryStream()) {
                DataContractJsonSerializer ser = new DataContractJsonSerializer(obj.GetType());
                ser.WriteObject(ms, obj);
                return Encoding.UTF8.GetString(ms.ToArray());
            }
        }

        static T Deserialize<T>(string json) {
            using (MemoryStream ms = new MemoryStream(Encoding.UTF8.GetBytes(json))) {
                DataContractJsonSerializer ser = new DataContractJsonSerializer(typeof(T));
                return (T)ser.ReadObject(ms);
            }
        }
    }

    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new ServiceForm());
        }
    }
}
