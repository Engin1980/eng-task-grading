using EngGradesBE.DbModel;

namespace EngTaskGradingNetBE.Services
{
  public abstract class DbContextService(AppDbContext context)
  {
    private readonly AppDbContext db = context;
    protected AppDbContext Db => db;
  }
}
