using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class GradeController(GradeService gradeService) : ControllerBase
  {

    [HttpGet("for-course/{courseId}")]
    public async Task<GradeSet> GetCourseGradeSet([FromRoute] int courseId)
    {
      var tmp = await gradeService.GetGradesByCourseAsync(courseId);

      GradeSet ret = new GradeSet(tmp.Tasks.Select(EObjectMapper.To).ToList(),
        tmp.Students.Select(EObjectMapper.To).OrderBy(q => q.Surname).ThenBy(q => q.Name).ToList(),
        tmp.Grades.Select(EObjectMapper.To).ToList());
      return ret;
    }

    [HttpGet("for-task/{taskId}")]
    public async Task<GradeSet> GetTaskGradeSet([FromRoute] int taskId)
    {
      var tmp = await gradeService.GetGradesByTaskAsync(taskId);

      List<Models.DbModel.Task> tasks = [tmp.Task];
      GradeSet ret = new GradeSet(tasks.Select(EObjectMapper.To).ToList(),
        tmp.Students.Select(EObjectMapper.To).OrderBy(q => q.Surname).ThenBy(q => q.Name).ToList(),
        tmp.Grades.Select(EObjectMapper.To).ToList());
      return ret;
    }
  }
}
