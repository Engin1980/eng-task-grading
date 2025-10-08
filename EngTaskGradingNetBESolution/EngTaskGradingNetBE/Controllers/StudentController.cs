using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/v1/[controller]")]
  [Authorize(Roles = Roles.TEACHER_ROLE)]
  public class StudentController([FromServices] StudentService studentService) : ControllerBase
  {
    [HttpGet("for-course/{courseId}")]
    public async Task<IEnumerable<StudentDto>> GetStudentsByCourseIdAsync(int courseId)
    {
      var students = await studentService.GetAllByCourseAsync(courseId);
      var result = students
        .Select(EObjectMapper.To)
        .OrderBy(q => q.Surname)
        .ThenBy(q => q.Name).ToList();
      return result;
    }

    [HttpGet("{id}")]
    public async Task<StudentDto> GetStudentByIdAsync(int id)
    {
      var student = await studentService.GetByIdAsync(id);
      var dto = EObjectMapper.To(student);
      return dto;
    }

    [HttpPost("analyse-stag-export")]
    public StudentAnalysisResultDto AnalyseStagExport([FromBody] string data)
    {
      var result = studentService.AnalyseStagExport(data);
      return result;
    }
  }
}
