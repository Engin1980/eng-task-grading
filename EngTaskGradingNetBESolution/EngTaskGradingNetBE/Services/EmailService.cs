using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Threading.Tasks;

namespace EngTaskGradingNetBE.Services
{
  public interface IEmailService
  {
    public Task SendEmailAsync(string recipient, string title, string htmlBody);
    public void SendEmailInBackground(string recipient, string title, string htmlBody);
  }

  public class EmailService(
    AppSettingsService appSettingsService, 
    BackgroundTaskQueue backgroundTaskQueue, 
    ILogger<EmailService> logger) : IEmailService
  {
    private class SmtpConfig
    {
      public string SmtpServer { get; internal set; } = string.Empty;
      public int SmtpPort { get; internal set; } = 0;
      public string SenderName { get; set; } = string.Empty;
      public string SenderEmail { get; set; } = string.Empty;
      public string SenderPassword { get; set; } = string.Empty;
    }

    private string ResolveKeyableValue(string keyOrValue)
    {
      if (string.IsNullOrEmpty(keyOrValue))
        return keyOrValue;

      if (keyOrValue.StartsWith("${") && keyOrValue.EndsWith('}'))
      {
        var key = keyOrValue[2..^1];
        return appSettingsService.GetKey(key);
      }

      return keyOrValue;
    }

    private SmtpConfig GetCurrentSmtpConfig()
    {
      var emailSettings = appSettingsService.GetSettings().Email ?? throw new InvalidOperationException("Email settings are not configured.");
      var activeConfig = emailSettings.GetActiveConfig() ?? throw new InvalidOperationException("Active email configuration not found.");

      SmtpConfig ret = new()
      {
        SmtpServer = activeConfig.SmtpServer,
        SmtpPort = activeConfig.SmtpPort,
        SenderName = ResolveKeyableValue(activeConfig.SenderName),
        SenderEmail = ResolveKeyableValue(activeConfig.SenderEmail),
        SenderPassword = ResolveKeyableValue(activeConfig.SenderPassword)
      };
      return ret;
    }

    private string AdjustDebugRecipientIfRequired(string recipient)
    {
      var debugRecipient = appSettingsService.GetSettings().Email.DebugEmailRecipient;
      if (!string.IsNullOrEmpty(debugRecipient))
      {
        logger.LogInformation($"Debug mode enabled in config: Redirecting email from {recipient} to {debugRecipient}");
        recipient = debugRecipient;
      }

      return recipient;
    }

    private static MimeMessage BuildMimeMessage(string recipient, string title, string htmlBody, SmtpConfig config)
    {
      var message = new MimeMessage();
      
      message.From.Add(new MailboxAddress(config.SenderName, config.SenderEmail));
      message.To.Add(new MailboxAddress("", recipient));
      message.Subject = title;
      var bodyBuilder = new BodyBuilder
      {
        HtmlBody = htmlBody
      };
      message.Body = bodyBuilder.ToMessageBody();
      
      return message;
    }

    // Společná metoda pro odeslání emailu
    private async Task SendEmailInternalAsync(string recipient, string title, string htmlBody, CancellationToken cancellationToken = default)
    {
      var finalRecipient = AdjustDebugRecipientIfRequired(recipient);
      
      var config = GetCurrentSmtpConfig();
      var message = BuildMimeMessage(finalRecipient, title, htmlBody, config);

      using var client = new SmtpClient();
      
      // Konfigurace timeoutu
      client.Timeout = 30000;

      logger.LogInformation($"Connecting to SMTP server {config.SmtpServer}:{config.SmtpPort}");
      
      // Připojení s automatickou detekcí SSL/TLS
      await client.ConnectAsync(config.SmtpServer, config.SmtpPort, SecureSocketOptions.Auto, cancellationToken);
      
      logger.LogInformation("Authenticating...");
      await client.AuthenticateAsync(config.SenderEmail, config.SenderPassword, cancellationToken);
      
      logger.LogInformation($"Sending email to {finalRecipient}...");
      await client.SendAsync(message, cancellationToken);
      
      logger.LogInformation("Disconnecting...");
      await client.DisconnectAsync(true, cancellationToken);
      
      logger.LogInformation($"Email sent successfully to {finalRecipient}");
    }

    public async Task SendEmailAsync(string recipient, string title, string htmlBody)
    {
      try
      {
        await SendEmailInternalAsync(recipient, title, htmlBody);
      }
      catch (Exception ex)
      {
        logger.LogError(ex, $"Failed to send email to {recipient}");
        throw;
      }
    }

    public void SendEmailInBackground(string recipient, string title, string htmlBody)
    {
      logger.LogInformation($"Enqueueing background email task for {recipient}");
      
      async ValueTask doSend(CancellationToken ct)
      {
        logger.LogInformation("Background email task started");
        try
        {
          await SendEmailInternalAsync(recipient, title, htmlBody, ct);
        }
        catch (Exception ex)
        {
          logger.LogError(ex, $"Failed to send background email to {recipient}");
        }
        logger.LogInformation("Background email task completed");
      }

      var result = backgroundTaskQueue.Enqueue(doSend);
      logger.LogInformation($"Email task enqueued, result: {result.IsCompleted}");
    }
  }

  public class MockEmailService(ILogger<MockEmailService> logger) : IEmailService
  {
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
    public async Task SendEmailAsync(string recipient, string title, string htmlBody)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
    {
      logger.LogInformation($"Mock Mail Sending -- to {recipient}; title: {title}; body: {htmlBody}");
    }

    public void SendEmailInBackground(string recipient, string title, string htmlBody)
    {
      _ = Task.Run(async () => await SendEmailAsync(recipient, title, htmlBody));
    }
  }
}
