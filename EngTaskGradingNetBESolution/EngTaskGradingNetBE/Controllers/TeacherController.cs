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
    [HttpPost("login")]
    public async Task<TeacherDto> LoginAsync([FromBody] TeacherLoginDto request)
    {
      Teacher teacher = await authService.LoginAsync(request.Email, request.Password);
      TeacherDto dto = EObjectMapper.To(teacher);
      return dto;
    }

    [HttpPost]
    public async Task<TeacherDto> RegisterAsync([FromBody] TeacherRegisterDto request)
    {
      var teacher = await authService.RegisterTeacher(request.Email, request.Password);
      return EObjectMapper.To(teacher);
    }

    [HttpGet]
    public async Task<IEnumerable<TeacherDto>> GetAllTeachers()
    {
      // add security
      var teachers = await teacherService.GetAllTeachersAsync();
      return teachers.Select(EObjectMapper.To)
        .OrderBy(q => q.Email)
        .ToList();
    }

    [HttpGet("{id}")]
    public async Task<TeacherDto> GetById(int id)
    {
      var teacher = await teacherService.GetAsync(id);
      return EObjectMapper.To(teacher);
    }
  }
}
