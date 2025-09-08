using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EngGradesBE.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendanceRecordUniqueness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecord_AttendanceDays_AttendanceDayId",
                table: "AttendanceRecord");

            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecord_AttendanceValues_AttendanceValueId",
                table: "AttendanceRecord");

            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecord_Student_StudentId",
                table: "AttendanceRecord");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AttendanceRecord",
                table: "AttendanceRecord");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecord_AttendanceDayId",
                table: "AttendanceRecord");

            migrationBuilder.RenameTable(
                name: "AttendanceRecord",
                newName: "AttendanceRecords");

            migrationBuilder.RenameIndex(
                name: "IX_AttendanceRecord_StudentId",
                table: "AttendanceRecords",
                newName: "IX_AttendanceRecords_StudentId");

            migrationBuilder.RenameIndex(
                name: "IX_AttendanceRecord_AttendanceValueId",
                table: "AttendanceRecords",
                newName: "IX_AttendanceRecords_AttendanceValueId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AttendanceRecords",
                table: "AttendanceRecords",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_AttendanceDayId_StudentId",
                table: "AttendanceRecords",
                columns: new[] { "AttendanceDayId", "StudentId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecords_AttendanceDays_AttendanceDayId",
                table: "AttendanceRecords",
                column: "AttendanceDayId",
                principalTable: "AttendanceDays",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecords_AttendanceValues_AttendanceValueId",
                table: "AttendanceRecords",
                column: "AttendanceValueId",
                principalTable: "AttendanceValues",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecords_Student_StudentId",
                table: "AttendanceRecords",
                column: "StudentId",
                principalTable: "Student",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecords_AttendanceDays_AttendanceDayId",
                table: "AttendanceRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecords_AttendanceValues_AttendanceValueId",
                table: "AttendanceRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecords_Student_StudentId",
                table: "AttendanceRecords");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AttendanceRecords",
                table: "AttendanceRecords");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_AttendanceDayId_StudentId",
                table: "AttendanceRecords");

            migrationBuilder.RenameTable(
                name: "AttendanceRecords",
                newName: "AttendanceRecord");

            migrationBuilder.RenameIndex(
                name: "IX_AttendanceRecords_StudentId",
                table: "AttendanceRecord",
                newName: "IX_AttendanceRecord_StudentId");

            migrationBuilder.RenameIndex(
                name: "IX_AttendanceRecords_AttendanceValueId",
                table: "AttendanceRecord",
                newName: "IX_AttendanceRecord_AttendanceValueId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AttendanceRecord",
                table: "AttendanceRecord",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecord_AttendanceDayId",
                table: "AttendanceRecord",
                column: "AttendanceDayId");

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecord_AttendanceDays_AttendanceDayId",
                table: "AttendanceRecord",
                column: "AttendanceDayId",
                principalTable: "AttendanceDays",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecord_AttendanceValues_AttendanceValueId",
                table: "AttendanceRecord",
                column: "AttendanceValueId",
                principalTable: "AttendanceValues",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecord_Student_StudentId",
                table: "AttendanceRecord",
                column: "StudentId",
                principalTable: "Student",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
