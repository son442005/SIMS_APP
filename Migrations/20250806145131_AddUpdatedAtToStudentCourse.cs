using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SIMS_APP.Migrations
{
    /// <inheritdoc />
    public partial class AddUpdatedAtToStudentCourse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "StudentCourses",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "StudentCourses");
        }
    }
}
