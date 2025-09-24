//using EngTaskGradingNetBE.Exceptions;
//using Newtonsoft.Json;
//using Serilog.Core;
//using System.Net.Http;
//using System.Net.Http.Headers;
//using System.Text;
//using static System.Net.WebRequestMethods;

//namespace EngTaskGradingNetBE.Services
//{
//  public class KeycloakService(HttpClient http, AppSettingsService appSettingsService, ILogger<KeycloakService> logger)
//  {
//    private readonly string url = appSettingsService.GetSettings().Keycloak.BaseUrl;
//    private readonly string appRealm = appSettingsService.GetSettings().Keycloak.Realm;
//    private readonly string adminClientId = appSettingsService.GetSettings().Keycloak.AdminClientId;
//    private readonly string adminClientSecret = appSettingsService.GetSettings().Keycloak.AdminClientSecret;
//    private readonly string userClientId = appSettingsService.GetSettings().Keycloak.UserClientId;

//    public class KeycloakTokenResponse
//    {
//      public string Access_Token { get; set; } = "";
//      public int Expires_In { get; set; }
//      public int Refresh_Expires_In { get; set; }
//      public string Refresh_Token { get; set; } = "";
//      public string Token_Type { get; set; } = "";
//      public string Id_Token { get; set; } = "";
//      public string Scope { get; set; } = "";
//    }

//    public record KeycloakRole(string Id, string Name, string Description);

//    public async Task<string> GetAdminTokenAsync()
//    {
//      var content = new FormUrlEncodedContent(new[]
//      {
//        new KeyValuePair<string,string>("client_id", this.adminClientId),
//        new KeyValuePair<string,string>("client_secret", this.adminClientSecret),
//        new KeyValuePair<string,string>("grant_type", "client_credentials"),
//      });

//      var response = await http.PostAsync(
//        $"{url}/realms/{appRealm}/protocol/openid-connect/token", content);
//      response.EnsureSuccessStatusCode();

//      using var stream = await response.Content.ReadAsStreamAsync();
//      var doc = await System.Text.Json.JsonDocument.ParseAsync(stream);
//      return doc.RootElement.GetProperty("access_token").GetString()!;
//    }

//    public async Task<string> CreateUserAsync(int userId, string username, string email, string password)
//    {
//      // 1. vytvořit uživatele
//      var user = new
//      {
//        username,
//        email,
//        emailVerified = true,
//        enabled = true,
//        credentials = new[]
//        {
//          new
//          {
//            type = "password",
//            value = password,
//            temporary = false
//          }
//        }
//      };

//      string token = await GetAdminTokenAsync();
//      http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

//      var json = System.Text.Json.JsonSerializer.Serialize(user);
//      var content = new StringContent(json, Encoding.UTF8, "application/json");

//      var response = await http.PostAsync(
//        $"{url}/admin/realms/{appRealm}/users",
//        content);
//      response.EnsureSuccessStatusCode();

//      string id;
//      try
//      {
//        var location = response.Headers.Location?.ToString();
//        id = location!.Substring(location.LastIndexOf('/') + 1);
//      }
//      catch (Exception ex)
//      {
//        logger.LogError(ex, "Failed to extract user ID from Keycloak response.");
//        throw new Exception("Failed to extract user ID from Keycloak response.", ex);
//      }

//      return id;
//    }

//    public async Task SetUserAdminFlagAsync(string token, int userId, bool isAdmin)
//    {
//      http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

//      // 1) Get the 'admin' role representation
//      var roleResponse = await http.GetAsync($"{url}/admin/realms/{appRealm}/roles/admin");
//      roleResponse.EnsureSuccessStatusCode();
//      var roleJson = await roleResponse.Content.ReadAsStringAsync();
//      var roleObj = JsonConvert.DeserializeObject(roleJson);

//      // 2) Build role array for assignment/removal
//      var roles = new[] { roleObj };
//      var content = new StringContent(JsonConvert.SerializeObject(roles), Encoding.UTF8, "application/json");

//      if (isAdmin)
//      {
//        // Assign role
//        var assignResponse = await http.PostAsync(
//            $"{url}/admin/realms/{appRealm}/users/{userId}/role-mappings/realm",
//            content);
//        assignResponse.EnsureSuccessStatusCode();
//      }
//      else
//      {
//        // Remove role
//        var removeResponse = await http.DeleteAsync(
//          $"{url}/admin/realms/{appRealm}/users/{userId}/role-mappings/realm",
//          content);
//        removeResponse.EnsureSuccessStatusCode();
//      }
//    }

//    internal async Task<KeycloakTokenResponse> LoginUserAsync(string email, string password)
//    {
//      var tokenEndpoint = $"{url}/realms/{appRealm}/protocol/openid-connect/token";

//      var content = new FormUrlEncodedContent(
//      [
//            new KeyValuePair<string, string>("grant_type", "password"),
//            new KeyValuePair<string, string>("client_id", this.userClientId),
//            new KeyValuePair<string, string>("username", email),
//            new KeyValuePair<string, string>("password", password),
//        ]);

//      var response = await http.PostAsync(tokenEndpoint, content);

//      if ((int)response.StatusCode == 401)
//        throw new InvalidCredentialsException();
//      else if (!response.IsSuccessStatusCode)
//      {
//        var error = await response.Content.ReadAsStringAsync();
//        throw new Exception($"Keycloak login failed: {response.StatusCode} - {error}");
//      }

//      string json = await response.Content.ReadAsStringAsync() ?? throw new UnexpectedNullException();
//      KeycloakTokenResponse ret = Newtonsoft.Json.JsonConvert.DeserializeObject<KeycloakTokenResponse>(json)
//        ?? throw new UnexpectedNullException();
//      return ret;
//    }

//    private async Task<KeycloakRole> GetKeycloakRoleIdAsync(string roleName, string? adminToken = null)
//    {
//      adminToken ??= await GetAdminTokenAsync();
//      http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

//      var response = await http.GetAsync(
//        $"{url}/admin/realms/{appRealm}/roles/{roleName}");

//      if (!response.IsSuccessStatusCode)
//        throw new Exception($"Failed to get role '{roleName}' from Keycloak. Status code: {response.StatusCode}");
//      var roleJson = await response.Content.ReadAsStringAsync();
//      var role = JsonConvert.DeserializeObject<KeycloakRole>(roleJson)
//        ?? throw new Exception($"Failed to deserialize role '{roleName}' from Keycloak response.");
//      return role;
//    }


//    public async Task AssignTeacherRole(string userId)
//    {
//      await AssignRole(userId, appSettingsService.GetSettings().Keycloak.TeacherRoleName);
//    }
//    public async Task AssignRole(string userId, string roleName)
//    {
//      var roleId = await GetKeycloakRoleIdAsync(roleName);
//      await AssingRole(userId, roleId);
//    }

//    private async Task AssingRole(string userId, KeycloakRole role, string? adminToken = null)
//    {
//      adminToken ??= await GetAdminTokenAsync();
//      http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
//      var roles = new[]
//      {
//        new
//        {
//          id = role.Id,
//          name = role.Name
//        }
//      };
//      var content = new StringContent(JsonConvert.SerializeObject(roles), Encoding.UTF8, "application/json");
//      var response = await http.PostAsync(
//          $"{url}/admin/realms/{appRealm}/users/{userId}/role-mappings/realm",
//          content);
//      response.EnsureSuccessStatusCode();
//    }
//  }
//}
