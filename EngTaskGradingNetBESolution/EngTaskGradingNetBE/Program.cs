using EngTaskGradingNetBE.Middleware;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Sinks.MSSqlServer;
using System.Collections.ObjectModel;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
BuildLogging(builder);
BuildServices(builder);
BuildSecurity(builder);
BuildCors(builder);
BuildDb(builder);

Log.Information("Building main app at " + DateTime.UtcNow + " UTC");
var app = builder.Build();

Log.Information("Initializing database");
InitDb(app);
UpdateLogging(builder);
Log.Debug("Database initialized");

Log.Information("Configuring request pipeline.");
app.UseMiddleware<GlobalExceptionHandler>(); // must be the first one
app.UseHttpsRedirection();
app.UseCors("AllowFrontend"); // must be before authen-autho
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

string feUrl = builder.Configuration["AppSettings:FrontEndUrl"]!;
app.MapGet("/", () => $"Alive! Go to '{feUrl}'.");

Log.Information("Starting main app");

app.Run();

void BuildCors(WebApplicationBuilder builder)
{
  builder.Services.AddCors(options =>
  {
    string feUrl = builder.Configuration["AppSettings:FrontEndUrl"] ?? throw new ApplicationException("Front-end URL not set.");
    Log.Information("Front-end URL for CORS: {feUrl}", feUrl);
    options.AddPolicy("AllowFrontend", policy =>
    {
      policy.WithOrigins(feUrl)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
  });
}

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

  builder.Services.AddTransient<DatabaseBackupService>();
  builder.Services.AddHostedService<DatabaseBackupHostedService>();

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

  // log CS securely
  var csBuilder = new SqlConnectionStringBuilder(cs)
  {
    Password = "*****"
  };
  Log.Information("Connection string obtained as " + csBuilder.ConnectionString);
  return ret;
}


static LoggerConfiguration CreateLoggerConfiguration(WebApplicationBuilder builder, bool addDb)
{
  string outputTemplate = "[{Timestamp:HH:mm:ss} {Level:u3}] ({SourceContext:l}) {Message:lj}{NewLine}{Exception}";
  var ret = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console(outputTemplate: outputTemplate)
    .WriteTo.File("logs/app.log", rollingInterval: RollingInterval.Day, outputTemplate: outputTemplate);
  if (addDb)
  {
    var columnOptions = new Serilog.Sinks.MSSqlServer.ColumnOptions();
    columnOptions.AdditionalColumns = new Collection<SqlColumn>
    {
      new SqlColumn
      {
        ColumnName = "SourceContext",
        DataType = System.Data.SqlDbType.NVarChar,
        DataLength = -1,
        AllowNull = true
      }
    };
    ret = ret.WriteTo.MSSqlServer(
          connectionString: GetConnectionString(builder),
          sinkOptions: new Serilog.Sinks.MSSqlServer.MSSqlServerSinkOptions
          {
            TableName = "AppLog",
            AutoCreateSqlTable = false
          },
          columnOptions: columnOptions
      );
  }

  return ret;
}

static void BuildLogging(WebApplicationBuilder builder)
{
  Log.Logger = CreateLoggerConfiguration(builder, addDb: false)
      .CreateLogger();

  builder.Host.UseSerilog();

  Log.Information("Logging initialized.");
}

static void UpdateLogging(WebApplicationBuilder builder)
{
  Log.CloseAndFlush();
  Log.Logger = CreateLoggerConfiguration(builder, addDb: true)
      .CreateLogger();
  Log.Information("Logging updated to use database sink.");
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
  Log.Debug("Using connection string: {connectionString}", connectionString);
  builder.Services.AddDbContext<AppDbContext>(options =>
      options.UseSqlServer(connectionString));
}

static void InitDb(WebApplication app)
{
  try
  {
    Log.Debug("Creating service scope...");
    using var scope = app.Services.CreateScope();
    Log.Debug("Obtaining AppDbContext...");
    using var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    Log.Information("Database migrated.");
  }
  catch (Exception ex)
  {
    Log.Fatal(ex, "Database initialization failed.");
    throw;
  }
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
    options.RequireHttpsMetadata = true;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
      ValidateIssuer = false,
      ValidateAudience = false,
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
  });

  builder.Services.AddAuthorization();
}

