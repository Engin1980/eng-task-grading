using EngTaskGradingNetBE.Models.Config;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;

namespace EngTaskGradingNetBE.Services
{
  public class CloudflareTurnistilleService(
    AppSettingsService appSettingsService, 
    IHttpClientFactory httpClientFactory)
  {
    public record TurnstileResponse(
        bool Success,
        string Challenge_ts,
        string Hostname,
        string[] ErrorCodes
    );

    public async System.Threading.Tasks.Task VerifyAsync(string? token)
    {
      AppSettings settings = appSettingsService.GetSettings();

      if (settings.CloudFlare.Enabled == false)
        throw new ApplicationException(typeof(CloudflareTurnistilleService).Name + " is disabled in config.");
      if (string.IsNullOrWhiteSpace(token))
        throw new Exceptions.CloudflareTurnistilleException($"Cloudflare Token is null or empty");

      string secret = appSettingsService.GetKey("CloudFlare:Turnstille:SecretKey")
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
