using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EngGradesBE.Migrations
{
    /// <inheritdoc />
    public partial class AddFinalGradeUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FinalGrade_Course_CourseId",
                table: "FinalGrade");

            migrationBuilder.DropForeignKey(
                name: "FK_FinalGrade_Student_StudentId",
                table: "FinalGrade");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FinalGrade",
                table: "FinalGrade");

            migrationBuilder.DropIndex(
                name: "IX_FinalGrade_CourseId",
                table: "FinalGrade");

            migrationBuilder.RenameTable(
                name: "FinalGrade",
                newName: "FinalGrades");

            migrationBuilder.RenameIndex(
                name: "IX_FinalGrade_StudentId",
                table: "FinalGrades",
                newName: "IX_FinalGrades_StudentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FinalGrades",
                table: "FinalGrades",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_FinalGrades_CourseId_StudentId",
                table: "FinalGrades",
                columns: new[] { "CourseId", "StudentId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_FinalGrades_Course_CourseId",
                table: "FinalGrades",
                column: "CourseId",
                principalTable: "Course",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FinalGrades_Student_StudentId",
                table: "FinalGrades",
                column: "StudentId",
                principalTable: "Student",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FinalGrades_Course_CourseId",
                table: "FinalGrades");

            migrationBuilder.DropForeignKey(
                name: "FK_FinalGrades_Student_StudentId",
                table: "FinalGrades");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FinalGrades",
                table: "FinalGrades");

            migrationBuilder.DropIndex(
                name: "IX_FinalGrades_CourseId_StudentId",
                table: "FinalGrades");

            migrationBuilder.RenameTable(
                name: "FinalGrades",
                newName: "FinalGrade");

            migrationBuilder.RenameIndex(
                name: "IX_FinalGrades_StudentId",
                table: "FinalGrade",
                newName: "IX_FinalGrade_StudentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FinalGrade",
                table: "FinalGrade",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_FinalGrade_CourseId",
                table: "FinalGrade",
                column: "CourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_FinalGrade_Course_CourseId",
                table: "FinalGrade",
                column: "CourseId",
                principalTable: "Course",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FinalGrade_Student_StudentId",
                table: "FinalGrade",
                column: "StudentId",
                principalTable: "Student",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
