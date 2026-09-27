import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\CourseSessionController::index
 * @see app/Http/Controllers/Admin/CourseSessionController.php:18
 * @route '/admin/sessions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/sessions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\CourseSessionController::index
 * @see app/Http/Controllers/Admin/CourseSessionController.php:18
 * @route '/admin/sessions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CourseSessionController::index
 * @see app/Http/Controllers/Admin/CourseSessionController.php:18
 * @route '/admin/sessions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\CourseSessionController::index
 * @see app/Http/Controllers/Admin/CourseSessionController.php:18
 * @route '/admin/sessions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\CourseSessionController::index
 * @see app/Http/Controllers/Admin/CourseSessionController.php:18
 * @route '/admin/sessions'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\CourseSessionController::index
 * @see app/Http/Controllers/Admin/CourseSessionController.php:18
 * @route '/admin/sessions'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\CourseSessionController::index
 * @see app/Http/Controllers/Admin/CourseSessionController.php:18
 * @route '/admin/sessions'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\Admin\CourseSessionController::show
 * @see app/Http/Controllers/Admin/CourseSessionController.php:51
 * @route '/admin/sessions/{session}'
 */
export const show = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/sessions/{session}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\CourseSessionController::show
 * @see app/Http/Controllers/Admin/CourseSessionController.php:51
 * @route '/admin/sessions/{session}'
 */
show.url = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CourseSessionController::show
 * @see app/Http/Controllers/Admin/CourseSessionController.php:51
 * @route '/admin/sessions/{session}'
 */
show.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\CourseSessionController::show
 * @see app/Http/Controllers/Admin/CourseSessionController.php:51
 * @route '/admin/sessions/{session}'
 */
show.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\CourseSessionController::show
 * @see app/Http/Controllers/Admin/CourseSessionController.php:51
 * @route '/admin/sessions/{session}'
 */
    const showForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\CourseSessionController::show
 * @see app/Http/Controllers/Admin/CourseSessionController.php:51
 * @route '/admin/sessions/{session}'
 */
        showForm.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\CourseSessionController::show
 * @see app/Http/Controllers/Admin/CourseSessionController.php:51
 * @route '/admin/sessions/{session}'
 */
        showForm.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
const sessions = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
}

export default sessions