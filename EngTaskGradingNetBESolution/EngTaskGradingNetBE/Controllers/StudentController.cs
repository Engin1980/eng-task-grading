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
    public async Task<IEnumerable<CourseStudentDto>> GetStudentsByCourseIdAsync(int courseId)
    {
      var students = await studentService.GetAllByCourseWithGroupAsync(courseId);
      return students.Select(EObjectMapper.To).ToList();
    }

    [HttpPut("for-course/{courseId}/{studentId}/study-group")]
    public async Task<CourseStudentDto> UpdateStudyGroupAsync(int courseId, int studentId, [FromBody] StudentStudyGroupUpdateDto dto)
    {
      var updated = await studentService.UpdateStudyGroupAsync(courseId, studentId, dto.StudyGroup);
      return EObjectMapper.To(updated);
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
