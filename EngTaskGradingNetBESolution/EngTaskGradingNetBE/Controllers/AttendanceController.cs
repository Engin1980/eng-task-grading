using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/v1/[controller]")]
  public class AttendanceController(AttendanceService attendanceService, StudentService studentService) : ControllerBase
  {
    [HttpGet("for-course/{courseId}")]
    public async Task<IEnumerable<AttendanceDto>> GetAll(int courseId)
    {
      var tmp = await attendanceService.GetAllForCourseAsync(courseId);
      var ret = tmp.Select(EObjectMapper.To).ToList();
      return ret;
    }

    [HttpPost("for-course/{courseId}")]
    public async Task<AttendanceDto> Create([FromRoute] int courseId, [FromBody] AttendanceCreateDto attendanceDto)
    {
      Attendance att = EObjectMapper.From(attendanceDto);
      var created = await attendanceService.CreateAsync(courseId, att);
      AttendanceDto ret = EObjectMapper.To(created);
      return ret;
    }

    [HttpPatch("{id}")]
    public async Task<AttendanceDto> UpdateAsync(int id, [FromBody] AttendanceDto attendanceDto)
    {
      Attendance att = EObjectMapper.From(attendanceDto);
      var updated = await attendanceService.UpdateAsync(id, att);
      AttendanceDto ret = EObjectMapper.To(updated);
      return ret;
    }

    [HttpGet("{id}")]
    public async Task<AttendanceDto> GetById([FromRoute] int id)
    {
      var attendance = await attendanceService.GetByIdAsync(id);
      var ret = EObjectMapper.To(attendance);
      return ret;
    }

    [HttpGet("{id}/overview")]
    public async Task<AttendanceOverviewDto> GetOverviewByIdAsync([FromRoute] int id)
    {
      Dictionary<Student, double> data = await attendanceService.GetOverviewByIdAsync(id);
      AttendanceOverviewDto ret = EObjectMapper.To(id, data);
      return ret;
    }

    [HttpDelete("{id}")]
    public async System.Threading.Tasks.Task DeleteAsync(int id)
    {
      await attendanceService.DeleteAsync(id);
    }

    [HttpPost("days")]
    public async System.Threading.Tasks.Task AddDayAsync([FromBody] AttendanceDayCreateDto dayDto)
    {
      AttendanceDay day = EObjectMapper.From(dayDto);
      await attendanceService.AddDayAsync(dayDto.AttendanceId, day);
    }

    [HttpPatch("days/{dayId}")]
    public async System.Threading.Tasks.Task UpdateDayAsync(int dayId, [FromBody] AttendanceDayUpdateDto dayDto)
    {
      AttendanceDay day = EObjectMapper.From(dayDto);
      await attendanceService.UpdateDayAsync(dayId, day);
    }

    [HttpDelete("days/{dayId}")]
    public async System.Threading.Tasks.Task DeleteDayAsync(int dayId)
    {
      await attendanceService.DeleteDayAsync(dayId);
    }

    [HttpGet("values")]
    public async Task<List<AttendanceValueDto>> GetValuesAsync()
    {
      var tmp = await attendanceService.GetValuesAsync();
      List<AttendanceValueDto> ret = tmp.Select(EObjectMapper.To).ToList();
      return ret;
    }

    [HttpGet("days/{dayId}/students")]
    public async Task<List<StudentDto>> GetStudentsForDayAsync([FromRoute] int dayId)
    {
      var tmp = await attendanceService.GetStudentsForDayAsync(dayId);
      var ret = tmp.Select(EObjectMapper.To).ToList();
      return ret;
    }

    [HttpGet("records/for-day/{attendanceDayId}")]
    public async Task<List<AttendanceRecordDto>> GetRecordsForDayAsync([FromRoute] int attendanceDayId)
    {
      var tmp = await attendanceService.GetRecordsForDayAsync(attendanceDayId);
      var ret = tmp.Select(EObjectMapper.To).ToList();
      return ret;
    }

    [HttpPost("records")]
    public async Task<AttendanceRecordDto> CreateOrUpdateRecord(AttendanceRecordDto data)
    {
      AttendanceRecord tmp = await attendanceService.CreateOrUpdateRecordAsync(data.AttendanceDayId, data.StudentId, data.AttendanceValueId);
      AttendanceRecordDto ret = EObjectMapper.To(tmp);
      return ret;
    }

    [HttpDelete("records/{id}")]
    public async System.Threading.Tasks.Task DeleteRecord(int id)
    {
      await attendanceService.DeleteRecordAsync(id);
    }

    [HttpGet("for-course/{courseId}/set")]
    public async Task<AttendanceSetDto> GetCourseAttendanceSetAsync(int courseId)
    {
      //TODO tohle bude pomale, prepsat na urovni DB
      var courseWithData = await attendanceService.GetCourseAttendanceDataAsync(courseId);
      var values = await attendanceService.GetValuesAsync();

      List<AttendanceDto> attendances = courseWithData.Attendances
        .Select(EObjectMapper.To)
        .OrderBy(q => q.Title)
        .ToList();
      List<StudentDto> students = courseWithData.Attendances
        .SelectMany(q => q.Days)
        .SelectMany(q => q.Records)
        .Select(q => q.Student)
        .Union(courseWithData.Students)
        .Distinct()
        .Select(EObjectMapper.To)
        .OrderBy(q => q.Surname).ThenBy(q => q.Name)
        .ToList();

      List<AttendanceSetItemDto> items = [];
      foreach (var attendance in courseWithData.Attendances)
      {
        foreach (var student in students)
        {
          var totalWeight = attendance.Days
            .SelectMany(q => q.Records)
            .Where(q => q.StudentId == student.Id)
            .Select(q => q.Value.Weight)
            .Sum();
          items.Add(new AttendanceSetItemDto(attendance.Id, student.Id, totalWeight));
        }
      }

      AttendanceSetDto ret = new(attendances, students, items);
      return ret;
    }

    [HttpGet("{attendanceId}/set")]
    public async Task<AttendanceDaySetDto> GetAttendanceSetAsync(int attendanceId)
    {
      var data = await attendanceService.GetAttendanceDataAsync(attendanceId);

      List<AttendanceDaySetRecordDto> items = data.Days
        .SelectMany(q => q.Records)
        .Select(q => new AttendanceDaySetRecordDto(q.Id, q.StudentId, q.AttendanceDayId, q.Value.Title, q.Value.Weight))
        .ToList();

      AttendanceDaySetDto ret = new(
        data.Students.Select(EObjectMapper.To).OrderBy(q => q.Surname).ThenBy(q => q.Name).ToList(),
        data.Days.Select(EObjectMapper.To).OrderBy(q => q.Title).ToList(),
        items
        );
      return ret;
    }

    [HttpPatch("days/{dayId}/key")]
    public async System.Threading.Tasks.Task SetSelfAssignKey([FromRoute] int dayId, [FromBody] string key)
    {
      await attendanceService.SetSelfAssignKeyAsync(dayId, key);
    }

    [HttpDelete("days/{dayId}/key")]
    public async System.Threading.Tasks.Task DeleteSelfAssignKey([FromRoute] int dayId)
    {
      await attendanceService.SetSelfAssignKeyAsync(dayId, null);
    }

    [HttpGet("self/for-day/{dayId}")]
    public async System.Threading.Tasks.Task<AttendanceDaySelfSignSetDto> GetSelfSignSet([FromRoute] int dayId)
    {
      AttendanceDay atd = await attendanceService.GetDayByIdAsync(dayId, true);
      List<AttendanceDaySelfSign> selfSigns = await attendanceService.GetSelfSignsForDayAsync(dayId);

      List<AttendanceDaySelfSignDto> dtos = selfSigns
        .Select(EObjectMapper.To)
        .ToList();

      AttendanceDaySelfSignSetDto ret = new(
        dayId,
        atd.SelfAssignKey,
        dtos
        );
      return ret;
    }

    [HttpPost("self/for-day/{dayId}")]
    public async System.Threading.Tasks.Task SelfAssignStudentToDay([FromRoute] int dayId, AttendanceDaySelfSignCreateDto data)
    {
      AttendanceDay atd = await attendanceService.GetDayByIdAsync(dayId, false);
      if (atd.SelfAssignKey == null || atd.SelfAssignKey.Length == 0 || atd.SelfAssignKey != data.Key)
      {
        //TODO implement fully
        throw new BadDataException("Attendance is not opened for self-assing or the key is invalid.");
      }
      Student student = await studentService.GetByStudyNumberAsync(data.StudyNumber);

      AttendanceDaySelfSign entity = new()
      {
        AttendanceDayId = dayId,
        Student = student,
        CreationDateTime = DateTime.Now,
        IP = Request.Headers["X-Forwarded-For"].FirstOrDefault() ?? Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? ""
      };

      await attendanceService.AddAttendanceDaySelfSignAsync(entity);
    }

    [HttpPost("self/{selfSignId}")]
    public async System.Threading.Tasks.Task ResolveSelfSigns([FromRoute] int selfSignId, [FromBody] int attendanceValueId)
    {
      await attendanceService.ResolveSelfSignsAsync(selfSignId, attendanceValueId);
    }
  }
}
