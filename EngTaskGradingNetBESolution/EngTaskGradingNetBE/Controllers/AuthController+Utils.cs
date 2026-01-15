using Microsoft.AspNetCore.Http;

namespace EngTaskGradingNetBE.Controllers
{
  public partial class AuthController
  {
    internal static class Utils
    {
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
