using EngTaskGradingNetBE.Models.DbModel;

namespace EngTaskGradingNetBE.Services
{
  public abstract class DbContextBaseService(AppDbContext context)
  {
    private readonly AppDbContext db = context;
    protected AppDbContext Db => db;
  }
}
