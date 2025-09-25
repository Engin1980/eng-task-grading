using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Newtonsoft.Json.Linq;
using System.IdentityModel.Tokens.Jwt;

namespace EngTaskGradingNetBE.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = Roles.STUDENT_ROLE)]
public class StudentViewController(
  StudentViewService studentViewService) : ControllerBase
{  

  [HttpGet("courses")]
  public async Task<List<CourseDto>> GetCourses()
  {
    string studyNumber;
    try
    {
      studyNumber = GetStudyNumberFromJwt();
    }
    catch (Exception ex)
    {
      throw new UnauthorizedAccessException(ex.Message);
    }

    // Get student's courses from database
    var courses = await studentViewService.GetStudentCoursesAsync(studyNumber);
    var courseDtos = courses.Select(EObjectMapper.To).ToList();
    return courseDtos;
  }

  [HttpGet("courses/{id}")]
  public async Task<StudentViewCourseDto> GetGrading([FromRoute] int id)
  {
    string studyNumber;
    try
    {
      studyNumber = GetStudyNumberFromJwt();
    }
    catch (Exception ex)
    {
      throw new UnauthorizedAccessException(ex.Message);
    }

    StudentViewService.StudentCourseDetailResult courseData = await studentViewService.GetStudentCourseDetailAsync(studyNumber, id);

    StudentViewCourseDto ret = new(
      EObjectMapper.To(courseData.Course),
      courseData.Course.Tasks.Select(EObjectMapper.To).ToList(),
      courseData.Course.Attendances.Select(EObjectMapper.To).ToList(),
      courseData.Grades.Select(EObjectMapper.To).ToList(),
      courseData.AttendanceRecords.Select(q => new AttendanceDaySetRecordDto(q.Id, q.StudentId, q.AttendanceDayId, q.Value.Title, q.Value.Weight))
      .ToList());

    return ret;
  }

  private string GetStudyNumberFromJwt()
  {
    // Extract JWT token from Authorization header
    var authHeader = Request.Headers.Authorization.FirstOrDefault();
    if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
    {
      throw new ApplicationException("Authorization header is missing or invalid.");
    }

    var tokenString = authHeader["Bearer ".Length..].Trim();

    var handler = new JwtSecurityTokenHandler();
    var token = handler.ReadJwtToken(tokenString);

    string sub = token.Claims.FirstOrDefault(c => c.Type == "sub")?.Value
        ?? throw new ApplicationException("Token does not contain 'sub' claim.");

    return sub;
  }
}