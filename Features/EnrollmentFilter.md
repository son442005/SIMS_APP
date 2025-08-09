# Enrollment Filter Feature

## Mô tả chức năng
Chức năng bộ lọc enrollment cho phép admin xem danh sách sinh viên đã được gán vào từng môn học cụ thể.

## Tính năng mới

### 1. **API Endpoints**

#### GET `/api/courses/enrollments?courseId={id}`
- **Mô tả**: Lấy danh sách enrollments với tùy chọn lọc theo courseId
- **Parameters**: 
  - `courseId` (optional): ID của môn học cần lọc
- **Response**: Danh sách StudentCourseDTO
- **Authorization**: Admin only

#### GET `/api/courses/{courseId}/students`
- **Mô tả**: Lấy danh sách sinh viên đã đăng ký môn học cụ thể
- **Parameters**: 
  - `courseId`: ID của môn học
- **Response**: Danh sách StudentCourseDTO được sắp xếp theo tên sinh viên
- **Authorization**: Admin only

### 2. **Frontend Features**

#### Course Filter Dropdown
- Dropdown hiển thị tất cả các môn học có sẵn
- Option "All Courses" để hiển thị tất cả enrollments
- Real-time filtering khi chọn môn học

#### Filter Information Display
- Hiển thị số lượng sinh viên đã đăng ký môn học được chọn
- Cập nhật động khi thay đổi filter

#### Enhanced User Experience
- Server-side filtering để tối ưu performance
- Loading states
- Error handling

## Cách sử dụng

### 1. **Truy cập Enrollment Management**
```
Admin Dashboard → Enrollments Tab
```

### 2. **Sử dụng bộ lọc**
1. Chọn "Filter by Course" dropdown
2. Chọn môn học muốn xem
3. Hệ thống sẽ hiển thị chỉ những sinh viên đã đăng ký môn học đó
4. Chọn "All Courses" để xem tất cả enrollments

### 3. **Xem thông tin chi tiết**
- Student Name
- Course Name & Code
- Enrollment Date
- Grade (nếu có)
- Letter Grade (nếu có)

## Technical Implementation

### Backend Changes

#### CoursesController.cs
```csharp
[HttpGet("enrollments")]
public async Task<ActionResult<IEnumerable<StudentCourseDTO>>> GetEnrollments([FromQuery] int? courseId = null)
{
    var query = _context.StudentCourses
        .Include(sc => sc.Student)
        .Include(sc => sc.Course)
        .AsQueryable();

    if (courseId.HasValue)
    {
        query = query.Where(sc => sc.CourseId == courseId.Value);
    }

    // ... rest of implementation
}

[HttpGet("{courseId}/students")]
public async Task<ActionResult<IEnumerable<StudentCourseDTO>>> GetStudentsByCourse(int courseId)
{
    // Implementation to get students by specific course
}
```

### Frontend Changes

#### Enhanced AdminDashboard
```javascript
const loadData = async (courseFilter = '') => {
    const enrollmentsUrl = courseFilter 
        ? `/courses/enrollments?courseId=${courseFilter}`
        : '/courses/enrollments';
    // ... implementation
};
```

#### EnrollmentsTab với Filter UI
```javascript
// Course filter dropdown
<select value={selectedCourseFilter} onChange={handleCourseFilterChange}>
    <option value="">All Courses</option>
    {courses.map(course => (
        <option key={course.id} value={course.id}>
            {course.code} - {course.name}
        </option>
    ))}
</select>
```

## Testing

### Unit Tests
- `EnrollmentFilterTests.cs`
- Test filtering functionality
- Test edge cases (empty results, invalid course ID)
- Test API endpoints

### Test Scenarios
```csharp
[Fact]
public async Task GetEnrollments_WithCourseFilter_ShouldReturnFilteredEnrollments()
[Fact] 
public async Task GetStudentsByCourse_WithValidCourseId_ShouldReturnEnrolledStudents()
[Fact]
public async Task GetStudentsByCourse_WithInvalidCourseId_ShouldReturnNotFound()
```

## Benefits

### 1. **Improved User Experience**
- Dễ dàng xem sinh viên theo từng môn học
- Giảm information overload
- Tìm kiếm nhanh chóng

### 2. **Performance Optimization**
- Server-side filtering
- Reduced data transfer
- Better scalability

### 3. **Administrative Efficiency**
- Quản lý enrollment hiệu quả hơn
- Thống kê theo môn học
- Hỗ trợ decision making

## Future Enhancements

### Possible Improvements
1. **Advanced Filters**
   - Filter by enrollment date range
   - Filter by grade range
   - Filter by student status

2. **Export Functionality**
   - Export filtered results to Excel/PDF
   - Print enrollment reports

3. **Analytics**
   - Enrollment statistics
   - Course popularity metrics
   - Student performance analytics

4. **Real-time Updates**
   - WebSocket integration
   - Live enrollment updates
   - Notification system