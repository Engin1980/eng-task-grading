namespace EngTaskGradingNetBE.Lib
{
  public static class EAssert
  {
    public static class Arg
    {
      public static void IsNotEmpty(string value, string paramName)
      {
        if (string.IsNullOrEmpty(value))
          throw new ArgumentException("String parameter cannot be null or empty.", paramName);
      }
      public static void IsNotNull(object value, string paramName)
      {
        if (value is null)
          throw new ArgumentNullException(paramName);
      }
    }

    public static void IsTrue(bool condition, string message)
    {
      if (!condition)
        throw new InvalidOperationException(message);
    }
  }
}
