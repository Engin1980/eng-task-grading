using Microsoft.EntityFrameworkCore;

namespace EngGradesBE.DbModel
{
  public class AppDbContext(DbContextOptions<AppDbContext> ctx) : DbContext(ctx)
  {
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Task> Tasks => Set<Task>();
    public DbSet<Grade> Grades => Set<Grade>();
    public DbSet<TeacherToken> TeacherTokens => Set<TeacherToken>();
    public DbSet<StudentToken> StudentTokens => Set<StudentToken>();
    public DbSet<AppLog> AppLog => Set<AppLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.Entity<Student>()
          .HasMany(s => s.Courses)
          .WithMany(k => k.Students)
          .UsingEntity(j => j.ToTable("StudentCourse"));

      modelBuilder.Entity<Teacher>()
          .HasMany(t => t.Courses)
          .WithMany(c => c.Teachers)
          .UsingEntity(j => j.ToTable("TeacherCourse"));

      // link courses and tasks
      modelBuilder.Entity<Course>()
          .HasMany(c => c.Tasks)
          .WithOne(t => t.Course)
          .HasForeignKey(t => t.CourseId)
          .OnDelete(DeleteBehavior.Cascade);
    }
  }
}
