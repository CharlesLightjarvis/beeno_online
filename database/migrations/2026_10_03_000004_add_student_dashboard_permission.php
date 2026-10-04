<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        $permission = Permission::firstOrCreate([
            'name' => 'view.student-dashboard',
            'guard_name' => 'web',
        ]);

        Role::query()->where('name', 'student')->where('guard_name', 'web')->first()?->givePermissionTo($permission);
    }

    public function down(): void
    {
        $permission = Permission::query()->where('name', 'view.student-dashboard')->where('guard_name', 'web')->first();
        $studentRole = Role::query()->where('name', 'student')->where('guard_name', 'web')->first();

        if ($permission && $studentRole) {
            $studentRole->revokePermissionTo($permission);
        }

        if ($permission && $permission->roles()->doesntExist() && $permission->users()->doesntExist()) {
            $permission->delete();
        }
    }
};
