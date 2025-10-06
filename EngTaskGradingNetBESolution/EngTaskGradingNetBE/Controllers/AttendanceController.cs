using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/v1/[controller]")]
  [Authorize(Roles = Roles.TEACHER_ROLE)]
  public class AttendanceController(
    AttendanceService attendanceService,
    StudentService studentService,
    AppSettingsService appSettingsService) : ControllerBase
  {
    private const string SELF_SIGN_USED_COOKIE_NAME = "self-sign-used";

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
    public async Task<AttendanceDto> UpdateAsync(int id, [FromBody] AttendanceUpdateDto attendanceDto)
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

    [HttpGet("days/{id}")]
    public async Task<AttendanceDayDto> GetDayByIdAsync(int id)
    {
      AttendanceDay tmp = await attendanceService.GetDayByIdAsync(id, false);
      AttendanceDayDto ret = EObjectMapper.To(tmp);
      return ret;
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

    [AllowAnonymous]
    [HttpPost("self/for-day/{dayId}")]
    public async System.Threading.Tasks.Task SelfAssignStudentToDay([FromRoute] int dayId, AttendanceDaySelfSignCreateDto data)
    {
      //if (Request.Cookies.ContainsKey(SELF_SIGN_USED_COOKIE_NAME))
      //  throw new CommonBadDataException(Lib.CommonErrorKind.SelfSignAlreadyUsed, "");

      AttendanceDay atd = await attendanceService.GetDayByIdAsync(dayId, false);
      if (atd.SelfAssignKey == null || atd.SelfAssignKey.Length == 0 || atd.SelfAssignKey != data.Key)
      {
        throw new CommonBadDataException(CommonErrorKind.InvalidSelfSignKey, data.Key);
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

      Response.Cookies.Append(SELF_SIGN_USED_COOKIE_NAME, $"{dayId}-{data.Key}-{data.StudyNumber}",
        new CookieOptions()
        {
          Expires = DateTime.UtcNow.AddMinutes(appSettingsService.GetSettings().SelfSignCookieExpirationInMinutes),
          HttpOnly = false,
          Secure = true
        });
    }

    [HttpPost("self/{selfSignId}")]
    public async System.Threading.Tasks.Task ResolveSelfSigns([FromRoute] int selfSignId, [FromBody] int attendanceValueId)
    {
      await attendanceService.ResolveSelfSignsAsync(selfSignId, attendanceValueId);
    }

    public record BulkImportRequest(int AttendanceDayId, string Text);
    [HttpPost("analyse-for-import")]
    public async Task<AttendanceAnalysisResultDto> AnalyseForBulkImport([FromBody] BulkImportRequest data)
    {
      var tmp = await attendanceService.AnalyseForImportAsync(data.AttendanceDayId, data.Text);
      var ret = new AttendanceAnalysisResultDto(
        tmp.Students.Select(EObjectMapper.To).ToList(), tmp.Errors);
      return ret;
    }

    public record AttendanceDayImportRequest(int AttendanceValueId, List<int> StudentIds);
    [HttpPost("days/{attendanceDayId}/import")]
    public async System.Threading.Tasks.Task ImportDayAttendance([FromRoute] int attendanceDayId, [FromBody] AttendanceDayImportRequest data)
    {
      await attendanceService.ImportAsync(attendanceDayId, data.AttendanceValueId, data.StudentIds);
    }

    //TODO move to DTO file
    public record AttendanceAnalysisResultDto(List<StudentDto> Students, List<string> Errors);
  }
}
