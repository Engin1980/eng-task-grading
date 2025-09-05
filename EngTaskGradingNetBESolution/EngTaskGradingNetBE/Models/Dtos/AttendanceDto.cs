namespace EngTaskGradingNetBE.Models.Dtos;

public record AttendanceValueDto(
  int Id,
  string Title,
  double Weight
);

public record AttendanceRecordDto(
  int Id,
  int StudentId,
  int AttendanceDayId,
  int AttendanceValueId
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


public record AttendanceDayCreateDto(
  int AttendanceId,
  string Title
);

public record AttendanceDayUpdateDto(
  string Title
);

public record AttendanceCreateDto(
  string Title
);

public record AttendanceOverviewDto(
  int AttendanceId,
  Dictionary<StudentDto, double> StudentResults);