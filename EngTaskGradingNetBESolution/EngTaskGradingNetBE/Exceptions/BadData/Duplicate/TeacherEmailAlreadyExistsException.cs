using System.Runtime.CompilerServices;

namespace EngTaskGradingNetBE.Exceptions.BadData.Duplicate;

public class TeacherEmailAlreadyRegisteredException(string email) : DuplicateItemException($"Teacher email {email} already exists.")
{
  public string Email { get; } = email;
}
