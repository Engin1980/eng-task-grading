using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class TurnstileController(
    IConfiguration config, IHttpClientFactory httpClientFactory) : ControllerBase
  {
    [HttpPost("verify")]
    public async Task<IActionResult> Verify([FromBody] TurnstileRequest request)
    {
      if (request == null || string.IsNullOrWhiteSpace(request.Token))
        return BadRequest(new { ok = false, error = "Missing token" });

      string secret = config["CloudFlare:Turnstille:SecretKey"]
        ?? throw new ApplicationException("CloudFlare SecretKey not found in config.");
      var client = httpClientFactory.CreateClient();

      var values = new Dictionary<string, string>
            {
                { "secret", secret },
                { "response", request.Token }
            };

      var response = await client.PostAsync(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          new FormUrlEncodedContent(values)
      );

      var data = await response.Content.ReadFromJsonAsync<TurnstileResponse>();

      if (data != null && data.Success)
        return Ok(new { ok = true });
      else
        return BadRequest(new { ok = false, errors = data?.ErrorCodes });
    }
  }

  public record TurnstileRequest(string Token);

  public record TurnstileResponse(
      bool Success,
      string Challenge_ts,
      string Hostname,
      string[] ErrorCodes
  );
}
