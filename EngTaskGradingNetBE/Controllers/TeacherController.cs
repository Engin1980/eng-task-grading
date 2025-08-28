using Microsoft.AspNetCore.Mvc;
using EngTaskGradingNetBE.Services;
using EngTaskGradingNetBE.Models;
using System.Threading.Tasks;
using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Lib;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class TeacherController(AuthService authService, TeacherService teacherService) : ControllerBase
  {
    [HttpPost("login")]
    public async Task<TeacherDto> Login([FromBody] TeacherLoginDto request)
    {
      var teacher = await authService.ValidateTeacherCredentialsAsync(request.Email, request.Password);
      return EObjectMapper.To(teacher);
    }

    [HttpPost("register")]
    public async Task<TeacherDto> Register([FromBody] TeacherRegisterDto request)
    {
      var teacher = await authService.RegisterTeacher(request.Email, request.Password);
      return EObjectMapper.To(teacher);
    }

    [HttpGet]
    public async Task<IEnumerable<TeacherDto>> GetAllTeachers()
    {
      // add security
      var teachers = await teacherService.GetAllTeachersAsync();
      return EObjectMapper.To(teachers);
    }
  }
}
