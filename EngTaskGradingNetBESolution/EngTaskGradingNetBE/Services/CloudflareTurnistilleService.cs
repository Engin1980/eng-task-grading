using Microsoft.AspNetCore.Mvc;
using System.Net.Http;

namespace EngTaskGradingNetBE.Services
{
  public class CloudflareTurnistilleService(IConfiguration config, IHttpClientFactory httpClientFactory)
  {
    public record TurnstileResponse(
        bool Success,
        string Challenge_ts,
        string Hostname,
        string[] ErrorCodes
    );

    public async System.Threading.Tasks.Task VerifyAsync(string? token)
    {
      if (string.IsNullOrWhiteSpace(token))
        throw new Exceptions.CloudflareTurnistilleException($"Cloudflare Token is null or empty");


      string secret = config["CloudFlare:Turnstille:SecretKey"] // get from configuration
        ?? throw new ApplicationException("CloudFlare SecretKey not found in config.");
      var client = httpClientFactory.CreateClient();

      var values = new Dictionary<string, string>
            {
                { "secret", secret },
                { "response", token }
            };

      var response = await client.PostAsync(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          new FormUrlEncodedContent(values)
      );

      var data = await response.Content.ReadFromJsonAsync<TurnstileResponse>();

      if (!(data != null && data.Success))
        throw new Exceptions.CloudflareTurnistilleException(string.Join(",", data?.ErrorCodes ?? []));
    }
  }
}
