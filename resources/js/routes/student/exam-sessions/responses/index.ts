import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Student\ExamSessionController::store
 * @see app/Http/Controllers/Student/ExamSessionController.php:116
 * @route '/student/exam-sessions/{examParticipation}/responses'
 */
export const store = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/student/exam-sessions/{examParticipation}/responses',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Student\ExamSessionController::store
 * @see app/Http/Controllers/Student/ExamSessionController.php:116
 * @route '/student/exam-sessions/{examParticipation}/responses'
 */
store.url = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { examParticipation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { examParticipation: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    examParticipation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        examParticipation: typeof args.examParticipation === 'object'
                ? args.examParticipation.id
                : args.examParticipation,
                }

    return store.definition.url
            .replace('{examParticipation}', parsedArgs.examParticipation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\ExamSessionController::store
 * @see app/Http/Controllers/Student/ExamSessionController.php:116
 * @route '/student/exam-sessions/{examParticipation}/responses'
 */
store.post = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Student\ExamSessionController::store
 * @see app/Http/Controllers/Student/ExamSessionController.php:116
 * @route '/student/exam-sessions/{examParticipation}/responses'
 */
    const storeForm = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Student\ExamSessionController::store
 * @see app/Http/Controllers/Student/ExamSessionController.php:116
 * @route '/student/exam-sessions/{examParticipation}/responses'
 */
        storeForm.post = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
const responses = {
    store: Object.assign(store, store),
}

export default responses