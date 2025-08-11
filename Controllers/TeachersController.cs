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
    public class TeachersController : ControllerBase
    {
        private readonly SIMSContext _context;
        private readonly AuthService _authService;

        public TeachersController(SIMSContext context, AuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<TeacherDTO>>> GetTeachers()
        {
            var teachers = await _context.Teachers
                .Include(t => t.User)
                .Select(t => new TeacherDTO
                {
                    Id = t.Id,
                    FirstName = t.FirstName,
                    LastName = t.LastName,
                    Email = t.Email,
                    TeacherId = t.TeacherId,
                    PhoneNumber = t.PhoneNumber,
                    Address = t.Address,
                    CreatedAt = t.CreatedAt,
                    Username = t.User.Username
                })
                .ToListAsync();

            return Ok(teachers);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TeacherDTO>> GetTeacher(int id)
        {
            var teacher = await _context.Teachers
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (teacher == null)
                return NotFound();

            var teacherDto = new TeacherDTO
            {
                Id = teacher.Id,
                FirstName = teacher.FirstName,
                LastName = teacher.LastName,
                Email = teacher.Email,
                TeacherId = teacher.TeacherId,
                PhoneNumber = teacher.PhoneNumber,
                Address = teacher.Address,
                CreatedAt = teacher.CreatedAt,
                Username = teacher.User.Username
            };

            return Ok(teacherDto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TeacherDTO>> CreateTeacher([FromBody] CreateTeacherRequest request)
        {
            Console.WriteLine($"=== CreateTeacher API Called ===");
            Console.WriteLine($"Request data: FirstName={request.FirstName}, LastName={request.LastName}, Email={request.Email}, TeacherId={request.TeacherId}, Username={request.Username}");
            
            try
            {
                // Check if username already exists
                if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                {
                    Console.WriteLine($"ERROR: Username {request.Username} already exists");
                    return BadRequest(new { message = "Username already exists" });
                }

                // Check if email already exists
                if (await _context.Teachers.AnyAsync(t => t.Email == request.Email))
                {
                    Console.WriteLine($"ERROR: Email {request.Email} already exists");
                    return BadRequest(new { message = "Email already exists" });
                }

                // Check if teacher ID already exists
                if (await _context.Teachers.AnyAsync(t => t.TeacherId == request.TeacherId))
                {
                    Console.WriteLine($"ERROR: Teacher ID {request.TeacherId} already exists");
                    return BadRequest(new { message = "Teacher ID already exists" });
                }

                Console.WriteLine("Creating user...");
                // Create user
                var user = new User
                {
                    Username = request.Username,
                    PasswordHash = _authService.HashPassword(request.Password),
                    Role = "Teacher",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                Console.WriteLine($"User created with ID: {user.Id}");

                Console.WriteLine("Creating teacher...");
                // Create teacher
                var teacher = new Teacher
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    TeacherId = request.TeacherId,
                    PhoneNumber = request.PhoneNumber,
                    Address = request.Address,
                    CreatedAt = DateTime.UtcNow,
                    UserId = user.Id
                };

                _context.Teachers.Add(teacher);
                await _context.SaveChangesAsync();
                Console.WriteLine($"Teacher created with ID: {teacher.Id}");

                var teacherDto = new TeacherDTO
                {
                    Id = teacher.Id,
                    FirstName = teacher.FirstName,
                    LastName = teacher.LastName,
                    Email = teacher.Email,
                    TeacherId = teacher.TeacherId,
                    PhoneNumber = teacher.PhoneNumber,
                    Address = teacher.Address,
                    CreatedAt = teacher.CreatedAt,
                    Username = user.Username
                };

                Console.WriteLine($"Teacher created successfully with ID: {teacher.Id}");
                return CreatedAtAction(nameof(GetTeacher), new { id = teacher.Id }, teacherDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in CreateTeacher: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest(new { message = $"Error creating teacher: {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTeacher(int id, [FromBody] UpdateTeacherRequest request)
        {
            var teacher = await _context.Teachers.FindAsync(id);
            
            if (teacher == null)
                return NotFound();

            // Check if email is being changed and already exists
            if (request.Email != teacher.Email && await _context.Teachers.AnyAsync(t => t.Email == request.Email))
                return BadRequest(new { message = "Email already exists" });

            // Check if teacher ID is being changed and already exists
            if (request.TeacherId != teacher.TeacherId && await _context.Teachers.AnyAsync(t => t.TeacherId == request.TeacherId))
                return BadRequest(new { message = "Teacher ID already exists" });

            teacher.FirstName = request.FirstName;
            teacher.LastName = request.LastName;
            teacher.Email = request.Email;
            teacher.TeacherId = request.TeacherId;
            teacher.PhoneNumber = request.PhoneNumber;
            teacher.Address = request.Address;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTeacher(int id)
        {
            var teacher = await _context.Teachers
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (teacher == null)
                return NotFound();

            _context.Teachers.Remove(teacher);
            _context.Users.Remove(teacher.User);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("my-courses")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<TeacherCourseDTO>>> GetMyCourses()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            Console.WriteLine($"GetMyCourses called for UserId: {userId}");
            
            var teacher = await _context.Teachers
                .FirstOrDefaultAsync(t => t.UserId == userId);

            if (teacher == null)
            {
                Console.WriteLine($"Teacher not found for UserId: {userId}");
                return NotFound();
            }

            Console.WriteLine($"Found teacher: {teacher.FirstName} {teacher.LastName} (ID: {teacher.Id})");

            var courses = await _context.Courses
                .Include(c => c.StudentCourses)
                .Where(c => c.TeacherId == teacher.Id)
                .Select(c => new TeacherCourseDTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    Code = c.Code,
                    Description = c.Description,
                    Credits = c.Credits,
                    CreatedAt = c.CreatedAt,
                    EnrolledStudentsCount = c.StudentCourses.Count()
                })
                .ToListAsync();

            Console.WriteLine($"Found {courses.Count} courses for teacher {teacher.Id}");

            return Ok(courses);
        }
    }
}