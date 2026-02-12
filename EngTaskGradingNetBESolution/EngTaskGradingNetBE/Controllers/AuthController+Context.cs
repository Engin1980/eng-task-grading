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
      private readonly Func<TeacherAuthService> teacherAuthServiceProvider;
      private readonly Func<StudentAuthService> studentAuthServiceProvider;
      private readonly Func<ILogger<AuthController>> loggerProvider;
      private readonly Func<StudentViewService> studentViewServiceProvider;

      public HttpContext HttpContext => httpContextProvider();
      public AppSettingsService AppSettingsService => appSettingsServiceProvider();
      public CloudflareTurnistilleService CloudflareTurnistilleService => cloudflareTurnistilleServiceProvider();
      public TeacherAuthService TeacherAuthService => teacherAuthServiceProvider();
      public StudentAuthService StudentAuthService => studentAuthServiceProvider();
      public ILogger<AuthController> Logger => loggerProvider();
      public StudentViewService StudentViewService => studentViewServiceProvider();
      public AuthControllerContext(
        Func<HttpContext> httpContextProvider,
        Func<AppSettingsService> appSettingsServiceProvider,
        Func<CloudflareTurnistilleService> cloudflareTurnistilleServiceProvider,
        Func<TeacherAuthService> teacherAuthServiceProvider,
        Func<StudentAuthService> studentAuthServiceProvider,
        Func<ILogger<AuthController>> loggerProvider,
        Func<StudentViewService> studentViewServiceProvider
        )
      {
        this.httpContextProvider = httpContextProvider;
        this.appSettingsServiceProvider = appSettingsServiceProvider;
        this.cloudflareTurnistilleServiceProvider = cloudflareTurnistilleServiceProvider;
        this.teacherAuthServiceProvider = teacherAuthServiceProvider;
        this.studentAuthServiceProvider = studentAuthServiceProvider;
        this.loggerProvider = loggerProvider;
        this.studentViewServiceProvider = studentViewServiceProvider;
      }
    }
  }
}
