using EngTaskGradingNetBE.Exceptions.BadData.Common;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.DbModel;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace EngTaskGradingNetBE.Services;

public enum TokenType
{
  Unset = 0,
  TeacherPasswordReset = 1,
  TeacherRefresh = 2,
  StudentLogin = 4,
  StudentAccess = 5,
  StudentAttendanceDaySelfSign = 6
}

public enum TokenUniquessBehavior
{
  NoCheck,
  DeleteExisting,
  ThrowException
}

public class TokenService(AppDbContext ctx) : DbContextBaseService(ctx)
{
  public async Task<string> CreateAsync(
    TokenType type,
    string key,
    TokenUniquessBehavior uniquessBehavior,
    int length,
    int expirationMinutes) => await CreateAsync(type, key, null, uniquessBehavior, length, expirationMinutes);

  public async Task<string> CreateAsync(
    TokenType type,
    string key,
    string? tag,
    TokenUniquessBehavior uniquessBehavior,
    int length,
    int expirationMinutes)
  {
    int typeInt = (int)type;
    await CheckForExistingTokensAsync(type, key, uniquessBehavior, typeInt);

    Token token = await CreateNewTokenAsync(typeInt, key, tag, length, expirationMinutes);
    return token.Value;
  }

  public async Task<Token> GetTokenIfValidAsync(string token, TokenType tokenType, bool deleteOnRetrieval)
    => await GetTokenIfValidAsync(token, tokenType, null, deleteOnRetrieval);

  public async Task<Token> GetTokenIfValidAsync(string token, TokenType tokenType, string? expectedKeyOrNull, bool deleteOnRetrieval)
  {
    Token ret = await Db.Tokens.FirstOrDefaultAsync(t => t.Value == token)
      ?? throw new InvalidTokenException(tokenType, InvalidationType.NotFound);

    if (deleteOnRetrieval)
    {
      Db.Tokens.Remove(ret);
      await Db.SaveChangesAsync();
    }

    DateTime utcNow = DateTime.UtcNow;
    if (utcNow > ret.ExpiresAt)
      throw new InvalidTokenException(tokenType, InvalidationType.Expired);
    if (expectedKeyOrNull != null && expectedKeyOrNull != ret.Key)
      throw new InvalidTokenException(tokenType, InvalidationType.InvalidOwner);

    return ret;
  }

  public async Task<string> GetTokenKeyIfValidAsync(string token, TokenType tokenType, bool deleteOnRetrieval)
    => (await GetTokenIfValidAsync(token, tokenType, null, deleteOnRetrieval)).Key;

  public async System.Threading.Tasks.Task ClearExpiredTokensAsync()
  {
    await Db.Tokens.Where(t => t.ExpiresAt < DateTime.UtcNow).ExecuteDeleteAsync();
  }

  private async Task<Token> CreateNewTokenAsync(int typeInt, string key, string? tag, int length, int expirationMinutes)
  {
    string tokenString = GenerateSecureToken(length);
    Token token = new()
    {
      CreatedAt = DateTime.UtcNow,
      ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes),
      Key = key,
      Tag = tag,
      Type = typeInt,
      Value = tokenString,
    };

    await Db.Tokens.AddAsync(token);
    await Db.SaveChangesAsync();
    return token;
  }

  private async System.Threading.Tasks.Task CheckForExistingTokensAsync(TokenType type, string? key, TokenUniquessBehavior uniquessBehavior, int typeInt)
  {
    key ??= string.Empty;
    List<Token> existing = Db.Tokens.Where(t => t.Type == typeInt && (key == t.Key)).ToList();
    if (existing.Count != 0)
    {
      if (uniquessBehavior == TokenUniquessBehavior.DeleteExisting)
      {
        Db.Tokens.RemoveRange(existing);
        await Db.SaveChangesAsync();
      }
      else if (uniquessBehavior == TokenUniquessBehavior.ThrowException)
      {
        throw new InvalidOperationException($"Token of type {type} with key {key} already exists.");
      }
    }
  }

  private static string GenerateSecureToken(int length)
  {
    byte[] tokenBytes = new byte[length];
    using (var rng = RandomNumberGenerator.Create())
    {
      rng.GetBytes(tokenBytes);
    }

    return Convert.ToBase64String(tokenBytes)
      .Replace('+', '-')
      .Replace('/', '_')
      .TrimEnd('=');
  }

  internal async System.Threading.Tasks.Task DeleteAsync(string refreshToken)
  {
    await Db.Tokens.Where(t => t.Value == refreshToken).ExecuteDeleteAsync();
  }

  internal async System.Threading.Tasks.Task DeleteAllByKeyAsync(TokenType tokenType, string key)
  {
    await Db.Tokens.Where(t => t.Key == key && t.Type == (int)tokenType).ExecuteDeleteAsync();
  }
}
