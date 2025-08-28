using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngGradesBE.DbModel;

[Table("Course")]
public class Course
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { get; set; }

  [Required]
  public string Code { get; set; } = string.Empty;

  public string? Name { get; set; }

  public ICollection<Student> Students { get; set; } = [];
  public ICollection<Teacher> Teachers { get; set; } = [];
  public ICollection<Task> Tasks { get; set; } = [];
}
