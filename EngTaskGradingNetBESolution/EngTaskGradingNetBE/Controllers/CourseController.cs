using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models;
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
  public class CourseController(CourseService courseService, StudentService studentService) : ControllerBase
  {
    [HttpPost]
    public async Task<ActionResult<Course>> CreateCourseAsync([FromBody] CourseCreateDto courseCreateDto)
    {
      if (courseCreateDto == null)
        return BadRequest("Course data is required.");

      Course course = EObjectMapper.From(courseCreateDto);
      var createdCourse = await courseService.CreateAsync(course);
      var courseDto = EObjectMapper.To(createdCourse);
      return CreatedAtAction(nameof(CreateCourseAsync), courseDto.Id, courseDto);
    }

    [HttpGet]
    public async Task<List<CourseDto>> GetAllCoursesAsync()
    {
      var courses = await courseService.GetAllAsync();
      var courseDtos = courses
        .Select(EObjectMapper.To)
        .OrderBy(c => c.Code)
        .ToList();
      return courseDtos;
    }

    [HttpGet("{id}")]
    public async Task<CourseDto> GetCourseByIdAsync(int id)
    {
      Course course = await courseService.GetByIdAsync(id);
      var dto = EObjectMapper.To(course);
      return dto;
    }


    [HttpPost("{courseId}/import-students")]
    public async System.Threading.Tasks.Task DoImportAsync([FromBody] List<StudentCreateDto> students, [FromRoute]int courseId)
    {
      List<Student> entities = students
        .Select(EObjectMapper.From)
        .ToList();
      var createdStudents = await studentService.CreateAsync(entities);
      var ids = createdStudents.Select(q => q.Id);
      await courseService.AssignStudentsAsync(ids, courseId);
    }
  }
}