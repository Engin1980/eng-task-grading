# API Endpointy - Pøehled

| Controller | HTTP Metoda | Endpoint | Parametry | Popis |
|------------|-------------|----------|-----------|-------|
| **AppLogController** | GET | `/api/v1/applog` | - | Získá všechny aplikaèní logy |
| **CourseController** | POST | `/api/Course` | `CourseCreateDto` (body) | Vytvoøí nový kurz |
| **CourseController** | GET | `/api/Course` | - | Získá všechny kurzy |
| **CourseController** | GET | `/api/Course/{id}` | `id` (route) | Získá kurz podle ID |
| **CourseController** | POST | `/api/Course/{courseId}/import` | `courseId` (route), `List<StudentCreateDto>` (body) | Importuje studenty do kurzu |
| **GradeController** | GET | `/api/Grade/for-course/{courseId}` | `courseId` (route) | Získá známky pro kurz |
| **GradeController** | GET | `/api/Grade/for-task/{taskId}` | `taskId` (route) | Získá známky pro úkol |
| **StudentController** | GET | `/api/Student/by-course/{courseId}` | `courseId` (route) | Získá studenty podle kurzu |
| **StudentController** | GET | `/api/Student/{id}` | `id` (route) | Získá studenta podle ID |
| **StudentController** | POST | `/api/Student/analyse-stag-export` | `string` (body) | Analyzuje STAG export studentù |
| **StudentController** | POST | `/api/Student/create-students` | `List<StudentCreateDto>` (body) | Vytvoøí nové studenty |
| **TaskController** | GET | `/api/Task/for-course/{courseId}` | `courseId` (route) | Získá úkoly pro kurz |
| **TaskController** | POST | `/api/Task/for-course/{courseId}` | `courseId` (route), `TaskCreateDto` (body) | Vytvoøí nový úkol pro kurz |
| **TaskController** | GET | `/api/Task/{id}` | `id` (route) | Získá úkol podle ID |
| **TeacherController** | POST | `/api/v1/teacher/login` | `TeacherLoginDto` (body) | Pøihlášení uèitele |
| **TeacherController** | POST | `/api/v1/teacher/register` | `TeacherRegisterDto` (body) | Registrace uèitele |
| **TeacherController** | GET | `/api/v1/teacher` | - | Získá všechny uèitele |
| **TeacherController** | GET | `/api/v1/teacher/{id}` | `id` (route) | Získá uèitele podle ID |

## Poznámky:
- Vìtšina controllerù používá route pattern `api/[controller]`, kromì **TeacherController** a **AppLogController**, které používají `api/v1/teacher` resp. `api/v1/applog`
- Všechny controllery jsou oznaèeny atributem `[ApiController]`
- Návratové typy zahrnují rùzné DTOs (`CourseDto`, `StudentDto`, `TaskDto`, `TeacherDto`, `GradeSet`, atd.)
- Nìkteré endpointy jsou asynchronní (`async Task`)

## Návratové typy podle endpointù:

| Endpoint | Návratový typ |
|----------|---------------|
| `/api/v1/applog` | `ActionResult<IEnumerable<AppLog>>` |
| `/api/Course` (POST) | `ActionResult<Course>` |
| `/api/Course` (GET) | `List<CourseDto>` |
| `/api/Course/{id}` | `CourseDto` |
| `/api/Course/{courseId}/import` | `Task` |
| `/api/Grade/for-course/{courseId}` | `GradeSet` |
| `/api/Grade/for-task/{taskId}` | `GradeSet` |
| `/api/Student/by-course/{courseId}` | `ActionResult<IEnumerable<StudentDto>>` |
| `/api/Student/{id}` | `StudentDto` |
| `/api/Student/analyse-stag-export` | `StudentAnalysisResultDto` |
| `/api/Student/create-students` | `Task` |
| `/api/Task/for-course/{courseId}` (GET) | `List<TaskDto>` |
| `/api/Task/for-course/{courseId}` (POST) | `TaskDto` |
| `/api/Task/{id}` | `TaskDto` |
| `/api/v1/teacher/login` | `TeacherDto` |
| `/api/v1/teacher/register` | `TeacherDto` |
| `/api/v1/teacher` | `IEnumerable<TeacherDto>` |
| `/api/v1/teacher/{id}` | `TeacherDto` |