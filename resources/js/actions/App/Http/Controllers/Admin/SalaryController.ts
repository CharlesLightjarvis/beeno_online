import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SalaryController::index
 * @see app/Http/Controllers/Admin/SalaryController.php:16
 * @route '/admin/salaries'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/salaries',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SalaryController::index
 * @see app/Http/Controllers/Admin/SalaryController.php:16
 * @route '/admin/salaries'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SalaryController::index
 * @see app/Http/Controllers/Admin/SalaryController.php:16
 * @route '/admin/salaries'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SalaryController::index
 * @see app/Http/Controllers/Admin/SalaryController.php:16
 * @route '/admin/salaries'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\SalaryController::index
 * @see app/Http/Controllers/Admin/SalaryController.php:16
 * @route '/admin/salaries'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\SalaryController::index
 * @see app/Http/Controllers/Admin/SalaryController.php:16
 * @route '/admin/salaries'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\SalaryController::index
 * @see app/Http/Controllers/Admin/SalaryController.php:16
 * @route '/admin/salaries'
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
const SalaryController = { index }

export default SalaryController