using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.DbModel;

public class AttendanceDay
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { set; get; }
  public int AttendanceId { set; get; }
  public Attendance Attendance { set; get; } = null!;
  [Required]
  public string Title { set; get; } = null!;

  public ICollection<AttendanceRecord> Records { set; get; } = new List<AttendanceRecord>();
}
