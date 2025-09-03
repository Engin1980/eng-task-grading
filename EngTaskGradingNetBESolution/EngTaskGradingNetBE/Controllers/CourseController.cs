using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class CourseController(CourseService courseService, StudentService studentService) : ControllerBase
  {
    [HttpPost]
    public async Task<ActionResult<Course>> CreateCourse([FromBody] CourseCreateDto courseCreateDto)
    {
      if (courseCreateDto == null)
        return BadRequest("Course data is required.");

      Course course = EObjectMapper.From(courseCreateDto);
      var createdCourse = await courseService.CreateCourseAsync(course);
      var courseDto = EObjectMapper.ToDto(createdCourse);
      return CreatedAtAction(nameof(CreateCourse), courseDto.Id, courseDto);
    }

    [HttpGet]
    public async Task<List<CourseDto>> GetAllCourses()
    {
      var courses = await courseService.GetAllCoursesAsync();
      var courseDtos = courses
        .Select(EObjectMapper.ToDto)
        .OrderBy(c => c.Code)
        .ToList();
      return courseDtos;
    }

    [HttpGet("{id}")]
    public async Task<CourseDto> GetCourseById(int id)
    {
      Course course = await courseService.GetCourseByIdAsync(id);
      var dto = EObjectMapper.ToDto(course);
      return dto;
    }


    [HttpPost("{courseId}/import")]
    public async System.Threading.Tasks.Task DoImportAsync([FromBody] List<StudentCreateDto> students, [FromRoute]int courseId)
    {
      var createdStudents = await studentService.CreateStudentsAsync(students);
      var ids = createdStudents.Select(q => q.Id);
      await courseService.AssignStudentsToCourseAsync(ids, courseId);
    }
  }
}