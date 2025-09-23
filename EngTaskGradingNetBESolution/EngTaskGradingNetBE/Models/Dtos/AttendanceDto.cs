using EngTaskGradingNetBE.Models.DbModel;

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
  string Title,
  string? SelfAssignKey
);

public record AttendanceDto(
  int Id,
  string Title,
  double? MinWeight,
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
  string Title,
  double? MinWeight
);

public record AttendanceOverviewDto(
  int AttendanceId,
  Dictionary<StudentDto, double> StudentResults);

public record AttendanceSetItemDto(int AttendanceId, int StudentId, double Value);

public record AttendanceSetDto(
  List<AttendanceDto> Attendances,
  List<StudentDto> Students,
  List<AttendanceSetItemDto> Items);

public record AttendanceDaySetDto(
  List<StudentDto> Students,
  List<AttendanceDayDto> AttendanceDays,
  List<AttendanceDaySetRecordDto> Items
);

public record AttendanceDaySetRecordDto(
  int? Id,
  int StudentId,
  int AttendanceDayId,
  string AttendanceValueTitle,
  double AttendanceValueWeight
);

public record AttendanceDaySelfSignCreateDto(
  string StudyNumber,
  string Key
  );

public record AttendanceDaySelfSignSetDto(
  int AttendanceDayId,
  string? Key,
  List<AttendanceDaySelfSignDto> SelfSigns
  );

public record AttendanceDaySelfSignDto(int Id, StudentDto Student, DateTime CreationDateTime, string IP);

