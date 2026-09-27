import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Teacher\StudentController::index
 * @see app/Http/Controllers/Teacher/StudentController.php:17
 * @route '/teacher/students'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/teacher/students',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\StudentController::index
 * @see app/Http/Controllers/Teacher/StudentController.php:17
 * @route '/teacher/students'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\StudentController::index
 * @see app/Http/Controllers/Teacher/StudentController.php:17
 * @route '/teacher/students'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\StudentController::index
 * @see app/Http/Controllers/Teacher/StudentController.php:17
 * @route '/teacher/students'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\StudentController::index
 * @see app/Http/Controllers/Teacher/StudentController.php:17
 * @route '/teacher/students'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\StudentController::index
 * @see app/Http/Controllers/Teacher/StudentController.php:17
 * @route '/teacher/students'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\StudentController::index
 * @see app/Http/Controllers/Teacher/StudentController.php:17
 * @route '/teacher/students'
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
* @see \App\Http\Controllers\Teacher\StudentController::create
 * @see app/Http/Controllers/Teacher/StudentController.php:29
 * @route '/teacher/students/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/teacher/students/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\StudentController::create
 * @see app/Http/Controllers/Teacher/StudentController.php:29
 * @route '/teacher/students/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\StudentController::create
 * @see app/Http/Controllers/Teacher/StudentController.php:29
 * @route '/teacher/students/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\StudentController::create
 * @see app/Http/Controllers/Teacher/StudentController.php:29
 * @route '/teacher/students/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\StudentController::create
 * @see app/Http/Controllers/Teacher/StudentController.php:29
 * @route '/teacher/students/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\StudentController::create
 * @see app/Http/Controllers/Teacher/StudentController.php:29
 * @route '/teacher/students/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\StudentController::create
 * @see app/Http/Controllers/Teacher/StudentController.php:29
 * @route '/teacher/students/create'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\Teacher\StudentController::store
 * @see app/Http/Controllers/Teacher/StudentController.php:34
 * @route '/teacher/students'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/teacher/students',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teacher\StudentController::store
 * @see app/Http/Controllers/Teacher/StudentController.php:34
 * @route '/teacher/students'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\StudentController::store
 * @see app/Http/Controllers/Teacher/StudentController.php:34
 * @route '/teacher/students'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Teacher\StudentController::store
 * @see app/Http/Controllers/Teacher/StudentController.php:34
 * @route '/teacher/students'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\StudentController::store
 * @see app/Http/Controllers/Teacher/StudentController.php:34
 * @route '/teacher/students'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Teacher\StudentController::edit
 * @see app/Http/Controllers/Teacher/StudentController.php:44
 * @route '/teacher/students/{student}/edit'
 */
export const edit = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/teacher/students/{student}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\StudentController::edit
 * @see app/Http/Controllers/Teacher/StudentController.php:44
 * @route '/teacher/students/{student}/edit'
 */
edit.url = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { student: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { student: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    student: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        student: typeof args.student === 'object'
                ? args.student.id
                : args.student,
                }

    return edit.definition.url
            .replace('{student}', parsedArgs.student.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\StudentController::edit
 * @see app/Http/Controllers/Teacher/StudentController.php:44
 * @route '/teacher/students/{student}/edit'
 */
edit.get = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\StudentController::edit
 * @see app/Http/Controllers/Teacher/StudentController.php:44
 * @route '/teacher/students/{student}/edit'
 */
edit.head = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\StudentController::edit
 * @see app/Http/Controllers/Teacher/StudentController.php:44
 * @route '/teacher/students/{student}/edit'
 */
    const editForm = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\StudentController::edit
 * @see app/Http/Controllers/Teacher/StudentController.php:44
 * @route '/teacher/students/{student}/edit'
 */
        editForm.get = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\StudentController::edit
 * @see app/Http/Controllers/Teacher/StudentController.php:44
 * @route '/teacher/students/{student}/edit'
 */
        editForm.head = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Teacher\StudentController::update
 * @see app/Http/Controllers/Teacher/StudentController.php:53
 * @route '/teacher/students/{student}'
 */
export const update = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/teacher/students/{student}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Teacher\StudentController::update
 * @see app/Http/Controllers/Teacher/StudentController.php:53
 * @route '/teacher/students/{student}'
 */
update.url = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { student: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { student: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    student: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        student: typeof args.student === 'object'
                ? args.student.id
                : args.student,
                }

    return update.definition.url
            .replace('{student}', parsedArgs.student.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\StudentController::update
 * @see app/Http/Controllers/Teacher/StudentController.php:53
 * @route '/teacher/students/{student}'
 */
update.put = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Teacher\StudentController::update
 * @see app/Http/Controllers/Teacher/StudentController.php:53
 * @route '/teacher/students/{student}'
 */
update.patch = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Teacher\StudentController::update
 * @see app/Http/Controllers/Teacher/StudentController.php:53
 * @route '/teacher/students/{student}'
 */
    const updateForm = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\StudentController::update
 * @see app/Http/Controllers/Teacher/StudentController.php:53
 * @route '/teacher/students/{student}'
 */
        updateForm.put = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Teacher\StudentController::update
 * @see app/Http/Controllers/Teacher/StudentController.php:53
 * @route '/teacher/students/{student}'
 */
        updateForm.patch = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\Teacher\StudentController::destroy
 * @see app/Http/Controllers/Teacher/StudentController.php:63
 * @route '/teacher/students/{student}'
 */
export const destroy = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/teacher/students/{student}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Teacher\StudentController::destroy
 * @see app/Http/Controllers/Teacher/StudentController.php:63
 * @route '/teacher/students/{student}'
 */
destroy.url = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { student: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { student: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    student: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        student: typeof args.student === 'object'
                ? args.student.id
                : args.student,
                }

    return destroy.definition.url
            .replace('{student}', parsedArgs.student.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\StudentController::destroy
 * @see app/Http/Controllers/Teacher/StudentController.php:63
 * @route '/teacher/students/{student}'
 */
destroy.delete = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Teacher\StudentController::destroy
 * @see app/Http/Controllers/Teacher/StudentController.php:63
 * @route '/teacher/students/{student}'
 */
    const destroyForm = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\StudentController::destroy
 * @see app/Http/Controllers/Teacher/StudentController.php:63
 * @route '/teacher/students/{student}'
 */
        destroyForm.delete = (args: { student: string | { id: string } } | [student: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const students = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default students