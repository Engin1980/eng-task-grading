using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/v1/[controller]")]
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
    public async Task<TaskDto> CreateTaskAsync([FromBody] TaskCreateDto taskCreateDto)
    {
      var task = EObjectMapper.From(taskCreateDto);
      var createdTask = await taskService.CreateAsync(taskCreateDto.CourseId, task);
      var taskDto = EObjectMapper.To(createdTask);
      return taskDto;
    }

    [HttpGet("{id}")]
    public async Task<TaskDto> GetAsync([FromRoute] int id)
    {
      var task = await taskService.GetByIdAsync(id);
      var taskDto = EObjectMapper.To(task);
      return taskDto;
    }
  }
}
