using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
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

    internal async Task<Attendance> GetByIdAsync(int attendanceId)
    {
      Attendance ret = await Db.Attendances
        .Include(q => q.Days)
        .FirstOrDefaultAsync(q => q.Id == attendanceId)
        ?? throw new Exceptions.EntityNotFoundException(typeof(Attendance), attendanceId);
      return ret;
    }

    internal async Task<Dictionary<Student, double>> GetOverviewByIdAsync(int id)
    {
      var att = await Db.Attendances
        .Include(q => q.Days).ThenInclude(q => q.Records).ThenInclude(q => q.Student)
        .Include(q => q.Course).ThenInclude(q => q.Students)
        .FirstOrDefaultAsync(q => q.Id == id) ?? throw new Exceptions.EntityNotFoundException(typeof(Attendance), id);
      var students = att.Days
        .SelectMany(q => q.Records)
        .Select(q => q.Student)
        .Union(att.Course.Students)
        .Distinct()
        .ToList();
      var tmp = await Db.AttendanceValues.ToListAsync();
      var vals = tmp.ToDictionary(q => q, q => q.Weight);

      Dictionary<Student, double> ret = students.ToDictionary(q => q, q => 0d);

      foreach (AttendanceRecord sa in Db.Attendances.SelectMany(q => q.Days).SelectMany(q => q.Records))
      {
        ret[sa.Student] += vals[sa.Value];
      }

      return ret;
    }

    internal async Task<List<AttendanceValue>> GetValuesAsync()
    {
      return await Db.AttendanceValues.ToListAsync();
    }

    internal async Task<IEnumerable<Student>> GetStudentsForDayAsync(int attendanceDayId)
    {
      var attDay = await Db.AttendanceDays
        .Include(q => q.Attendance).ThenInclude(q => q.Course).ThenInclude(q => q.Students)
        .Include(q => q.Records).ThenInclude(q => q.Student)
        .Where(q => q.Id == attendanceDayId)
        .FirstOrDefaultAsync()
        ?? throw new Exceptions.EntityNotFoundException(typeof(AttendanceDay), attendanceDayId);
      var students = attDay.Attendance.Course.Students.Union(attDay.Records.Select(q => q.Student)).Distinct().ToList();
      return students;
    }

    internal async Task<IEnumerable<AttendanceRecord>> GetRecordsForDayAsync(int attendanceDayId)
    {
      var attDay = await Db.AttendanceDays
        .Include(q => q.Records)
        .FirstOrDefaultAsync(q => q.Id == attendanceDayId)
                ?? throw new Exceptions.EntityNotFoundException(typeof(AttendanceDay), attendanceDayId);
      return attDay.Records;

    }

    internal async Task<AttendanceRecord> CreateOrUpdateRecordAsync(int attendanceDayId, int studentId, int attendanceValueId)
    {
      var ar = await Db.AttendanceRecords
        .Where(q => q.AttendanceDayId == attendanceDayId && q.StudentId == studentId)
        .FirstOrDefaultAsync();
      if (ar == null)
      {
        ar = new AttendanceRecord()
        {
          AttendanceDayId = attendanceDayId,
          StudentId = studentId,
        };
        await Db.AttendanceRecords.AddAsync(ar);
      }
      ar.AttendanceValueId = attendanceValueId;
      await Db.SaveChangesAsync();
      return ar;
    }

    internal async System.Threading.Tasks.Task DeleteRecordAsync(int id)
    {
      var ar = await Db.AttendanceRecords.FindAsync(id);
      if (ar != null)
      {
        Db.AttendanceRecords.Remove(ar);
        await Db.SaveChangesAsync();
      }
    }

    internal async System.Threading.Tasks.Task<Course> GetCourseAttendanceDataAsync(int courseId)
    {
      var course = await Db.Courses
        .Include(q => q.Students)
        .Include(q => q.Attendances)
        .ThenInclude(q => q.Days)
        .ThenInclude(q => q.Records)
        .FirstOrDefaultAsync(q => q.Id == courseId)
        ?? throw new Exceptions.EntityNotFoundException(typeof(Course), courseId);

      return course;
    }

    public record AttendanceData(List<Student> Students, List<AttendanceDay> Days);
    internal async System.Threading.Tasks.Task<AttendanceData> GetAttendanceDataAsync(int attendanceId)
    {
      var att = await Db.Attendances
        .Include(q => q.Days).ThenInclude(q => q.Records).ThenInclude(q => q.Value)
        .Include(q => q.Course).ThenInclude(q => q.Students)
        .FirstOrDefaultAsync(q => q.Id == attendanceId)
        ?? throw new Exceptions.EntityNotFoundException(typeof(Attendance), attendanceId);

      var xa = att.Days.SelectMany(q => q.Records);

      AttendanceData ret = new AttendanceData(
        att.Course.Students.Union(att.Days.SelectMany(q => q.Records).Select(q => q.Student)).Distinct().ToList(),
        att.Days.ToList()
        );
      return ret;
    }

    internal async System.Threading.Tasks.Task AddAttendanceDaySelfSignAsync(AttendanceDaySelfSign entity)
    {
      await Db.AttendanceDaySelfSign.AddAsync(entity);
      await Db.SaveChangesAsync();
    }

    internal async Task<AttendanceDay> GetDayByIdAsync(int attendanceDayId, bool includeSelfSigns)
    {
      IQueryable<AttendanceDay> tmp = Db.AttendanceDays;
      if (includeSelfSigns)
        tmp = tmp.Include(q => q.SelfSigns);
      AttendanceDay ret =
        await tmp
        .FirstOrDefaultAsync(q => q.Id == attendanceDayId)
        ?? throw new Exceptions.EntityNotFoundException(typeof(AttendanceDay), attendanceDayId);

      return ret;
    }

    internal async System.Threading.Tasks.Task SetSelfAssignKeyAsync(int dayId, string? key)
    {
      AttendanceDay attDay = await Db.AttendanceDays
        .FirstOrDefaultAsync(q => q.Id == dayId)
        ?? throw new Exceptions.EntityNotFoundException(typeof(AttendanceDay), dayId);
      attDay.SelfAssignKey = key;
      await Db.SaveChangesAsync();
    }

    internal async System.Threading.Tasks.Task ResolveSelfSignsAsync(int selfSignId, int attendanceValueId)
    {
      AttendanceDaySelfSign atss = await Db.AttendanceDaySelfSign
        .FirstOrDefaultAsync(q => q.Id == selfSignId)
        ?? throw new EntityNotFoundException(typeof(AttendanceDaySelfSign), selfSignId);

      using var transaction = await Db.Database.BeginTransactionAsync();
      try
      {

        await CreateOrUpdateRecordAsync(atss.AttendanceDayId, atss.StudentId, attendanceValueId);

        Db.AttendanceDaySelfSign.Remove(atss);
        await Db.SaveChangesAsync();

        await transaction.CommitAsync();
      }
      catch (Exception ex)
      {
        await transaction.RollbackAsync();
        throw ex;
      }
    }

    internal async Task<List<AttendanceDaySelfSign>> GetSelfSignsForDayAsync(int dayId)
    {
      List<AttendanceDaySelfSign> ret = await Db.AttendanceDaySelfSign
        .Where(q => q.AttendanceDayId == dayId)
        .Include(q => q.Student)
        .ToListAsync();
      return ret;
    }
  }
}