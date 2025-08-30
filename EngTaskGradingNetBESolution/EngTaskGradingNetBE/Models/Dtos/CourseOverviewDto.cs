using EngTaskGradingNetBE.Models.DbModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.Dtos
{
  public record CourseOverviewDto(int Id, string Code, string? Name,int StudentCount, int TaskCount);
}