import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Teacher\ExamController::index
 * @see app/Http/Controllers/Teacher/ExamController.php:17
 * @route '/teacher/exams'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/teacher/exams',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\ExamController::index
 * @see app/Http/Controllers/Teacher/ExamController.php:17
 * @route '/teacher/exams'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamController::index
 * @see app/Http/Controllers/Teacher/ExamController.php:17
 * @route '/teacher/exams'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\ExamController::index
 * @see app/Http/Controllers/Teacher/ExamController.php:17
 * @route '/teacher/exams'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamController::index
 * @see app/Http/Controllers/Teacher/ExamController.php:17
 * @route '/teacher/exams'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamController::index
 * @see app/Http/Controllers/Teacher/ExamController.php:17
 * @route '/teacher/exams'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\ExamController::index
 * @see app/Http/Controllers/Teacher/ExamController.php:17
 * @route '/teacher/exams'
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
* @see \App\Http\Controllers\Teacher\ExamController::create
 * @see app/Http/Controllers/Teacher/ExamController.php:28
 * @route '/teacher/exams/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/teacher/exams/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\ExamController::create
 * @see app/Http/Controllers/Teacher/ExamController.php:28
 * @route '/teacher/exams/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamController::create
 * @see app/Http/Controllers/Teacher/ExamController.php:28
 * @route '/teacher/exams/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\ExamController::create
 * @see app/Http/Controllers/Teacher/ExamController.php:28
 * @route '/teacher/exams/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamController::create
 * @see app/Http/Controllers/Teacher/ExamController.php:28
 * @route '/teacher/exams/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamController::create
 * @see app/Http/Controllers/Teacher/ExamController.php:28
 * @route '/teacher/exams/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\ExamController::create
 * @see app/Http/Controllers/Teacher/ExamController.php:28
 * @route '/teacher/exams/create'
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
* @see \App\Http\Controllers\Teacher\ExamController::store
 * @see app/Http/Controllers/Teacher/ExamController.php:35
 * @route '/teacher/exams'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/teacher/exams',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teacher\ExamController::store
 * @see app/Http/Controllers/Teacher/ExamController.php:35
 * @route '/teacher/exams'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamController::store
 * @see app/Http/Controllers/Teacher/ExamController.php:35
 * @route '/teacher/exams'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamController::store
 * @see app/Http/Controllers/Teacher/ExamController.php:35
 * @route '/teacher/exams'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamController::store
 * @see app/Http/Controllers/Teacher/ExamController.php:35
 * @route '/teacher/exams'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Teacher\ExamController::edit
 * @see app/Http/Controllers/Teacher/ExamController.php:43
 * @route '/teacher/exams/{exam}/edit'
 */
export const edit = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/teacher/exams/{exam}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\ExamController::edit
 * @see app/Http/Controllers/Teacher/ExamController.php:43
 * @route '/teacher/exams/{exam}/edit'
 */
edit.url = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { exam: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { exam: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    exam: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        exam: typeof args.exam === 'object'
                ? args.exam.id
                : args.exam,
                }

    return edit.definition.url
            .replace('{exam}', parsedArgs.exam.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamController::edit
 * @see app/Http/Controllers/Teacher/ExamController.php:43
 * @route '/teacher/exams/{exam}/edit'
 */
edit.get = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\ExamController::edit
 * @see app/Http/Controllers/Teacher/ExamController.php:43
 * @route '/teacher/exams/{exam}/edit'
 */
edit.head = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamController::edit
 * @see app/Http/Controllers/Teacher/ExamController.php:43
 * @route '/teacher/exams/{exam}/edit'
 */
    const editForm = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamController::edit
 * @see app/Http/Controllers/Teacher/ExamController.php:43
 * @route '/teacher/exams/{exam}/edit'
 */
        editForm.get = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\ExamController::edit
 * @see app/Http/Controllers/Teacher/ExamController.php:43
 * @route '/teacher/exams/{exam}/edit'
 */
        editForm.head = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Teacher\ExamController::update
 * @see app/Http/Controllers/Teacher/ExamController.php:51
 * @route '/teacher/exams/{exam}'
 */
export const update = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/teacher/exams/{exam}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Teacher\ExamController::update
 * @see app/Http/Controllers/Teacher/ExamController.php:51
 * @route '/teacher/exams/{exam}'
 */
update.url = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { exam: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { exam: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    exam: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        exam: typeof args.exam === 'object'
                ? args.exam.id
                : args.exam,
                }

    return update.definition.url
            .replace('{exam}', parsedArgs.exam.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamController::update
 * @see app/Http/Controllers/Teacher/ExamController.php:51
 * @route '/teacher/exams/{exam}'
 */
update.put = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Teacher\ExamController::update
 * @see app/Http/Controllers/Teacher/ExamController.php:51
 * @route '/teacher/exams/{exam}'
 */
update.patch = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamController::update
 * @see app/Http/Controllers/Teacher/ExamController.php:51
 * @route '/teacher/exams/{exam}'
 */
    const updateForm = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamController::update
 * @see app/Http/Controllers/Teacher/ExamController.php:51
 * @route '/teacher/exams/{exam}'
 */
        updateForm.put = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Teacher\ExamController::update
 * @see app/Http/Controllers/Teacher/ExamController.php:51
 * @route '/teacher/exams/{exam}'
 */
        updateForm.patch = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Teacher\ExamController::destroy
 * @see app/Http/Controllers/Teacher/ExamController.php:59
 * @route '/teacher/exams/{exam}'
 */
export const destroy = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/teacher/exams/{exam}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Teacher\ExamController::destroy
 * @see app/Http/Controllers/Teacher/ExamController.php:59
 * @route '/teacher/exams/{exam}'
 */
destroy.url = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { exam: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { exam: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    exam: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        exam: typeof args.exam === 'object'
                ? args.exam.id
                : args.exam,
                }

    return destroy.definition.url
            .replace('{exam}', parsedArgs.exam.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamController::destroy
 * @see app/Http/Controllers/Teacher/ExamController.php:59
 * @route '/teacher/exams/{exam}'
 */
destroy.delete = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamController::destroy
 * @see app/Http/Controllers/Teacher/ExamController.php:59
 * @route '/teacher/exams/{exam}'
 */
    const destroyForm = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamController::destroy
 * @see app/Http/Controllers/Teacher/ExamController.php:59
 * @route '/teacher/exams/{exam}'
 */
        destroyForm.delete = (args: { exam: string | { id: string } } | [exam: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const exams = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default exams