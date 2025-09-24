using Microsoft.AspNetCore.Mvc;
using EngTaskGradingNetBE.Services;
using EngTaskGradingNetBE.Models;
using System.Threading.Tasks;
using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.DbModel;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/v1/teacher")]
  public class TeacherController(AuthService authService, TeacherService teacherService) : ControllerBase
  {
    [HttpPost]
    public async Task<TeacherDto> RegisterAsync([FromBody] TeacherCreateDto request)
    {
      Teacher teacher = EObjectMapper.From(request);
      await teacherService.Create(teacher);
      await authService.SetPasswordAsync(teacher.Id, request.Password);
      return EObjectMapper.To(teacher);
    }

    [HttpGet]
    public async Task<IEnumerable<TeacherDto>> GetAllTeachersAsync()
    {
      // add security
      var teachers = await teacherService.GetAllTeachersAsync();
      return teachers.Select(EObjectMapper.To)
        .OrderBy(q => q.Email)
        .ToList();
    }

    [HttpGet("{id}")]
    public async Task<TeacherDto> GetByIdAsync(int id)
    {
      var teacher = await teacherService.GetAsync(id);
      return EObjectMapper.To(teacher);
    }
  }
}
