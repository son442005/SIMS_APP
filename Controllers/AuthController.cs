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
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly SIMSContext _context;

        public AuthController(AuthService authService, SIMSContext context)
        {
            _authService = authService;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            var user = await _authService.AuthenticateUserAsync(request.Username, request.Password);
            
            if (user == null)
                return Unauthorized(new { message = "Invalid username or password" });

            var token = _authService.GenerateJwtToken(user);
            
            return Ok(new AuthResponse
            {
                Token = token,
                Username = user.Username,
                Role = user.Role,
                UserId = user.Id
            });
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
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

            var token = _authService.GenerateJwtToken(user);
            
            return Ok(new AuthResponse
            {
                Token = token,
                Username = user.Username,
                Role = user.Role,
                UserId = user.Id
            });
        }

        [HttpPost("create-admin")]
        public async Task<ActionResult> CreateDefaultAdmin()
        {
            var created = await _authService.CreateDefaultAdminAsync();
            
            if (created)
                return Ok(new { message = "Default admin created successfully. Username: admin, Password: admin123" });
            
            return BadRequest(new { message = "Admin user already exists" });
        }
    }
} 