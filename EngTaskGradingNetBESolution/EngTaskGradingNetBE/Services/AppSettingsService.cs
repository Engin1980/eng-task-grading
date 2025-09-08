using EngTaskGradingNetBE.Models.Config;

namespace EngTaskGradingNetBE.Services;

public class AppSettingsService(IConfiguration config)
{
  private readonly AppSettings settings = config.GetSection("AppSettings").Get<AppSettings>()
      ?? throw new ApplicationException("AppSettings not found in config.");

  public AppSettings GetSettings() => settings;

  public string GetKey(string key) => config[key] ?? throw new ApplicationException($"AppSettings key '{key}' not found in config.");
}
