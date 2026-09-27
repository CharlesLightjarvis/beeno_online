import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
export const create = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/teacher/sessions/{session}/next/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
create.url = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { session: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: typeof args.session === 'object'
                ? args.session.id
                : args.session,
                }

    return create.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
create.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
create.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
    const createForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
        createForm.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
        createForm.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
const next = {
    create: Object.assign(create, create),
}

export default next