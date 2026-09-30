using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EngGradesBE.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseStudentStudyGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StudyGroup",
                table: "StudentCourse",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StudyGroup",
                table: "StudentCourse");
        }
    }
}
