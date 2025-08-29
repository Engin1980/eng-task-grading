using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.DbModel;

[Table("Student")]
public class Student
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { get; set; }

  [Required]
  public string Number { get; set; } = string.Empty;

  [Required]
  public string Email { get; set; } = string.Empty;

  public string? Name { get; set; }

  public string? Surname { get; set; }

  public ICollection<Course> Courses { get; set; } = [];
  public ICollection<Grade> Grades { get; set; } = [];
}
