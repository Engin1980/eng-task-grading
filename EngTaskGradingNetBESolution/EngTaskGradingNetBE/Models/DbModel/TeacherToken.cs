using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.DbModel;

public class TeacherToken
{
  public enum TokenType
  {
    Unset = 0,
    PasswordReset = 1,
    Refresh = 2
  }

  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { get; set; }

  [Required]
  public string Value { get; set; } = string.Empty;

  public DateTime ExpirationDate { get; set; }

  public TokenType Type { get; set; }

  public int TeacherId { get; set; }
  public Teacher Teacher { get; set; } = null!;
}
