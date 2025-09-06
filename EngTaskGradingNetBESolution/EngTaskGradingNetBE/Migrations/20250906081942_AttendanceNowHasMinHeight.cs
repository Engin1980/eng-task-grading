using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EngGradesBE.Migrations
{
    /// <inheritdoc />
    public partial class AttendanceNowHasMinHeight : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "MinWeight",
                table: "Attendances",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MinWeight",
                table: "Attendances");
        }
    }
}
