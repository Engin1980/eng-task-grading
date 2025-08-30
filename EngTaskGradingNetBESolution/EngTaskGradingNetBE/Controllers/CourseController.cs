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
  public class CourseController(CourseService courseService) : ControllerBase
  {
    [HttpPost]
    public async Task<ActionResult<Course>> CreateCourse([FromBody] Course course)
    {
      if (course == null)
      {
        return BadRequest("Course data is required.");
      }

      var createdCourse = await courseService.CreateCourseAsync(course);
      return CreatedAtAction(nameof(CreateCourse), new { id = createdCourse.Id }, createdCourse);
    }

    [HttpGet]
    public async Task<List<CourseOverviewDto>> GetAllCourses()
    {
      var courses = await courseService.GetAllCoursesAsync();
      var courseDtos = courses.Select(c => EObjectMapper.ToOverview(c)).ToList();
      return courseDtos;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Course>> GetCourseById(int id)
    {
      var course = await courseService.GetCourseByIdAsync(id);
      return Ok(course);
    }

  }
}