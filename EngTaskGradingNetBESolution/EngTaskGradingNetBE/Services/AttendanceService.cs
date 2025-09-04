using EngTaskGradingNetBE.Models.DbModel;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Services
{
  public class AttendanceService(AppDbContext context) : DbContextBaseService(context)
  {
    public async Task<IEnumerable<Attendance>> GetAllForCourseAsync(int courseId)
    {
      return await this.Db.Attendances
        .Where(a => a.CourseId == courseId)
        .Include(a => a.Days)
        .OrderBy(a => a.Title)
        .ToListAsync();
    }

    public async Task<Attendance> CreateAsync(int courseId, Attendance attendance)
    {
      var course = await this.Db.Courses
        .FirstOrDefaultAsync(q => q.Id == courseId)
        ?? throw new Exceptions.EntityNotFoundException(typeof(Course), courseId);
      attendance.Course = course;
      await this.Db.Attendances.AddAsync(attendance);
      await this.Db.SaveChangesAsync();
      return attendance;
    }

    public async Task<Attendance> UpdateAsync(int id, Attendance updatedAttendance)
    {
      var existingAttendance = await this.Db.Attendances
        .Include(a => a.Days)
        .FirstOrDefaultAsync(a => a.Id == id)
        ?? throw new Exceptions.EntityNotFoundException(typeof(Attendance), id);
      existingAttendance.Title = updatedAttendance.Title;
      await this.Db.SaveChangesAsync();
      return existingAttendance;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int id, bool mustExist = false)
    {
      var attendance = await this.Db.Attendances
        .Include(a => a.Days)
        .FirstOrDefaultAsync(a => a.Id == id);
      if (attendance == null)
        if (mustExist)
          throw new Exceptions.EntityNotFoundException(typeof(Attendance), id);
        else
          return;

      this.Db.Attendances.Remove(attendance);
      await this.Db.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task AddDayAsync(int attendanceId, AttendanceDay day)
    {
      var attendance = await this.Db.Attendances
        .Include(a => a.Days)
        .FirstOrDefaultAsync(a => a.Id == attendanceId)
        ?? throw new Exceptions.EntityNotFoundException(typeof(Attendance), attendanceId);
      attendance.Days.Add(day);
      await this.Db.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task UpdateDayAsync(
      int attendanceDayId,
      AttendanceDay updatedDay)
    {
      var existingDay = await this.Db.AttendanceDays
        .FirstOrDefaultAsync(d => d.Id == attendanceDayId)
        ?? throw new Exceptions.EntityNotFoundException(typeof(AttendanceDay), attendanceDayId);
      existingDay.Title = updatedDay.Title;
      await this.Db.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task DeleteDayAsync(int attendanceDayId, bool mustExist = false)
    {
      var day = await this.Db.AttendanceDays
        .FirstOrDefaultAsync(d => d.Id == attendanceDayId);
      if (day == null)
        if (mustExist)
          throw new Exceptions.EntityNotFoundException(typeof(AttendanceDay), attendanceDayId);
        else
          return;
      this.Db.AttendanceDays.Remove(day);
      await this.Db.SaveChangesAsync();
    }
  }
}