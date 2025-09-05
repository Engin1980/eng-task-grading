# API Endpointy - P�ehled

| Controller | HTTP Metoda | Endpoint | Parametry | Popis |
|------------|-------------|----------|-----------|-------|
| **AppLogController** | GET | `/api/v1/applog` | - | Z�sk� v�echny aplika�n� logy |
| **CourseController** | POST | `/api/Course` | `CourseCreateDto` (body) | Vytvo�� nov� kurz |
| **CourseController** | GET | `/api/Course` | - | Z�sk� v�echny kurzy |
| **CourseController** | GET | `/api/Course/{id}` | `id` (route) | Z�sk� kurz podle ID |
| **CourseController** | POST | `/api/Course/{courseId}/import` | `courseId` (route), `List<StudentCreateDto>` (body) | Importuje studenty do kurzu |
| **GradeController** | GET | `/api/Grade/for-course/{courseId}` | `courseId` (route) | Z�sk� zn�mky pro kurz |
| **GradeController** | GET | `/api/Grade/for-task/{taskId}` | `taskId` (route) | Z�sk� zn�mky pro �kol |
| **StudentController** | GET | `/api/Student/by-course/{courseId}` | `courseId` (route) | Z�sk� studenty podle kurzu |
| **StudentController** | GET | `/api/Student/{id}` | `id` (route) | Z�sk� studenta podle ID |
| **StudentController** | POST | `/api/Student/analyse-stag-export` | `string` (body) | Analyzuje STAG export student� |
| **StudentController** | POST | `/api/Student/create-students` | `List<StudentCreateDto>` (body) | Vytvo�� nov� studenty |
| **TaskController** | GET | `/api/Task/for-course/{courseId}` | `courseId` (route) | Z�sk� �koly pro kurz |
| **TaskController** | POST | `/api/Task/for-course/{courseId}` | `courseId` (route), `TaskCreateDto` (body) | Vytvo�� nov� �kol pro kurz |
| **TaskController** | GET | `/api/Task/{id}` | `id` (route) | Z�sk� �kol podle ID |
| **TeacherController** | POST | `/api/v1/teacher/login` | `TeacherLoginDto` (body) | P�ihl�en� u�itele |
| **TeacherController** | POST | `/api/v1/teacher/register` | `TeacherRegisterDto` (body) | Registrace u�itele |
| **TeacherController** | GET | `/api/v1/teacher` | - | Z�sk� v�echny u�itele |
| **TeacherController** | GET | `/api/v1/teacher/{id}` | `id` (route) | Z�sk� u�itele podle ID |

## Pozn�mky:
- V�t�ina controller� pou��v� route pattern `api/[controller]`, krom� **TeacherController** a **AppLogController**, kter� pou��vaj� `api/v1/teacher` resp. `api/v1/applog`
- V�echny controllery jsou ozna�eny atributem `[ApiController]`
- N�vratov� typy zahrnuj� r�zn� DTOs (`CourseDto`, `StudentDto`, `TaskDto`, `TeacherDto`, `GradeSet`, atd.)
- N�kter� endpointy jsou asynchronn� (`async Task`)

## N�vratov� typy podle endpoint�:

| Endpoint | N�vratov� typ |
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