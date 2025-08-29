using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EngTaskGradingNetBE.Models.DbModel;

public class Grade
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { get; set; }

  public int TaskId { get; set; }
  public Task Task { get; set; } = null!;

  public int StudentId { get; set; }
  public Student Student { get; set; } = null!;

  public int Value { get; set; }

  public string? Comment { get; set; }

  public DateTime Date { get; set; }

  public int AssignerTeacherId { get; set; }
  public Teacher AssignerTeacher { get; set; } = null!;

}
