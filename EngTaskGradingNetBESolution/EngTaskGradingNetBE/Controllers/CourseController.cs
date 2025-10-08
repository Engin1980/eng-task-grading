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
      Course course = EObjectMapper.From(courseCreateDto);
      var createdCourse = await courseService.CreateAsync(course);
      var courseDto = EObjectMapper.To(createdCourse);
      return CreatedAtAction(nameof(CreateCourseAsync), courseDto.Id, courseDto);
    }

    [HttpPatch("{courseId}")]
    public async System.Threading.Tasks.Task UpdateCourseAsync([FromRoute] int courseId, [FromBody] CourseUpdateDto courseDto)
    {
      Course course = EObjectMapper.From(courseDto);
      await courseService.UpdateAsync(courseId, course);
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

    [HttpGet("{id}/overview")]
    public async Task<GSetCourse> GetOverviewAsync(int id)
    {
      Course course = await courseService.GetForOverview(id);
      GSetCourse ret;

      List<GSetCourseStudentDto> students = [];
      foreach (var student in course.Students.OrderBy(q => q.Surname).ThenBy(q => q.Name))
      {
        var gradesPerTask = student.Grades
          .Where(q => q.Task.CourseId == course.Id)
          .GroupBy(q => q.TaskId)
          .ToDictionary(q => q.Key, q => q.ToList());
        var taskGrades = gradesPerTask
          .Select(q => new GSetCourseStudentTaskDto(
            q.Key,
            q.Value.Select(q => EObjectMapper.To(q)).ToArray()))
          .ToArray();

        var atts = student.AttendanceRecords
          .Where(q => q.AttendanceDay.Attendance.CourseId == course.Id)
          .GroupBy(q => q.AttendanceDay.AttendanceId)
          .ToDictionary(q => q.Key, q => q.ToList());

        GSetCourseStudentAttendanceDto[] attDtos = atts
          .Select(q => new GSetCourseStudentAttendanceDto(
            q.Key,
            q.Value.Sum(p => p.Value.Weight)))
          .ToArray();

        GSetCourseStudentDto gSetStudentDto = new(
          EObjectMapper.To(student),
          taskGrades,
          attDtos);
        students.Add(gSetStudentDto);
      }

      ret = new GSetCourse(
        EObjectMapper.To(course),
        course.Tasks.Select(EObjectMapper.To).ToArray(),
        course.Attendances.Select(EObjectMapper.To).ToArray(),
        students.ToArray());

      return ret;
    }


    [HttpPost("{courseId}/import-students")]
    public async System.Threading.Tasks.Task DoImportAsync([FromBody] List<StudentCreateDto> students, [FromRoute] int courseId)
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