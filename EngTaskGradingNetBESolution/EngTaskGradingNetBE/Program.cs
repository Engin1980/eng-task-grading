using EngTaskGradingNetBE.Middleware;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;
using System.Diagnostics;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using EngTaskGradingNetBE.Exceptions;



var builder = WebApplication.CreateBuilder(args);
BuildLogging(builder);
BuildServices(builder);
BuildSecurity(builder);
BuildCors(builder);

void BuildCors(WebApplicationBuilder builder)
{
  builder.Services.AddCors(options =>
  {
    string feUrl = builder.Configuration["AppSettings:FrontEndUrl"] ?? throw new ApplicationException("Front-end URL not set.");
    options.AddPolicy("AllowFrontend", policy =>
    {
      policy.WithOrigins(feUrl)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
  });
}

BuildDb(builder);

Log.Information("Building main app");
var app = builder.Build();

InitDb(app);

app.UseMiddleware<GlobalExceptionHandler>(); // must be the first one
app.UseHttpsRedirection();
app.UseCors("AllowFrontend"); // must be before authen-to
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", context =>
{
  context.Response.Redirect("/api/v1/applog");
  return System.Threading.Tasks.Task.CompletedTask;
});

Log.Information("Starting main app");

app.Run();

static void BuildServices(WebApplicationBuilder builder)
{
  // Configure settings
  builder.Services.AddHttpClient();
  builder.Services.AddTransient<AppSettingsService>();
  builder.Services.AddTransient<AppLogService>();
  builder.Services.AddTransient<IEmailService, EmailService>();
  builder.Services.AddTransient<TeacherService>();
  builder.Services.AddTransient<CourseService>();
  builder.Services.AddTransient<StudentService>();
  builder.Services.AddTransient<TaskService>();
  builder.Services.AddTransient<GradeService>();
  builder.Services.AddTransient<AttendanceService>();
  builder.Services.AddTransient<CloudflareTurnistilleService>();
  builder.Services.AddTransient<StudentViewService>();
  builder.Services.AddTransient<AuthService>();

  builder.Services.AddSingleton<BackgroundTaskQueue>();
  builder.Services.AddHostedService<BackgroundTaskManagerService>();
  builder.Services.AddControllers();
}

static string GetConnectionString(WebApplicationBuilder builder)
{
  string DB_ENV_KEY = "DB_PASSWORD";
  string DB_ENV_KEY_REF = "{" + DB_ENV_KEY + "}";
  string cs = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new ApplicationException("Default connection not found in app properties.");
  string pass = Environment.GetEnvironmentVariable(DB_ENV_KEY) ?? throw new ApplicationException("DB_PASSWORD not found in environmental variables.");
  string ret = cs.Replace(DB_ENV_KEY_REF, pass);
  return ret;
}

static void BuildLogging(WebApplicationBuilder builder)
{
  Log.Logger = new LoggerConfiguration()
      .WriteTo.Console()
      .WriteTo.File("Logs/app.log", rollingInterval: RollingInterval.Day)
      //TODO remove following when DB is working
      .WriteTo.MSSqlServer(
          connectionString: GetConnectionString(builder),
          sinkOptions: new Serilog.Sinks.MSSqlServer.MSSqlServerSinkOptions
          {
            TableName = "AppLog",
            AutoCreateSqlTable = false
          }
      )
      .CreateLogger();

  builder.Host.UseSerilog();
}

static void BuildDb(WebApplicationBuilder builder)
{
  // Add DbContext
  var connectionString = GetConnectionString(builder);
  if (string.IsNullOrEmpty(connectionString))
  {
    Log.Fatal("No connection string found");
    throw new InvalidOperationException("No connection string found");
  }
  builder.Services.AddDbContext<AppDbContext>(options =>
      options.UseSqlServer(connectionString));
}

static void InitDb(WebApplication app)
{
  using var scope = app.Services.CreateScope();
  using var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
  db.Database.Migrate();
  Log.Information("Database migrated.");
}

static void BuildSecurity(WebApplicationBuilder builder)
{
  var jwtKey = builder.Configuration["AppSettings:Security:AccessTokenJwtSecretKey"] ?? throw new ApplicationException("JWT secret not set.");
  var key = Encoding.ASCII.GetBytes(jwtKey);

  builder.Services.AddAuthentication(options =>
  {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
  })
    .AddJwtBearer(options =>
  {
    options.RequireHttpsMetadata = false; // v produkci = true
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
      ValidateIssuer = false, // v produkci nastavit na true a dodat issuer
      ValidateAudience = false, // v produkci nastavit na true a dodat audience
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = new SymmetricSecurityKey(key),
      ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
      OnAuthenticationFailed = ctx =>
      {
        Console.WriteLine("Chyba JWT: " + ctx.Exception);
        return System.Threading.Tasks.Task.CompletedTask;
      }
    };
    //options.Events = new JwtBearerEvents
    //{
    //  OnAuthenticationFailed = context =>
    //  {
    //    if (context.Exception is SecurityTokenExpiredException)
    //    {
    //      context.NoResult();
    //      context.Response.StatusCode = StatusCodes.Status401Unauthorized;
    //      context.Response.ContentType = "application/json";
    //      return context.Response.WriteAsync("{\"error\":\"Token expired\"}");
    //    }

    //    return System.Threading.Tasks.Task.CompletedTask;
    //  }
    //};
  });

  // demo pro Keycloak, ale tady v projektu se nepoužívá:
  //builder.Services.AddAuthentication("Bearer")
  //  .AddJwtBearer("Bearer", options =>
  //  {
  //    options.Authority = "http://localhost:8080/realms/TaskGradingRealm";
  //    options.RequireHttpsMetadata = false; //TODO jen pro vývoj!
  //    options.Audience = "TaskGradingNetBE";
  //  });

  builder.Services.AddAuthorization();
}