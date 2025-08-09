namespace SIMS_APP.DTOs
{
    public class CourseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Credits { get; set; }
        public int? TeacherId { get; set; }
        public string? TeacherName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCourseRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Credits { get; set; }
        public int TeacherId { get; set; }
    }

    public class UpdateCourseRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Credits { get; set; }
        public int TeacherId { get; set; }
    }

    public class StudentCourseDTO
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int CourseId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public DateTime EnrolledAt { get; set; }
        public decimal? Grade { get; set; }
        public string? LetterGrade { get; set; }
    }

    public class EnrollStudentRequest
    {
        public int StudentId { get; set; }
        public int CourseId { get; set; }
    }

    public class AssignTeacherRequest
    {
        public int TeacherId { get; set; }
    }


} 