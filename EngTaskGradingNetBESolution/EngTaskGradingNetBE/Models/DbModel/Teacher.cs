using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.DbModel
{
  public class Teacher
  {
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string? KeycloakId { get; set; }

    [Required]
    public string Email { get; set; } = string.Empty;

    public ICollection<Course> Courses { get; set; } = [];
  }
}
