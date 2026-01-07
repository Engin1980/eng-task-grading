using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EngGradesBE.Migrations
{
    /// <inheritdoc />
    public partial class TaskHasMaxGrade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaxGrade",
                table: "Tasks",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxGrade",
                table: "Tasks");
        }
    }
}
