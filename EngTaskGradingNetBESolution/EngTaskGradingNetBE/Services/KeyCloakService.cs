using EngTaskGradingNetBE.Exceptions;
using Newtonsoft.Json;
using Serilog.Core;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using static System.Net.WebRequestMethods;

namespace EngTaskGradingNetBE.Services
{
  public class KeyCloakService(HttpClient http, ILogger<KeyCloakService> logger)
  {
    private const string KEYCLOAK_URL = "http://keycloak:8080";
    private const string APP_REALM = "TaskGradingRealm";
    private const string MASTER_REALM = "master";
    private const string CLIENT_ID = "admin-cli";
    private const string CLIENT_SECRET = "IcJ8IvMeYsCp7iBSOJARgz96M9mRin1c";

    public class KeycloakTokenResponse
    {
      public string Access_Token { get; set; } = "";
      public int Expires_In { get; set; }
      public int Refresh_Expires_In { get; set; }
      public string Refresh_Token { get; set; } = "";
      public string Token_Type { get; set; } = "";
      public string Id_Token { get; set; } = "";
      public string Scope { get; set; } = "";
    }

    public async Task<string> GetAdminTokenAsync()
    {
      var content = new FormUrlEncodedContent(new[]
      {
            new KeyValuePair<string,string>("client_id", "admin-cli"),
            new KeyValuePair<string,string>("username", "sa"),
            new KeyValuePair<string,string>("password", "Bublinka#1"),
            new KeyValuePair<string,string>("grant_type", "password"),
        });

      var response = await http.PostAsync(
        $"{KEYCLOAK_URL}/realms/{MASTER_REALM}/protocol/openid-connect/token", content);
      response.EnsureSuccessStatusCode();

      using var stream = await response.Content.ReadAsStreamAsync();
      var doc = await System.Text.Json.JsonDocument.ParseAsync(stream);
      return doc.RootElement.GetProperty("access_token").GetString()!;
    }

    public async Task<string> CreateUserAsync(string token, int userId, string username, string email, string password)
    {
      // 1. vytvořit uživatele
      var user = new
      {
        username,
        email,
        emailVerified = true,
        enabled = true,
        firstName = string.Empty,
        lastName = string.Empty,
        credentials = new[]
        {
          new
          {
            type = "password",
            value = password,
            temporary = false
          }
        }
      };

      http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

      var json = System.Text.Json.JsonSerializer.Serialize(user);
      var content = new StringContent(json, Encoding.UTF8, "application/json");
      //request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

      var response = await http.PostAsync(
        $"{KEYCLOAK_URL}/admin/realms/{APP_REALM}/users",
        content);
      response.EnsureSuccessStatusCode();

      string id;
      try
      {
        var location = response.Headers.Location?.ToString();
        id = location!.Substring(location.LastIndexOf('/') + 1);
      }
      catch (Exception ex)
      {
        logger.LogError(ex, "Failed to extract user ID from Keycloak response.");
        throw new Exception("Failed to extract user ID from Keycloak response.", ex);
      }

      return id;
    }

    public async Task SetUserAdminFlagAsync(string token, int userId, bool isAdmin)
    {
      http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

      // 1) Get the 'admin' role representation
      var roleResponse = await http.GetAsync($"{KEYCLOAK_URL}/admin/realms/{APP_REALM}/roles/admin");
      roleResponse.EnsureSuccessStatusCode();
      var roleJson = await roleResponse.Content.ReadAsStringAsync();
      var roleObj = JsonConvert.DeserializeObject(roleJson);

      // 2) Build role array for assignment/removal
      var roles = new[] { roleObj };
      var content = new StringContent(JsonConvert.SerializeObject(roles), Encoding.UTF8, "application/json");

      if (isAdmin)
      {
        // Assign role
        var assignResponse = await http.PostAsync(
            $"{KEYCLOAK_URL}/admin/realms/{APP_REALM}/users/{userId}/role-mappings/realm",
            content);
        assignResponse.EnsureSuccessStatusCode();
      }
      else
      {
        // Remove role
        var removeResponse = await http.DeleteAsync(
          $"{KEYCLOAK_URL}/admin/realms/{APP_REALM}/users/{userId}/role-mappings/realm",
          content);
        removeResponse.EnsureSuccessStatusCode();
      }
    }

    internal async Task<KeycloakTokenResponse> LoginUserAsync(string token, string email, string password)
    {
      var tokenEndpoint = $"{KEYCLOAK_URL}/realms/{APP_REALM}/protocol/openid-connect/token";

      var content = new FormUrlEncodedContent(
      [
            new KeyValuePair<string, string>("grant_type", "password"),
            new KeyValuePair<string, string>("client_id", CLIENT_ID),
            new KeyValuePair<string, string>("client_secret", CLIENT_SECRET),
            new KeyValuePair<string, string>("username", email),
            new KeyValuePair<string, string>("password", password),
        ]);

      var response = await http.PostAsync(tokenEndpoint, content);

      if (!response.IsSuccessStatusCode)
      {
        var error = await response.Content.ReadAsStringAsync();
        throw new Exception($"Keycloak login failed: {response.StatusCode} - {error}");
      }

      string json = await response.Content.ReadAsStringAsync() ?? throw new UnexpectedNullException();
      KeycloakTokenResponse ret = System.Text.Json.JsonSerializer.Deserialize<KeycloakTokenResponse>(json) ?? throw new UnexpectedNullException();
      return ret;
    }
  }
}
