using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Newtonsoft.Json.Linq;

namespace EngTaskGradingNetBE.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class StudentViewController(
  AppSettingsService appSettingsService,
  StudentViewService studentViewService,
  CloudflareTurnistilleService cloudflareTurnistilleService,
  ILogger<StudentViewController> logger) : ControllerBase
{
  [HttpPost("login")]
  public async System.Threading.Tasks.Task LoginAsync(StudentViewLoginDto data)
  {
    try
    {
      if (appSettingsService.GetSettings().CloudFlare.Enabled)
        await cloudflareTurnistilleService.VerifyAsync(data.CaptchaToken);
      await studentViewService.SendInvitationAsync(data.StudentNumber);
    }
    catch (Exception ex)
    {
      // Log exception details if necessary
      throw new ApplicationException("Failed to process student-view-login.", ex);
    }
  }

  public record VerifyRequest(string Token, int DurationSeconds);
  [HttpPost("verify")]
  public async Task<StudentViewTokenDto> Verify(VerifyRequest request)
  {
    StudentViewService.RefreshTokenData tmp;
    string accessToken;
    try
    {
      tmp = await studentViewService.VerifyLoginToken(request.Token, request.DurationSeconds);
    }
    catch (Exception ex)
    {
      logger.LogError(ex, $"Failed to complete verification for {request.Token}.");
      throw;
    }
    accessToken = GenerateJwtToken(tmp.studyNumber);
    return new StudentViewTokenDto(accessToken, tmp.RefreshToken);
  }

  [HttpPost("refresh")]
  public async Task<string> RefreshToken([FromBody] string token)
  {
    string studyNumber = await studentViewService.ValidateRefreshTokenAsync(token);
    string accessToken = GenerateJwtToken(studyNumber);
    return accessToken;
  }

  [HttpGet("courses")]
  public async Task<List<CourseDto>> GetCourses()
  {
    string studyNumber;
    try
    {
      studyNumber = ValidateTokenAndGetStudyNumber();
    }
    catch (Exception ex)
    {
      throw new UnauthorizedAccessException(ex.Message);
    }

    // Get student's courses from database
    var courses = await studentViewService.GetStudentCoursesAsync(studyNumber);
    var courseDtos = courses.Select(EObjectMapper.To).ToList();
    return courseDtos;
  }

  //[HttpGet("courses/{id}")]
  //public async Task<List<StudentViewGradingDto>> GetGrading([FromRoute] int id)
  //{
  //  string studyNumber;
  //  try
  //  {
  //    studyNumber = ValidateTokenAndGetStudyNumber();
  //  }
  //  catch (Exception ex)
  //  {
  //    throw new UnauthorizedAccessException(ex.Message);
  //  }
  //}

  private string ValidateTokenAndGetStudyNumber()
  {
    // Extract JWT token from Authorization header
    var authHeader = Request.Headers.Authorization.FirstOrDefault();
    if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
    {
      throw new UnauthorizedAccessException("Authorization header is missing or invalid.");
    }

    var token = authHeader["Bearer ".Length..].Trim();

    // Validate JWT token with signature and expiration
    var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
    tokenHandler.InboundClaimTypeMap.Clear();
    tokenHandler.OutboundClaimTypeMap.Clear();

    // Get the secret key used for signing
    var jwtKey = appSettingsService.GetKey("AppSettings:Token:JwtSecretKey");
    if (string.IsNullOrEmpty(jwtKey))
      throw new InvalidOperationException("JWT secret key is not configured.");

    var key = System.Text.Encoding.ASCII.GetBytes(jwtKey);

    // Configure validation parameters
    var validationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key),
      ValidateIssuer = false,
      ValidateAudience = false,
      ValidateLifetime = true,
      ClockSkew = TimeSpan.Zero
    };

    System.Security.Claims.ClaimsPrincipal principal;
    Microsoft.IdentityModel.Tokens.SecurityToken validatedToken;
    try
    {
      principal = tokenHandler.ValidateToken(token, validationParameters, out validatedToken);

      // Log NBF and EXP values to console
      if (validatedToken is System.IdentityModel.Tokens.Jwt.JwtSecurityToken jwtToken)
      {
        var nbf = jwtToken.ValidFrom;
        var exp = jwtToken.ValidTo;
        Console.WriteLine($"Token NBF (Not Before): {nbf:yyyy-MM-dd HH:mm:ss} UTC");
        Console.WriteLine($"Token EXP (Expires): {exp:yyyy-MM-dd HH:mm:ss} UTC");
      }
    }
    catch (Exception ex)
    {
      throw new UnauthorizedAccessException("Invalid token: validation failed.");
    }

    // Extract student ID from validated claims
    var studyNumberClaim = principal.FindFirst("sub");
    if (studyNumberClaim == null || string.IsNullOrEmpty(studyNumberClaim.Value))
    {
      throw new UnauthorizedAccessException("Invalid token: student number not found.");
    }

    // Verify token type (optional additional security)
    var typeClaim = principal.FindFirst("type");
    if (typeClaim?.Value != "student_access")
    {
      throw new UnauthorizedAccessException("Invalid token: token type is not valid.");
    }

    return studyNumberClaim.Value;
  }

  private string GenerateJwtToken(string studyNumber)
  {
    var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
    var jwtKey = appSettingsService.GetKey("AppSettings:Token:JwtSecretKey");
    if (string.IsNullOrEmpty(jwtKey))
      throw new InvalidOperationException("JWT secret key is not configured.");
    var key = System.Text.Encoding.ASCII.GetBytes(jwtKey);
    var nowUtc = DateTime.UtcNow;
    var expiryUtc = nowUtc.AddMinutes(appSettingsService.GetSettings().Token.StudentAccessJwtTokenExpiryMinutes);
    var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
    {
      Subject = new System.Security.Claims.ClaimsIdentity(new[]
        {
            new System.Security.Claims.Claim("sub", studyNumber),
            new System.Security.Claims.Claim("type", "student_access")
        }),
      Issuer = "EngTaskGradingNetBE",
      Expires = expiryUtc,
      NotBefore = nowUtc,
      IssuedAt = nowUtc,
      SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(
            new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key),
            Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature)
    };
    var token = tokenHandler.CreateToken(tokenDescriptor);
    Console.WriteLine("JWT " + token);
    return tokenHandler.WriteToken(token);
  }

  public record StudentViewLoginDto(
      string StudentNumber,
      string? CaptchaToken = null
  );
}