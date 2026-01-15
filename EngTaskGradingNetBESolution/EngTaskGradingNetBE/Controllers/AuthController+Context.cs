using EngTaskGradingNetBE.Services;

namespace EngTaskGradingNetBE.Controllers
{
  public partial class AuthController
  {
    public class AuthControllerContext
    {
      private readonly Func<HttpContext> httpContextProvider;
      private readonly Func<AppSettingsService> appSettingsServiceProvider;
      private readonly Func<CloudflareTurnistilleService> cloudflareTurnistilleServiceProvider;
      private readonly Func<AuthService> authServiceProvider;
      private readonly Func<ILogger<AuthController>> loggerProvider;
      private readonly Func<StudentViewService> studentViewServiceProvider;

      public HttpContext HttpContext => httpContextProvider();
      public AppSettingsService AppSettingsService => appSettingsServiceProvider();
      public CloudflareTurnistilleService CloudflareTurnistilleService => cloudflareTurnistilleServiceProvider();
      public AuthService AuthService => authServiceProvider();
      public ILogger<AuthController> Logger => loggerProvider();
      public StudentViewService StudentViewService => studentViewServiceProvider();
      public AuthControllerContext(
        Func<HttpContext> httpContextProvider,
        Func<AppSettingsService> appSettingsServiceProvider,
        Func<CloudflareTurnistilleService> cloudflareTurnistilleServiceProvider,
        Func<AuthService> authServiceProvider,
        Func<ILogger<AuthController>> loggerProvider,
        Func<StudentViewService> studentViewServiceProvider
        )
      {
        this.httpContextProvider = httpContextProvider;
        this.appSettingsServiceProvider = appSettingsServiceProvider;
        this.cloudflareTurnistilleServiceProvider = cloudflareTurnistilleServiceProvider;
        this.authServiceProvider = authServiceProvider;
        this.loggerProvider = loggerProvider;
        this.studentViewServiceProvider = studentViewServiceProvider;
      }
    }
  }
}
