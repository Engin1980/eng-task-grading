using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EngGradesBE.Migrations
{
    /// <inheritdoc />
    public partial class TeacherRemoveRoleAndCredentials : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAdmin",
                table: "Teachers");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Teachers");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Teachers",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Number",
                table: "Student",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Student",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Course",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Teachers_Email",
                table: "Teachers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Student_Email",
                table: "Student",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Student_Number",
                table: "Student",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Course_Code",
                table: "Course",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Teachers_Email",
                table: "Teachers");

            migrationBuilder.DropIndex(
                name: "IX_Student_Email",
                table: "Student");

            migrationBuilder.DropIndex(
                name: "IX_Student_Number",
                table: "Student");

            migrationBuilder.DropIndex(
                name: "IX_Course_Code",
                table: "Course");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Teachers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<bool>(
                name: "IsAdmin",
                table: "Teachers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Teachers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Number",
                table: "Student",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Student",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Course",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
