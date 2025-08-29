using System.Runtime.CompilerServices;

namespace EngTaskGradingNetBE
{
  public static class Extensions
  {
    public async static Task<HttpResponseMessage> DeleteAsync(this HttpClient http, string url, HttpContent? content)
    {
      var removeRequest = new HttpRequestMessage(HttpMethod.Delete, url)
      {
        Content = content
      };
      return await http.SendAsync(removeRequest);
    }

    public static string GetMessagesRecursively(this Exception ex)
    {
      if (ex == null) return string.Empty;
      if (ex.InnerException == null) return ex.Message;
      return ex.Message + " --> " + GetMessagesRecursively(ex.InnerException);
    }
  }
}
