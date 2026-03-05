using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
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
        [DataMember] public int best_score { get; set; }
    }

    // --- Main Form ---
    public class ServiceForm : Form
    {
        private HttpListener _listener;
        private Thread _serverThread;
        private Reader _reader;
        private TextBox _txtLog;

        // Sync Objects
        private CaptureResult _captureResult;
        private AutoResetEvent _waitForCapture = new AutoResetEvent(false);

        // ✅ CHANGED: Gate supaya tidak ada 2 request capture/verify barengan (reader bisa konflik)
        private static readonly SemaphoreSlim _requestGate = new SemaphoreSlim(1, 1);

        // ✅ CHANGED: Better constants
        private const int CAPTURE_TIMEOUT_MS = 12000;   // per attempt
        private const int CAPTURE_MAX_TRIES = 3;        // retry attempts
        private const int MATCH_THRESHOLD = 21474;      // umum dipakai di DP (score kecil = lebih cocok)

        public ServiceForm()
        {
            this.Text = "Fingerprint Service Bridge (Port 5000)";
            this.Size = new Size(700, 450);

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

            // Init reader sekali untuk info, tapi capture tetap init fresh per request
            if (!InitReader())
            {
                Log("WARNING: No Reader Found at startup.");
            }
            CleanupReader();

            try
            {
                if (!HttpListener.IsSupported) throw new Exception("OS Not Supported");

                _listener = new HttpListener();
                _listener.Prefixes.Add("http://localhost:5000/");
                _listener.Start();
                Log("HTTP Server Listening on Port 5000");

                _serverThread = new Thread(ServerLoop);
                _serverThread.IsBackground = true;
                _serverThread.Start();
            }
            catch (Exception ex)
            {
                Log("CRITICAL ERROR: " + ex.Message);
            }
        }

        private void ServiceForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            // [FIX] Ganti operator ?. dengan pengecekan manual
            try 
            { 
                if (_listener != null) 
                {
                    _listener.Abort(); 
                }
            } 
            catch { }
            this.Invoke(new MethodInvoker(() => CleanupReader()));
        }

        private void Log(string msg)
        {
            if (this.IsDisposed) return;

            if (this.InvokeRequired)
            {
                try { this.Invoke(new MethodInvoker(() => Log(msg))); } catch { }
            }
            else
            {
                _txtLog.AppendText("[" + DateTime.Now.ToString("HH:mm:ss") + "] " + msg + "\r\n");
            }
        }

        // --- Reader Management ---
        // CATATAN: InitReader dan CleanupReader dipanggil dari UI Thread (via Invoke)
        private bool InitReader()
        {
            try
            {
                CleanupReader();

                ReaderCollection rc = ReaderCollection.GetReaders();
                if (rc.Count > 0)
                {
                    _reader = rc[0];
                    Log("Reader Detected: " + _reader.Description.Name);
                    return true;
                }
                Log("Tidak ada Reader yang terdeteksi.");
            }
            catch (Exception ex)
            {
                Log("InitReader Gagal: " + ex.Message);
            }
            return false;
        }

        private void CleanupReader()
        {
            if (_reader != null)
            {
                try
                {
                    // ✅ CHANGED: lepas event handler biar tidak “nyangkut”
                    _reader.On_Captured -= OnReaderCaptured;
                }
                catch { }

                try
                {
                    _reader.CancelCapture();
                }
                catch { }

                try
                {
                    _reader.Dispose();
                }
                catch { }

                _reader = null;
                Log("Reader di-dispose.");
            }
        }

        // --- Server Loop ---
        private void ServerLoop()
        {
            while (_listener != null && _listener.IsListening)
            {
                try
                {
                    var context = _listener.GetContext();
                    ThreadPool.QueueUserWorkItem(state => ProcessRequest(context));
                }
                catch { }
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

            if (context.Request.HttpMethod == "OPTIONS")
            {
                context.Response.Close();
                return;
            }

            Log("Incoming Request: " + path);

            try
            {
                if (path == "/capture" || path == "/enroll")
                {
                    respJson = PerformCapture_Gated();
                }
                else if (path == "/identify" || path == "/verify")
                {
                    using (StreamReader r = new StreamReader(context.Request.InputStream))
                    {
                        respJson = PerformVerification_Gated(r.ReadToEnd());
                    }
                }
                else
                {
                    context.Response.StatusCode = 404;
                    respJson = "{\"message\":\"Not Found\"}";
                }
            }
            catch (Exception ex)
            {
                Log("Error Processing: " + ex.Message);
                respJson = "{\"success\":false, \"message\":\"" + EscapeJson(ex.Message) + "\"}";
            }

            try
            {
                byte[] buf = Encoding.UTF8.GetBytes(respJson);
                context.Response.ContentType = "application/json";
                context.Response.ContentLength64 = buf.Length;
                context.Response.OutputStream.Write(buf, 0, buf.Length);
                context.Response.Close();
            }
            catch { }
        }

        // ✅ CHANGED: Gate wrapper (biar gak ada 2 request sekaligus)
        private string PerformCapture_Gated()
        {
            _requestGate.Wait();
            try { return PerformCapture(); }
            finally { _requestGate.Release(); }
        }

        private string PerformVerification_Gated(string body)
        {
            _requestGate.Wait();
            try { return PerformVerification(body); }
            finally { _requestGate.Release(); }
        }

        // --- BUSINESS LOGIC ---

        // ✅ CHANGED: retry + pesan error jelas + timeout per attempt
        private string PerformCapture()
        {
            Log("Starting Capture Sequence...");

            for (int attempt = 1; attempt <= CAPTURE_MAX_TRIES; attempt++)
            {
                bool started = false;

                // Start capture di UI thread
                this.Invoke(new MethodInvoker(() =>
                {
                    started = StartCaptureOnUI();
                }));

                if (!started)
                {
                    return Serialize(new EnrollResponse
                    {
                        success = false,
                        message = "Reader Init/Open Failed"
                    });
                }

                Log("Waiting finger for verify... attempt " + attempt + "/" + CAPTURE_MAX_TRIES);

                if (_waitForCapture.WaitOne(CAPTURE_TIMEOUT_MS))
                {
                    if (_captureResult == null)
                    {
                        Log("CaptureResult null (unexpected). Retrying...");
                        continue;
                    }

                    if (_captureResult.ResultCode != Constants.ResultCode.DP_SUCCESS)
                    {
                        Log("Capture failed ResultCode: " + _captureResult.ResultCode);
                        // retry
                        continue;
                    }

                    var fmdRes = FeatureExtraction.CreateFmdFromFid(_captureResult.Data, Constants.Formats.Fmd.ANSI);
                    if (fmdRes.ResultCode != Constants.ResultCode.DP_SUCCESS || fmdRes.Data == null)
                    {
                        Log("FMD extraction failed: " + fmdRes.ResultCode);
                        // retry
                        continue;
                    }

                    string b64 = Convert.ToBase64String(fmdRes.Data.Bytes);

                    // Image (optional)
                    string img64 = "";
                    try
                    {
                        var v = _captureResult.Data.Views[0];
                        using (Bitmap bmp = CreateBitmap(v.RawImage, v.Width, v.Height))
                        using (MemoryStream ms = new MemoryStream())
                        {
                            bmp.Save(ms, ImageFormat.Png);
                            img64 = "data:image/png;base64," + Convert.ToBase64String(ms.ToArray());
                        }
                    }
                    catch (Exception ex)
                    {
                        Log("Image build error: " + ex.Message);
                    }

                    return Serialize(new EnrollResponse
                    {
                        success = true,
                        message = "Success (attempt " + attempt + "/" + CAPTURE_MAX_TRIES + ")",
                        fmd = b64,
                        image = img64
                    });
                }
                else
                {
                    Log("Capture timeout this attempt.");
                    // bersihin reader biar request berikutnya aman
                    this.Invoke(new MethodInvoker(() => CleanupReader()));
                    // retry
                }
            }

            return Serialize(new EnrollResponse
            {
                success = false,
                message = "Failed: bad quality / no finger after several attempts"
            });
        }

        // ✅ CHANGED: retry capture + threshold compare benar + best score dikirim
        private string PerformVerification(string body)
        {
            VerifyRequest req = DeserializeSafe<VerifyRequest>(body);
            if (req == null || req.database == null)
                return Serialize(new VerifyResponse { match = false, message = "Invalid JSON Body or Database is Null", best_score = int.MaxValue });

            Log("Verifying with " + req.database.Count + " records.");

            // 1. Capture Jari User (Proses Scan)
            // CaptureResult capScore = null;
            Fmd candidateFmd = null;

            // --- Mulai Capture ---
            bool captureSuccess = false;
            for (int attempt = 1; attempt <= CAPTURE_MAX_TRIES; attempt++)
            {
                bool started = false;
                this.Invoke(new MethodInvoker(() =>
                {
                    started = StartCaptureOnUI();
                }));

                if (!started)
                {
                    Log("Capture Attempt " + attempt + " failed to start reader.");
                    continue;
                }
                    // return Serialize(new VerifyResponse { match = false, message = "Reader Init/Open Failed", best_score = int.MaxValue });

                Log("Waiting finger for verify... attempt " + attempt + "/" + CAPTURE_MAX_TRIES);

                if (_waitForCapture.WaitOne(CAPTURE_TIMEOUT_MS))
                {
                    if (_captureResult != null && _captureResult.ResultCode == Constants.ResultCode.DP_SUCCESS)
                    {
                        var result = FeatureExtraction.CreateFmdFromFid(_captureResult.Data, Constants.Formats.Fmd.ANSI);
                        if (result.ResultCode == Constants.ResultCode.DP_SUCCESS && result.Data != null)
                        {
                            candidateFmd = result.Data;
                            captureSuccess = true;
                            // Reset Reader agar bersih
                            this.Invoke(new MethodInvoker(() => CleanupReader()));
                            break; 
                        }
                    }
                    else
                    {
                        Log("Capture result null or failed.");
                    }
                }
                else
                {
                    Log("Capture Timeout.");
                    this.Invoke(new MethodInvoker(() => CleanupReader()));
                }
            }

            if (!captureSuccess || candidateFmd == null)
            {
                return Serialize(new VerifyResponse { match = false, message = "Capture Failed or Timeout", best_score = int.MaxValue });
            }
            // --- Selesai Capture ---

            // if (candidate == null)
            //     return Serialize(new VerifyResponse { match = false, message = "Bad Capture / Timeout", best_score = int.MaxValue });

            // 2. Proses Pencocokan
            int bestScore = int.MaxValue;
            string bestId = null;
            int counter = 0;

            foreach (var u in req.database)
            {
                counter++;
                // Log debug per 100 record biar ga spam
                if (counter % 100 == 0) Log("Comparing record " + counter + "...");

                try
                {
                    // Validasi Level 1: Null Check
                    if (u == null) continue;
                    if (string.IsNullOrEmpty(u.id)) continue;
                    if (string.IsNullOrEmpty(u.fmd)) 
                    {
                        Log("Skip ID " + u.id + ": FMD string is empty/null");
                        continue;
                    }

                    // Validasi Level 2: Panjang String
                    if (u.fmd.Length < 50) 
                    {
                        Log("Skip ID " + u.id + ": FMD too short (" + u.fmd.Length + " chars)");
                        continue;
                    }

                    byte[] fmdBytes = null;
                    try 
                    {
                        fmdBytes = Convert.FromBase64String(u.fmd);
                    }
                    catch  (Exception b64Ex)
                    { 
                        // Jika bukan Base64 valid, skip aja jangan crash
                        Log("Skip ID " + u.id + ": Bad Base64 format. " + b64Ex.Message);
                        continue; 
                    }

                    if (fmdBytes == null || fmdBytes.Length == 0)
                    {
                        Log("Skip ID " + u.id + ": Byte array is empty after conversion.");
                        continue;
                    }

                    // Validasi Level 4: Import ke SDK DigitalPersona
                    // Disini biasanya error "not enough data" terjadi jika byte array rusak
                    DataResult<Fmd> importRes = Importer.ImportFmd(fmdBytes, Constants.Formats.Fmd.ANSI, Constants.Formats.Fmd.ANSI);

                    if (importRes.ResultCode != Constants.ResultCode.DP_SUCCESS)
                    {
                        // Jangan biarkan error SDK membunuh loop, log saja dan continue
                        Log("Skip ID " + u.id + ": ImportFmd Failed. Code: " + importRes.ResultCode);
                        continue;
                    }

                    if (importRes.Data == null)
                    {
                        continue;
                    }

                    // Validasi Level 5: Bandingkan!
                    // Parameter: (Fmd1, ViewIdx1, Fmd2, ViewIdx2)
                    CompareResult compareRes = Comparison.Compare(candidateFmd, 0, importRes.Data, 0);

                    if (compareRes.ResultCode != Constants.ResultCode.DP_SUCCESS)
                    {
                        Log("Skip ID " + u.id + ": Compare Error. Code: " + compareRes.ResultCode);
                        continue; 
                    }

                    // Simpan skor terbaik (makin kecil makin cocok)
                    if (compareRes.Score < bestScore)
                    {
                        bestScore = compareRes.Score;
                        bestId = u.id;
                        
                        // Optimasi: Jika skor = 0 (Match Sempurna), langsung break biar cepat
                        if (bestScore == 0) 
                        {
                            Log("Perfect match found for ID: " + bestId);
                            break;
                        }
                    }
                }
                catch(Exception ex)
                {
                    // INI PENTING: Tangkap error per-item supaya satu data rusak tidak merusak semua proses
                    string errId = (u != null && u.id != null) ? u.id : "Unknown";
                    Log("CRITICAL ERROR on ID " + errId + ": " + ex.Message);
                }
            }

            Log("Best Match Score: " + bestScore + " for User ID: " + (bestId ?? "None"));

            if (bestId != null && bestScore < MATCH_THRESHOLD)
            {
                return Serialize(new VerifyResponse
                {
                    match = true,
                    user_id = bestId,
                    message = "Match Found (Score: " + bestScore + ")",
                    best_score = bestScore
                });
            }

            return Serialize(new VerifyResponse
            {
                match = false,
                user_id = null,
                message = "No Match Found",
                best_score = bestScore
            });
        }

        // --- UI THREAD METHODS ---
        private bool StartCaptureOnUI()
        {
            // fresh every request
            _captureResult = null;
            _waitForCapture.Reset();

            CleanupReader();
            if (!InitReader()) return false;

            try
            {
                _reader.On_Captured += OnReaderCaptured;

                Constants.ResultCode openRes = _reader.Open(Constants.CapturePriority.DP_PRIORITY_EXCLUSIVE);
                if (openRes != Constants.ResultCode.DP_SUCCESS)
                {
                    Log("Open Reader Gagal: " + openRes);
                    CleanupReader();
                    return false;
                }

                // CaptureAsync
                _reader.CaptureAsync(
                    Constants.Formats.Fid.ANSI,
                    Constants.CaptureProcessing.DP_IMG_PROC_DEFAULT,
                    _reader.Capabilities.Resolutions[0]
                );

                Log("Reader siap. Silakan tempelkan jari.");
                return true;
            }
            catch (Exception ex)
            {
                Log("StartCapture Gagal: " + ex.Message);
                CleanupReader();
                return false;
            }
        }

        private void OnReaderCaptured(CaptureResult res)
        {
            // runs on UI thread
            Log("Event: OnCaptured Fired!");
            _captureResult = res;

            // cleanup immediately to avoid stuck state
            CleanupReader();

            _waitForCapture.Set();
        }

        // --- Helpers ---

        // ✅ CHANGED: FIX gambar “belok/serong” dengan copy per row pakai STRIDE
        public static Bitmap CreateBitmap(byte[] bytes, int width, int height)
        {
            // bytes: grayscale 8-bit
            byte[] rgbBytes = new byte[width * height * 3];
            for (int i = 0; i < bytes.Length; i++)
            {
                int o = i * 3;
                rgbBytes[o] = bytes[i];
                rgbBytes[o + 1] = bytes[i];
                rgbBytes[o + 2] = bytes[i];
            }

            Bitmap bmp = new Bitmap(width, height, PixelFormat.Format24bppRgb);
            BitmapData data = bmp.LockBits(
                new Rectangle(0, 0, width, height),
                ImageLockMode.WriteOnly,
                PixelFormat.Format24bppRgb
            );

            int bytesPerRow = width * 3;

            for (int y = 0; y < height; y++)
            {
                IntPtr dest = IntPtr.Add(data.Scan0, y * data.Stride);
                System.Runtime.InteropServices.Marshal.Copy(rgbBytes, y * bytesPerRow, dest, bytesPerRow);
            }

            bmp.UnlockBits(data);

            // Kalau ternyata kebalik atas-bawah, uncomment ini:
            // bmp.RotateFlip(RotateFlipType.RotateNoneFlipY);

            return bmp;
        }

        static string Serialize(object obj)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                DataContractJsonSerializer ser = new DataContractJsonSerializer(obj.GetType());
                ser.WriteObject(ms, obj);
                return Encoding.UTF8.GetString(ms.ToArray());
            }
        }

        // ✅ CHANGED: safer deserialize (biar gak nge-crash kalau body jelek)
        static T DeserializeSafe<T>(string json) where T : class
        {
            try
            {
                using (MemoryStream ms = new MemoryStream(Encoding.UTF8.GetBytes(json)))
                {
                    DataContractJsonSerializer ser = new DataContractJsonSerializer(typeof(T));
                    return ser.ReadObject(ms) as T;
                }
            }
            catch
            {
                return null;
            }
        }

        static string EscapeJson(string s)
        {
            if (string.IsNullOrEmpty(s)) return "";
            return s.Replace("\\", "\\\\").Replace("\"", "\\\"");
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