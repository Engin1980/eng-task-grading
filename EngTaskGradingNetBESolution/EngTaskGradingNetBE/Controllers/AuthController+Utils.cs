using Microsoft.AspNetCore.Http;

namespace EngTaskGradingNetBE.Controllers
{
  public partial class AuthController
  {
    private const string DELETE_ON_SESSION_END_PREFIX = "!-!";

    internal static class Utils
    {
      internal static string ExpandRefreshToken(string token, bool isSessionOnly)
      {
        return isSessionOnly ? DELETE_ON_SESSION_END_PREFIX + token : token;
      }

      internal static string ShrinkRefreshToken(string token, out bool isSesionOnly)
      {
        isSesionOnly = token.StartsWith(DELETE_ON_SESSION_END_PREFIX);
        return isSesionOnly ? token[DELETE_ON_SESSION_END_PREFIX.Length..] : token;
      }

      private static CookieOptions BuildTokenCookieOptions(bool useHttps, DateTime? expirationUtcDateTime) => new()
      {
        HttpOnly = true,
        SameSite = SameSiteMode.Lax,
        Secure = useHttps,
        Expires = expirationUtcDateTime
      };

      internal static void DeleteRefreshToken(HttpContext httpContext, string tokenName, bool useHttps)
      {
        CookieOptions opts = BuildTokenCookieOptions(useHttps, DateTime.Now.AddDays(-10));
        httpContext.Response.Cookies.Append(tokenName, "-to-delete-", opts);
      }

      public static void SetRefreshToken(HttpContext httpContext, string tokenName, string refreshToken, bool useHttps, DateTime? expiresAt)
      {
        CookieOptions opts = BuildTokenCookieOptions(useHttps, expiresAt);
        httpContext.Response.Cookies.Append(tokenName, refreshToken, opts);
      }
    }
  }
}
