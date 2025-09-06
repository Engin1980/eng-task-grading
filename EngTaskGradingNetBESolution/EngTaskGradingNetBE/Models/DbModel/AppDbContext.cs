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
    public DbSet<TeacherToken> TeacherTokens => Set<TeacherToken>();
    public DbSet<StudentViewToken> StudentViewTokens => Set<StudentViewToken>();
    public DbSet<AppLog> AppLog => Set<AppLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.Entity<Student>(e =>
      {
        e.HasMany(s => s.Courses)
          .WithMany(k => k.Students)
          .UsingEntity(j => j.ToTable("StudentCourse"));

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

      modelBuilder.Entity<StudentViewToken>(e =>
      {
        e.HasIndex(t => new { t.StudentId, t.ExpiresAt }).IsUnique();
        e.HasIndex(t => t.Token);
      });
    }
  }
}
