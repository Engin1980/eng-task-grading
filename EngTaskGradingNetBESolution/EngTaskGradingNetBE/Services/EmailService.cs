namespace EngTaskGradingNetBE.Services
{
  public interface IEmailService
  {
    public Task SendEmailAsync(string recipient, string title, string htmlBody);
  }
  public class EmailService //: IEmailService
  {
  }
  public class MockEmailService(ILogger<MockEmailService> logger) : IEmailService
  {
    public async Task SendEmailAsync(string recipient, string title, string htmlBody)
    {
      logger.LogInformation($"Mock Mail Sending -- to {recipient}; title: {title}; body: {htmlBody}");
    }
  }
}
