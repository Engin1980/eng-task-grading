using Microsoft.AspNetCore.Mvc;
using EngTaskGradingNetBE.Models;
using EngTaskGradingNetBE.Services;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Exceptions;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class GradeController(GradeService gradeService) : ControllerBase
  {

    // Insert a new grade
    [HttpPost]
    public async Task<GradeDto> InsertGrade([FromBody] GradeInsertDto request)
    {
      if (request == null)
        throw new BadDataException("Request body is null");

      int teacherId = 1; // TODO: Replace with actual teacher ID from auth context
      var grade = await gradeService.InsertGradeAsync(request.TaskId, request.StudentId, teacherId, request.Value, request.Comment);
      var dto = EObjectMapper.To(grade);
      return dto;
    }

    // Get all grades by course
    [HttpGet("course/{courseId}")]
    public async Task<List<GradeDto>> GetGradesByCourse(int courseId)
    {
      var grades = await gradeService.GetGradesByCourseAsync(courseId);
      List<GradeDto> dtos = grades.Select(EObjectMapper.To).ToList();
      return dtos;
    }
  }
}
