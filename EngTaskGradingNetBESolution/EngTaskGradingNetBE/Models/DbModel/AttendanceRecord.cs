using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.DbModel;

public class AttendanceRecord
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { set; get; }
  [Required]
  public int StudentId { set; get; }
  public Student Student { set; get; } = null!;
  [Required]
  public int AttendanceDayId { set; get; }
  public AttendanceDay AttendanceDay { set; get; } = null!;


  [Required]
  public int AttendanceValueId { get; set; }
  public AttendanceValue Value { set; get; } = null!;
}
