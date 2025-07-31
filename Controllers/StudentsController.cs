using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIMS_APP.Data;
using SIMS_APP.DTOs;
using SIMS_APP.Models;
using SIMS_APP.Services;

namespace SIMS_APP.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudentsController : ControllerBase
    {
        private readonly SIMSContext _context;
        private readonly AuthService _authService;

        public StudentsController(SIMSContext context, AuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<StudentDTO>>> GetStudents()
        {
            var students = await _context.Students
                .Include(s => s.User)
                .Select(s => new StudentDTO
                {
                    Id = s.Id,
                    FirstName = s.FirstName,
                    LastName = s.LastName,
                    Email = s.Email,
                    StudentId = s.StudentId,
                    PhoneNumber = s.PhoneNumber,
                    DateOfBirth = s.DateOfBirth,
                    Address = s.Address,
                    CreatedAt = s.CreatedAt,
                    Username = s.User.Username
                })
                .ToListAsync();

            return Ok(students);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StudentDTO>> GetStudent(int id)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (student == null)
                return NotFound();

            var studentDto = new StudentDTO
            {
                Id = student.Id,
                FirstName = student.FirstName,
                LastName = student.LastName,
                Email = student.Email,
                StudentId = student.StudentId,
                PhoneNumber = student.PhoneNumber,
                DateOfBirth = student.DateOfBirth,
                Address = student.Address,
                CreatedAt = student.CreatedAt,
                Username = student.User.Username
            };

            return Ok(studentDto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StudentDTO>> CreateStudent([FromBody] CreateStudentRequest request)
        {
            // Check if username already exists
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest(new { message = "Username already exists" });

            // Check if email already exists
            if (await _context.Students.AnyAsync(s => s.Email == request.Email))
                return BadRequest(new { message = "Email already exists" });

            // Check if student ID already exists
            if (await _context.Students.AnyAsync(s => s.StudentId == request.StudentId))
                return BadRequest(new { message = "Student ID already exists" });

            // Create user
            var user = new User
            {
                Username = request.Username,
                PasswordHash = _authService.HashPassword(request.Password),
                Role = "Student",
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create student
            var student = new Student
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                StudentId = request.StudentId,
                PhoneNumber = request.PhoneNumber,
                DateOfBirth = request.DateOfBirth,
                Address = request.Address,
                CreatedAt = DateTime.UtcNow,
                UserId = user.Id
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            var studentDto = new StudentDTO
            {
                Id = student.Id,
                FirstName = student.FirstName,
                LastName = student.LastName,
                Email = student.Email,
                StudentId = student.StudentId,
                PhoneNumber = student.PhoneNumber,
                DateOfBirth = student.DateOfBirth,
                Address = student.Address,
                CreatedAt = student.CreatedAt,
                Username = user.Username
            };

            return CreatedAtAction(nameof(GetStudent), new { id = student.Id }, studentDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] UpdateStudentRequest request)
        {
            var student = await _context.Students.FindAsync(id);
            
            if (student == null)
                return NotFound();

            // Check if email is being changed and already exists
            if (request.Email != student.Email && await _context.Students.AnyAsync(s => s.Email == request.Email))
                return BadRequest(new { message = "Email already exists" });

            // Check if student ID is being changed and already exists
            if (request.StudentId != student.StudentId && await _context.Students.AnyAsync(s => s.StudentId == request.StudentId))
                return BadRequest(new { message = "Student ID already exists" });

            student.FirstName = request.FirstName;
            student.LastName = request.LastName;
            student.Email = request.Email;
            student.StudentId = request.StudentId;
            student.PhoneNumber = request.PhoneNumber;
            student.DateOfBirth = request.DateOfBirth;
            student.Address = request.Address;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (student == null)
                return NotFound();

            _context.Students.Remove(student);
            _context.Users.Remove(student.User);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("my-courses")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<IEnumerable<StudentCourseDTO>>> GetMyCourses()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound();

            var courses = await _context.StudentCourses
                .Include(sc => sc.Course)
                .Where(sc => sc.StudentId == student.Id)
                .Select(sc => new StudentCourseDTO
                {
                    Id = sc.Id,
                    StudentId = sc.StudentId,
                    CourseId = sc.CourseId,
                    StudentName = $"{student.FirstName} {student.LastName}",
                    CourseName = sc.Course.Name,
                    CourseCode = sc.Course.Code,
                    EnrolledAt = sc.EnrolledAt,
                    Grade = sc.Grade,
                    LetterGrade = sc.LetterGrade
                })
                .ToListAsync();

            return Ok(courses);
        }
    }
} 