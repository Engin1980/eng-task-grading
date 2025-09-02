using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;

namespace EngTaskGradingNetBE.Services
{
  public class StudentService(AppDbContext context) : DbContextBaseService(context)
  {
    public IEnumerable<Student> GetAll()
    {
      return Db.Students.ToList();
    }

    public IEnumerable<Student> GetAllByCourseId(int courseId)
    {
      return Db.Students.Where(s => s.Courses.Any(c => c.Id == courseId)).ToList();
    }

    public IEnumerable<Student> GetStudentsByCourse(Course course)
    {
      if (course == null) return [];
      return GetAllByCourseId(course.Id);
    }

    public Student GetById(int id)
    {
      throw new NotImplementedException();
    }

    public StudentAnalysisResultDto AnalyseStagExport(string data)
    {
      var errors = new List<string>();
      var result = new List<StudentCreateDto>();
      if (string.IsNullOrWhiteSpace(data)) return new(result, errors);

      var lines = data.Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries);
      if (lines.Length < 2) return new(result, errors); ;

      string firstLine = lines[0];
      var pts = firstLine.ToLower().Split("\t").Select(q => q.Trim()).ToList();
      int ptsCount = pts.Count;
      int numberIndex = pts.IndexOf("oscislo");
      int nameIndex = pts.IndexOf("jmeno");
      int surnameIndex = pts.IndexOf("prijmeni");
      int userNameIndex = pts.IndexOf("userName");
      int studyProgramIndex = pts.IndexOf("nazevSp");
      int studyFormIndex = pts.IndexOf("formaSp");
      int emailIndex = pts.IndexOf("email");

      int index = 0;
      foreach (string line in lines[1..])
      {
        index++;
        var dataPts = line.Split("\t").Select(q => q.Trim()).ToList();

        if (dataPts.Count != pts.Count)
        {
          errors.Add($"Line {index}: Header has {pts.Count} columns, but row has {dataPts.Count} columns. Skipped.");
          continue;
        }

        var dto = new StudentCreateDto(
          dataPts[numberIndex], dataPts[nameIndex], dataPts[surnameIndex],
          dataPts[userNameIndex], dataPts[emailIndex], dataPts[studyProgramIndex], dataPts[studyFormIndex]);
        result.Add(dto);
      }

      return new(result, errors);
    }

    public async System.Threading.Tasks.Task CreateStudentsAsync(List<StudentCreateDto> students)
    {
      foreach (var dto in students)
      {
        var existing = Db.Students.FirstOrDefault(s => s.Number == dto.Number);
        if (existing != null)
        {
          if (existing.Name != dto.Name || existing.Surname != dto.Surname ||
            existing.Email != dto.Email || existing.UserName != dto.UserName)
          {
            throw new Exception($"Unable to insert student {dto.Name} {dto.Surname} ({dto.Number}). Student already exists with different values!");
          }
        }

        var student = new Student
        {
          Number = dto.Number,
          Name = dto.Name,
          Surname = dto.Surname,
          Email = dto.Email,
          StudyForm = dto.StudyForm,
          StudyProgram = dto.StudyProgram
        };

        await Db.Students.AddAsync(student);
      }
      await Db.SaveChangesAsync();
    }
  }
}
