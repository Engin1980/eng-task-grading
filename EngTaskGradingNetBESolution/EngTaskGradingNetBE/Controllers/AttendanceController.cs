using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/v1/[controller]")]
  public class AttendanceController(AttendanceService attendanceService) : ControllerBase
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

    [HttpPut("{id}")]
    public async Task<AttendanceDto> UpdateAsync(int id, [FromBody] AttendanceDto attendanceDto)
    {
      Attendance att = EObjectMapper.From(attendanceDto);
      var updated = await attendanceService.UpdateAsync(id, att);
      AttendanceDto ret = EObjectMapper.To(updated);
      return ret;
    }

    [HttpDelete("{id}")]
    public async System.Threading.Tasks.Task DeleteAsync(int id)
    {
      await attendanceService.DeleteAsync(id);
    }

    [HttpPost("{attId}/days")]
    public async System.Threading.Tasks.Task AddDayAsync(int attId, [FromBody] AttendanceDayCreateUpdateDto dayDto)
    {
      AttendanceDay day = EObjectMapper.From(dayDto);
      await attendanceService.AddDayAsync(attId, day);
    }

    [HttpPut("{attId}/days/{dayId}")]
    public async System.Threading.Tasks.Task UpdateDayAsync(int attId, int dayId, [FromBody] AttendanceDayCreateUpdateDto dayDto)
    {
      AttendanceDay day = EObjectMapper.From(dayDto);
      await attendanceService.UpdateDayAsync(dayId, day);
    }

    [HttpDelete("{attId}/days/{dayId}")]
    public async System.Threading.Tasks.Task DeleteDayAsync(int attId, int dayId)
    {
      await attendanceService.DeleteDayAsync(dayId);
    }
  }
}
