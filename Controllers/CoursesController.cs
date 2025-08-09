using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIMS_APP.Data;
using SIMS_APP.DTOs;
using SIMS_APP.Models;

namespace SIMS_APP.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CoursesController : ControllerBase
    {
        private readonly SIMSContext _context;

        public CoursesController(SIMSContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<CourseDTO>>> GetCourses()
        {
            var courses = await _context.Courses
                .Include(c => c.Teacher)
                .Select(c => new CourseDTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    Code = c.Code,
                    Description = c.Description,
                    Credits = c.Credits,
                    TeacherId = c.TeacherId,
                    TeacherName = c.Teacher != null ? $"{c.Teacher.FirstName} {c.Teacher.LastName}" : null,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();

            return Ok(courses);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CourseDTO>> GetCourse(int id)
        {
            var course = await _context.Courses
                .Include(c => c.Teacher)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
                return NotFound();

            var courseDto = new CourseDTO
            {
                Id = course.Id,
                Name = course.Name,
                Code = course.Code,
                Description = course.Description,
                Credits = course.Credits,
                TeacherId = course.TeacherId,
                TeacherName = course.Teacher != null ? $"{course.Teacher.FirstName} {course.Teacher.LastName}" : null,
                CreatedAt = course.CreatedAt
            };

            return Ok(courseDto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CourseDTO>> CreateCourse([FromBody] CreateCourseRequest request)
        {
            Console.WriteLine($"CreateCourse called with: Name={request.Name}, Code={request.Code}, Credits={request.Credits}, TeacherId={request.TeacherId}");
            
            // Check if course code already exists
            if (await _context.Courses.AnyAsync(c => c.Code == request.Code))
            {
                Console.WriteLine($"Course code {request.Code} already exists");
                return BadRequest(new { message = "Course code already exists" });
            }

            // Check if teacher exists
            var teacher = await _context.Teachers.FindAsync(request.TeacherId);
            if (teacher == null)
            {
                Console.WriteLine($"Teacher with ID {request.TeacherId} not found");
                return BadRequest(new { message = "Selected teacher not found" });
            }

            var course = new Course
            {
                Name = request.Name,
                Code = request.Code,
                Description = request.Description,
                Credits = request.Credits,
                TeacherId = request.TeacherId,
                CreatedAt = DateTime.UtcNow
            };

            Console.WriteLine($"Adding course to context: {course.Name} ({course.Code}) assigned to teacher {teacher.FirstName} {teacher.LastName}");
            _context.Courses.Add(course);
            
            try
            {
                await _context.SaveChangesAsync();
                Console.WriteLine($"Course saved successfully with ID: {course.Id}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving course: {ex.Message}");
                return BadRequest(new { message = "Error saving course to database" });
            }

            var courseDto = new CourseDTO
            {
                Id = course.Id,
                Name = course.Name,
                Code = course.Code,
                Description = course.Description,
                Credits = course.Credits,
                TeacherId = course.TeacherId,
                TeacherName = $"{teacher.FirstName} {teacher.LastName}",
                CreatedAt = course.CreatedAt
            };

            Console.WriteLine($"Returning course DTO with ID: {courseDto.Id}");
            return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, courseDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] UpdateCourseRequest request)
        {
            var course = await _context.Courses.FindAsync(id);

            if (course == null)
                return NotFound();

            // Check if course code is being changed and already exists
            if (request.Code != course.Code && await _context.Courses.AnyAsync(c => c.Code == request.Code))
                return BadRequest(new { message = "Course code already exists" });

            // Check if teacher exists
            var teacher = await _context.Teachers.FindAsync(request.TeacherId);
            if (teacher == null)
            {
                Console.WriteLine($"Teacher with ID {request.TeacherId} not found");
                return BadRequest(new { message = "Selected teacher not found" });
            }

            course.Name = request.Name;
            course.Code = request.Code;
            course.Description = request.Description;
            course.Credits = request.Credits;
            course.TeacherId = request.TeacherId;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);

            if (course == null)
                return NotFound();

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("enroll")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EnrollStudent([FromBody] EnrollStudentRequest request)
        {
            // Check if student exists
            var student = await _context.Students.FindAsync(request.StudentId);
            if (student == null)
                return BadRequest(new { message = "Student not found" });

            // Check if course exists
            var course = await _context.Courses.FindAsync(request.CourseId);
            if (course == null)
                return BadRequest(new { message = "Course not found" });

            // Check if already enrolled
            if (await _context.StudentCourses.AnyAsync(sc => sc.StudentId == request.StudentId && sc.CourseId == request.CourseId))
                return BadRequest(new { message = "Student is already enrolled in this course" });

            var enrollment = new StudentCourse
            {
                StudentId = request.StudentId,
                CourseId = request.CourseId,
                EnrolledAt = DateTime.UtcNow
            };

            _context.StudentCourses.Add(enrollment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Student enrolled successfully" });
        }

        [HttpGet("enrollments")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<StudentCourseDTO>>> GetEnrollments([FromQuery] int? courseId = null)
        {
            var query = _context.StudentCourses
                .Include(sc => sc.Student)
                .Include(sc => sc.Course)
                .AsQueryable();

            // Lọc theo courseId nếu có
            if (courseId.HasValue)
            {
                query = query.Where(sc => sc.CourseId == courseId.Value);
            }

            var enrollments = await query
                .Select(sc => new StudentCourseDTO
                {
                    Id = sc.Id,
                    StudentId = sc.StudentId,
                    CourseId = sc.CourseId,
                    StudentName = $"{sc.Student.FirstName} {sc.Student.LastName}",
                    CourseName = sc.Course.Name,
                    CourseCode = sc.Course.Code,
                    EnrolledAt = sc.EnrolledAt,
                    Grade = sc.Grade,
                    LetterGrade = sc.LetterGrade
                })
                .OrderByDescending(sc => sc.EnrolledAt)
                .ToListAsync();

            return Ok(enrollments);
        }

        [HttpGet("{courseId}/students")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<StudentCourseDTO>>> GetStudentsByCourse(int courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
                return NotFound(new { message = "Course not found" });

            var enrolledStudents = await _context.StudentCourses
                .Include(sc => sc.Student)
                .Include(sc => sc.Course)
                .Where(sc => sc.CourseId == courseId)
                .Select(sc => new StudentCourseDTO
                {
                    Id = sc.Id,
                    StudentId = sc.StudentId,
                    CourseId = sc.CourseId,
                    StudentName = $"{sc.Student.FirstName} {sc.Student.LastName}",
                    CourseName = sc.Course.Name,
                    CourseCode = sc.Course.Code,
                    EnrolledAt = sc.EnrolledAt,
                    Grade = sc.Grade,
                    LetterGrade = sc.LetterGrade
                })
                .OrderBy(sc => sc.StudentName)
                .ToListAsync();

            return Ok(enrolledStudents);
        }





        [HttpDelete("enrollments/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveEnrollment(int id)
        {
            var enrollment = await _context.StudentCourses.FindAsync(id);

            if (enrollment == null)
                return NotFound();

            _context.StudentCourses.Remove(enrollment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/assign-teacher")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignTeacherToCourse(int id, [FromBody] AssignTeacherRequest request)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                return NotFound(new { message = "Course not found" });

            var teacher = await _context.Teachers.FindAsync(request.TeacherId);
            if (teacher == null)
                return BadRequest(new { message = "Teacher not found" });

            course.TeacherId = request.TeacherId;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Teacher {teacher.FirstName} {teacher.LastName} assigned to course {course.Name}" });
        }


    }
} 