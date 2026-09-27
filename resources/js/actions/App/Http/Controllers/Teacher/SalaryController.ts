import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Teacher\SalaryController::index
 * @see app/Http/Controllers/Teacher/SalaryController.php:21
 * @route '/teacher/salaries'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/teacher/salaries',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Teacher\SalaryController::index
 * @see app/Http/Controllers/Teacher/SalaryController.php:21
 * @route '/teacher/salaries'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\SalaryController::index
 * @see app/Http/Controllers/Teacher/SalaryController.php:21
 * @route '/teacher/salaries'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Teacher\SalaryController::index
 * @see app/Http/Controllers/Teacher/SalaryController.php:21
 * @route '/teacher/salaries'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Teacher\SalaryController::index
 * @see app/Http/Controllers/Teacher/SalaryController.php:21
 * @route '/teacher/salaries'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Teacher\SalaryController::index
 * @see app/Http/Controllers/Teacher/SalaryController.php:21
 * @route '/teacher/salaries'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Teacher\SalaryController::index
 * @see app/Http/Controllers/Teacher/SalaryController.php:21
 * @route '/teacher/salaries'
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
* @see \App\Http\Controllers\Teacher\SalaryController::markPaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:34
 * @route '/teacher/salaries/{session}/paid'
 */
export const markPaid = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markPaid.url(args, options),
    method: 'post',
})

markPaid.definition = {
    methods: ["post"],
    url: '/teacher/salaries/{session}/paid',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teacher\SalaryController::markPaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:34
 * @route '/teacher/salaries/{session}/paid'
 */
markPaid.url = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return markPaid.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\SalaryController::markPaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:34
 * @route '/teacher/salaries/{session}/paid'
 */
markPaid.post = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markPaid.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Teacher\SalaryController::markPaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:34
 * @route '/teacher/salaries/{session}/paid'
 */
    const markPaidForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markPaid.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\SalaryController::markPaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:34
 * @route '/teacher/salaries/{session}/paid'
 */
        markPaidForm.post = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markPaid.url(args, options),
            method: 'post',
        })
    
    markPaid.form = markPaidForm
/**
* @see \App\Http\Controllers\Teacher\SalaryController::markPartiallyPaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:62
 * @route '/teacher/salaries/{session}/partially-paid'
 */
export const markPartiallyPaid = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markPartiallyPaid.url(args, options),
    method: 'post',
})

markPartiallyPaid.definition = {
    methods: ["post"],
    url: '/teacher/salaries/{session}/partially-paid',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teacher\SalaryController::markPartiallyPaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:62
 * @route '/teacher/salaries/{session}/partially-paid'
 */
markPartiallyPaid.url = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return markPartiallyPaid.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\SalaryController::markPartiallyPaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:62
 * @route '/teacher/salaries/{session}/partially-paid'
 */
markPartiallyPaid.post = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markPartiallyPaid.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Teacher\SalaryController::markPartiallyPaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:62
 * @route '/teacher/salaries/{session}/partially-paid'
 */
    const markPartiallyPaidForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markPartiallyPaid.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\SalaryController::markPartiallyPaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:62
 * @route '/teacher/salaries/{session}/partially-paid'
 */
        markPartiallyPaidForm.post = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markPartiallyPaid.url(args, options),
            method: 'post',
        })
    
    markPartiallyPaid.form = markPartiallyPaidForm
/**
* @see \App\Http\Controllers\Teacher\SalaryController::deletePayment
 * @see app/Http/Controllers/Teacher/SalaryController.php:137
 * @route '/teacher/salaries/{session}/payments/{payment}'
 */
export const deletePayment = (args: { session: string | { id: string }, payment: string | { id: string } } | [session: string | { id: string }, payment: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deletePayment.url(args, options),
    method: 'delete',
})

deletePayment.definition = {
    methods: ["delete"],
    url: '/teacher/salaries/{session}/payments/{payment}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Teacher\SalaryController::deletePayment
 * @see app/Http/Controllers/Teacher/SalaryController.php:137
 * @route '/teacher/salaries/{session}/payments/{payment}'
 */
deletePayment.url = (args: { session: string | { id: string }, payment: string | { id: string } } | [session: string | { id: string }, payment: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                    payment: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: typeof args.session === 'object'
                ? args.session.id
                : args.session,
                                payment: typeof args.payment === 'object'
                ? args.payment.id
                : args.payment,
                }

    return deletePayment.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{payment}', parsedArgs.payment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\SalaryController::deletePayment
 * @see app/Http/Controllers/Teacher/SalaryController.php:137
 * @route '/teacher/salaries/{session}/payments/{payment}'
 */
deletePayment.delete = (args: { session: string | { id: string }, payment: string | { id: string } } | [session: string | { id: string }, payment: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deletePayment.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Teacher\SalaryController::deletePayment
 * @see app/Http/Controllers/Teacher/SalaryController.php:137
 * @route '/teacher/salaries/{session}/payments/{payment}'
 */
    const deletePaymentForm = (args: { session: string | { id: string }, payment: string | { id: string } } | [session: string | { id: string }, payment: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deletePayment.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\SalaryController::deletePayment
 * @see app/Http/Controllers/Teacher/SalaryController.php:137
 * @route '/teacher/salaries/{session}/payments/{payment}'
 */
        deletePaymentForm.delete = (args: { session: string | { id: string }, payment: string | { id: string } } | [session: string | { id: string }, payment: string | { id: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deletePayment.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    deletePayment.form = deletePaymentForm
/**
* @see \App\Http\Controllers\Teacher\SalaryController::markUnpaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:120
 * @route '/teacher/salaries/{session}/unpaid'
 */
export const markUnpaid = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markUnpaid.url(args, options),
    method: 'post',
})

markUnpaid.definition = {
    methods: ["post"],
    url: '/teacher/salaries/{session}/unpaid',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Teacher\SalaryController::markUnpaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:120
 * @route '/teacher/salaries/{session}/unpaid'
 */
markUnpaid.url = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return markUnpaid.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Teacher\SalaryController::markUnpaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:120
 * @route '/teacher/salaries/{session}/unpaid'
 */
markUnpaid.post = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markUnpaid.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Teacher\SalaryController::markUnpaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:120
 * @route '/teacher/salaries/{session}/unpaid'
 */
    const markUnpaidForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markUnpaid.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Teacher\SalaryController::markUnpaid
 * @see app/Http/Controllers/Teacher/SalaryController.php:120
 * @route '/teacher/salaries/{session}/unpaid'
 */
        markUnpaidForm.post = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markUnpaid.url(args, options),
            method: 'post',
        })
    
    markUnpaid.form = markUnpaidForm
const SalaryController = { index, markPaid, markPartiallyPaid, deletePayment, markUnpaid }

export default SalaryController