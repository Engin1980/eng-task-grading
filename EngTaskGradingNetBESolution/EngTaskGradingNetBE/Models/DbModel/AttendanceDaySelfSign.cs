using Microsoft.Identity.Client;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.DbModel
{
  public class AttendanceDaySelfSign
  {
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int AttendanceDayId { get; set; }
    public AttendanceDay AttendanceDay { get; set; } = null!;
    
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public DateTime CreationDateTime { get; set; }
    public DateTime? VerificationDateTime { get; set; }
    public string IP { get; set; } = string.Empty;
    public string VerificationIP { get; set; } = string.Empty;
  }
}
