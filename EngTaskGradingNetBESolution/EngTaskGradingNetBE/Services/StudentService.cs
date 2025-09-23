using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Services
{
  public class StudentService(AppDbContext context) : DbContextBaseService(context)
  {
    public async Task<IEnumerable<Student>> GetAllAsync()
    {
      return await Db.Students
        .OrderBy(q => q.Surname)
        .ThenBy(q => q.Name)
        .ToListAsync();
    }

    public async Task<IEnumerable<Student>> GetAllByCourseAsync(int courseId)
    {
      return await Db.Students
        .Where(s => s.Courses.Any(c => c.Id == courseId))
        .OrderBy(q => q.Surname)
        .ThenBy(q => q.Name)
        .ToListAsync();
    }

    public async Task<IEnumerable<Student>> GetAllByCourseAsync(Course course)
    {
      if (course == null) return [];
      return await GetAllByCourseAsync(course.Id);
    }

    public async Task<Student> GetByIdAsync(int id)
    {
      Student ret = await Db.Students
        .FirstOrDefaultAsync(q => q.Id == id)
        ?? throw new Exceptions.EntityNotFoundException(typeof(Student), id);
      return ret;
    }

    public StudentAnalysisResultDto AnalyseStagExport(string data)
    {
      var errors = new List<string>();
      var result = new List<StudentCreateDto>();
      if (string.IsNullOrWhiteSpace(data)) return new(result, errors);

      var lines = data.Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries);
      if (lines.Length < 2) return new(result, errors); ;

      string firstLine = lines[0];
      var pts = firstLine.Split("\t").Select(q => q.Trim()).ToList();
      int ptsCount = pts.Count;
      int numberIndex = pts.IndexOf("osCislo");
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

    public async Task<List<Student>> CreateAsync(List<Student> students)
    {
      List<Student> createdEntities = [];
      foreach (var dto in students)
      {
        dto.Number = dto.Number.ToUpper();
        var existing = await CheckIfAlreadyExists(dto);

        if (existing == null)
        {
          await Db.Students.AddAsync(dto);
          createdEntities.Add(dto);
        }
        else
          createdEntities.Add(existing);
      }
      await Db.SaveChangesAsync();

      return createdEntities;
    }

    public async Task<Student> CreateAsync(Student student, bool mayAlreadyExist = true)
    {
      Student? ret = null;
      student.Number = student.Number.ToUpper();
      if (mayAlreadyExist)
        ret = await CheckIfAlreadyExists(student);
      if (ret == null)
      {
        await Db.Students.AddAsync(student);
        await Db.SaveChangesAsync();
      }
      return student;
    }

    private async Task<Student?> CheckIfAlreadyExists(Student student)
    {
      var existing = await Db.Students.FirstOrDefaultAsync(s => s.Number == student.Number);
      if (existing != null)
      {
        if (existing.Name != student.Name || existing.Surname != student.Surname ||
          existing.Email != student.Email || existing.UserName != student.UserName)
        {
          throw new Exception($"Unable to insert student {student.Name} {student.Surname} ({student.Number}). Student already exists with different values!");
        }
      }
      return existing;
    }

    public async Task<Student> UpdateAsync(int id, Student updatedStudent)
    {
      var existingStudent = await Db.Students.FirstOrDefaultAsync(q => q.Id == id)
        ?? throw new Exceptions.EntityNotFoundException(typeof(Student), id);

      existingStudent.Number = updatedStudent.Number;
      existingStudent.Name = updatedStudent.Name;
      existingStudent.Surname = updatedStudent.Surname;
      existingStudent.UserName = updatedStudent.UserName;
      existingStudent.Email = updatedStudent.Email;
      existingStudent.StudyProgram = updatedStudent.StudyProgram;
      existingStudent.StudyForm = updatedStudent.StudyForm;

      await Db.SaveChangesAsync();
      return existingStudent;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int id, bool mustExist = false)
    {
      var student = await Db.Students.FirstOrDefaultAsync(q => q.Id == id);
      if (student == null)
        if (mustExist) throw new Exceptions.EntityNotFoundException(typeof(Student), id);
        else return;
      Db.Students.Remove(student);
      await Db.SaveChangesAsync();
      return;
    }

    internal async Task<Student> GetByStudyNumberAsync(string studyNumber)
    {
      Student ret = await Db.Students
        .FirstOrDefaultAsync(q => q.Number == studyNumber.ToUpper())
        ?? throw new Exceptions.EntityNotFoundException(typeof(Student), "StudyNumber ==" + studyNumber);
      return ret;
    }
  }
}
