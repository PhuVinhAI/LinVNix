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
  lesson: (lessonId: string) => generatePath(ROUTES.LESSON_DETAIL, { lessonId }),
  lessonSection: (lessonId: string, section: string) =>
    generatePath(ROUTES.LESSON_SECTION, { lessonId, section }),
  lessonNew: (moduleId: string) => generatePath(ROUTES.LESSON_NEW, { moduleId }),
  lessonEdit: (moduleId: string, id: string) => generatePath(ROUTES.LESSON_EDIT, { moduleId, id }),
  exercise: (exerciseId: string) => generatePath(ROUTES.EXERCISE_DETAIL, { exerciseId }),
  exerciseType: (exerciseId: string, questionType: string) =>
    generatePath(ROUTES.EXERCISE_TYPE, { exerciseId, questionType }),
  exerciseNew: (lessonId: string) => generatePath(ROUTES.EXERCISE_NEW, { lessonId }),
  exerciseEdit: (lessonId: string, id: string) => generatePath(ROUTES.EXERCISE_EDIT, { lessonId, id }),
  questionNew: (exerciseId: string, questionType?: string) => {
    const path = generatePath(ROUTES.QUESTION_NEW, { exerciseId })
    return questionType ? `${path}?type=${questionType}` : path
  },
  questionEdit: (exerciseId: string, id: string) => generatePath(ROUTES.QUESTION_EDIT, { exerciseId, id }),
}
