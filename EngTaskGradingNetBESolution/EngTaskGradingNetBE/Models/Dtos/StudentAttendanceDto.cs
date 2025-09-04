namespace EngTaskGradingNetBE.Models.Dtos;

public record AttendanceValueDto(
  int Id,
  string Title,
  double Weight
);

public record StudentAttendanceDto(
  int Id,
  int StudentId,
  int AttendanceDayId,
  AttendanceValueDto Value
);

public record AttendanceDayDto(
  int Id,
  string Title
);

public record AttendanceDto(
  int Id,
  string Title,
  ICollection<AttendanceDayDto> Days
);


public record AttendanceDayCreateUpdateDto(
  string Title
);

public record AttendanceCreateDto(
  string Title
);