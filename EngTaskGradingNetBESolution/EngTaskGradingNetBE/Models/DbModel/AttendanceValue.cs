using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.DbModel;

public class AttendanceValue
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { set; get; }
  [Required]
  public string Title { set; get; } = null!;
  [Required]
  public double Weight { set; get; }
}
