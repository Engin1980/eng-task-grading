using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class StudentController([FromServices] StudentService studentService) : ControllerBase
  {
    [HttpGet("by-course/{courseId}")]
    public ActionResult<IEnumerable<StudentDto>> GetStudentsByCourseId(int courseId)
    {
      var students = studentService.GetAllByCourseId(courseId);
      var result = students
        .Select(EObjectMapper.To)
        .OrderBy(q => q.Surname)
        .ThenBy(q => q.Name).ToList();
      return Ok(result);
    }

    [HttpGet("{id}")]
    public StudentDto GetStudentById(int id)
    {
      var student = studentService.GetById(id);
      var dto = EObjectMapper.To(student);
      return dto;
    }

    //[HttpPost]
    //public ActionResult<StudentDto> CreateStudent([FromBody] StudentCreateDto studentDto)
    //{
    //  var createdStudent = studentService.CreateStudent(studentDto);
    //  return CreatedAtAction(nameof(GetStudentById), new { id = createdStudent.Id }, createdStudent);
    //}

    [HttpPost("analyse-stag-export")]
    public StudentAnalysisResultDto AnalyseStagExport([FromBody] string data)
    {
      var result = studentService.AnalyseStagExport(data);
      return result;
    }

    [HttpPost("create-students")]
    public async Task CreateStudentsAsync([FromBody] List<StudentCreateDto> students)
    {
      await studentService.CreateStudentsAsync(students);
    }
  }
}
