import { generatePath } from 'react-router'
import { ROUTES } from '../../../lib/shared/constants'

export const learningPath = {
  courses: () => ROUTES.COURSES,
  course: (courseId: string) => generatePath(ROUTES.COURSE_DETAIL, { courseId }),
  courseNew: () => ROUTES.COURSE_NEW,
  courseEdit: (id: string) => generatePath(ROUTES.COURSE_EDIT, { id }),
  module: (moduleId: string) => generatePath(ROUTES.MODULE_DETAIL, { moduleId }),
  moduleNew: (courseId: string) => generatePath(ROUTES.MODULE_NEW, { courseId }),
  moduleEdit: (courseId: string, id: string) => generatePath(ROUTES.MODULE_EDIT, { courseId, id }),
  lesson: (lessonId: string, tab?: string) => {
    const path = generatePath(ROUTES.LESSON_DETAIL, { lessonId })
    return tab ? `${path}?tab=${tab}` : path
  },
  lessonNew: (moduleId: string) => generatePath(ROUTES.LESSON_NEW, { moduleId }),
  lessonEdit: (moduleId: string, id: string) => generatePath(ROUTES.LESSON_EDIT, { moduleId, id }),
  exerciseSet: (setId: string) => generatePath(ROUTES.EXERCISE_SET_DETAIL, { setId }),
  exerciseSetNew: (lessonId: string) => generatePath(ROUTES.EXERCISE_SET_NEW, { lessonId }),
  exerciseSetEdit: (lessonId: string, id: string) => generatePath(ROUTES.EXERCISE_SET_EDIT, { lessonId, id }),
  exerciseNew: (setId: string) => generatePath(ROUTES.EXERCISE_NEW, { setId }),
  exerciseEdit: (setId: string, id: string) => generatePath(ROUTES.EXERCISE_EDIT, { setId, id }),
}
