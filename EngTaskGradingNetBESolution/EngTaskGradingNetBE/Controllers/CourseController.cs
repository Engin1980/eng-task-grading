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
    public async Task<CourseOverviewDto> GetOverviewAsync(int id)
    {
      static AttendanceResultDto[] buildAttendanceResults(Course course)
      {
        List<AttendanceResultDto> ret = [];

        foreach (var att in course.Attendances)
          foreach (var day in att.Days)
            foreach (var rec in day.Records)
            {
              AttendanceResultDto dto = new(att.Id, rec.StudentId, rec.Value.Weight);
              ret.Add(dto);
            }

        return ret.ToArray();
      }

      Course course = await courseService.GetForOverview(id);
      CourseOverviewDto ret;

      CourseDto courseDto = EObjectMapper.To(course);

      TaskDto[] tasksDto = course.Tasks.Select(EObjectMapper.To).ToArray();
      StudentDto[] studentsDto = course.Students.Select(EObjectMapper.To).ToArray();
      AttendanceDto[] attendancesDto = course.Attendances.Select(EObjectMapper.To).ToArray();
      AttendanceResultDto[] attendanceDaysDto = buildAttendanceResults(course);
      GradeDto[] gradesDto = course.Tasks.SelectMany(q => q.Grades).Select(EObjectMapper.To).ToArray();
      FinalGradeDto[] finalGradesDto = course.FinalGrades.Select(EObjectMapper.To).ToArray();

      ret = new CourseOverviewDto(courseDto, studentsDto,
        tasksDto, gradesDto,
        attendancesDto, attendanceDaysDto,
        finalGradesDto);
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

    [HttpPut("final-grade/{finalGradeId}/recorded")]
    public async Task<FinalGradeDto> MarkRecorded([FromRoute] int finalGradeId)
    {
      FinalGrade finalGrade = await courseService.SetFinalGradeAsRecordedAsync(finalGradeId);
      FinalGradeDto ret = EObjectMapper.To(finalGrade);
      return ret;
    }

    [HttpDelete("final-grade/{finalGradeId}/recorded")]
    public async Task<FinalGradeDto> MarkUnrecorded([FromRoute] int finalGradeId)
    {
      FinalGrade finalGrade = await courseService.SetFinalGradeAsUnrecordedAsync(finalGradeId);
      FinalGradeDto ret = EObjectMapper.To(finalGrade);
      return ret;
    }

    public record FinalGradePostRequest(int StudentId, int Value, string? Comment);
    [HttpPost("{courseId}/final-grade")]
    public async Task<FinalGradeDto> CreateCourseFinalGrade([FromRoute] int courseId, [FromBody] FinalGradePostRequest data)
    {
      FinalGrade finalGrade = new()
      {
        CourseId = courseId,
        StudentId = data.StudentId,
        Value = data.Value,
        Comment = data.Comment
      };
      finalGrade = await courseService.AddFinalGradeAsync(finalGrade);
      FinalGradeDto ret = EObjectMapper.To(finalGrade);
      return ret;
    }

    public record FinalGradePatchRequest(int Value, string? Comment);
    [HttpPatch("final-grade/{finalGradeId}")]
    public async Task<FinalGradeDto> UpdateCourseFinalGrade([FromRoute] int finalGradeId, [FromBody] FinalGradePatchRequest data)
    {
      FinalGrade finalGrade = await courseService.UpdateFinalGradeAsync(finalGradeId, data.Value, data.Comment);
      FinalGradeDto ret = EObjectMapper.To(finalGrade);
      return ret;
    }

    [HttpDelete("final-grade/{finalGradeId}")]
    public async System.Threading.Tasks.Task DeleteCourseFinalGrade([FromRoute] int finalGradeId)
    {
      await courseService.DeleteFinalGradeAsync(finalGradeId);
    }
  }
}