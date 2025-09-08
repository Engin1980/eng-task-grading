using EngTaskGradingNetBE.Middleware;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;



var builder = WebApplication.CreateBuilder(args);
BuildLogging(builder);
BuildServices(builder);
BuildSecurity(builder);
BuildCors(builder);

void BuildCors(WebApplicationBuilder builder)
{
  builder.Services.AddCors(options =>
  {
    options.AddPolicy("AllowFrontend", policy =>
    {
      policy.WithOrigins("http://localhost:5173") // tvoje FE adresa
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // pokud používáš cookie/token z Keycloak
    });
  });
}

BuildDb(builder);

Log.Information("Building main app");
var app = builder.Build();

InitDb(app);
app.UseMiddleware<GlobalExceptionHandler>(); // must be the first one
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

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
  builder.Services.Configure<TokenSettings>(
    builder.Configuration.GetSection(TokenSettings.SectionName));
  
  builder.Services.AddTransient<AppLogService>();
  builder.Services.AddTransient<AuthService>();
  builder.Services.AddTransient<TeacherService>();
  builder.Services.AddTransient<CourseService>();
  builder.Services.AddTransient<StudentService>();
  builder.Services.AddTransient<TaskService>();
  builder.Services.AddTransient<GradeService>();
  builder.Services.AddTransient<AttendanceService>();
  builder.Services.AddTransient<CloudflareTurnistilleService>();
  builder.Services.AddTransient<StudentViewService>();
  builder.Services.AddTransient<IEmailService, EmailService>();
  builder.Services.AddTransient<AppSettingsService>();
  builder.Services.AddSingleton<BackgroundTaskQueue>();
  builder.Services.AddHostedService<BackgroundTaskManagerService>();
  builder.Services.AddHttpClient<KeyCloakService>(); // http client for KeyCloakService
  builder.Services.AddTransient<KeyCloakService>();
  builder.Services.AddControllers();
}

static void BuildLogging(WebApplicationBuilder builder)
{
  Log.Logger = new LoggerConfiguration()
      .WriteTo.Console()
      .WriteTo.File("Logs/app.log", rollingInterval: RollingInterval.Day)
      //TODO remove following when DB is working
      .WriteTo.MSSqlServer(
          connectionString: builder.Configuration.GetConnectionString("DefaultConnection"),
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
  var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
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
  //db.Database.EnsureDeleted();
  //db.Database.EnsureCreated();
  db.Database.Migrate();
  Log.Information("Database migrated.");
}

static void BuildSecurity(WebApplicationBuilder builder)
{
  //TODO move to config
  var jwtKey = "SuperTajneHeslo12345";
  var key = Encoding.ASCII.GetBytes(jwtKey);

  //builder.Services
  //  .AddAuthentication(options =>
  //{
  //  options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
  //  options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
  //})
  //  .AddJwtBearer(options =>
  //{
  //  options.RequireHttpsMetadata = false; // v produkci = true
  //  options.SaveToken = true;
  //  options.TokenValidationParameters = new TokenValidationParameters
  //  {
  //    ValidateIssuer = false, // v produkci nastavit na true a dodat issuer
  //    ValidateAudience = false, // v produkci nastavit na true a dodat audience
  //    ValidateIssuerSigningKey = true,
  //    IssuerSigningKey = new SymmetricSecurityKey(key),
  //    ClockSkew = TimeSpan.Zero
  //  };
  //});

  builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
      options.Authority = "http://localhost:8080/realms/TaskGradingRealm";
      options.RequireHttpsMetadata = false; //TODO jen pro vývoj!
      options.Audience = "TaskGradingNetBE";
    });

  builder.Services
    .AddAuthorization();
}