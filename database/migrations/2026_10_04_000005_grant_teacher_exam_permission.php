<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permission = Permission::firstOrCreate([
            'name' => 'manage.own-exams',
            'guard_name' => 'web',
        ]);

        Role::query()
            ->where('name', 'teacher')
            ->where('guard_name', 'web')
            ->first()?->givePermissionTo($permission);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Role::query()
            ->where('name', 'teacher')
            ->where('guard_name', 'web')
            ->first()?->revokePermissionTo('manage.own-exams');

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
