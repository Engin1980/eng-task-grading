using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EngGradesBE.Migrations
{
    /// <inheritdoc />
    public partial class MainEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Grade_Student_StudentId",
                table: "Grade");

            migrationBuilder.DropForeignKey(
                name: "FK_Grade_Task_TaskId",
                table: "Grade");

            migrationBuilder.DropForeignKey(
                name: "FK_Grade_Teacher_AssignerTeacherId",
                table: "Grade");

            migrationBuilder.DropForeignKey(
                name: "FK_Task_Course_CourseId",
                table: "Task");

            migrationBuilder.DropForeignKey(
                name: "FK_TeacherCourse_Teacher_TeachersId",
                table: "TeacherCourse");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Teacher",
                table: "Teacher");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Task",
                table: "Task");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Grade",
                table: "Grade");

            migrationBuilder.RenameTable(
                name: "Teacher",
                newName: "Teachers");

            migrationBuilder.RenameTable(
                name: "Task",
                newName: "Tasks");

            migrationBuilder.RenameTable(
                name: "Grade",
                newName: "Grades");

            migrationBuilder.RenameIndex(
                name: "IX_Task_CourseId",
                table: "Tasks",
                newName: "IX_Tasks_CourseId");

            migrationBuilder.RenameIndex(
                name: "IX_Grade_TaskId",
                table: "Grades",
                newName: "IX_Grades_TaskId");

            migrationBuilder.RenameIndex(
                name: "IX_Grade_StudentId",
                table: "Grades",
                newName: "IX_Grades_StudentId");

            migrationBuilder.RenameIndex(
                name: "IX_Grade_AssignerTeacherId",
                table: "Grades",
                newName: "IX_Grades_AssignerTeacherId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Teachers",
                table: "Teachers",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tasks",
                table: "Tasks",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Grades",
                table: "Grades",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "StudentTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentTokens_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TeacherTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    TeacherId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeacherTokens_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StudentTokens_StudentId",
                table: "StudentTokens",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherTokens_TeacherId",
                table: "TeacherTokens",
                column: "TeacherId");

            migrationBuilder.AddForeignKey(
                name: "FK_Grades_Student_StudentId",
                table: "Grades",
                column: "StudentId",
                principalTable: "Student",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Grades_Tasks_TaskId",
                table: "Grades",
                column: "TaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Grades_Teachers_AssignerTeacherId",
                table: "Grades",
                column: "AssignerTeacherId",
                principalTable: "Teachers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Course_CourseId",
                table: "Tasks",
                column: "CourseId",
                principalTable: "Course",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TeacherCourse_Teachers_TeachersId",
                table: "TeacherCourse",
                column: "TeachersId",
                principalTable: "Teachers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Grades_Student_StudentId",
                table: "Grades");

            migrationBuilder.DropForeignKey(
                name: "FK_Grades_Tasks_TaskId",
                table: "Grades");

            migrationBuilder.DropForeignKey(
                name: "FK_Grades_Teachers_AssignerTeacherId",
                table: "Grades");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Course_CourseId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_TeacherCourse_Teachers_TeachersId",
                table: "TeacherCourse");

            migrationBuilder.DropTable(
                name: "StudentTokens");

            migrationBuilder.DropTable(
                name: "TeacherTokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Teachers",
                table: "Teachers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Tasks",
                table: "Tasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Grades",
                table: "Grades");

            migrationBuilder.RenameTable(
                name: "Teachers",
                newName: "Teacher");

            migrationBuilder.RenameTable(
                name: "Tasks",
                newName: "Task");

            migrationBuilder.RenameTable(
                name: "Grades",
                newName: "Grade");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_CourseId",
                table: "Task",
                newName: "IX_Task_CourseId");

            migrationBuilder.RenameIndex(
                name: "IX_Grades_TaskId",
                table: "Grade",
                newName: "IX_Grade_TaskId");

            migrationBuilder.RenameIndex(
                name: "IX_Grades_StudentId",
                table: "Grade",
                newName: "IX_Grade_StudentId");

            migrationBuilder.RenameIndex(
                name: "IX_Grades_AssignerTeacherId",
                table: "Grade",
                newName: "IX_Grade_AssignerTeacherId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Teacher",
                table: "Teacher",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Task",
                table: "Task",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Grade",
                table: "Grade",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Grade_Student_StudentId",
                table: "Grade",
                column: "StudentId",
                principalTable: "Student",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Grade_Task_TaskId",
                table: "Grade",
                column: "TaskId",
                principalTable: "Task",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Grade_Teacher_AssignerTeacherId",
                table: "Grade",
                column: "AssignerTeacherId",
                principalTable: "Teacher",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Task_Course_CourseId",
                table: "Task",
                column: "CourseId",
                principalTable: "Course",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TeacherCourse_Teacher_TeachersId",
                table: "TeacherCourse",
                column: "TeachersId",
                principalTable: "Teacher",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
