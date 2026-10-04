<?php

namespace App\Http\Requests\Teacher;

use App\Enums\ExamStatus;
use App\Models\Exam;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Exam::class) === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return self::examRules();
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'title' => 'titre de l’examen',
            'parts.*.instructions' => 'consignes',
            'parts.*.reading_materials.*.body' => 'contenu du texte',
            'parts.*.reading_materials.*.position' => 'ordre du texte',
            'parts.*.tasks.*.prompt' => 'question ou affirmation',
            'parts.*.tasks.*.position' => 'ordre de la question',
            'parts.*.tasks.*.choices.*.body' => 'contenu de l’annonce',
            'parts.*.tasks.*.choices.*.label' => 'nom du choix',
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'parts.*.instructions.required_if' => 'Ajoutez les consignes de cette partie avant de publier.',
            'parts.*.reading_materials.*.body.required_if' => 'Ajoutez le contenu de ce texte avant de publier.',
            'parts.*.tasks.*.prompt.required_if' => 'Saisissez la question ou l’affirmation avant de publier.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(fn (Validator $validator) => self::validateExam($validator, $this->input()));
    }

    /** @return array<string, mixed> */
    public static function examRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'status' => ['required', 'in:'.implode(',', array_column(ExamStatus::cases(), 'value'))],
            'parts' => ['sometimes', 'array', 'max:3'],
            'parts.*' => ['array'],
            'parts.*.id' => ['nullable', 'uuid'],
            'parts.*.part_number' => ['required', 'integer', 'between:1,3', 'distinct'],
            'parts.*.instructions' => ['required_if:status,published', 'nullable', 'string', 'max:2000'],
            'parts.*.reading_materials' => ['sometimes', 'array', 'max:30'],
            'parts.*.reading_materials.*' => ['array'],
            'parts.*.reading_materials.*.id' => ['nullable', 'uuid'],
            'parts.*.reading_materials.*.source' => ['nullable', 'string', 'max:255'],
            'parts.*.reading_materials.*.title' => ['nullable', 'string', 'max:255'],
            'parts.*.reading_materials.*.body' => ['required_if:status,published', 'nullable', 'string', 'max:20000'],
            'parts.*.reading_materials.*.position' => ['required', 'integer', 'min:1'],
            'parts.*.tasks' => ['sometimes', 'array', 'max:5'],
            'parts.*.tasks.*' => ['array'],
            'parts.*.tasks.*.id' => ['nullable', 'uuid'],
            'parts.*.tasks.*.reading_material_id' => ['nullable', 'uuid'],
            'parts.*.tasks.*.reading_material_position' => ['nullable', 'integer', 'between:1,30'],
            'parts.*.tasks.*.prompt' => ['required_if:status,published', 'nullable', 'string', 'max:2000'],
            'parts.*.tasks.*.position' => ['required', 'integer', 'between:1,5'],
            'parts.*.tasks.*.choices' => ['sometimes', 'array', 'size:2'],
            'parts.*.tasks.*.choices.*' => ['array'],
            'parts.*.tasks.*.choices.*.id' => ['nullable', 'uuid'],
            'parts.*.tasks.*.choices.*.label' => ['required', 'string', 'max:20'],
            'parts.*.tasks.*.choices.*.body' => ['nullable', 'string', 'max:20000'],
            'parts.*.tasks.*.choices.*.is_correct' => ['sometimes', 'boolean'],
            'parts.*.tasks.*.choices.*.position' => ['required', 'integer', 'between:1,2'],
        ];
    }

    /** @param array<string, mixed> $data */
    public static function validateExam(Validator $validator, array $data): void
    {
        $parts = is_array($data['parts'] ?? null) ? $data['parts'] : [];
        foreach ($parts as $partIndex => $part) {
            if (! is_array($part)) {
                continue;
            }
            $number = (int) ($part['part_number'] ?? 0);
            $materials = is_array($part['reading_materials'] ?? null) ? $part['reading_materials'] : [];
            $tasks = is_array($part['tasks'] ?? null) ? $part['tasks'] : [];

            self::validateUniquePositions($validator, $materials, "parts.$partIndex.reading_materials", 'Les positions des textes doivent être uniques dans cette partie.');
            self::validateUniquePositions($validator, $tasks, "parts.$partIndex.tasks", 'Les positions des questions doivent être uniques dans cette partie.');

            foreach ($tasks as $taskIndex => $task) {
                if (! is_array($task)) {
                    continue;
                }
                $choicesData = is_array($task['choices'] ?? null) ? $task['choices'] : [];
                self::validateUniquePositions($validator, $choicesData, "parts.$partIndex.tasks.$taskIndex.choices", 'Les positions des choix doivent être uniques dans cette question.');

                $choices = array_values(array_filter($choicesData, 'is_array'));
                $labels = array_column($choices, 'label');
                if ($labels === []) {
                    continue;
                }
                $expected = $number === 2 ? ['A', 'B'] : ['richtig', 'falsch'];
                if (count($labels) !== 2 || $labels !== $expected) {
                    $validator->errors()->add("parts.$partIndex.tasks.$taskIndex.choices", 'Les choix proposés ne correspondent pas au format de cette partie.');
                }
                if (($data['status'] ?? null) === ExamStatus::Published->value
                    && count(array_filter($choices, fn (array $choice): bool => filter_var($choice['is_correct'] ?? false, FILTER_VALIDATE_BOOLEAN))) !== 1) {
                    $validator->errors()->add("parts.$partIndex.tasks.$taskIndex.choices", 'Sélectionnez une seule réponse attendue pour cette question.');
                }
            }
        }

        if (($data['status'] ?? null) !== ExamStatus::Published->value) {
            return;
        }
        $parts = array_values(array_filter($parts, 'is_array'));
        $valid = count($parts) === 3;
        foreach ([1, 2, 3] as $number) {
            $partIndex = collect($parts)->search(fn (array $part): bool => (int) ($part['part_number'] ?? 0) === $number);
            $part = $partIndex === false ? null : $parts[$partIndex];
            if ($part === null) {
                $valid = false;

                continue;
            }
            $tasks = is_array($part['tasks'] ?? null) ? array_values(array_filter($part['tasks'], 'is_array')) : [];
            $valid = $valid && count($tasks) === 5;
            $materials = is_array($part['reading_materials'] ?? null) ? array_filter($part['reading_materials'], 'is_array') : [];
            if ($number !== 2 && ! collect($materials)->contains(fn (array $material): bool => filled($material['body'] ?? null))) {
                $validator->errors()->add("parts.$partIndex.reading_materials", 'Ajoutez au moins un texte de lecture.');
            }
            foreach ($tasks as $taskIndex => $task) {
                if (blank($task['prompt'] ?? null)) {
                    $validator->errors()->add("parts.$partIndex.tasks.$taskIndex.prompt", 'La question est obligatoire pour publier.');
                }
                if ($number === 1) {
                    $materialPosition = $task['reading_material_position'] ?? null;
                    $materialIds = array_column($materials, 'id');
                    if (($materialPosition === null && ! in_array($task['reading_material_id'] ?? null, $materialIds, true))
                        || ($materialPosition !== null && ! collect($materials)->contains(fn (array $material): bool => (int) ($material['position'] ?? 0) === (int) $materialPosition))) {
                        $validator->errors()->add("parts.$partIndex.tasks.$taskIndex.reading_material_position", 'Associez cette question à un texte.');
                    }
                }
                $choices = is_array($task['choices'] ?? null) ? array_values(array_filter($task['choices'], 'is_array')) : [];
                $expectedLabels = $number === 2 ? ['A', 'B'] : ['richtig', 'falsch'];
                if (array_column($choices, 'label') !== $expectedLabels) {
                    $validator->errors()->add("parts.$partIndex.tasks.$taskIndex.choices", 'Cette question doit proposer les deux choix prévus pour cette partie.');
                }
                if (count(array_filter($choices, fn (array $choice): bool => filter_var($choice['is_correct'] ?? false, FILTER_VALIDATE_BOOLEAN))) !== 1) {
                    $validator->errors()->add("parts.$partIndex.tasks.$taskIndex.choices", 'Sélectionnez une seule réponse attendue pour cette question.');
                }
                if ($number === 2) {
                    foreach ($choices as $choiceIndex => $choice) {
                        if (blank($choice['body'] ?? null)) {
                            $validator->errors()->add("parts.$partIndex.tasks.$taskIndex.choices.$choiceIndex.body", 'Chaque annonce A/B doit avoir un contenu.');
                        }
                    }
                }
            }
        }
        if (! $valid) {
            $validator->errors()->add('parts', 'Pour publier, les trois Teile doivent contenir cinq tâches chacun.');
        }
    }

    /** @param array<int, mixed> $items */
    private static function validateUniquePositions(Validator $validator, array $items, string $attribute, string $message): void
    {
        $positions = collect($items)
            ->filter(fn (mixed $item): bool => is_array($item) && is_numeric($item['position'] ?? null))
            ->map(fn (array $item): int => (int) $item['position']);

        if ($positions->count() !== $positions->unique()->count()) {
            $validator->errors()->add($attribute, $message);
        }
    }
}
