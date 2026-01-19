using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/v1/[controller]")]
  [Authorize(Roles = Roles.TEACHER_ROLE)]
  public class GradeController(GradeService gradeService) : ControllerBase
  {

    [HttpGet("for-course/{courseId}")]
    public async Task<GradeSetDto> GetCourseGradeSetAsync([FromRoute] int courseId)
    {
      var tmp = await gradeService.GetGradesByCourseAsync(courseId);

      GradeSetDto ret = new GradeSetDto(tmp.Tasks.Select(EObjectMapper.To).ToList(),
        tmp.Students.Select(EObjectMapper.To).OrderBy(q => q.Surname).ThenBy(q => q.Name).ToList(),
        tmp.Grades.Select(EObjectMapper.To).ToList());
      return ret;
    }

    [HttpGet("for-course/{courseId}/new")]
    public async Task<List<NewGradeSetTaskDto>> GetCourseGradeSetNewAsync([FromRoute] int courseId)
    {
      var tmp = await gradeService.GetGradesByCourseAsync(courseId);
      List<NewGradeSetTaskDto> ret = [];

      foreach (var tmpTask in tmp.Tasks)
      {
        TaskDto taskDto = EObjectMapper.To(tmpTask);

        List<NewGradeSetStudentDto> students = [];

        foreach (var tmpStudent in tmp.Students)
        {
          StudentDto studentDto = EObjectMapper.To(tmpStudent);
          List<Grade> grades = tmp.Grades.Where(q => q.StudentId == tmpStudent.Id && q.TaskId == tmpTask.Id).OrderByDescending(q => q.Date).ToList();
          List<GradeDto> gradeDtos = grades.Select(EObjectMapper.To).ToList();
          NewGradeSetStudentDto studentSetDto = new(studentDto, gradeDtos);
          students.Add(studentSetDto);
        }
        NewGradeSetTaskDto it = new(taskDto, students.OrderBy(q => q.Student.Surname).ThenBy(q => q.Student.Name).ToList());
        ret.Add(it);
      }
      return ret;
    }

    [HttpGet("for-task/{taskId}")]
    public async Task<GradeSetDto> GetTaskGradeSetAsync([FromRoute] int taskId)
    {
      var tmp = await gradeService.GetGradesByTaskAsync(taskId);

      List<Models.DbModel.Task> tasks = [tmp.Task];
      GradeSetDto ret = new GradeSetDto(tasks.Select(EObjectMapper.To).ToList(),
        tmp.Students.Select(EObjectMapper.To).OrderBy(q => q.Surname).ThenBy(q => q.Name).ToList(),
        tmp.Grades.Select(EObjectMapper.To).ToList());
      return ret;
    }

    [HttpGet("for-task/{taskId}/new")]
    public async Task<NewGradeSetTaskDto> GetTaskGradeSetNewAsync([FromRoute] int taskId)
    {
      var tmp = await gradeService.GetGradesByTaskAsync(taskId);

      NewGradeSetTaskDto ret;

      TaskDto taskDto = EObjectMapper.To(tmp.Task);
      List<NewGradeSetStudentDto> students = [];

      foreach (var tmpStudent in tmp.Students)
      {
        StudentDto studentDto = EObjectMapper.To(tmpStudent);
        List<Grade> grades = tmp.Grades.Where(q => q.StudentId == tmpStudent.Id).OrderByDescending(q => q.Date).ToList();
        List<GradeDto> gradeDtos = grades.Select(EObjectMapper.To).ToList();
        NewGradeSetStudentDto studentSetDto = new(studentDto, gradeDtos);
        students.Add(studentSetDto);
      }
      ret = new(taskDto, students.OrderBy(q => q.Student.Surname).ThenBy(q => q.Student.Name).ToList());
      return ret;
    }

    [HttpPost]
    public async Task<GradeDto> CreateAsync([FromBody] GradeCreateDto gradeCreateDto)
    {
      Grade grade = EObjectMapper.From(gradeCreateDto, DateTime.UtcNow);
      var createdGrade = await gradeService.CreateAsync(grade);
      var gradeDto = EObjectMapper.To(createdGrade);
      return gradeDto;
    }

    [HttpPatch("{id}")]
    public async Task<GradeDto> UpdateAsync([FromRoute] int id, [FromBody] GradeUpdateDto gradeUpdateDto)
    {
      var grade = EObjectMapper.From(gradeUpdateDto);
      grade = await gradeService.UpdateAsync(id, grade);
      var ret = EObjectMapper.To(grade);
      return ret;
    }

    [HttpDelete("{id}")]
    public async System.Threading.Tasks.Task DeleteAsync([FromRoute] int id)
    {
      await gradeService.DeleteAsync(id);
    }
  }
}
