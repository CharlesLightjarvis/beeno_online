import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import students from './students'
import exams from './exams'
import examSessions from './exam-sessions'
import sessions from './sessions'
import salaries from './salaries'
/**
* @see \App\Http\Controllers\Teacher\DashboardController::__invoke
 * @see app/Http/Controllers/Teacher/DashboardController.php:15
 * @route '/teacher/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/teacher/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\DashboardController::__invoke
 * @see app/Http/Controllers/Teacher/DashboardController.php:15
 * @route '/teacher/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\DashboardController::__invoke
 * @see app/Http/Controllers/Teacher/DashboardController.php:15
 * @route '/teacher/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\DashboardController::__invoke
 * @see app/Http/Controllers/Teacher/DashboardController.php:15
 * @route '/teacher/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\DashboardController::__invoke
 * @see app/Http/Controllers/Teacher/DashboardController.php:15
 * @route '/teacher/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\DashboardController::__invoke
 * @see app/Http/Controllers/Teacher/DashboardController.php:15
 * @route '/teacher/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\DashboardController::__invoke
 * @see app/Http/Controllers/Teacher/DashboardController.php:15
 * @route '/teacher/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
const teacher = {
    dashboard: Object.assign(dashboard, dashboard),
students: Object.assign(students, students),
exams: Object.assign(exams, exams),
examSessions: Object.assign(examSessions, examSessions),
sessions: Object.assign(sessions, sessions),
salaries: Object.assign(salaries, salaries),
}

export default teacher