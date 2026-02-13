using System;
using System.IO;
using System.Net;
using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using DPUruNet; // Namespace resmi DigitalPersona SDK .NET

// --- Struktur Data ---
[DataContract]
public class FingerprintRequest
{
    [DataMember(Name = "candidate")]
    public string Candidate { get; set; }

    [DataMember(Name = "database")]
    public List<UserFingerprint> Database { get; set; }
}

[DataContract]
public class UserFingerprint
{
    [DataMember(Name = "id")]
    public string Id { get; set; }

    [DataMember(Name = "fmd")]
    public string Fmd { get; set; }
}

class Program
{
    static void Main(string[] args)
    {
        if (!HttpListener.IsSupported)
        {
            Console.WriteLine("Windows XP SP2 or Server 2003 is required to use the HttpListener class.");
            return;
        }

        HttpListener listener = new HttpListener();
        listener.Prefixes.Add("http://localhost:5000/");
        
        try 
        {
            listener.Start();
            Console.WriteLine("=== MESIN ABSENSI (U.are.U SDK) SIAP PORT 5000 ===");
            Console.WriteLine("Menunggu scan jari...");
        }
        catch(Exception ex)
        {
            Console.WriteLine("Gagal start server: " + ex.Message);
            return;
        }

        while (listener.IsListening)
        {
            try {
                HttpListenerContext context = listener.GetContext();
                ProcessRequest(context);
            } catch (Exception ex) {
                Console.WriteLine("Error Server Loop: " + ex.Message);
            }
        }
    }

    static void ProcessRequest(HttpListenerContext context)
    {
        HttpListenerResponse response = context.Response;
        
        // CORS HEADERS (PENTING AGAR BISA DIAKSES BROWSER)
        response.Headers.Add("Access-Control-Allow-Origin", "*");
        response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");
        response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");

        // Handle Preflight Request (OPTIONS)
        if (context.Request.HttpMethod == "OPTIONS") {
            response.StatusCode = 200;
            response.Close();
            return;
        }

        if (context.Request.HttpMethod != "POST") {
            response.StatusCode = 405;
            response.Close(); 
            return;
        }

        string responseJson = "{\"match\":false, \"message\":\"No match found\"}";

        try
        {
            // Baca Body Request
            var serializer = new DataContractJsonSerializer(typeof(FingerprintRequest));
            FingerprintRequest requestData = (FingerprintRequest)serializer.ReadObject(context.Request.InputStream);
            
            Console.WriteLine("\n[+] Request diterima. Database size: " + (requestData.Database != null ? requestData.Database.Count : 0));
            // ---------------------------------------------------------
            // PERUBAHAN PENTING DISINI: BASE64 Handling
            // ---------------------------------------------------------
            
            // 1. Decode Candidate (Jari yang baru discan di browser)
            byte[] candidateBytes = Convert.FromBase64String(requestData.Candidate);

            // Konversi Candidate (Dari Browser/Scanner JS) ke FMD
            // Constants.Formats.Fmd.ANSI atau ISO tergantung settingan JS SDK Anda. Default biasanya Precom (DigitalPersona) atau ANSI.
            // Kita coba Convert Base64 ke FMD Object
            // Fmd fmdCandidate = Fmd.DeserializeXml(requestData.Candidate); // Jika format XML string


            // ATAU Jika format Base64 Raw:
            // byte[] candidateBytes = Convert.FromBase64String(requestData.Candidate);
            // Fmd fmdCandidate = Importer.ImportFmd(candidateBytes, Constants.Formats.Fmd.ANSI, Constants.Formats.Fmd.ANSI).Data;
            // Import Raw Data ke FMD Object. 
            // PENTING: Format input ANSI/ISO/Precom tergantung settingan JS SDK.
            // DigitalPersona Web SDK defaultnya biasanya Precom (DigitalPersona Format), tapi kita coba ANSI atau Precom.
            // Jika error Invalid Format, ganti Constants.Formats.Fmd.ANSI jadi .DigitalPersona
            // Fmd fmdCandidate = Importer.ImportFmd(candidateBytes, Constants.Formats.Fmd.ANSI, Constants.Formats.Fmd.ANSI).Data;
            Fmd fmdCandidate = Importer.ImportFmd(
                candidateBytes, 
                Constants.Formats.Fmd.DP_PRE_REGISTRATION, 
                Constants.Formats.Fmd.DP_PRE_REGISTRATION
            ).Data;
            bool isFound = false;
            int bestScore = int.MaxValue;
            string bestMatchId = "";

            if (requestData.Database != null) 
            {
                // Console.WriteLine("Mencocokkan dengan " + requestData.Database.Count + " data di DB...");

                foreach (var user in requestData.Database)
                {
                    try {
                        if (string.IsNullOrEmpty(user.Fmd)) continue;
                        // Decode FMD dari Database (Pastikan format penyimpanan konsisten)
                        // Fmd fmdDB = Fmd.DeserializeXml(user.Fmd); 
                        // ATAU Jika Raw Base64:
                        byte[] dbBytes = Convert.FromBase64String(user.Fmd);
                        Fmd fmdDB = Importer.ImportFmd(
                            dbBytes, 
                        Constants.Formats.Fmd.DP_PRE_REGISTRATION, 
                        Constants.Formats.Fmd.DP_PRE_REGISTRATION).Data;

                        // Lakukan Komparasi
                        CompareResult compareResult = Comparison.Compare(fmdCandidate, 0, fmdDB, 0);
                        
                        // Score 0 = Identical match. 
                        // PROBABILITY_ONE = 0x7FFFFFFF (2147483647). 
                        // Jika score < (PROBABILITY_ONE / 100000), ini hitungan kasar false positive rate.
                        // SDK biasanya menyarankan compareResult.Score < 2147 (example threshold)
                        // Console.WriteLine("> ID: " + user.Id + " | Score: " + compareResult.Score);
                        // Simpan score terbaik utk log
                        // if (compareResult.Score < bestScore) {
                        //     bestScore = compareResult.Score;
                        //     bestMatchId = user.Id;
                        // }
                        if (compareResult.Score > 2000000000) 
                        {
                            try {
                                Fmd fmdDB_Ansi = Importer.ImportFmd(
                                    dbBytes, 
                                    Constants.Formats.Fmd.ANSI, 
                                    Constants.Formats.Fmd.ANSI
                                ).Data;
                                compareResult = Comparison.Compare(fmdCandidate, 0, fmdDB_Ansi, 0);
                            } catch {}
                        }

                        Console.WriteLine("> ID: " + user.Id + " | Score: " + compareResult.Score);
                        
                        // Simpan score terbaik
                        if (compareResult.Score < bestScore) {
                            bestScore = compareResult.Score;
                            bestMatchId = user.Id;
                        }

                        if (compareResult.Score < 100000) // Threshold ini perlu disesuaikan scara eksperimental
                        { 
                            Console.WriteLine("[MATCH] FOUND ID: " + user.Id + " Score: " + compareResult.Score);
                            responseJson = "{\"match\":true, \"user_id\":\"" + user.Id + "\", \"message\":\"Success\"}";
                            isFound = true;
                            break;
                        }
                    } catch (Exception exdb) { 
                        // Skip data yang corrupt
                        Console.WriteLine("Skip user " + user.Id + ": " + exdb.Message);
                        continue; 
                    }
                }
            }

            if(!isFound) {
                 Console.WriteLine("[-] Tidak cocok. Best Score: " + bestScore + " (ID: " + bestMatchId + ")");
            }

        }
        catch (Exception ex)
        {
            Console.WriteLine("Error Matching Process: " + ex.Message);
            responseJson = "{\"match\":false, \"message\":\"Server Error: " + ex.Message + "\"}";
        }

        // Kirim Response
        byte[] buffer = Encoding.UTF8.GetBytes(responseJson);
        response.ContentType = "application/json";
        response.ContentLength64 = buffer.Length;
        response.OutputStream.Write(buffer, 0, buffer.Length);
        response.Close();
    }
}