import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::createNext
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
export const createNext = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createNext.url(args, options),
    method: 'get',
})

createNext.definition = {
    methods: ["get","head"],
    url: '/teacher/sessions/{session}/next/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::createNext
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
createNext.url = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return createNext.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::createNext
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
createNext.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createNext.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::createNext
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
createNext.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: createNext.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::createNext
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
    const createNextForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: createNext.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::createNext
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
        createNextForm.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: createNext.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::createNext
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:82
 * @route '/teacher/sessions/{session}/next/create'
 */
        createNextForm.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: createNext.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    createNext.form = createNextForm
/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::index
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:24
 * @route '/teacher/sessions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/teacher/sessions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::index
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:24
 * @route '/teacher/sessions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::index
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:24
 * @route '/teacher/sessions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::index
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:24
 * @route '/teacher/sessions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::index
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:24
 * @route '/teacher/sessions'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::index
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:24
 * @route '/teacher/sessions'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::index
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:24
 * @route '/teacher/sessions'
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
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:65
 * @route '/teacher/sessions/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/teacher/sessions/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:65
 * @route '/teacher/sessions/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:65
 * @route '/teacher/sessions/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:65
 * @route '/teacher/sessions/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:65
 * @route '/teacher/sessions/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:65
 * @route '/teacher/sessions/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::create
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:65
 * @route '/teacher/sessions/create'
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
* @see \App\Http\Controllers\Teacher\CourseSessionController::store
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:151
 * @route '/teacher/sessions'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/teacher/sessions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::store
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:151
 * @route '/teacher/sessions'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::store
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:151
 * @route '/teacher/sessions'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::store
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:151
 * @route '/teacher/sessions'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::store
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:151
 * @route '/teacher/sessions'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::show
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:117
 * @route '/teacher/sessions/{session}'
 */
export const show = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/teacher/sessions/{session}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::show
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:117
 * @route '/teacher/sessions/{session}'
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
* @see \App\Http\Controllers\Teacher\CourseSessionController::show
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:117
 * @route '/teacher/sessions/{session}'
 */
show.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::show
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:117
 * @route '/teacher/sessions/{session}'
 */
show.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::show
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:117
 * @route '/teacher/sessions/{session}'
 */
    const showForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::show
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:117
 * @route '/teacher/sessions/{session}'
 */
        showForm.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::show
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:117
 * @route '/teacher/sessions/{session}'
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
/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::edit
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:201
 * @route '/teacher/sessions/{session}/edit'
 */
export const edit = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/teacher/sessions/{session}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::edit
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:201
 * @route '/teacher/sessions/{session}/edit'
 */
edit.url = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return edit.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::edit
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:201
 * @route '/teacher/sessions/{session}/edit'
 */
edit.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::edit
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:201
 * @route '/teacher/sessions/{session}/edit'
 */
edit.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::edit
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:201
 * @route '/teacher/sessions/{session}/edit'
 */
    const editForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::edit
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:201
 * @route '/teacher/sessions/{session}/edit'
 */
        editForm.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::edit
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:201
 * @route '/teacher/sessions/{session}/edit'
 */
        editForm.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Teacher\CourseSessionController::update
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:216
 * @route '/teacher/sessions/{session}'
 */
export const update = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/teacher/sessions/{session}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::update
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:216
 * @route '/teacher/sessions/{session}'
 */
update.url = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::update
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:216
 * @route '/teacher/sessions/{session}'
 */
update.put = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::update
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:216
 * @route '/teacher/sessions/{session}'
 */
update.patch = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::update
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:216
 * @route '/teacher/sessions/{session}'
 */
    const updateForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::update
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:216
 * @route '/teacher/sessions/{session}'
 */
        updateForm.put = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::update
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:216
 * @route '/teacher/sessions/{session}'
 */
        updateForm.patch = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Teacher\CourseSessionController::destroy
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:228
 * @route '/teacher/sessions/{session}'
 */
export const destroy = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/teacher/sessions/{session}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::destroy
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:228
 * @route '/teacher/sessions/{session}'
 */
destroy.url = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\CourseSessionController::destroy
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:228
 * @route '/teacher/sessions/{session}'
 */
destroy.delete = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::destroy
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:228
 * @route '/teacher/sessions/{session}'
 */
    const destroyForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\CourseSessionController::destroy
 * @see app/Http/Controllers/Teacher/CourseSessionController.php:228
 * @route '/teacher/sessions/{session}'
 */
        destroyForm.delete = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const CourseSessionController = { createNext, index, create, store, show, edit, update, destroy }

export default CourseSessionController