using EngGradesBE.Migrations;
using EngTaskGradingNetBE.Models.DbModel;
using Microsoft.EntityFrameworkCore;
using System.IO.Compression;
using System.Reflection;
using System.Threading.Tasks;

namespace EngTaskGradingNetBE.Services
{
  public class DatabaseBackupService(
    AppDbContext context,
    ILogger<DatabaseBackupService> logger) : DbContextBaseService(context)
  {
    private static readonly string outDir = Path.Combine("Data", "Backup");
    private const int MAX_BACKUP_FILES_COUNT = 10;
    private ILogger<DatabaseBackupService> logger = logger;

    public async Task<bool> IsBackupNeededAsync()
    {
      bool checkZipFileExists()
      {
        string zipFileNameBeginning = System.IO.Path.GetFileName(GetCurrentBackupZipFileName())[..10];
        string[] zipFiles = System.IO.Path.Exists(outDir) ? System.IO.Directory.GetFiles(outDir, "*.zip") : [];
        string? existingZipFile = zipFiles.FirstOrDefault(q => q.StartsWith(zipFileNameBeginning));
        if (existingZipFile != null)
        {
          this.logger.LogDebug("Backup not needed: zip file beginning '{zipFileNameBeginning}' already exists as '{existingZipFile}'",
            zipFileNameBeginning, System.IO.Path.GetFullPath(existingZipFile));
        }
        else
        {
          this.logger.LogDebug("Backup needed: no existing zip file beginning '{zipFileNameBeginning}' found",
            zipFileNameBeginning);
        }
        return existingZipFile == null;
      }

      Task<bool> t = Task<bool>.Run(checkZipFileExists);
      return await t;
    }

    public async System.Threading.Tasks.Task BackupDatabaseAsync()
    {
      Dictionary<string, List<string>> backups = [];

      backups["teachers"] = ConvertToCsv(await Db.Teachers.ToListAsync());
      backups["students"] = ConvertToCsv(await Db.Students.ToListAsync());
      backups["courses"] = ConvertToCsv(await Db.Courses.ToListAsync());
      backups["tasks"] = ConvertToCsv(await Db.Tasks.ToListAsync());
      backups["grades"] = ConvertToCsv(await Db.Grades.ToListAsync());
      backups["attendances"] = ConvertToCsv(await Db.Attendances.ToListAsync());
      backups["attendanceValues"] = ConvertToCsv(await Db.AttendanceValues.ToListAsync());
      backups["attendanceDays"] = ConvertToCsv(await Db.AttendanceDays.ToListAsync());
      backups["attendanceRecords"] = ConvertToCsv(await Db.AttendanceRecords.ToListAsync());
      backups["finalGrades"] = ConvertToCsv(await Db.FinalGrades.ToListAsync());
      backups["studentCourse"] = ConvertToCsv(await Db.Set<Student>().Include(s => s.Courses).ToListAsync());
      backups["teacherCourse"] = ConvertToCsv(await Db.Set<Teacher>().Include(t => t.Courses).ToListAsync());

      await StoreDataToZipAsync(backups);
      await DeleteOldBackups();
    }

    private async System.Threading.Tasks.Task DeleteOldBackups()
    {
      if (!Directory.Exists(outDir)) return;

      var files = Directory.GetFiles(outDir, "*.zip").OrderByDescending(q => q);
      var filesToDelete = files.Skip(MAX_BACKUP_FILES_COUNT);
      foreach (var file in filesToDelete)
      {
        System.Threading.Tasks.Task delTask = System.Threading.Tasks.Task.Run(() => File.Delete(file));
        await delTask;
      }
    }

    private static string GetCurrentBackupZipFileName() =>
      System.IO.Path.Combine(
        outDir,
        DateTime.UtcNow.ToString("yyyy-MM-dd-HH-mm-ss") + ".zip");

    private async System.Threading.Tasks.Task StoreDataToZipAsync(Dictionary<string, List<string>> backups)
    {
      // 1. Vytvoříme unikátní dočasnou složku

      string tempDir = Path.Combine(outDir, "Temp");
      Directory.CreateDirectory(tempDir);

      string zipPath = GetCurrentBackupZipFileName();
      if (System.IO.File.Exists(zipPath))
      {
        this.logger.LogWarning("Backup zip file '{zipPath}' already exists, skipping backup.",
          System.IO.Path.GetFullPath(zipPath));
        //already backuped today, skip
        return;
      }

      try
      {
        foreach (var key in backups.Keys)
        {
          string fileName = $"{key}.csv";
          string filePath = Path.Combine(tempDir, fileName);
          await File.WriteAllLinesAsync(filePath, backups[key]);
        }

        System.Threading.Tasks.Task zipTask = System.Threading.Tasks.Task.Run(
          () => ZipFile.CreateFromDirectory(tempDir, zipPath));
        await zipTask;
        this.logger.LogInformation("Database backup created at '{zipPath}'",
          System.IO.Path.GetFullPath(zipPath));
      }
      finally
      {
        System.Threading.Tasks.Task delTask = System.Threading.Tasks.Task.Run(() =>
        {
          // 5. Úklid: Smažeme dočasnou složku i se soubory
          if (Directory.Exists(tempDir))
          {
            Directory.Delete(tempDir, true);
          }
        });
        await delTask;
      }
    }

    private List<PropertyInfo> GetEntityPropertyInfos<T>() where T : class
    {
      var entityType = this.Db.Model.FindEntityType(typeof(T))
        ?? throw new InvalidOperationException($"Entity type '{typeof(T).Name}' not found in the DbContext model.");

      List<PropertyInfo> ret = entityType.GetProperties()
          .Select(p => p.PropertyInfo)
          .Where(pi => pi != null)
          .Cast<PropertyInfo>()
          .ToList();

      return ret;
    }

    private List<string> ConvertToCsv<T>(List<T> students) where T : class
    {
      Dictionary<Type, HashSet<string>> prohibitedColumns = new()
      {
        { typeof(Teacher), [
          nameof(Teacher.PasswordHash) ] },
        { typeof(Student), [
            nameof(Student.Name),
            nameof(Student.Surname),
            nameof(Student.UserName) ]  }
      };
      List<string> ret = [];
      HashSet<string> currentProhibitedColumns = prohibitedColumns.ContainsKey(typeof(T))
        ? prohibitedColumns[typeof(T)] : [];
      var props = GetEntityPropertyInfos<T>()
        .Where(q => currentProhibitedColumns.Contains(q.Name) == false);

      string header = ToCsvRow(props.Select(q => q.Name));
      ret.Add(header);

      foreach (var item in students)
      {
        var values = props.Select(p =>
        {
          var val = p.GetValue(item);
          return val?.ToString() ?? "(null)";
        });
        string row = ToCsvRow(values);
        ret.Add(row);
      }
      return ret;
    }

    private static string ToCsvRow(IEnumerable<string> values)
    {
      var formattedValues = values.Select(v =>
      {
        if (string.IsNullOrEmpty(v)) return "";

        if (v.Contains(';') || v.Contains('"') || v.Contains('\n') || v.Contains('\r'))
          return $"\"{v.Replace("\"", "\"\"")}\"";

        return v;
      });

      return string.Join(";", formattedValues);
    }
  }
}
