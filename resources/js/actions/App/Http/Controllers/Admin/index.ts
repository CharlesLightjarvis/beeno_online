import DashboardController from './DashboardController'
import TeacherController from './TeacherController'
import CourseSessionController from './CourseSessionController'
import SalaryController from './SalaryController'
const Admin = {
    DashboardController: Object.assign(DashboardController, DashboardController),
TeacherController: Object.assign(TeacherController, TeacherController),
CourseSessionController: Object.assign(CourseSessionController, CourseSessionController),
SalaryController: Object.assign(SalaryController, SalaryController),
}

export default Admin