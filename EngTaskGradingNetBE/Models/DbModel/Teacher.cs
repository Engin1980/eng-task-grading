using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.DbModel
{
  public class Teacher
  {
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public string Email { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public bool IsAdmin { get; set; }

    public ICollection<Course> Courses { get; set; } = [];
  }
}
