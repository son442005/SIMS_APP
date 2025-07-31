# Student Information Management System (SIMS)

A modern, full-stack web application for managing student information, courses, and enrollments with role-based access control.

## Features

### Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin and Student roles)
- **Secure password hashing** using BCrypt
- **Automatic admin user creation** on first run

### Admin Features
- **Student Management**: CRUD operations for student records
- **Course Management**: CRUD operations for course information
- **Enrollment Management**: Assign students to courses
- **Dashboard**: Comprehensive overview of all system data

### Student Features
- **Course Viewing**: View enrolled courses and grades
- **Personal Information**: Access to own student records
- **Secure Access**: Role-restricted functionality

## Technology Stack

### Backend
- **.NET 8.0** with ASP.NET Core
- **Entity Framework Core** for data access
- **SQL Server** database
- **JWT Authentication** with Bearer tokens
- **BCrypt** for password hashing

### Frontend
- **React 18** with modern hooks
- **Tailwind CSS** for styling
- **Axios** for HTTP requests
- **Babel** for JSX compilation

## Database Schema

### Users Table
- `Id` (Primary Key)
- `Username` (Unique)
- `PasswordHash` (BCrypt hashed)
- `Role` (Admin/Student)
- `CreatedAt`

### Students Table
- `Id` (Primary Key)
- `FirstName`, `LastName`
- `Email` (Unique)
- `StudentId` (Unique)
- `PhoneNumber`, `Address`
- `DateOfBirth`
- `UserId` (Foreign Key to Users)
- `CreatedAt`

### Courses Table
- `Id` (Primary Key)
- `Name`, `Code` (Unique)
- `Description`
- `Credits`
- `Instructor`
- `CreatedAt`

### StudentCourses Table (Many-to-Many)
- `Id` (Primary Key)
- `StudentId` (Foreign Key)
- `CourseId` (Foreign Key)
- `EnrolledAt`
- `Grade`, `LetterGrade`

## Installation & Setup

### Prerequisites
- .NET 8.0 SDK
- SQL Server (Local or Remote)
- Visual Studio 2022 or VS Code

### Database Setup
1. **Create Database**:
   ```sql
   CREATE DATABASE SIMS;
   ```

2. **Update Connection String** in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=SIMS;User Id=sa;Password=Son_442005;TrustServerCertificate=true;"
     }
   }
   ```

### Application Setup
1. **Restore Dependencies**:
   ```bash
   dotnet restore
   ```

2. **Create Database Migration**:
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

3. **Run the Application**:
   ```bash
   dotnet run
   ```

4. **Access the Application**:
   - Navigate to `https://localhost:7000` or `http://localhost:5000`
   - Default admin credentials: `admin` / `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Student registration
- `POST /api/auth/create-admin` - Create default admin

### Students (Admin Only)
- `GET /api/students` - Get all students
- `GET /api/students/{id}` - Get specific student
- `POST /api/students` - Create new student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Courses (Admin Only)
- `GET /api/courses` - Get all courses
- `GET /api/courses/{id}` - Get specific course
- `POST /api/courses` - Create new course
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Enrollments
- `GET /api/courses/enrollments` - Get all enrollments (Admin)
- `POST /api/courses/enroll` - Enroll student in course (Admin)
- `DELETE /api/courses/enrollments/{id}` - Remove enrollment (Admin)
- `GET /api/students/my-courses` - Get student's courses (Student)

## Security Features

### Authentication
- JWT tokens with configurable expiration
- Secure password hashing with BCrypt
- Role-based authorization

### Data Protection
- Input validation and sanitization
- SQL injection prevention via Entity Framework
- XSS protection through proper encoding

### Access Control
- Admin role: Full system access
- Student role: Limited to own data and courses

## User Roles

### Admin
- **Username**: `admin`
- **Password**: `admin123`
- **Capabilities**:
  - Manage all students
  - Manage all courses
  - Assign students to courses
  - View all enrollments
  - Full CRUD operations

### Student
- **Registration**: Self-registration via web interface
- **Capabilities**:
  - View own enrolled courses
  - View course grades
  - Update personal information
  - Access to own student dashboard

## Development

### Project Structure
```
SIMS_APP/
├── Controllers/          # API Controllers
├── Data/                # Entity Framework Context
├── DTOs/                # Data Transfer Objects
├── Models/              # Entity Models
├── Services/            # Business Logic Services
├── Views/               # Razor Views
└── wwwroot/            # Static Files (React App)
    └── js/
        ├── auth.js      # Authentication Components
        ├── dashboards.js # Dashboard Components
        └── app.js       # Main App Component
```

### Adding New Features
1. **Backend**: Add models, DTOs, controllers, and services
2. **Frontend**: Add React components and API calls
3. **Database**: Create migrations for schema changes
4. **Testing**: Test both API endpoints and UI functionality

## Deployment

### Production Considerations
1. **Environment Variables**: Move sensitive data to environment variables
2. **HTTPS**: Enable HTTPS in production
3. **Database**: Use production-grade SQL Server
4. **Security**: Update JWT secret key
5. **Logging**: Implement proper logging
6. **Monitoring**: Add application monitoring

### Docker Support
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["SIMS_APP.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SIMS_APP.dll"]
```

## Troubleshooting

### Common Issues
1. **Database Connection**: Verify connection string and SQL Server access
2. **Migration Errors**: Ensure database exists and user has permissions
3. **JWT Issues**: Check secret key configuration
4. **CORS Errors**: Verify API endpoint configuration

### Logs
- Check application logs for detailed error information
- Use `dotnet ef database update --verbose` for migration issues

## Contributing

1. Follow existing code patterns and conventions
2. Add proper error handling and validation
3. Include appropriate documentation
4. Test thoroughly before submitting changes

## License

This project is developed for educational purposes as part of the Student Information Management System requirements. 