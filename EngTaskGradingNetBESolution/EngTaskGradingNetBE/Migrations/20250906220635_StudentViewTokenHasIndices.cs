using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EngGradesBE.Migrations
{
    /// <inheritdoc />
    public partial class StudentViewTokenHasIndices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StudentViewTokens_StudentId",
                table: "StudentViewTokens");

            migrationBuilder.AlterColumn<string>(
                name: "Token",
                table: "StudentViewTokens",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_StudentViewTokens_StudentId_ExpiresAt",
                table: "StudentViewTokens",
                columns: new[] { "StudentId", "ExpiresAt" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentViewTokens_Token",
                table: "StudentViewTokens",
                column: "Token");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StudentViewTokens_StudentId_ExpiresAt",
                table: "StudentViewTokens");

            migrationBuilder.DropIndex(
                name: "IX_StudentViewTokens_Token",
                table: "StudentViewTokens");

            migrationBuilder.AlterColumn<string>(
                name: "Token",
                table: "StudentViewTokens",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.CreateIndex(
                name: "IX_StudentViewTokens_StudentId",
                table: "StudentViewTokens",
                column: "StudentId");
        }
    }
}
