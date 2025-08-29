using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.DbModel;

public class StudentToken
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { get; set; }

  [Required]
  public string Value { get; set; } = string.Empty;

  public DateTime ExpirationDate { get; set; }

  public int StudentId { get; set; }
  public Student Student { get; set; } = null!;
}
