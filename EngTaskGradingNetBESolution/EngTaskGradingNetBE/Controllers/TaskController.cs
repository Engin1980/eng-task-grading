using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/v1/[controller]")]
  [Authorize(Roles = Roles.TEACHER_ROLE)]
  public class TaskController(TaskService taskService) : ControllerBase
  {
    [HttpGet("for-course/{courseId}")]
    public async Task<List<TaskDto>> GetAllByCourseAsync([FromRoute] int courseId)
    {
      var tasks = await taskService.GetAllByCourseAsync(courseId);
      var taskDtos = tasks
        .Select(EObjectMapper.To)
        .OrderBy(t => t.Title)
        .ToList();
      return taskDtos;
    }

    [HttpPost()]
    public async System.Threading.Tasks.Task CreateTaskAsync([FromBody] TaskCreateDto taskCreateDto)
    {
      var task = EObjectMapper.From(taskCreateDto);
      await taskService.CreateAsync(taskCreateDto.CourseId, task);
    }

    [HttpPatch("{taskId}")]
    public async System.Threading.Tasks.Task UpdateTaskAsync([FromRoute] int taskId, [FromBody] TaskUpdateDto taskUpdateDto)
    {
      var task = EObjectMapper.From(taskUpdateDto);
      await taskService.UpdateAsync(taskId, task);
    }

    [HttpGet("{id}")]
    public async Task<TaskDto> GetByIdAsync([FromRoute] int id)
    {
      var task = await taskService.GetByIdAsync(id);
      var taskDto = EObjectMapper.To(task);
      return taskDto;
    }
  }
}
