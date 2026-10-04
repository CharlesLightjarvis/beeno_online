import Student from './Student'
import Settings from './Settings'
import Admin from './Admin'
import Teacher from './Teacher'
const Controllers = {
    Student: Object.assign(Student, Student),
Settings: Object.assign(Settings, Settings),
Admin: Object.assign(Admin, Admin),
Teacher: Object.assign(Teacher, Teacher),
}

export default Controllers