import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\TeacherController::index
 * @see app/Http/Controllers/Admin/TeacherController.php:15
 * @route '/admin/teachers'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/teachers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TeacherController::index
 * @see app/Http/Controllers/Admin/TeacherController.php:15
 * @route '/admin/teachers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TeacherController::index
 * @see app/Http/Controllers/Admin/TeacherController.php:15
 * @route '/admin/teachers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\TeacherController::index
 * @see app/Http/Controllers/Admin/TeacherController.php:15
 * @route '/admin/teachers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\TeacherController::index
 * @see app/Http/Controllers/Admin/TeacherController.php:15
 * @route '/admin/teachers'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\TeacherController::index
 * @see app/Http/Controllers/Admin/TeacherController.php:15
 * @route '/admin/teachers'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\TeacherController::index
 * @see app/Http/Controllers/Admin/TeacherController.php:15
 * @route '/admin/teachers'
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
const TeacherController = { index }

export default TeacherController