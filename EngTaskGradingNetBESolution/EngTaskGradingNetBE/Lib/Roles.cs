namespace EngTaskGradingNetBE.Lib
{
  public static class Roles
  {
    public const string TEACHER_ROLE = "ROLE_TEACHER";
    public const string ADMIN_ROLE = "ROLE_ADMIN";
    public const string STUDENT_ROLE = "ROLE_STUDENT";
    public const string TEACHER_OR_ADMIN_ROLE = TEACHER_ROLE + "," + ADMIN_ROLE;
  }
}
