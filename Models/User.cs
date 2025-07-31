using System.ComponentModel.DataAnnotations;

namespace SIMS_APP.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Role { get; set; } = string.Empty; // "Admin" or "Student"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property for Student
        public Student? Student { get; set; }
    }
} 