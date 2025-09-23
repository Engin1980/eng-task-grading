using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EngGradesBE.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendanceDaySelfSignToStudent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StudyNumber",
                table: "AttendanceDaySelfSign");

            migrationBuilder.AddColumn<int>(
                name: "StudentId",
                table: "AttendanceDaySelfSign",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDaySelfSign_StudentId",
                table: "AttendanceDaySelfSign",
                column: "StudentId");

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceDaySelfSign_Student_StudentId",
                table: "AttendanceDaySelfSign",
                column: "StudentId",
                principalTable: "Student",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceDaySelfSign_Student_StudentId",
                table: "AttendanceDaySelfSign");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceDaySelfSign_StudentId",
                table: "AttendanceDaySelfSign");

            migrationBuilder.DropColumn(
                name: "StudentId",
                table: "AttendanceDaySelfSign");

            migrationBuilder.AddColumn<string>(
                name: "StudyNumber",
                table: "AttendanceDaySelfSign",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
