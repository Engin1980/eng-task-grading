using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EngGradesBE.Migrations
{
    /// <inheritdoc />
    public partial class DropStudentViewTokenUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StudentViewTokens_StudentId_ExpiresAt",
                table: "StudentViewTokens");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceDaySelfSign_AttendanceDayId",
                table: "AttendanceDaySelfSign");

            migrationBuilder.CreateIndex(
                name: "IX_StudentViewTokens_StudentId",
                table: "StudentViewTokens",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDaySelfSign_AttendanceDayId_StudentId",
                table: "AttendanceDaySelfSign",
                columns: new[] { "AttendanceDayId", "StudentId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StudentViewTokens_StudentId",
                table: "StudentViewTokens");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceDaySelfSign_AttendanceDayId_StudentId",
                table: "AttendanceDaySelfSign");

            migrationBuilder.CreateIndex(
                name: "IX_StudentViewTokens_StudentId_ExpiresAt",
                table: "StudentViewTokens",
                columns: new[] { "StudentId", "ExpiresAt" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDaySelfSign_AttendanceDayId",
                table: "AttendanceDaySelfSign",
                column: "AttendanceDayId");
        }
    }
}
