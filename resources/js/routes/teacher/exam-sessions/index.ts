import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::index
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:25
 * @route '/teacher/exam-sessions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/teacher/exam-sessions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::index
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:25
 * @route '/teacher/exam-sessions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::index
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:25
 * @route '/teacher/exam-sessions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::index
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:25
 * @route '/teacher/exam-sessions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::index
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:25
 * @route '/teacher/exam-sessions'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::index
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:25
 * @route '/teacher/exam-sessions'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::index
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:25
 * @route '/teacher/exam-sessions'
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
* @see \App\Http\Controllers\Teacher\ExamSessionController::create
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:38
 * @route '/teacher/exam-sessions/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/teacher/exam-sessions/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::create
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:38
 * @route '/teacher/exam-sessions/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::create
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:38
 * @route '/teacher/exam-sessions/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::create
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:38
 * @route '/teacher/exam-sessions/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::create
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:38
 * @route '/teacher/exam-sessions/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::create
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:38
 * @route '/teacher/exam-sessions/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::create
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:38
 * @route '/teacher/exam-sessions/create'
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
* @see \App\Http\Controllers\Teacher\ExamSessionController::store
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:56
 * @route '/teacher/exam-sessions'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/teacher/exam-sessions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::store
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:56
 * @route '/teacher/exam-sessions'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::store
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:56
 * @route '/teacher/exam-sessions'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::store
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:56
 * @route '/teacher/exam-sessions'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::store
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:56
 * @route '/teacher/exam-sessions'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::show
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:66
 * @route '/teacher/exam-sessions/{exam_session}'
 */
export const show = (args: { exam_session: string | { id: string } } | [exam_session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/teacher/exam-sessions/{exam_session}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::show
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:66
 * @route '/teacher/exam-sessions/{exam_session}'
 */
show.url = (args: { exam_session: string | { id: string } } | [exam_session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { exam_session: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { exam_session: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    exam_session: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        exam_session: typeof args.exam_session === 'object'
                ? args.exam_session.id
                : args.exam_session,
                }

    return show.definition.url
            .replace('{exam_session}', parsedArgs.exam_session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::show
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:66
 * @route '/teacher/exam-sessions/{exam_session}'
 */
show.get = (args: { exam_session: string | { id: string } } | [exam_session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::show
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:66
 * @route '/teacher/exam-sessions/{exam_session}'
 */
show.head = (args: { exam_session: string | { id: string } } | [exam_session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::show
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:66
 * @route '/teacher/exam-sessions/{exam_session}'
 */
    const showForm = (args: { exam_session: string | { id: string } } | [exam_session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::show
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:66
 * @route '/teacher/exam-sessions/{exam_session}'
 */
        showForm.get = (args: { exam_session: string | { id: string } } | [exam_session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::show
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:66
 * @route '/teacher/exam-sessions/{exam_session}'
 */
        showForm.head = (args: { exam_session: string | { id: string } } | [exam_session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Teacher\ExamSessionController::run
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:76
 * @route '/teacher/exam-sessions/{examSession}/run'
 */
export const run = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: run.url(args, options),
    method: 'get',
})

run.definition = {
    methods: ["get","head"],
    url: '/teacher/exam-sessions/{examSession}/run',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::run
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:76
 * @route '/teacher/exam-sessions/{examSession}/run'
 */
run.url = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { examSession: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { examSession: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    examSession: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        examSession: typeof args.examSession === 'object'
                ? args.examSession.id
                : args.examSession,
                }

    return run.definition.url
            .replace('{examSession}', parsedArgs.examSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::run
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:76
 * @route '/teacher/exam-sessions/{examSession}/run'
 */
run.get = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: run.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::run
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:76
 * @route '/teacher/exam-sessions/{examSession}/run'
 */
run.head = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: run.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::run
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:76
 * @route '/teacher/exam-sessions/{examSession}/run'
 */
    const runForm = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: run.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::run
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:76
 * @route '/teacher/exam-sessions/{examSession}/run'
 */
        runForm.get = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: run.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::run
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:76
 * @route '/teacher/exam-sessions/{examSession}/run'
 */
        runForm.head = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: run.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    run.form = runForm
/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::start
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:108
 * @route '/teacher/exam-sessions/{examSession}/start'
 */
export const start = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(args, options),
    method: 'post',
})

start.definition = {
    methods: ["post"],
    url: '/teacher/exam-sessions/{examSession}/start',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::start
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:108
 * @route '/teacher/exam-sessions/{examSession}/start'
 */
start.url = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { examSession: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { examSession: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    examSession: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        examSession: typeof args.examSession === 'object'
                ? args.examSession.id
                : args.examSession,
                }

    return start.definition.url
            .replace('{examSession}', parsedArgs.examSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::start
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:108
 * @route '/teacher/exam-sessions/{examSession}/start'
 */
start.post = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::start
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:108
 * @route '/teacher/exam-sessions/{examSession}/start'
 */
    const startForm = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: start.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::start
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:108
 * @route '/teacher/exam-sessions/{examSession}/start'
 */
        startForm.post = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: start.url(args, options),
            method: 'post',
        })
    
    start.form = startForm
/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::open
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:178
 * @route '/teacher/exam-sessions/{examSession}/open'
 */
export const open = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: open.url(args, options),
    method: 'post',
})

open.definition = {
    methods: ["post"],
    url: '/teacher/exam-sessions/{examSession}/open',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::open
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:178
 * @route '/teacher/exam-sessions/{examSession}/open'
 */
open.url = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { examSession: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { examSession: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    examSession: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        examSession: typeof args.examSession === 'object'
                ? args.examSession.id
                : args.examSession,
                }

    return open.definition.url
            .replace('{examSession}', parsedArgs.examSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::open
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:178
 * @route '/teacher/exam-sessions/{examSession}/open'
 */
open.post = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: open.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::open
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:178
 * @route '/teacher/exam-sessions/{examSession}/open'
 */
    const openForm = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: open.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::open
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:178
 * @route '/teacher/exam-sessions/{examSession}/open'
 */
        openForm.post = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: open.url(args, options),
            method: 'post',
        })
    
    open.form = openForm
/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::close
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:188
 * @route '/teacher/exam-sessions/{examSession}/close'
 */
export const close = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: close.url(args, options),
    method: 'post',
})

close.definition = {
    methods: ["post"],
    url: '/teacher/exam-sessions/{examSession}/close',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::close
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:188
 * @route '/teacher/exam-sessions/{examSession}/close'
 */
close.url = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { examSession: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { examSession: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    examSession: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        examSession: typeof args.examSession === 'object'
                ? args.examSession.id
                : args.examSession,
                }

    return close.definition.url
            .replace('{examSession}', parsedArgs.examSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::close
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:188
 * @route '/teacher/exam-sessions/{examSession}/close'
 */
close.post = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: close.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::close
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:188
 * @route '/teacher/exam-sessions/{examSession}/close'
 */
    const closeForm = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: close.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::close
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:188
 * @route '/teacher/exam-sessions/{examSession}/close'
 */
        closeForm.post = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: close.url(args, options),
            method: 'post',
        })
    
    close.form = closeForm
/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::readingMaterial
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:169
 * @route '/teacher/exam-sessions/{examSession}/reading-material'
 */
export const readingMaterial = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: readingMaterial.url(args, options),
    method: 'post',
})

readingMaterial.definition = {
    methods: ["post"],
    url: '/teacher/exam-sessions/{examSession}/reading-material',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::readingMaterial
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:169
 * @route '/teacher/exam-sessions/{examSession}/reading-material'
 */
readingMaterial.url = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { examSession: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { examSession: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    examSession: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        examSession: typeof args.examSession === 'object'
                ? args.examSession.id
                : args.examSession,
                }

    return readingMaterial.definition.url
            .replace('{examSession}', parsedArgs.examSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\ExamSessionController::readingMaterial
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:169
 * @route '/teacher/exam-sessions/{examSession}/reading-material'
 */
readingMaterial.post = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: readingMaterial.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::readingMaterial
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:169
 * @route '/teacher/exam-sessions/{examSession}/reading-material'
 */
    const readingMaterialForm = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: readingMaterial.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\ExamSessionController::readingMaterial
 * @see app/Http/Controllers/Teacher/ExamSessionController.php:169
 * @route '/teacher/exam-sessions/{examSession}/reading-material'
 */
        readingMaterialForm.post = (args: { examSession: string | { id: string } } | [examSession: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: readingMaterial.url(args, options),
            method: 'post',
        })
    
    readingMaterial.form = readingMaterialForm
const examSessions = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
show: Object.assign(show, show),
run: Object.assign(run, run),
start: Object.assign(start, start),
open: Object.assign(open, open),
close: Object.assign(close, close),
readingMaterial: Object.assign(readingMaterial, readingMaterial),
}

export default examSessions