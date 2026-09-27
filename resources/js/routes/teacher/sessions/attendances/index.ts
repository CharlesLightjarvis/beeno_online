import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Teacher\AttendanceController::create
 * @see app/Http/Controllers/Teacher/AttendanceController.php:18
 * @route '/teacher/sessions/{session}/attendances/create'
 */
export const create = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/teacher/sessions/{session}/attendances/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\AttendanceController::create
 * @see app/Http/Controllers/Teacher/AttendanceController.php:18
 * @route '/teacher/sessions/{session}/attendances/create'
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
* @see \App\Http\Controllers\Teacher\AttendanceController::create
 * @see app/Http/Controllers/Teacher/AttendanceController.php:18
 * @route '/teacher/sessions/{session}/attendances/create'
 */
create.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\AttendanceController::create
 * @see app/Http/Controllers/Teacher/AttendanceController.php:18
 * @route '/teacher/sessions/{session}/attendances/create'
 */
create.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\AttendanceController::create
 * @see app/Http/Controllers/Teacher/AttendanceController.php:18
 * @route '/teacher/sessions/{session}/attendances/create'
 */
    const createForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\AttendanceController::create
 * @see app/Http/Controllers/Teacher/AttendanceController.php:18
 * @route '/teacher/sessions/{session}/attendances/create'
 */
        createForm.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\AttendanceController::create
 * @see app/Http/Controllers/Teacher/AttendanceController.php:18
 * @route '/teacher/sessions/{session}/attendances/create'
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
/**
* @see \App\Http\Controllers\Teacher\AttendanceController::store
 * @see app/Http/Controllers/Teacher/AttendanceController.php:34
 * @route '/teacher/sessions/{session}/attendances'
 */
export const store = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/teacher/sessions/{session}/attendances',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teacher\AttendanceController::store
 * @see app/Http/Controllers/Teacher/AttendanceController.php:34
 * @route '/teacher/sessions/{session}/attendances'
 */
store.url = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\AttendanceController::store
 * @see app/Http/Controllers/Teacher/AttendanceController.php:34
 * @route '/teacher/sessions/{session}/attendances'
 */
store.post = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Teacher\AttendanceController::store
 * @see app/Http/Controllers/Teacher/AttendanceController.php:34
 * @route '/teacher/sessions/{session}/attendances'
 */
    const storeForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\AttendanceController::store
 * @see app/Http/Controllers/Teacher/AttendanceController.php:34
 * @route '/teacher/sessions/{session}/attendances'
 */
        storeForm.post = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Teacher\AttendanceController::edit
 * @see app/Http/Controllers/Teacher/AttendanceController.php:57
 * @route '/teacher/sessions/{session}/attendances/{lesson}/edit'
 */
export const edit = (args: { session: string | { id: string }, lesson: string | { id: string } } | [session: string | { id: string }, lesson: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/teacher/sessions/{session}/attendances/{lesson}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\AttendanceController::edit
 * @see app/Http/Controllers/Teacher/AttendanceController.php:57
 * @route '/teacher/sessions/{session}/attendances/{lesson}/edit'
 */
edit.url = (args: { session: string | { id: string }, lesson: string | { id: string } } | [session: string | { id: string }, lesson: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                    lesson: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: typeof args.session === 'object'
                ? args.session.id
                : args.session,
                                lesson: typeof args.lesson === 'object'
                ? args.lesson.id
                : args.lesson,
                }

    return edit.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{lesson}', parsedArgs.lesson.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\AttendanceController::edit
 * @see app/Http/Controllers/Teacher/AttendanceController.php:57
 * @route '/teacher/sessions/{session}/attendances/{lesson}/edit'
 */
edit.get = (args: { session: string | { id: string }, lesson: string | { id: string } } | [session: string | { id: string }, lesson: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\AttendanceController::edit
 * @see app/Http/Controllers/Teacher/AttendanceController.php:57
 * @route '/teacher/sessions/{session}/attendances/{lesson}/edit'
 */
edit.head = (args: { session: string | { id: string }, lesson: string | { id: string } } | [session: string | { id: string }, lesson: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\AttendanceController::edit
 * @see app/Http/Controllers/Teacher/AttendanceController.php:57
 * @route '/teacher/sessions/{session}/attendances/{lesson}/edit'
 */
    const editForm = (args: { session: string | { id: string }, lesson: string | { id: string } } | [session: string | { id: string }, lesson: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\AttendanceController::edit
 * @see app/Http/Controllers/Teacher/AttendanceController.php:57
 * @route '/teacher/sessions/{session}/attendances/{lesson}/edit'
 */
        editForm.get = (args: { session: string | { id: string }, lesson: string | { id: string } } | [session: string | { id: string }, lesson: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\AttendanceController::edit
 * @see app/Http/Controllers/Teacher/AttendanceController.php:57
 * @route '/teacher/sessions/{session}/attendances/{lesson}/edit'
 */
        editForm.head = (args: { session: string | { id: string }, lesson: string | { id: string } } | [session: string | { id: string }, lesson: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\Teacher\AttendanceController::update
 * @see app/Http/Controllers/Teacher/AttendanceController.php:77
 * @route '/teacher/sessions/{session}/attendances/{lesson}'
 */
export const update = (args: { session: string | { id: string }, lesson: string | { id: string } } | [session: string | { id: string }, lesson: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/teacher/sessions/{session}/attendances/{lesson}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Teacher\AttendanceController::update
 * @see app/Http/Controllers/Teacher/AttendanceController.php:77
 * @route '/teacher/sessions/{session}/attendances/{lesson}'
 */
update.url = (args: { session: string | { id: string }, lesson: string | { id: string } } | [session: string | { id: string }, lesson: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                    lesson: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: typeof args.session === 'object'
                ? args.session.id
                : args.session,
                                lesson: typeof args.lesson === 'object'
                ? args.lesson.id
                : args.lesson,
                }

    return update.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{lesson}', parsedArgs.lesson.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\AttendanceController::update
 * @see app/Http/Controllers/Teacher/AttendanceController.php:77
 * @route '/teacher/sessions/{session}/attendances/{lesson}'
 */
update.put = (args: { session: string | { id: string }, lesson: string | { id: string } } | [session: string | { id: string }, lesson: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Teacher\AttendanceController::update
 * @see app/Http/Controllers/Teacher/AttendanceController.php:77
 * @route '/teacher/sessions/{session}/attendances/{lesson}'
 */
    const updateForm = (args: { session: string | { id: string }, lesson: string | { id: string } } | [session: string | { id: string }, lesson: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\AttendanceController::update
 * @see app/Http/Controllers/Teacher/AttendanceController.php:77
 * @route '/teacher/sessions/{session}/attendances/{lesson}'
 */
        updateForm.put = (args: { session: string | { id: string }, lesson: string | { id: string } } | [session: string | { id: string }, lesson: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const attendances = {
    create: Object.assign(create, create),
store: Object.assign(store, store),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
}

export default attendances