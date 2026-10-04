<?php

namespace Tests\Feature\Teacher;

use App\Actions\Teacher\CreateStudent;
use App\Enums\RoleEnum;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_action_creates_a_non_interactive_student_owned_by_the_teacher(): void
    {
        $teacher = $this->teacher();

        $student = app(CreateStudent::class)->handle($teacher, '  Amina Ben Salah  ', 'amina@example.test');

        $this->assertSame('Amina Ben Salah', $student->name);
        $this->assertSame($teacher->id, $student->teacher_id);
        $this->assertSame('amina@example.test', $student->email);
        $this->assertTrue(Hash::check('Beenoaminbensalah1@', $student->password));
        $this->assertTrue($student->hasExactRoles(RoleEnum::Student->value));
    }

    public function test_users_table_uses_one_name_column_for_students(): void
    {
        $this->assertTrue(Schema::hasColumn('users', 'name'));
        $this->assertFalse(Schema::hasColumn('users', 'first_name'));
        $this->assertFalse(Schema::hasColumn('users', 'last_name'));
    }

    public function test_student_factory_creates_a_named_student(): void
    {
        $teacher = $this->teacher();

        $student = User::factory()->student($teacher)->create();

        $this->assertNotSame('', $student->name);
        $this->assertTrue($student->hasExactRoles(RoleEnum::Student->value));
    }

    public function test_teacher_can_create_a_student_and_submitted_role_is_ignored(): void
    {
        $teacher = $this->teacher();

        $this->actingAs($teacher)->post(route('teacher.students.store'), [
            'name' => 'Sami Trabelsi',
            'email' => 'sami@example.test',
            'role' => 'admin',
        ])->assertRedirect(route('teacher.students.index'));

        $student = User::query()->where('name', 'Sami Trabelsi')->firstOrFail();
        $this->assertTrue($student->hasExactRoles(RoleEnum::Student->value));
        $this->assertSame($teacher->id, $student->teacher_id);
        $this->assertSame('sami@example.test', $student->email);
        $this->assertTrue(Hash::check('Beenosamitrabelsi1@', $student->password));
    }

    public function test_student_can_log_in_with_the_name_based_password_and_reach_their_dashboard(): void
    {
        $teacher = $this->teacher();

        $this->actingAs($teacher)->post(route('teacher.students.store'), [
            'name' => 'Yosri',
            'email' => 'yosri@example.test',
        ])->assertRedirect(route('teacher.students.index'));

        auth()->logout();

        $this->post(route('login.store'), [
            'email' => 'yosri@example.test',
            'password' => 'Beenoyosri1@',
        ])->assertRedirect(route('student.dashboard'));

        $this->get(route('student.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('student/dashboard')
                ->where('summary.total', 0));
    }

    public function test_teacher_lists_only_their_active_students(): void
    {
        $teacher = $this->teacher();
        $otherTeacher = $this->teacher();
        $visible = app(CreateStudent::class)->handle($teacher, 'Ali Mansour', 'ali@example.test');
        app(CreateStudent::class)->handle($otherTeacher, 'Leila Gharbi', 'leila@example.test');
        $archived = app(CreateStudent::class)->handle($teacher, 'Nour Ayari', 'nour@example.test');
        $archived->update(['archived_at' => now()]);

        $this->actingAs($teacher)
            ->get(route('teacher.students.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/students/index')
                ->has('students.data', 1)
                ->where('students.data.0.id', $visible->id)
                ->where('students.data.0.name', 'Ali Mansour'));
    }

    public function test_teacher_can_update_and_archive_their_student(): void
    {
        $teacher = $this->teacher();
        $student = app(CreateStudent::class)->handle($teacher, 'Ali Mansour', 'ali@example.test');

        $this->actingAs($teacher)->patch(route('teacher.students.update', $student), [
            'name' => 'Aly Mansouri',
            'email' => 'aly@example.test',
        ])->assertRedirect();

        $student->refresh();
        $this->assertSame('Aly Mansouri', $student->name);
        $this->assertSame('aly@example.test', $student->email);

        $this->actingAs($teacher)
            ->delete(route('teacher.students.destroy', $student))
            ->assertRedirect(route('teacher.students.index'));

        $this->assertNotNull($student->refresh()->archived_at);
        $this->assertDatabaseHas('users', ['id' => $student->id]);
    }

    public function test_teacher_cannot_view_or_mutate_another_teachers_student(): void
    {
        $owner = $this->teacher();
        $intruder = $this->teacher();
        $student = app(CreateStudent::class)->handle($owner, 'Ines Jaziri', 'ines@example.test');

        $this->actingAs($intruder)
            ->get(route('teacher.students.edit', $student))
            ->assertForbidden();

        $this->actingAs($intruder)
            ->patch(route('teacher.students.update', $student), ['name' => 'X Y'])
            ->assertForbidden();

        $this->actingAs($intruder)
            ->delete(route('teacher.students.destroy', $student))
            ->assertForbidden();
    }

    public function test_student_name_is_required_trimmed_and_limited(): void
    {
        $teacher = $this->teacher();

        $this->actingAs($teacher)->post(route('teacher.students.store'), [
            'name' => '   ',
            'email' => 'student@example.test',
        ])->assertSessionHasErrors(['name']);

        $this->actingAs($teacher)->post(route('teacher.students.store'), [
            'name' => str_repeat('a', 256),
            'email' => 'student@example.test',
        ])->assertSessionHasErrors(['name']);

        $this->actingAs($teacher)->post(route('teacher.students.store'), [
            'name' => 'Nom valide',
            'email' => 'pas-une-adresse',
        ])->assertSessionHasErrors(['email']);
    }

    public function test_admin_student_and_guest_cannot_mutate_teacher_students(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(RoleEnum::Admin->value);
        $student = User::factory()->create();
        $student->assignRole(RoleEnum::Student->value);

        $payload = ['name' => 'A B'];

        $this->post('/teacher/students', $payload)->assertRedirect(route('login'));
        $this->actingAs($admin)->post('/teacher/students', $payload)->assertForbidden();
        $this->actingAs($student)->post('/teacher/students', $payload)->assertForbidden();
    }

    private function teacher(): User
    {
        $teacher = User::factory()->create();
        $teacher->assignRole(RoleEnum::Teacher->value);

        return $teacher;
    }
}
