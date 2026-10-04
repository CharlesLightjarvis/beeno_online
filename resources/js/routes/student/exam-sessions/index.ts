import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import responses from './responses'
/**
* @see \App\Http\Controllers\Student\ExamSessionController::index
 * @see app/Http/Controllers/Student/ExamSessionController.php:27
 * @route '/student/exam-sessions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/student/exam-sessions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Student\ExamSessionController::index
 * @see app/Http/Controllers/Student/ExamSessionController.php:27
 * @route '/student/exam-sessions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\ExamSessionController::index
 * @see app/Http/Controllers/Student/ExamSessionController.php:27
 * @route '/student/exam-sessions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Student\ExamSessionController::index
 * @see app/Http/Controllers/Student/ExamSessionController.php:27
 * @route '/student/exam-sessions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Student\ExamSessionController::index
 * @see app/Http/Controllers/Student/ExamSessionController.php:27
 * @route '/student/exam-sessions'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Student\ExamSessionController::index
 * @see app/Http/Controllers/Student/ExamSessionController.php:27
 * @route '/student/exam-sessions'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Student\ExamSessionController::index
 * @see app/Http/Controllers/Student/ExamSessionController.php:27
 * @route '/student/exam-sessions'
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
* @see \App\Http\Controllers\Student\ExamSessionController::join
 * @see app/Http/Controllers/Student/ExamSessionController.php:44
 * @route '/student/exam-sessions/join'
 */
export const join = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(options),
    method: 'post',
})

join.definition = {
    methods: ["post"],
    url: '/student/exam-sessions/join',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Student\ExamSessionController::join
 * @see app/Http/Controllers/Student/ExamSessionController.php:44
 * @route '/student/exam-sessions/join'
 */
join.url = (options?: RouteQueryOptions) => {
    return join.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\ExamSessionController::join
 * @see app/Http/Controllers/Student/ExamSessionController.php:44
 * @route '/student/exam-sessions/join'
 */
join.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Student\ExamSessionController::join
 * @see app/Http/Controllers/Student/ExamSessionController.php:44
 * @route '/student/exam-sessions/join'
 */
    const joinForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: join.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Student\ExamSessionController::join
 * @see app/Http/Controllers/Student/ExamSessionController.php:44
 * @route '/student/exam-sessions/join'
 */
        joinForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: join.url(options),
            method: 'post',
        })
    
    join.form = joinForm
/**
* @see \App\Http\Controllers\Student\ExamSessionController::access
 * @see app/Http/Controllers/Student/ExamSessionController.php:51
 * @route '/student/exam-sessions/{examParticipation}/access'
 */
export const access = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: access.url(args, options),
    method: 'post',
})

access.definition = {
    methods: ["post"],
    url: '/student/exam-sessions/{examParticipation}/access',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Student\ExamSessionController::access
 * @see app/Http/Controllers/Student/ExamSessionController.php:51
 * @route '/student/exam-sessions/{examParticipation}/access'
 */
access.url = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return access.definition.url
            .replace('{examParticipation}', parsedArgs.examParticipation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\ExamSessionController::access
 * @see app/Http/Controllers/Student/ExamSessionController.php:51
 * @route '/student/exam-sessions/{examParticipation}/access'
 */
access.post = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: access.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Student\ExamSessionController::access
 * @see app/Http/Controllers/Student/ExamSessionController.php:51
 * @route '/student/exam-sessions/{examParticipation}/access'
 */
    const accessForm = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: access.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Student\ExamSessionController::access
 * @see app/Http/Controllers/Student/ExamSessionController.php:51
 * @route '/student/exam-sessions/{examParticipation}/access'
 */
        accessForm.post = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: access.url(args, options),
            method: 'post',
        })
    
    access.form = accessForm
/**
* @see \App\Http\Controllers\Student\ExamSessionController::show
 * @see app/Http/Controllers/Student/ExamSessionController.php:73
 * @route '/student/exam-sessions/{examParticipation}'
 */
export const show = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/student/exam-sessions/{examParticipation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Student\ExamSessionController::show
 * @see app/Http/Controllers/Student/ExamSessionController.php:73
 * @route '/student/exam-sessions/{examParticipation}'
 */
show.url = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{examParticipation}', parsedArgs.examParticipation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\ExamSessionController::show
 * @see app/Http/Controllers/Student/ExamSessionController.php:73
 * @route '/student/exam-sessions/{examParticipation}'
 */
show.get = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Student\ExamSessionController::show
 * @see app/Http/Controllers/Student/ExamSessionController.php:73
 * @route '/student/exam-sessions/{examParticipation}'
 */
show.head = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Student\ExamSessionController::show
 * @see app/Http/Controllers/Student/ExamSessionController.php:73
 * @route '/student/exam-sessions/{examParticipation}'
 */
    const showForm = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Student\ExamSessionController::show
 * @see app/Http/Controllers/Student/ExamSessionController.php:73
 * @route '/student/exam-sessions/{examParticipation}'
 */
        showForm.get = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Student\ExamSessionController::show
 * @see app/Http/Controllers/Student/ExamSessionController.php:73
 * @route '/student/exam-sessions/{examParticipation}'
 */
        showForm.head = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Student\ExamSessionController::results
 * @see app/Http/Controllers/Student/ExamSessionController.php:160
 * @route '/student/exam-sessions/{examParticipation}/results'
 */
export const results = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: results.url(args, options),
    method: 'get',
})

results.definition = {
    methods: ["get","head"],
    url: '/student/exam-sessions/{examParticipation}/results',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Student\ExamSessionController::results
 * @see app/Http/Controllers/Student/ExamSessionController.php:160
 * @route '/student/exam-sessions/{examParticipation}/results'
 */
results.url = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return results.definition.url
            .replace('{examParticipation}', parsedArgs.examParticipation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\ExamSessionController::results
 * @see app/Http/Controllers/Student/ExamSessionController.php:160
 * @route '/student/exam-sessions/{examParticipation}/results'
 */
results.get = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: results.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Student\ExamSessionController::results
 * @see app/Http/Controllers/Student/ExamSessionController.php:160
 * @route '/student/exam-sessions/{examParticipation}/results'
 */
results.head = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: results.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Student\ExamSessionController::results
 * @see app/Http/Controllers/Student/ExamSessionController.php:160
 * @route '/student/exam-sessions/{examParticipation}/results'
 */
    const resultsForm = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: results.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Student\ExamSessionController::results
 * @see app/Http/Controllers/Student/ExamSessionController.php:160
 * @route '/student/exam-sessions/{examParticipation}/results'
 */
        resultsForm.get = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: results.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Student\ExamSessionController::results
 * @see app/Http/Controllers/Student/ExamSessionController.php:160
 * @route '/student/exam-sessions/{examParticipation}/results'
 */
        resultsForm.head = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: results.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    results.form = resultsForm
/**
* @see \App\Http\Controllers\Student\ExamSessionController::state
 * @see app/Http/Controllers/Student/ExamSessionController.php:250
 * @route '/student/exam-sessions/{examParticipation}/state'
 */
export const state = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: state.url(args, options),
    method: 'get',
})

state.definition = {
    methods: ["get","head"],
    url: '/student/exam-sessions/{examParticipation}/state',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Student\ExamSessionController::state
 * @see app/Http/Controllers/Student/ExamSessionController.php:250
 * @route '/student/exam-sessions/{examParticipation}/state'
 */
state.url = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return state.definition.url
            .replace('{examParticipation}', parsedArgs.examParticipation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\ExamSessionController::state
 * @see app/Http/Controllers/Student/ExamSessionController.php:250
 * @route '/student/exam-sessions/{examParticipation}/state'
 */
state.get = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: state.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Student\ExamSessionController::state
 * @see app/Http/Controllers/Student/ExamSessionController.php:250
 * @route '/student/exam-sessions/{examParticipation}/state'
 */
state.head = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: state.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Student\ExamSessionController::state
 * @see app/Http/Controllers/Student/ExamSessionController.php:250
 * @route '/student/exam-sessions/{examParticipation}/state'
 */
    const stateForm = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: state.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Student\ExamSessionController::state
 * @see app/Http/Controllers/Student/ExamSessionController.php:250
 * @route '/student/exam-sessions/{examParticipation}/state'
 */
        stateForm.get = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: state.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Student\ExamSessionController::state
 * @see app/Http/Controllers/Student/ExamSessionController.php:250
 * @route '/student/exam-sessions/{examParticipation}/state'
 */
        stateForm.head = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: state.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    state.form = stateForm
/**
* @see \App\Http\Controllers\Student\ExamSessionController::heartbeat
 * @see app/Http/Controllers/Student/ExamSessionController.php:285
 * @route '/student/exam-sessions/{examParticipation}/heartbeat'
 */
export const heartbeat = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: heartbeat.url(args, options),
    method: 'post',
})

heartbeat.definition = {
    methods: ["post"],
    url: '/student/exam-sessions/{examParticipation}/heartbeat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Student\ExamSessionController::heartbeat
 * @see app/Http/Controllers/Student/ExamSessionController.php:285
 * @route '/student/exam-sessions/{examParticipation}/heartbeat'
 */
heartbeat.url = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return heartbeat.definition.url
            .replace('{examParticipation}', parsedArgs.examParticipation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\ExamSessionController::heartbeat
 * @see app/Http/Controllers/Student/ExamSessionController.php:285
 * @route '/student/exam-sessions/{examParticipation}/heartbeat'
 */
heartbeat.post = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: heartbeat.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Student\ExamSessionController::heartbeat
 * @see app/Http/Controllers/Student/ExamSessionController.php:285
 * @route '/student/exam-sessions/{examParticipation}/heartbeat'
 */
    const heartbeatForm = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: heartbeat.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Student\ExamSessionController::heartbeat
 * @see app/Http/Controllers/Student/ExamSessionController.php:285
 * @route '/student/exam-sessions/{examParticipation}/heartbeat'
 */
        heartbeatForm.post = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: heartbeat.url(args, options),
            method: 'post',
        })
    
    heartbeat.form = heartbeatForm
/**
* @see \App\Http\Controllers\Student\ExamSessionController::finish
 * @see app/Http/Controllers/Student/ExamSessionController.php:240
 * @route '/student/exam-sessions/{examParticipation}/finish'
 */
export const finish = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: finish.url(args, options),
    method: 'post',
})

finish.definition = {
    methods: ["post"],
    url: '/student/exam-sessions/{examParticipation}/finish',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Student\ExamSessionController::finish
 * @see app/Http/Controllers/Student/ExamSessionController.php:240
 * @route '/student/exam-sessions/{examParticipation}/finish'
 */
finish.url = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return finish.definition.url
            .replace('{examParticipation}', parsedArgs.examParticipation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Student\ExamSessionController::finish
 * @see app/Http/Controllers/Student/ExamSessionController.php:240
 * @route '/student/exam-sessions/{examParticipation}/finish'
 */
finish.post = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: finish.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Student\ExamSessionController::finish
 * @see app/Http/Controllers/Student/ExamSessionController.php:240
 * @route '/student/exam-sessions/{examParticipation}/finish'
 */
    const finishForm = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: finish.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Student\ExamSessionController::finish
 * @see app/Http/Controllers/Student/ExamSessionController.php:240
 * @route '/student/exam-sessions/{examParticipation}/finish'
 */
        finishForm.post = (args: { examParticipation: string | { id: string } } | [examParticipation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: finish.url(args, options),
            method: 'post',
        })
    
    finish.form = finishForm
const examSessions = {
    index: Object.assign(index, index),
join: Object.assign(join, join),
access: Object.assign(access, access),
show: Object.assign(show, show),
results: Object.assign(results, results),
state: Object.assign(state, state),
heartbeat: Object.assign(heartbeat, heartbeat),
responses: Object.assign(responses, responses),
finish: Object.assign(finish, finish),
}

export default examSessions