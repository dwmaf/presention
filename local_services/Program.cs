using System;
using System.IO;
using System.Net;
using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using DPUruNet; 

// --- Struktur Data ---
[DataContract]
public class FingerprintRequest
{
    [DataMember] public string candidate { get; set; }
    [DataMember] public List<UserFingerprint> database { get; set; }
}

[DataContract]
public class UserFingerprint
{
    [DataMember] public string id { get; set; }
    [DataMember] public string fmd { get; set; }
}

[DataContract]
public class ResponseData
{
    [DataMember] public bool match { get; set; }
    [DataMember] public string user_id { get; set; }
    [DataMember] public string message { get; set; }
}

class Program
{
    static void Main(string[] args)
    {
        HttpListener listener = new HttpListener();
        listener.Prefixes.Add("http://localhost:5000/");
        listener.Start();
        Console.WriteLine("=== MESIN ABSENSI (U.are.U SDK) SIAP PORT 5000 ===");

        while (true)
        {
            try {
                HttpListenerContext context = listener.GetContext();
                ProcessRequest(context);
            } catch (Exception ex) {
                // Ganti string interpolation dengan penggabungan string biasa
                Console.WriteLine("Error Server: " + ex.Message);
            }
        }
    }

    static void ProcessRequest(HttpListenerContext context)
    {
        HttpListenerResponse response = context.Response;
        
        response.Headers.Add("Access-Control-Allow-Origin", "*");
        response.Headers.Add("Access-Control-Allow-Methods", "POST");

        if (context.Request.HttpMethod != "POST") {
            response.Close(); return;
        }

        string responseJson = "{\"match\":false}";

        try
        {
            var serializer = new DataContractJsonSerializer(typeof(FingerprintRequest));
            FingerprintRequest data = (FingerprintRequest)serializer.ReadObject(context.Request.InputStream);
            
            // REVISI C# 5: Pakai concantenation (+)
            Console.WriteLine("\nMenerima " + data.database.Count + " data. Sedang mencocokkan...");

            byte[] candidateBytes = Convert.FromBase64String(data.candidate);
            
            // Asumsi format ANSI. Kalau error ganti ISO.
            Fmd fmdCandidate = Importer.ImportFmd(candidateBytes, Constants.Formats.Fmd.ANSI, Constants.Formats.Fmd.ANSI).Data;

            foreach (var user in data.database)
            {
                try {
                    byte[] dbBytes = Convert.FromBase64String(user.fmd);
                    Fmd fmdDB = Importer.ImportFmd(dbBytes, Constants.Formats.Fmd.ANSI, Constants.Formats.Fmd.ANSI).Data;

                    CompareResult compareResult = Comparison.Compare(fmdCandidate, 0, fmdDB, 0);
                    
                    // Score 0 = Identik. Di bawah 2000 biasanya mirip banget.
                    if (compareResult.Score < 2000) 
                    { 
                        // REVISI C# 5
                        Console.WriteLine("[MATCH] USER DITEMUKAN: " + user.id);
                        
                        // JSON Manual String
                        responseJson = "{\"match\":true, \"user_id\":\"" + user.id + "\", \"message\":\"Success\"}";
                        break;
                    }
                } catch { 
                    continue; 
                }
            }
        }
        catch (Exception ex)
        {
            // REVISI C# 5
            Console.WriteLine("Error Matching: " + ex.Message);
            responseJson = "{\"match\":false, \"message\":\"" + ex.Message + "\"}";
        }

        byte[] buffer = Encoding.UTF8.GetBytes(responseJson);
        response.ContentLength64 = buffer.Length;
        response.OutputStream.Write(buffer, 0, buffer.Length);
        response.Close();
    }
}