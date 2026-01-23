using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.DbModel;

public class AppLog
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { get; set; }
  public string? Message { get; set; }
  public string? MessageTemplate { get; set; }
  public string? Level { get; set; }
  public DateTime? TimeStamp { get; set; }
  public string? Exception { get; set; }
  public string? Properties { get; set; }
  public string? SourceContext { get; set; }
}
