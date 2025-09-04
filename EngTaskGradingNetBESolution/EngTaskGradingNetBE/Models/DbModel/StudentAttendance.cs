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

public class StudentAttendance
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
  public AttendanceValue Value { set; get; } = null!;
}

public class AttendanceDay
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { set; get; }
  public int AttendanceId { set; get; }
  public Attendance Attendance { set; get; } = null!;
  [Required]
  public string Title { set; get; } = null!;  

  public ICollection<StudentAttendance> StudentAttendances { set; get; } = new List<StudentAttendance>();
}

public class Attendance
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { set; get; }

  public int CourseId { set; get; }
  public Course Course { set; get; } = null!;
  [Required]
  public string Title { set; get; } = null!;

  public ICollection<AttendanceDay> Days { set; get; } = new List<AttendanceDay>();
}