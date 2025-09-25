using System.Security.Cryptography;

namespace EngTaskGradingNetBE.Lib
{
  public static class SecurityUtils
  {
    public static string GenerateSecureToken(int length)
    {
      byte[] tokenBytes = new byte[length];
      using (var rng = RandomNumberGenerator.Create())
      {
        rng.GetBytes(tokenBytes);
      }

      // Convert to Base64 and make URL-safe by replacing problematic characters
      return Convert.ToBase64String(tokenBytes)
        .Replace('+', '-')
        .Replace('/', '_')
        .TrimEnd('=');
    }
  }
}
