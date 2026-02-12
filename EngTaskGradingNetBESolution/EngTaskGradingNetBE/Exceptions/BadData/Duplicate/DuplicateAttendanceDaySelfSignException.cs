namespace EngTaskGradingNetBE.Exceptions.BadData.Duplicate
{
  public class DuplicateAttendanceDaySelfSignException() : DuplicateItemException("Student-self-sign already created for a student.")
  {
  }
}
