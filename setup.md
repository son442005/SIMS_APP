# SIMS Setup Guide

## Quick Start

### 1. Database Setup
```sql
-- Connect to SQL Server and run:
CREATE DATABASE SIMS;
```

### 2. Application Setup
```bash
# Navigate to project directory
cd SIMS_APP

# Restore packages
dotnet restore

# Create and apply database migrations
dotnet ef migrations add InitialCreate
dotnet ef database update

# Run the application
dotnet run
```

### 3. Access the Application
- **URL**: `https://localhost:7000` or `http://localhost:5000`
- **Admin Login**: 
  - Username: `admin`
  - Password: `admin123`

### 4. Test the System

#### Admin Features:
1. **Login** with admin credentials
2. **Add Students** via the Students tab
3. **Add Courses** via the Courses tab
4. **Enroll Students** in courses via the Enrollments tab

#### Student Features:
1. **Register** a new student account
2. **Login** with student credentials
3. **View** enrolled courses in the dashboard

## Database Configuration

The application uses the following connection string:
```
Server=localhost;Database=SIMS;User Id=sa;Password=Son_442005;TrustServerCertificate=true;
```

**Important**: Update the connection string in `appsettings.json` if your SQL Server configuration differs.

## Default Admin Account

The system automatically creates a default admin account on first run:
- **Username**: `admin`
- **Password**: `admin123`

**Security Note**: Change the default password in production environments.

## API Testing

You can test the API endpoints using tools like Postman or curl:

### Login
```bash
curl -X POST https://localhost:7000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Students (Admin only)
```bash
curl -X GET https://localhost:7000/api/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Verify SQL Server is running
   - Check connection string in `appsettings.json`
   - Ensure database exists

2. **Migration Errors**
   - Run `dotnet ef database update --verbose` for detailed error info
   - Ensure user has database creation permissions

3. **JWT Token Issues**
   - Check JWT configuration in `appsettings.json`
   - Verify secret key is properly set

4. **CORS Errors**
   - Check browser console for CORS-related errors
   - Verify API endpoints are accessible

### Logs
- Application logs are available in the console output
- Use `dotnet run --environment Development` for detailed logging

## Development

### Adding New Features:
1. Create models in `Models/` directory
2. Add DTOs in `DTOs/` directory
3. Create controllers in `Controllers/` directory
4. Add React components in `wwwroot/js/`
5. Create database migrations: `dotnet ef migrations add MigrationName`

### Code Structure:
- **Backend**: C# with ASP.NET Core
- **Frontend**: React with Tailwind CSS
- **Database**: Entity Framework Core with SQL Server
- **Authentication**: JWT with role-based authorization 