import DashboardController from './DashboardController'
import StudentController from './StudentController'
import CourseSessionController from './CourseSessionController'
import AttendanceController from './AttendanceController'
import SalaryController from './SalaryController'
const Teacher = {
    DashboardController: Object.assign(DashboardController, DashboardController),
StudentController: Object.assign(StudentController, StudentController),
CourseSessionController: Object.assign(CourseSessionController, CourseSessionController),
AttendanceController: Object.assign(AttendanceController, AttendanceController),
SalaryController: Object.assign(SalaryController, SalaryController),
}

export default Teacher