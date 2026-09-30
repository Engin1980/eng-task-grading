using System.ComponentModel.DataAnnotations;

namespace EngTaskGradingNetBE.Models.DbModel;

/// <summary>
/// Join entity between Course and Student (table StudentCourse).
/// </summary>
public class CourseStudent
{
  public int CourseId { get; set; }
  public int StudentId { get; set; }

  public Course Course { get; set; } = null!;
  public Student Student { get; set; } = null!;

  [Required]
  public string StudyGroup { get; set; } = string.Empty;
}
