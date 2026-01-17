namespace EngTaskGradingNetBE.Exceptions.Server.CloudflareTurnistille;

internal class CloudflareTurnistilleVerifyException(string[] errorCodes)
  : CloudflareTurnistilleException("Cloudflare Turnistille verification failed. Codes: " + string.Join(",", errorCodes))
{
  public string[] ErrorCodes { get; init; } = errorCodes;
}