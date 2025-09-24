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
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public bool IsActive { get; set; } = false;

    public ICollection<Course> Courses { get; set; } = [];
  }
}
