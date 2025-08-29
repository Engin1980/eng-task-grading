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
  [Route("api/v1/teacher")]
  public class TeacherController(AuthService authService, TeacherService teacherService) : ControllerBase
  {
    [HttpPost("login")]
    public async Task<TeacherDto> LoginAsync([FromBody] TeacherLoginDto request)
    {
      throw new NotImplementedException();
      //var teacher = await authService.ValidateTeacherCredentialsAsync(request.Email, request.Password);
      //return EObjectMapper.To(teacher);
    }

    [HttpPost("register")]
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
      return EObjectMapper.To(teachers);
    }

    [HttpGet("{id}")]
    public async Task<TeacherDto> GetById(int id)
    {
      var teacher = await teacherService.GetAsync(id);
      return EObjectMapper.To(teacher);
    }
  }
}
