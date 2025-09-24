namespace EngTaskGradingNetBE.Models.Dtos
{
  public record TeacherLoginDto(
    string Email, 
    string Password
  );

  public record TeacherCreateDto(
    string Email,
    string Password
  );
  public record TeacherDto(
    int Id,
    string Email
  );
}
