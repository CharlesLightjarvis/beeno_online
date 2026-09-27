import Settings from './Settings'
import Admin from './Admin'
import Teacher from './Teacher'
const Controllers = {
    Settings: Object.assign(Settings, Settings),
Admin: Object.assign(Admin, Admin),
Teacher: Object.assign(Teacher, Teacher),
}

export default Controllers