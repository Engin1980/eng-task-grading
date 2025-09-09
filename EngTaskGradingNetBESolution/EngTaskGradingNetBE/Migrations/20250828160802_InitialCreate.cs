using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EngGradesBE.Migrations
{
  /// <inheritdoc />
  public partial class InitialCreate : Migration
  {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.CreateTable(
          name: "Course",
          columns: table => new
          {
            Id = table.Column<int>(type: "int", nullable: false)
                  .Annotation("SqlServer:Identity", "1, 1"),
            Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
            Name = table.Column<string>(type: "nvarchar(max)", nullable: true)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_Course", x => x.Id);
          });

      migrationBuilder.CreateTable(
          name: "Student",
          columns: table => new
          {
            Id = table.Column<int>(type: "int", nullable: false)
                  .Annotation("SqlServer:Identity", "1, 1"),
            Number = table.Column<string>(type: "nvarchar(max)", nullable: false),
            Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
            Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
            Surname = table.Column<string>(type: "nvarchar(max)", nullable: true)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_Student", x => x.Id);
          });

      migrationBuilder.CreateTable(
          name: "Teacher",
          columns: table => new
          {
            Id = table.Column<int>(type: "int", nullable: false)
                  .Annotation("SqlServer:Identity", "1, 1"),
            Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
            PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
            IsAdmin = table.Column<bool>(type: "bit", nullable: false)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_Teacher", x => x.Id);
          });

      migrationBuilder.CreateTable(
          name: "Task",
          columns: table => new
          {
            Id = table.Column<int>(type: "int", nullable: false)
                  .Annotation("SqlServer:Identity", "1, 1"),
            Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
            Keywords = table.Column<string>(type: "nvarchar(max)", nullable: true),
            CourseId = table.Column<int>(type: "int", nullable: false),
            MinGrade = table.Column<int>(type: "int", nullable: true)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_Task", x => x.Id);
            table.ForeignKey(
                      name: "FK_Task_Course_CourseId",
                      column: x => x.CourseId,
                      principalTable: "Course",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
          });

      migrationBuilder.CreateTable(
          name: "StudentCourse",
          columns: table => new
          {
            CoursesId = table.Column<int>(type: "int", nullable: false),
            StudentsId = table.Column<int>(type: "int", nullable: false)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_StudentCourse", x => new { x.CoursesId, x.StudentsId });
            table.ForeignKey(
                      name: "FK_StudentCourse_Course_CoursesId",
                      column: x => x.CoursesId,
                      principalTable: "Course",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
            table.ForeignKey(
                      name: "FK_StudentCourse_Student_StudentsId",
                      column: x => x.StudentsId,
                      principalTable: "Student",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
          });

      migrationBuilder.CreateTable(
          name: "TeacherCourse",
          columns: table => new
          {
            CoursesId = table.Column<int>(type: "int", nullable: false),
            TeachersId = table.Column<int>(type: "int", nullable: false)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_TeacherCourse", x => new { x.CoursesId, x.TeachersId });
            table.ForeignKey(
                      name: "FK_TeacherCourse_Course_CoursesId",
                      column: x => x.CoursesId,
                      principalTable: "Course",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
            table.ForeignKey(
                      name: "FK_TeacherCourse_Teacher_TeachersId",
                      column: x => x.TeachersId,
                      principalTable: "Teacher",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
          });

      migrationBuilder.CreateTable(
          name: "Grade",
          columns: table => new
          {
            Id = table.Column<int>(type: "int", nullable: false)
                  .Annotation("SqlServer:Identity", "1, 1"),
            TaskId = table.Column<int>(type: "int", nullable: false),
            StudentId = table.Column<int>(type: "int", nullable: false),
            Value = table.Column<int>(type: "int", nullable: false),
            Comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
            Date = table.Column<DateTime>(type: "datetime2", nullable: false),
            AssignerTeacherId = table.Column<int>(type: "int", nullable: false)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_Grade", x => x.Id);
            table.ForeignKey(
                      name: "FK_Grade_Student_StudentId",
                      column: x => x.StudentId,
                      principalTable: "Student",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
            table.ForeignKey(
                      name: "FK_Grade_Task_TaskId",
                      column: x => x.TaskId,
                      principalTable: "Task",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
            table.ForeignKey(
                      name: "FK_Grade_Teacher_AssignerTeacherId",
                      column: x => x.AssignerTeacherId,
                      principalTable: "Teacher",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
          });

      migrationBuilder.CreateIndex(
          name: "IX_Grade_AssignerTeacherId",
          table: "Grade",
          column: "AssignerTeacherId");

      migrationBuilder.CreateIndex(
          name: "IX_Grade_StudentId",
          table: "Grade",
          column: "StudentId");

      migrationBuilder.CreateIndex(
          name: "IX_Grade_TaskId",
          table: "Grade",
          column: "TaskId");

      migrationBuilder.CreateIndex(
          name: "IX_StudentCourse_StudentsId",
          table: "StudentCourse",
          column: "StudentsId");

      migrationBuilder.CreateIndex(
          name: "IX_Task_CourseId",
          table: "Task",
          column: "CourseId");

      migrationBuilder.CreateIndex(
          name: "IX_TeacherCourse_TeachersId",
          table: "TeacherCourse",
          column: "TeachersId");

    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropTable(
          name: "Grade");

      migrationBuilder.DropTable(
          name: "StudentCourse");

      migrationBuilder.DropTable(
          name: "TeacherCourse");

      migrationBuilder.DropTable(
          name: "Task");

      migrationBuilder.DropTable(
          name: "Student");

      migrationBuilder.DropTable(
          name: "Teacher");

      migrationBuilder.DropTable(
          name: "Course");
    }
  }
}
