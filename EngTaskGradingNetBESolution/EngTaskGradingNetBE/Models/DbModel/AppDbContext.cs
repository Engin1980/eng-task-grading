using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Models.DbModel
{
  public class AppDbContext(DbContextOptions<AppDbContext> ctx) : DbContext(ctx)
  {
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Task> Tasks => Set<Task>();
    public DbSet<Grade> Grades => Set<Grade>();
    public DbSet<AppLog> AppLog => Set<AppLog>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<AttendanceValue> AttendanceValues => Set<AttendanceValue>();
    public DbSet<AttendanceDay> AttendanceDays => Set<AttendanceDay>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<AttendanceDaySelfSign> AttendanceDaySelfSign => Set<AttendanceDaySelfSign>();
    public DbSet<FinalGrade> FinalGrades => Set<FinalGrade>();
    public DbSet<Token> Tokens => Set<Token>();
    public DbSet<CourseStudent> CourseStudents => Set<CourseStudent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.Entity<Student>(e =>
      {
        e.HasMany(s => s.Courses)
          .WithMany(k => k.Students)
          .UsingEntity<CourseStudent>(
            j => j.HasOne(cs => cs.Course).WithMany().HasForeignKey(cs => cs.CourseId),
            j => j.HasOne(cs => cs.Student).WithMany().HasForeignKey(cs => cs.StudentId),
            j =>
            {
              j.ToTable("StudentCourse");
              j.HasKey(cs => new { cs.CourseId, cs.StudentId });
              j.Property(cs => cs.CourseId).HasColumnName("CoursesId");
              j.Property(cs => cs.StudentId).HasColumnName("StudentsId");
              j.Property(cs => cs.StudyGroup).HasDefaultValue("");
            });

        e.HasIndex(s => s.Number).IsUnique();
        e.HasIndex(s => s.Email).IsUnique();
      });


      modelBuilder.Entity<Teacher>(e =>
      {
        e.HasMany(t => t.Courses)
          .WithMany(c => c.Teachers)
          .UsingEntity(j => j.ToTable("TeacherCourse"));

        e.HasIndex(t => t.Email).IsUnique();
      });

      modelBuilder.Entity<Course>(e =>
      {
        e.HasMany(c => c.Tasks)
          .WithOne(t => t.Course)
          .HasForeignKey(t => t.CourseId)
          .OnDelete(DeleteBehavior.Cascade);

        e.HasIndex(c => c.Code).IsUnique();
      });

      modelBuilder.Entity<AttendanceRecord>()
       .HasIndex(ar => new { ar.AttendanceDayId, ar.StudentId })
       .IsUnique();

      modelBuilder.Entity<Token>(e =>
      {
        e.HasIndex(t => t.Value).IsUnique();
      });

      modelBuilder.Entity<AttendanceDaySelfSign>(e =>
      {
        e.HasIndex(s => new { s.AttendanceDayId, s.StudentId })
         .IsUnique();
      });

      modelBuilder.Entity<FinalGrade>()
        .HasIndex(fg => new { fg.CourseId, fg.StudentId })
        .IsUnique();
    }
  }
}
