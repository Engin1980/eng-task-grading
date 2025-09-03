using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.DbModel;

public class Task
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { get; set; }

  public string Title { get; set; } = string.Empty;

  public string? Keywords { get; set; }

  public string? Description { get; set; }

  public int CourseId { get; set; }
  public Course Course { get; set; } = null!;

  public int? MinGrade { get; set; }

  public List<Grade> Grades { get; set; } = null!;
}
