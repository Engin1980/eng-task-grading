using EngTaskGradingNetBE.Models.DbModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.Dtos
{
  public record StudentDto(
    int Id,
    string Number,
    string Email,
    string? Name,
    string? Surname,
    string? UserName,
    string? StudyProgram,
    string? StudyForm
  );

  public record StudentCreateDto(string Number, string Name, string Surname, string UserName, string Email, string StudyProgram, string StudyForm);
  public record StudentAnalysisResultDto(List<StudentCreateDto> Students, List<string> Errors);
}
