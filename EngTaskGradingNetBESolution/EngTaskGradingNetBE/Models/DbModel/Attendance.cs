using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.DbModel;

public class Attendance
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { set; get; }

  public int CourseId { set; get; }
  public Course Course { set; get; } = null!;
  [Required]
  public string Title { set; get; } = null!;

  public ICollection<AttendanceDay> Days { set; get; } = new List<AttendanceDay>();
}